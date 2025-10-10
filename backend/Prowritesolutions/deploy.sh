#!/bin/bash
# Production Deployment Script for ProWrite Backend

set -e  # Exit on any error

echo "🚀 Starting ProWrite Backend Production Deployment..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please do not run this script as root"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from env.production.template"
    echo "   cp env.production.template .env"
    echo "   # Then edit .env with your production values"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p thumbnails
mkdir -p static

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod 755 logs
chmod 755 uploads
chmod 755 thumbnails
chmod 755 static

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if gunicorn is installed
if ! command -v gunicorn &> /dev/null; then
    echo "📦 Installing gunicorn..."
    pip install gunicorn
fi

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/prowrite-backend.service > /dev/null <<EOF
[Unit]
Description=ProWrite Backend API
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(which gunicorn) --bind 0.0.0.0:5000 --workers 4 --timeout 120 --access-logfile logs/access.log --error-logfile logs/error.log app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo "🔄 Enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable prowrite-backend

# Start the service
echo "▶️ Starting service..."
sudo systemctl start prowrite-backend

# Check service status
echo "📊 Checking service status..."
sudo systemctl status prowrite-backend --no-pager

echo "✅ Deployment complete!"
echo "🌐 Your API should be running on port 5000"
echo "📋 To check logs: sudo journalctl -u prowrite-backend -f"
echo "🔄 To restart: sudo systemctl restart prowrite-backend"

