var express = require('express')
var admin = require('express-admin')
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
require('dotenv').config();

var app = express();

// Session setup
app.use(session({
  name: 'express-admin',
  secret: 'very secret',
  saveUninitialized: true,
  resave: true
}))

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (CSS, JavaScript, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Login page route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Handle login form submission
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Replace with your own authentication logic
    if (username === 'admin' && password === '1234abCD') {
        req.session.isAuthenticated = true;
        res.redirect('/custom');
    } else {
        res.redirect('/login'); // Redirect back to login on failure
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Middleware to protect admin routes
app.use('/', (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
});

// Serve custom admin layout
app.get('/custom', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/adminLayout.html'));
});

// Serve CRUD operations through the iframe
app.get('/users', (req, res) => {    
    res.redirect('/users');
});

app.get('/courses', (req, res) => {
  console.log("redirecting to courses...");
    res.redirect('/courses');
});

// Initialize and use Express Admin but with modified routes to avoid overriding your custom layout
express()
  .use(admin({
    config: require(`./config/mysql/config.json`),
    settings: require(`./config/mysql/settings.json`),
    users: require(`./config/users.json`),
    custom: require(`./config/custom.json`),
  }))

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
