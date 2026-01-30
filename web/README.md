# Blinkist Clone - Web Application

Modern web application for book summaries, built with React.

## 🚀 Features

- 📚 Browse books library
- 🔍 Search functionality
- ❤️ Favorites system
- 📊 Reading progress tracking
- 🏷️ Category filtering
- 🎯 Chapter-by-chapter reading
- 👨‍💼 Admin panel for CRUD operations
- 📱 Fully responsive design
- 🎨 Modern UI with smooth animations

## 📋 Prerequisites

- Node.js 16+ installed
- Backend API running on port 3000

## 🛠️ Installation

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Configure API URL

Edit `src/services/api.js`:
```javascript
// For local development
const API_BASE_URL = 'http://localhost:3000/api';

// For production
// const API_BASE_URL = 'https://your-api.com/api';
```

### 3. Start Development Server
```bash
npm start
```

The app will open at: **http://localhost:3000**

## 📦 Build for Production
```bash
npm run build
```

The build files will be in the `build/` folder.

## 🌐 Deployment

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `build/` folder to Netlify
3. Configure environment variables

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/blinkist-clone",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```
3. Deploy: `npm run deploy`

## 📱 Testing on Mobile

### Local Network Testing

1. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
   
2. Update API URL in `api.js`:
```javascript
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

3. Access from mobile browser:
```
http://192.168.1.100:3000
```

### Testing with Hotspot

1. Create hotspot on your phone
2. Connect computer to hotspot
3. Find computer IP (usually 192.168.43.xxx)
4. Update API URL
5. Access from phone browser

## 🎨 Customization

### Theme Colors

Edit `src/styles/theme.js`:
```javascript
export const colors = {
  primary: '#00D9B6',  // Change this
  // ... other colors
};
```

### Layout

All pages are in `src/pages/`
All components are in `src/components/`

## 🐛 Troubleshooting

### CORS Error

Add to backend `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### API Connection Failed

1. Check backend is running: `http://localhost:3000/health`
2. Verify API URL in `api.js`
3. Check firewall settings

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📚 Project Structure
```
web/
├── public/              # Static files
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── BookCard.jsx
│   │   ├── SearchBar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── BookDetailPage.jsx
│   │   ├── ChapterReaderPage.jsx
│   │   ├── LibraryPage.jsx
│   │   ├── CategoriesPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── ManageChaptersPage.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── styles/         # Styling
│   │   ├── theme.js
│   │   └── global.css
│   ├── utils/          # Helper functions
│   │   └── helpers.js
│   ├── App.jsx         # Main app component
│   └── index.js        # Entry point
├── package.json
└── README.md
```

## 🔧 Available Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from create-react-app
```

## 🌟 Features Overview

### User Features
- Browse all books
- Search by title, author, or content
- Read book details
- Read chapters (blinks)
- Add to favorites
- Track reading progress
- Filter by categories

### Admin Features
- Add new books
- Edit book details
- Delete books
- Manage chapters
- Add/edit/delete chapters

## 📱 Responsive Design

The app is fully responsive and works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Wide screens (1280px+)

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

MIT License - feel free to use for learning and projects!

## 🤝 Contributing

Feel free to fork and submit pull requests!

## 📧 Support

For issues or questions, please create an issue on GitHub.
