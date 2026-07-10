FROM php:8.2-apache

# Dependencias de sistema:
# - libpq-dev: necesario para compilar la extensión pdo_pgsql
# - poppler-utils: da el binario pdftotext usado para leer PDFs
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        poppler-utils \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod rewrite \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# La imagen base de Apache trae AllowOverride None por defecto:
# sin esto el .htaccess (RewriteEngine) se ignora y todas las rutas
# menos /index.php directo devuelven 404.
RUN { \
        echo '<Directory /var/www/html/>'; \
        echo '    AllowOverride All'; \
        echo '</Directory>'; \
    } > /etc/apache2/conf-available/z-allow-override.conf \
    && a2enconf z-allow-override

COPY src/ /var/www/html/

RUN mkdir -p /var/www/uploads \
    && chown -R www-data:www-data /var/www/uploads /var/www/html

EXPOSE 80
