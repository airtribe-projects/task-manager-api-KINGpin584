import express from 'express';
import { taskRoutes, taskService } from './routes/task.routes';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.use('/api', taskRoutes);

// endpoint for health checks
app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});


const server: http.Server = app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});


// --- Graceful Shutdown Logic ---
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🚨 Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop the server from accepting new connections
  server.close(async () => {
    console.log('🛑 HTTP server closed.');

    // 2. Perform a final compaction to save all data before exiting
    await taskService.compact();
    console.log('💾 Final data compaction complete.');

    // 3. Exit the process
    process.exit(0);
  });
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Standard shutdown