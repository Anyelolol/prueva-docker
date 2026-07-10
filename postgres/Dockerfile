FROM postgres:16-alpine

# Los scripts en /docker-entrypoint-initdb.d/ se ejecutan en orden alfabético
# SOLO la primera vez que se crea el volumen de datos (db-data). Si ya existe
# el volumen, hay que borrarlo (docker compose down -v) para que se re-corran.
COPY init/ /docker-entrypoint-initdb.d/
