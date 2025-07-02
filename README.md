# Todo App - Beautiful Task Manager

A modern, minimalist todo application built with React, Vite, and Tailwind CSS. Features a beautiful glass morphism UI with authentication, email verification, and real-time todo management.

## ✨ Features

- **Beautiful UI**: Glass morphism design with blue-purple gradient background
- **User Authentication**: Secure registration and login with email verification
- **Real-time Todos**: Add, complete, and delete todos with instant updates
- **Data Persistence**: Todos are saved to MongoDB and synced across devices
- **Email Verification**: Secure account creation with email verification codes
- **Privacy & Terms**: Built-in privacy policy and terms of service pages
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- Gmail account for email verification

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-project-clean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   # Database (MongoDB Atlas)
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/todo-app?retryWrites=true&w=majority
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   
   # Server Port
   PORT=3000
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Backend server
   node server/index.js
   
   # Terminal 2: Frontend server
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📧 Email Setup

### Gmail App Password Setup

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)
6. Add it to your `.env` file as `EMAIL_PASS`

## 🔒 Privacy & Legal

The app includes comprehensive privacy policy and terms of service pages:

- **Privacy Policy**: Details data collection, usage, security, and user rights
- **Terms of Service**: Covers usage terms, account responsibilities, and limitations
- **Accessible**: Available from login, registration, and main app interface
- **Compliant**: Designed to meet basic legal requirements for web applications

### Accessing Privacy & Terms

- **From Login/Register**: Click the links at the bottom of the forms
- **From Main App**: Use the "Privacy" and "Terms" buttons in the header
- **Direct Navigation**: Available at any time during app usage

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer with Gmail SMTP
- **Styling**: Glass morphism design with CSS gradients

## 📱 App Store Ready

This todo app is designed to be easily converted for mobile app stores:

### For iOS App Store:
- **React Native**: Convert components to React Native
- **Capacitor**: Wrap existing web app for native deployment
- **PWA**: Progressive Web App for web-based installation

### Requirements:
- Apple Developer Account ($99/year)
- Xcode for iOS development
- App Store Connect setup
- Privacy policy and terms of service (✅ Included)
- App icons and screenshots
- App review process (1-7 days)

## 🔧 Development

### Project Structure
```
ai-project-clean/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── server/
│   └── index.js         # Backend API server
├── public/              # Static assets
├── .env                 # Environment variables
└── README.md           # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Ensure MongoDB Atlas is accessible
3. Verify Gmail app password is correct
4. Check browser console for any errors

For additional help, please open an issue in the repository.
