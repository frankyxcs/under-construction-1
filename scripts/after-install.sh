#!/bin/sh

# Access the project folder
cd /var/www

# Install server dependencies
sudo npm install --loglevel=error

# Generates Dist
sudo npm run build
