FROM php:8.2-apache

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy ONLY the contents of backend/api/ into the web root
COPY api/ /var/www/html/

# No need to change document root – it stays /var/www/html
EXPOSE 80