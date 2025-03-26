const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');

router.post('/message', messagesController.createMessage);
router.get('/messages', messagesController.getMessages);
router.get('/messages/:id', messagesController.getMessage);
router.put('/messages/:id', messagesController.updateMessage);
router.delete('/messages/:id', messagesController.deleteMessage);

module.exports = router;