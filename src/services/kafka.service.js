const { Kafka } = require('kafkajs');
const config = require('../config');

const kafka = new Kafka(config.kafka);
const producer = kafka.producer();

const connect = async () => {
  await producer.connect();
};

const disconnect = async () => {
  await producer.disconnect();
};

const sendMessage = async (topic, key, value) => {
  await producer.send({
    topic,
    messages: [{ key, value: JSON.stringify(value) }],
  });
};

module.exports = {
  connect,
  disconnect,
  sendMessage,
};