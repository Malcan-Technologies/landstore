import express from 'express';
import cookieParser from 'cookie-parser';
import db from './config/prisma.js';
import authRoutes from './src/routes/auth.routes.js';
import testFileRoutes from './src/routes/testFile.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());

// Test database connection
db.$connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error:', err));
// Routes
app.use('/auth', authRoutes);
app.use('/test-file', testFileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});