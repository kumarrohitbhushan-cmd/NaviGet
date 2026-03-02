import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { riderRouter } from './routes/rider.routes';
import { driverRouter } from './routes/driver.routes';
import { walletRouter } from './routes/wallet.routes';
import { adminRouter } from './routes/admin.routes';
import { initSocketServer } from './sockets';

const app = express();
const server = http.createServer(app);

// ======================== MIDDLEWARE ========================

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ======================== HEALTH CHECK ========================

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'NaviGet API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      usps: [
        'Fixed Fare 24×7',
        'No Surge Pricing',
        '2× Refund on Our Cancel',
        'Shared Rides from ₹399',
        'Schedule 2 Hours Ahead',
        '₹0 Cancellation Fee',
      ],
    },
  });
});

// ======================== ROUTES ========================

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/rider', riderRouter);
app.use('/api/v1/driver', driverRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/admin', adminRouter);

// ======================== ERROR HANDLING ========================

app.use(errorHandler);

// ======================== SOCKET.IO ========================

initSocketServer(server);

// ======================== START SERVER ========================

server.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║           🚗 NaviGet API Server                    ║
  ║                                                   ║
  ║  Port:    ${config.port}                              ║
  ║  Env:     ${config.nodeEnv.padEnd(16)}                ║
  ║  Health:  http://localhost:${config.port}/health       ║
  ║                                                   ║
  ║  USP: Fixed Fare • No Surge • 2× Refund          ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
