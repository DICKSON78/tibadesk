<?php
// Simple script to help set up the database
echo "Database Setup Instructions:\n";
echo "============================\n\n";

echo "1. Open phpMyAdmin (http://localhost/phpmyadmin)\n";
echo "2. Create a new database named: kayoka_db\n";
echo "3. Make sure your XAMPP MySQL is running\n\n";

echo "Then run these commands:\n";
echo "php artisan migrate\n";
echo "php artisan db:seed --class=CreateTestUserSeeder\n\n";

echo "Login credentials will be:\n";
echo "Username: kayoka\n";
echo "Password: 2121\n";
?>