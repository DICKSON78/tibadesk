# Deployment Notes for Medicore Dental Clinic

## Domain Configuration
- **Domain**: medicore-dental.co.tz
- **URL**: https://medicore-dental.co.tz
- **SSL**: Enabled

## Environment Variables (.env)
Update your `.env` file with the following:

```env
APP_NAME=Medicore
APP_ENV=production
APP_KEY=base64:DZTfsicMYMbKIHEOlmivnXJzNF0ZgpjPFD6krXowe0o=
APP_DEBUG=false
APP_URL=https://medicore-dental.co.tz

# Database configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sikacgkz_eyecare
DB_USERNAME=sikacgkz_kayoka
DB_PASSWORD=Allos@2026
```

## SSL Certificate Setup
1. Obtain SSL certificate from your hosting provider (Let's Encrypt, cPanel SSL, etc.)
2. The `.htaccess` file is configured to force HTTPS
3. Ensure your hosting provider has SSL enabled for the domain

## Server Requirements
- PHP 8.1 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Apache with mod_rewrite enabled
- Node.js and NPM (for building assets)

## Deployment Steps

1. **Upload Files**
   - Upload all files to your web root directory
   - Ensure `.htaccess` is in the public directory (or root if using shared hosting)

2. **Set Permissions**
   ```bash
   chmod -R 755 storage
   chmod -R 755 bootstrap/cache
   ```

3. **Install Dependencies**
   ```bash
   composer install --optimize-autoloader --no-dev
   npm install
   npm run build
   ```

4. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update database credentials and APP_URL

5. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

6. **Run Migrations**
   ```bash
   php artisan migrate --force
   ```

7. **Clear Caches**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Login Access
- Login page is accessible at: `https://medicore-dental.co.tz/login`
- Login button has been removed from the public navbar
- Users can manually navigate to `/login` if needed

## Notes
- Landing page (/) is the default route with public pages
- All public pages are accessible without login
- Dashboard and admin features require login at `/login`
