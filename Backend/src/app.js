const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const requestRoutes = require('./modules/requests/request.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ISSOP API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/agent/tasks', taskRoutes);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
