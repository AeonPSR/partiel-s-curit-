// mini-projet-vulnerable/app.js

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'notsecure',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: true
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let users = [
  { id: 1, username: 'alice', password: '1234' },
  { id: 2, username: 'bob', password: 'abcd' }
];

let messages = [];

// Page de login
app.get('/', (req, res) => {
  res.render('login');
});


app.post('/login', (req, res) => {
  const username = String(req.body.username);
  const password = String(req.body.password);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    res.send('Login failed');
  }
});


app.get('/contact', (req, res) => {
  res.render('contact', { messages });
});

app.post('/contact', (req, res) => {
  const { message } = req.body;
  const sanitizedMessage = message.replace(/[&<>"']/g, function(c) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c];
  });
  messages.push(sanitizedMessage);
  res.redirect('/contact');
});


app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const userId = req.session.user.id;
  const user = users.find(u => u.id === userId);
  res.render('dashboard', { user });
});



app.get('/edit-profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (!req.session.csrfToken) {
    req.session.csrfToken = Math.random().toString(36).substring(2);
  }
  res.render('edit', { csrfToken: req.session.csrfToken });
});

app.post('/edit-profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  if (!req.body.csrfToken || req.body.csrfToken !== req.session.csrfToken) {
    return res.status(403).send('Invalid CSRF token');
  }
  const user = users.find(u => u.id === req.session.user.id);
  user.username = req.body.username;
  res.redirect('/dashboard');
});

// Server
app.listen(3000, () => {
  console.log('Mini-projet vulnérable en cours sur http://localhost:3000');
});
