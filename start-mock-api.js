import jsonServer from 'json-server';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create server
const server = jsonServer.create();

// Set up middlewares
const middlewares = jsonServer.defaults();
server.use(middlewares);

// Use body parser middleware to handle POST, PUT, PATCH requests
server.use(jsonServer.bodyParser);

// Custom routes
const routes = jsonServer.rewriter(await import('./mock-api/routes.json', { assert: { type: 'json' } }).default);
server.use(routes);

// Serve static files
server.use('/static', express.static(path.join(__dirname, 'public')));

// Load database
const db = await import('./mock-api/db.json', { assert: { type: 'json' } }).default;
const router = jsonServer.router(db);
server.use(router);

// Start server
const PORT = 4001;
server.listen(PORT, () => {
  console.log(`Mock API Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  Object.keys(routes).forEach(route => {
    console.log(`  ${route} -> ${routes[route]}`);
  });
});