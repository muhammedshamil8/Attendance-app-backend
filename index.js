const express = require('express');
const cors = require('cors');
const middleware = require('./src/middleware');
const admin = require('firebase-admin');
const todoRoutes = require('./src/routes/todos');
const authRoutes = require('./src/routes/User/auth');
const adminRoutes = require('./src/routes/Admin/admin');
const test = require('./src/routes/test');
const AdminuserRoutes = require('./src/routes/Admin/User');
const ContactRoute = require('./src/routes/User/contact');
const UserRoutes = require('./src/routes/User/User');
const EventStudentRoutes = require('./src/routes/User/Event-Student');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!, This is a attendance app  apis application.');
}
);
// app.use('/test', test)
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', ContactRoute);
// app.use('/api', UserRoutes);
app.use('/api/admin/test', middleware.decodeToken, middleware.checkRole('admin'), adminRoutes);
app.use('/api/admin', middleware.decodeToken, middleware.checkRole('admin'), AdminuserRoutes);
app.use('/api', middleware.decodeToken, middleware.checkRole('user'), UserRoutes);
app.use('/api/user', middleware.decodeToken, middleware.checkRole('user'), EventStudentRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
