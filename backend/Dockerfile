FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y libssl-dev pkg-config git unzip \
    && curl -fsSL https://pecl.php.net/get/mongodb-1.21.3.tgz -o /tmp/mongodb.tgz \
    && pecl install /tmp/mongodb.tgz \
    && docker-php-ext-enable mongodb \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/. .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80