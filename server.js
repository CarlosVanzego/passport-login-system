// Load environment variables from .env file if not in production environment
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import required modules
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

// Import passport configuration
const initializePassport = require('./passport-config');
initializePasspport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id ===  id)
);

// Array to store user data
const users = [];

// Configure the view engine to be used
app.set('view-engine', 'ejs');

// Middleware to parse url-encoded request bodies
app.use(express.urlencoded({ extended: false }));

// Middleware for flash messages
app.use(flash());

// Middleware for session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Middleware for passport authentication
app.use(passport.initialize());
app.use(passport.session());

// Middleware for HTTP method override
app.use(methodOverride('_method'));

// Route for home page
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
});

// Route for login page
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

// Route for login form submission
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: './login',
  failureFlash: true
}));

// Route for registration page
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

// Route for registration form submission
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch {
    res.redirect('./register');
  }
});

// Route for logout
app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('./login');
});

// Middleware function to check if user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('./login');
}

// Middleware function to check if user is not authenticated
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Start the server
app.listen(3000);