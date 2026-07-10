# --- Etapa 1: build ---
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite "hornea" las env vars VITE_* dentro del bundle en build time,
# por eso se pasan como build-arg y no como env var de runtime.
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Etapa 2: servir estático ---
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback: cualquier ruta que no sea un archivo real cae en index.html,
# para que funcione el ruteo de react-router-dom al refrescar/entrar directo.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
