import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Increase limit for base64 image uploads during screen capture
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// API Routes
app.use('/api', apiRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ScreenAwareTutor API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
