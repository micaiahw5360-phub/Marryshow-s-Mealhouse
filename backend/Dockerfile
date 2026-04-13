# Dockerfile
FROM php:8.2-apache

# Install PHP extensions for MySQL
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite (if you use pretty URLs)
RUN a2enmod rewrite

# Copy all backend files into the Apache document root
COPY . /var/www/html/

# Optionally, set the document root to your public folder if you have one
# If your API entry point is in the root (e.g., index.php), this is fine.

# Expose port 80
EXPOSE 80