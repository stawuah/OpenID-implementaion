
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-openidconnect');

const app = express();

// Configure session
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure OpenID Connect Strategy
passport.use('oidc', new Strategy({
    issuer: 'YOUR_OIDC_ISSUER_URL',
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectURL: 'http://localhost:3000/auth/callback', // Callback URL
    scope: 'openid profile email', // Scopes you need
    response_type: 'code', // Authorization code flow
}, (tokenset, userinfo, done) => {
    return done(null, userinfo);
}));

// Serialize user info into session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user info from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/', ensureAuthenticated, (req, res) => {
    res.send(`Hello, ${req.user.name}!`);
});

app.get('/login', passport.authenticate('oidc'));

app.get('/auth/callback', passport.authenticate('oidc', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Start server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
