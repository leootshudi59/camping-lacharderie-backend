// src/index.ts
import express from 'express';
import userRoutes from './routes/user.routes';

import cors from 'cors'; // Autorise CORS pour le frontend
import helmet from 'helmet'; // Sécurité HTTP

const app = express();

// ----------- Middlewares globaux -----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Permet les appels cross-origin
app.use(helmet()); // Headers de sécurité


// ----------- Routes -----------
app.use('/api/users', userRoutes);

// ----------- 404 Handler -----------
app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Route not found' });
});

// ----------- Global Error Handler -----------
app.use((err: Error, _req: any, res: any, _next: any) => {
  // Améliore la gestion des erreurs (en prod, n’expose pas le stack trace)
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.use('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// ----------- Démarrage du serveur -----------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});