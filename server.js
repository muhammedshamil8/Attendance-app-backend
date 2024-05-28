const express = require('express');
var cors = require('cors');
const middleware = require('./src/middleware');
const admin = require('firebase-admin');
const test = require('./src/routes/test');
const auth = require('./src/routes/auth');

const app = express();
const port = 5000;

app.use(cors())
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

app.use("/testing" , test)

app.use('/api/login',auth );
app.use('/register', auth);

// Middleware for role-based authorization
function checkRole(role) {
    return async (req, res, next) => {
        const { uid } = req.user;
        const userRecord = await admin.auth().getUser(uid);
        const { customClaims } = userRecord;
        if (customClaims && customClaims.role === role) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    };
}

// Protected endpoint accessible only by users with 'admin' role
app.get('/admin', checkRole('admin'), (req, res) => {
    res.status(200).send('Welcome, Admin!');
});


app.use(middleware.decodeToken);

app.get('/checking', (req, res) => {
    res.send('The token is valid!');
}
);


app.get('/api/todos', (req, res) => {
    return res.json({
        todos: [
            { id: 1, text: 'Learn React' },
            { id: 2, text: 'Learn Node.js' },
            { id: 3, text: 'Learn Express' },
        ]
    });
}
);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);