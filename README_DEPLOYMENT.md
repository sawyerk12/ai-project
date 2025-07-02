# Todo App Deployment Guide

## Quick Testing Options

### 1. **Local Network Sharing (Easiest)**
If you're on the same WiFi network:

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   node server/index.js
   
   # Terminal 2 - Frontend (with host flag)
   npm run dev -- --host
   ```

2. **Share the URL:**
   - Frontend: `http://10.0.0.45:5173` (your local IP)
   - Backend: `http://10.0.0.45:3000`

3. **Testers can access:**
   - Anyone on your WiFi can visit `http://10.0.0.45:5173`

### 2. **Docker Deployment (Recommended)**
For easy distribution:

1. **Build and run with Docker:**
   ```bash
   # Build the image
   docker build -t todo-app .
   
   # Run with docker-compose
   docker-compose up -d
   ```

2. **Share the Docker image:**
   ```bash
   # Save the image
   docker save todo-app > todo-app.tar
   
   # Recipient can load it
   docker load < todo-app.tar
   ```

### 3. **Cloud Deployment**

#### **Vercel (Frontend) + Railway (Backend)**
1. **Frontend:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Backend:**
   - Deploy to Railway or Render
   - Update frontend API URL

#### **Heroku (Full Stack)**
```bash
# Add Procfile
echo "web: node server/index.js" > Procfile

# Deploy
heroku create your-todo-app
git push heroku main
```

## Environment Setup for Testers

### Required Environment Variables
Create a `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/todo-app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Email (for verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Port
PORT=3000
```

### For Testers Using Docker
1. **Install Docker Desktop**
2. **Run the app:**
   ```bash
   docker-compose up -d
   ```
3. **Access at:** `http://localhost:5173`

### For Testers Using Local Setup
1. **Install Node.js 18+**
2. **Install MongoDB** (or use MongoDB Atlas)
3. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```
4. **Set up environment variables**
5. **Start servers:**
   ```bash
   # Backend
   node server/index.js
   
   # Frontend
   npm run dev
   ```

## Testing Checklist

### Features to Test:
- [ ] User registration
- [ ] Email verification
- [ ] User login/logout
- [ ] Create todo items
- [ ] Mark todos as complete
- [ ] Delete todos
- [ ] View deleted todos in History
- [ ] Restore deleted todos
- [ ] Navigation between pages
- [ ] Responsive design on mobile

### Browser Compatibility:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Troubleshooting

### Common Issues:
1. **Port already in use:**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **MongoDB connection failed:**
   - Check if MongoDB is running
   - Verify connection string

3. **Email not sending:**
   - Check Gmail app password
   - Verify email credentials

4. **CORS errors:**
   - Ensure backend CORS is configured
   - Check API URL in frontend

## Security Notes for Production

Before deploying to production:
1. Change default passwords
2. Use strong JWT secrets
3. Enable HTTPS
4. Set up proper CORS
5. Use environment variables
6. Implement rate limiting
7. Add input validation
8. Set up monitoring

## Support

If testers encounter issues:
1. Check browser console for errors
2. Verify all services are running
3. Check network connectivity
4. Review environment variables
5. Check MongoDB connection 