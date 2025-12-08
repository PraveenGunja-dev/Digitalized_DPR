const jsonServer = require('json-server');
const path = require('path');
const express = require('express');

// Create server
const server = jsonServer.create();

// Set up middlewares
const middlewares = jsonServer.defaults();
server.use(middlewares);

// Use body parser middleware to handle POST, PUT, PATCH requests
server.use(jsonServer.bodyParser);

// Custom routes
const routes = require('./mock-api/routes.json');
server.use(jsonServer.rewriter(routes));

// Serve static files
server.use('/static', express.static(path.join(__dirname, 'public')));

// Load database
const db = require('./mock-api/db.json');
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