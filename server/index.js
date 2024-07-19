const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');
const helmet = require('helmet'); // Added for security
const session = require('express-session');
const db = require('./database'); // Import the database file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d'  // Cache for one day
}));

// Use helmet to set security-related HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://example.com"],
            styleSrc: ["'self'", "https://example.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'", "https://example.com"],
            fontSrc: ["'self'", "https://example.com"],
            objectSrc: ["'none'"]
        }
    },
    referrerPolicy: { policy: 'same-origin' },
    xContentTypeOptions: { nosniff: true }
    
    }));
    app.use(session({
        secret: 'your-secret-key', // Replace with a secure random string
        resave: false,
        saveUninitialized: true
}));

// Define route for the root path
// Serve register.html
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/weather');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Serve register.html
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


// Serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/weather', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'weather.html'));
    } else {
        res.redirect('/login');
    }
});

// Fetch weather data from OpenWeatherMap API
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).send('City is required');
    }
    try {
        const apiKey = '08778517d5f65cbc7b5295a8d225fc11'; // Make sure to use your actual API key here
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
        res.json(response.data);

        // Log the search query to the database without requiring authentication
        // This line assumes you have a default user_id of 1
        db.addSearchQuery(1, city)
            .catch((err) => console.error('Error logging search:', err.message));

    } catch (error) {
        res.status(500).send('Error fetching weather data');
    }
});

// Register route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert the new user into the database
        db.createUser(username, hashedPassword)
            .then((userId) => res.status(201).json({ id: userId }))
            .catch((err) => {
                console.error('Error registering user:', err.message);
                res.status(500).send('Error registering user');
            });

    } catch (error) {
        console.error('Error hashing password:', error.message);
        res.status(500).send('Error hashing password');
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    try {
        const user = await db.getUserByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user.id, username: user.username };
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out');
        }
        res.status(200).send('Logged out');
    });
});

app.get('/api/checkSession', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
