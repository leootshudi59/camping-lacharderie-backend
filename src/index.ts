import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'; // Enable CORS for the frontend
import helmet from 'helmet'; // Security HTTP headers

import { authenticateJWT } from './middlewares/authenticateJWT';
import userRoutes from './routes/user.routes';
import campsiteRoutes from './routes/campsite.routes';
import bookingRoutes from './routes/booking.routes';
import inventoryRoutes from "./routes/inventory.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import eventRoutes from "./routes/event.routes";
import { createUser, loginUser } from './controllers/user.controller';
import guestRoutes from './routes/guest.routes';
dotenv.config();

const app = express();

app.set('trust proxy', 1); // or: app.set('trust proxy', true);
// ----------- Global middlewares -----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enables cross-origin requests
app.use(helmet()); // Security headers

// ----------- Public routes -----------
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ----------- Private routes -----------
app.post('/api/users/login', loginUser);
app.post('/api/users', createUser);
app.use('/api/users', authenticateJWT, userRoutes); 
app.use('/api/campsites', authenticateJWT, campsiteRoutes);
app.use('/api/bookings', authenticateJWT, bookingRoutes);
app.use('/api/inventories', authenticateJWT, inventoryRoutes);
app.use('/api/products', authenticateJWT, productRoutes);
app.use('/api/orders', authenticateJWT, orderRoutes);
app.use('/api/events', authenticateJWT, eventRoutes);
app.use('/api/guest', guestRoutes); 

// ----------- 404 Handler -----------
app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Route not found' });
});

// ----------- Global Error Handler -----------
app.use((err: Error, _req: any, res: any, _next: any) => {
  // Improves error handling (in production, does not expose the stack trace)
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ----------- Server start -----------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});