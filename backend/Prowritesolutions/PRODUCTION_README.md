# 🚀 ProWrite Backend - Production Deployment Guide

## 📋 Overview

This guide will help you deploy ProWrite Backend to production with all debugging removed and optimized for performance.

## ✅ Production Readiness Checklist

- [x] **Debugging Removed**: All print statements and console.log calls removed
- [x] **Test Files Cleaned**: All test and debug files removed
- [x] **Logging Configured**: Production logging with rotation
- [x] **Error Handling**: Comprehensive error handlers
- [x] **Security**: Production security configurations
- [x] **Deployment Scripts**: Ready-to-use deployment scripts

## 🛠️ Prerequisites

- Python 3.11+
- MySQL 8.0+
- Nginx (for reverse proxy)
- SSL Certificate (for HTTPS)
- Domain name

## 📦 Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd prowrite/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy production template
cp env.production.template .env

# Edit with your production values
nano .env
```

**Required Environment Variables:**
```env
# Database
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-secure-password
DB_NAME=prowrite_production

# Security (Use strong, unique keys)
JWT_SECRET_KEY=your-64-char-secret-key-here
SECRET_KEY=your-64-char-secret-key-here

# AI Service
AI_API_KEY=sk-your-openai-api-key-here

# Production Settings
FLASK_ENV=production
FLASK_DEBUG=False
```

### 3. Database Setup

```bash
# Create production database
mysql -u root -p
CREATE DATABASE prowrite_production;
CREATE USER 'prowrite_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON prowrite_production.* TO 'prowrite_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🚀 Deployment Options

### Option 1: Systemd Service (Recommended)

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Check service status
sudo systemctl status prowrite-backend

# View logs
sudo journalctl -u prowrite-backend -f
```

### Option 2: Docker Deployment

```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 3: Manual Gunicorn

```bash
# Start with Gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app

# Or use the production script
python start_production.py
```

## 🔧 Nginx Configuration

1. **Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

2. **Copy configuration:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/prowrite
sudo ln -s /etc/nginx/sites-available/prowrite /etc/nginx/sites-enabled/
```

3. **Update domain name in nginx.conf:**
```nginx
server_name your-domain.com www.your-domain.com;
```

4. **Setup SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

5. **Test and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring

### Health Check
```bash
curl https://your-domain.com/api/health
```

### Log Monitoring
```bash
# Application logs
tail -f logs/app.log

# System logs
sudo journalctl -u prowrite-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring
```bash
# Check service status
sudo systemctl status prowrite-backend

# Check resource usage
htop
df -h
```

## 🔒 Security Considerations

1. **Firewall Configuration:**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **Database Security:**
- Use strong passwords
- Limit database user privileges
- Enable SSL for database connections

3. **Application Security:**
- Keep dependencies updated
- Use HTTPS only
- Implement rate limiting
- Regular security audits

## 🚨 Troubleshooting

### Common Issues

1. **Service won't start:**
```bash
sudo journalctl -u prowrite-backend --no-pager
```

2. **Database connection issues:**
```bash
# Check database status
sudo systemctl status mysql
# Test connection
mysql -u prowrite_user -p prowrite_production
```

3. **Permission issues:**
```bash
sudo chown -R www-data:www-data /path/to/prowrite
sudo chmod -R 755 /path/to/prowrite
```

4. **Port already in use:**
```bash
sudo netstat -tlnp | grep :5000
sudo kill -9 <PID>
```

## 📈 Performance Optimization

1. **Database Optimization:**
- Add indexes for frequently queried columns
- Optimize queries
- Regular maintenance

2. **Application Optimization:**
- Use connection pooling
- Implement caching
- Optimize file uploads

3. **Server Optimization:**
- Increase worker processes
- Optimize Nginx configuration
- Use CDN for static files

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Restart service
sudo systemctl restart prowrite-backend

# Check status
sudo systemctl status prowrite-backend
```

### Backup Strategy
```bash
# Database backup
mysqldump -u prowrite_user -p prowrite_production > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf prowrite_backup_$(date +%Y%m%d).tar.gz /path/to/prowrite
```

## 📞 Support

For production support and issues:
- Check logs first: `sudo journalctl -u prowrite-backend -f`
- Review error handlers in `error_handlers.py`
- Monitor application health: `/api/health`

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Service running and healthy
- [ ] Monitoring in place
- [ ] Backup strategy implemented
- [ ] Security measures applied

---

**🎉 Your ProWrite Backend is now production-ready!**

