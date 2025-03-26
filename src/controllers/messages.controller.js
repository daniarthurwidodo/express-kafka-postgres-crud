const { ulid } = require('ulid');
const db = require('../services/db.service');
const kafka = require('../services/kafka.service');

// Create a new message
const createMessage = async (req, res) => {
    try {
        const { topic, message } = req.body;
        const messageId = ulid();

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let messageObject = typeof message === 'string' ? JSON.parse(message) : message;
        
        const query = 'INSERT INTO messages(id, topic, message) VALUES($1, $2, $3::jsonb) RETURNING *';
        const values = [messageId, topic || 'test-topic', messageObject];
        const result = await db.query(query, values);

        await kafka.sendMessage(topic || 'test-topic', messageId, messageObject);

        res.json({
            status: 'Message sent successfully!',
            stored: result.rows[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

// Get all messages
const getMessages = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Get a single message by ID
const getMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM messages WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
};

// Update a message
const updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { topic, message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let messageObject = typeof message === 'string' ? JSON.parse(message) : message;

        const query = `
            UPDATE messages 
            SET topic = $1, message = $2::jsonb, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3 
            RETURNING *
        `;
        const result = await db.query(query, [topic || 'test-topic', messageObject, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await kafka.sendMessage(topic || 'test-topic', id, {
            action: 'UPDATE',
            data: messageObject
        });

        res.json({
            status: 'Message updated successfully!',
            updated: result.rows[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM messages WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await kafka.sendMessage(result.rows[0].topic || 'test-topic', id, {
            action: 'DELETE',
            id: id
        });

        res.json({
            status: 'Message deleted successfully!',
            deleted: result.rows[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

module.exports = {
    createMessage,
    getMessages,
    getMessage,
    updateMessage,
    deleteMessage
};