//server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import gigRoute from './routes/gig.route.js';
import reviewRoute from './routes/review.route.js';
import orderRoute from './routes/order.route.js';
import conversationRoute from './routes/conversation.route.js';
import messageRoute from './routes/message.route.js';
import likeRoute from './routes/like.route.js';
import commentRoute from './routes/comment.route.js';
import productRoute from './routes/product.route.js';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(
  cors({
     origin: process.env.FRONTEND_URL,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     credentials: true,
    })
  );

app.use(express.json());
app.use(cookieParser());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).send({ message: 'Server is healthy' });
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/gigs', gigRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/orders', orderRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/likes', likeRoute);
app.use('/api/comments', commentRoute);
app.use('/api/products', productRoute);

// Global error handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || 'Something went wrong!';
  return res.status(errorStatus).send(errorMessage);
});

// Start server
const PORT = process.env.PORT || 8800;
app.listen(PORT, async () => {
  console.log(`Backend server is running on port ${PORT}!`);
});