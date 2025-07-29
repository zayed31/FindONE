import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

export default app; 