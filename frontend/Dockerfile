# --- Etapa 1: build ---
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Ya no se pasa VITE_API_URL: el frontend usa la ruta relativa "/api"
# (fallback en src/services/api.js), que nginx resuelve haciendo proxy
# hacia backend-arc. Esto evita tener que rebuildear según IP/dominio.

RUN npm run build

# --- Etapa 2: servir estático ---
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx sirve el bundle estático y hace de proxy a /api -> backend-arc.
# Así el frontend usa siempre ruta relativa (/api), sin importar si se
# accede por localhost, la IP del servidor, o una URL de Codespaces/túnel.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location /api/ {\n\
        proxy_pass http://backend-arc:80/api/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header Authorization $http_authorization;\n\
    }\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
