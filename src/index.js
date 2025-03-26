const express = require('express');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { ulid } = require('ulid');

const app = express();

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize PostgreSQL client
const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'mydb',
  password: 'password',
  port: 5432,
});

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

// Create a producer
const producer = kafka.producer();

// Connect the producer when the app starts
producer.connect().catch(console.error);

// Add message route
app.post('/message', async (req, res) => {
  try {
    const { topic, message } = req.body;
    const messageId = ulid(); // This generates a string ID
    
    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Handle message parsing safely
    let messageObject;
    try {
      messageObject = typeof message === 'string' ? JSON.parse(message) : message;
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON message format' });
    }
    
    // Send to Kafka
    await producer.send({
      topic: topic || 'test-topic',
      messages: [
        { 
          key: messageId,
          value: JSON.stringify(messageObject) 
        },
      ],
    });

    // Store in PostgreSQL with string ID
    const query = 'INSERT INTO messages(id, topic, message) VALUES($1, $2, $3::jsonb) RETURNING *';
    const values = [messageId, topic || 'test-topic', messageObject];
    const dbResult = await pool.query(query, values);

    res.json({ 
      status: 'Message sent successfully!',
      stored: dbResult.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Add route to get messages
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add route to get a single message by ID
app.get('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Update a message
app.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, message } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Handle message parsing safely
    let messageObject;
    try {
      messageObject = typeof message === 'string' ? JSON.parse(message) : message;
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON message format' });
    }

    // Update in PostgreSQL
    const query = 'UPDATE messages SET topic = $1, message = $2::jsonb, updated_at = NOW() WHERE id = $3 RETURNING *';
    const values = [topic || 'test-topic', messageObject, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Send updated message to Kafka
    await producer.send({
      topic: topic || 'test-topic',
      messages: [
        {
          key: id,
          value: JSON.stringify({
            action: 'UPDATE',
            data: messageObject
          })
        },
      ],
    });

    res.json({
      status: 'Message updated successfully!',
      updated: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete a message
app.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from PostgreSQL
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Send deletion event to Kafka
    await producer.send({
      topic: result.rows[0].topic || 'test-topic',
      messages: [
        {
          key: id,
          value: JSON.stringify({
            action: 'DELETE',
            id: id
          })
        },
      ],
    });

    res.json({
      status: 'Message deleted successfully!',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await producer.disconnect();
  await pool.end();
  process.exit(0);
});