const express = require('express');
const cors = require('cors');
const startAiLoader = require('./jobs/aiLoader');
const taskRoutes = require('./routes/taskRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Sudarshan Chakra API Running 🚀');
});

// Start AI Loader Cron
startAiLoader();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});