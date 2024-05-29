const express = require('express');
const cors = require('cors');
const middleware = require('./src/middleware');
const admin = require('firebase-admin');
const todoRoutes = require('./src/routes/todos');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const test = require('./src/routes/test');
const userRoutes = require('./src/routes/User');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!, This is a attendance app  apis application.');
}
);
app.use('test', test)
app.use('/api/todos', todoRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', middleware.decodeToken, middleware.checkRole('admin'), adminRoutes);
app.use('/api', middleware.decodeToken, middleware.checkRole('admin'), userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
