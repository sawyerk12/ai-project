#!/bin/bash

# Todo App Deployment Script
echo "🚀 Todo App Deployment Script"
echo "=============================="

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

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "🌐 Deployment Options:"
echo "1. Vercel (Frontend) + Railway (Backend) - RECOMMENDED"
echo "2. Heroku (Full Stack)"
echo "3. Netlify (Frontend) + Render (Backend)"
echo "4. Local Network Sharing"
echo ""

read -p "Choose deployment option (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel + Railway..."
        
        # Deploy backend to Railway
        echo "📦 Deploying backend to Railway..."
        echo "1. Go to https://railway.app"
        echo "2. Connect your GitHub account"
        echo "3. Create new project from GitHub"
        echo "4. Select this repository"
        echo "5. Add environment variables:"
        echo "   - MONGODB_URI (MongoDB Atlas connection string)"
        echo "   - JWT_SECRET (random string)"
        echo "   - EMAIL_USER (your Gmail)"
        echo "   - EMAIL_PASS (Gmail app password)"
        echo "   - PORT=3000"
        
        # Deploy frontend to Vercel
        echo ""
        echo "🌐 Deploying frontend to Vercel..."
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel"
        echo "3. Follow the prompts"
        echo "4. Update VITE_API_URL to your Railway backend URL"
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Frontend: https://your-app.vercel.app"
        echo "Backend: https://your-app.railway.app"
        ;;
        
    2)
        echo "🚀 Deploying to Heroku..."
        
        # Create Procfile
        echo "📝 Creating Procfile..."
        echo "web: node server/index.js" > Procfile
        
        # Create app.json for Heroku
        echo "📝 Creating app.json..."
        cat > app.json << EOF
{
  "name": "todo-app",
  "description": "A beautiful todo app with authentication",
  "repository": "https://github.com/yourusername/todo-app",
  "logo": "https://node-js-sample.herokuapp.com/node.png",
  "keywords": ["node", "express", "react", "todo"],
  "env": {
    "MONGODB_URI": {
      "description": "MongoDB connection string",
      "required": true
    },
    "JWT_SECRET": {
      "description": "JWT secret key",
      "required": true
    },
    "EMAIL_USER": {
      "description": "Gmail address",
      "required": true
    },
    "EMAIL_PASS": {
      "description": "Gmail app password",
      "required": true
    }
  }
}
EOF
        
        echo "📦 Deploying to Heroku..."
        echo "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "2. Run: heroku login"
        echo "3. Run: heroku create your-todo-app"
        echo "4. Run: git push heroku main"
        echo "5. Set environment variables in Heroku dashboard"
        
        echo ""
        echo "✅ Deployment complete!"
        echo "App URL: https://your-todo-app.herokuapp.com"
        ;;
        
    3)
        echo "🚀 Deploying to Netlify + Render..."
        
        # Deploy backend to Render
        echo "📦 Deploying backend to Render..."
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service"
        echo "3. Connect your GitHub repository"
        echo "4. Set build command: npm install"
        echo "5. Set start command: node server/index.js"
        echo "6. Add environment variables"
        
        # Deploy frontend to Netlify
        echo ""
        echo "🌐 Deploying frontend to Netlify..."
        echo "1. Go to https://netlify.com"
        echo "2. Drag and drop your dist folder (after npm run build)"
        echo "3. Or connect your GitHub repository"
        echo "4. Set build command: npm run build"
        echo "5. Set publish directory: dist"
        
        echo ""
        echo "✅ Deployment complete!"
        ;;
        
    4)
        echo "🌐 Local Network Sharing..."
        
        # Get local IP
        LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
        
        echo "📱 Your local IP: $LOCAL_IP"
        echo ""
        echo "1. Start backend: node server/index.js"
        echo "2. Start frontend: npm run dev -- --host"
        echo "3. Share URL: http://$LOCAL_IP:5173"
        echo ""
        echo "Anyone on your WiFi can access the app!"
        ;;
        
    *)
        echo "❌ Invalid option. Please choose 1-4."
        ;;
esac

echo ""
echo "📚 For detailed instructions, see README_DEPLOYMENT.md" 