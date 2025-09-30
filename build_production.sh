#!/bin/bash
# Frontend Production Build Script

set -e  # Exit on any error

echo "🚀 Building ProWrite Frontend for Production..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean up debugging code
echo "🧹 Cleaning up debugging code..."
node cleanup_production.js

# Create production environment file
echo "⚙️ Creating production environment..."
cat > .env.production << EOF
# Production Environment Variables
VITE_AI_API_KEY=your-ai-api-key-here
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=ProWrite
VITE_APP_VERSION=1.0.0
EOF

# Build for production
echo "🔨 Building for production..."
npm run build

# Optimize build
echo "⚡ Optimizing build..."
if command -v npx &> /dev/null; then
    # Minify CSS
    npx postcss dist/assets/*.css --replace --use autoprefixer cssnano
    
    # Optimize images (if imagemin is available)
    if npm list imagemin-cli &> /dev/null; then
        npx imagemin dist/assets/*.{jpg,png,svg} --out-dir=dist/assets
    fi
fi

# Create production deployment package
echo "📦 Creating deployment package..."
tar -czf prowrite-frontend-production.tar.gz dist/

echo "✅ Frontend production build complete!"
echo "📁 Build files are in the 'dist' directory"
echo "📦 Deployment package: prowrite-frontend-production.tar.gz"
echo ""
echo "🚀 To deploy:"
echo "1. Upload the contents of 'dist' to your web server"
echo "2. Configure your web server to serve the files"
echo "3. Update .env.production with your actual values"

