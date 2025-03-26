# Express Kafka Postgres CRUD

A RESTful API service that implements CRUD operations using Express.js, Apache Kafka, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- PostgreSQL
- Apache Kafka

## Quick Start

1. Clone the repository:

```bash
git clone <repository-url>
cd express-kafka-postgres-crud
```

2. Copy environment file and update variables:

```bash
cp .env.example .env
```

3. Install dependencies:

```bash
npm install
```

4. Start infrastructure services:

```bash
docker-compose up -d
```

5. Initialize database:

```bash
npm run init-db
```

6. Start the application:

```bash
npm start
```

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── index.js         # Application entry point
├── scripts/
│   ├── init-db.js       # Database initialization
│   └── reset-db.js      # Database reset
├── docker-compose.yml   # Docker services
├── .env                 # Environment variables
└── README.md
```

## API Reference

### Messages API

#### Create Message

```http
POST /message
Content-Type: application/json

{
  "topic": "test-topic",
  "message": {
    "key": "value"
  }
}
```

Response:

```json
{
  "status": "Message sent successfully!",
  "stored": {
    "id": "01HRBX...",
    "topic": "test-topic",
    "message": {"key": "value"},
    "created_at": "2024-03-26T..."
  }
}
```

#### Get All Messages

```http
GET /messages
```

#### Get Single Message

```http
GET /messages/:id
```

#### Update Message

```http
PUT /messages/:id
Content-Type: application/json

{
  "topic": "test-topic",
  "message": {
    "key": "updated-value"
  }
}
```

#### Delete Message

```http
DELETE /messages/:id
```

## Development

### Database Management

Initialize new database:

```bash
npm run init-db
```

Reset existing database:

```bash
npm run reset-db
```

### Environment Variables

```bash
# Server Configuration
PORT=3000

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mydb
POSTGRES_USER=user
POSTGRES_PASSWORD=password

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=my-app
```

### Error Codes

| Status | Description |
|--------|-------------|
| 200    | Success |
| 400    | Bad Request - Invalid input |
| 404    | Not Found - Resource doesn't exist |
| 500    | Server Error |

### Testing with cURL

Create a message:

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"topic":"test-topic","message":{"key":"value"}}'
```

Get all messages:

```bash
curl http://localhost:3000/messages
```

Get single message:

```bash
curl http://localhost:3000/messages/YOUR_MESSAGE_ID
```

Update message:

```bash
curl -X PUT http://localhost:3000/messages/YOUR_MESSAGE_ID \
  -H "Content-Type: application/json" \
  -d '{"topic":"test-topic","message":{"key":"updated-value"}}'
```

Delete message:

```bash
curl -X DELETE http://localhost:3000/messages/YOUR_MESSAGE_ID
```

## Production

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Graceful Shutdown

The application handles graceful shutdown by:

- Closing Kafka connections
- Closing database connections
- Processing remaining requests

Triggered by SIGTERM signal:

```bash
kill -TERM <pid>
```
