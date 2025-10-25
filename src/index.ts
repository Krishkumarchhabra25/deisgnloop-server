import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import redisClient from './config/redis';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
        await connectDB();

    // await redisClient.connect();
    // console.log('✅ Redis Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};

startServer();
