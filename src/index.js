const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const kafka = require('./services/kafka.service');
const db = require('./services/db.service');
const messagesRoutes = require('./routes/messages.routes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', messagesRoutes);

// Connect Kafka
kafka.connect().catch(console.error);

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await kafka.disconnect();
  await db.end();
  process.exit(0);
});