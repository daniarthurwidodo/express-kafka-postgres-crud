# Express Kafka Postgres CRUD

A RESTful API service that implements CRUD operations using Express.js, Apache Kafka, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- PostgreSQL
- Apache Kafka

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd express-kafka-postgres-crud
```

2. Install dependencies:

```bash
npm install
```

3. Start PostgreSQL and Kafka using Docker:

```bash
docker-compose up -d
```

4. Initialize the database:

```bash
npm run init-db
```

## Project Structure

```
.
├── src/
│   └── index.js          # Main application file
├── scripts/
│   ├── init-db.js        # Database initialization script
│   └── reset-db.js       # Database reset script
├── docker-compose.yml    # Docker services configuration
├── package.json
└── README.md
```

## API Endpoints

### Create Message

- **POST** `/message`
- Creates a new message and sends it to Kafka

```json
{
  "topic": "test-topic",
  "message": {
    "key": "value"
  }
}
```

- Response:

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

### Read Messages

- **GET** `/messages`
- Retrieves all messages
- Response: Array of message objects

### Read Single Message

- **GET** `/messages/:id`
- Retrieves a specific message by ID
- Response: Single message object

### Update Message

- **PUT** `/messages/:id`
- Updates an existing message

```json
{
  "topic": "test-topic",
  "message": {
    "key": "updated-value"
  }
}
```

- Response:

```json
{
  "status": "Message updated successfully!",
  "updated": {
    "id": "01HRBX...",
    "topic": "test-topic",
    "message": {"key": "updated-value"},
    "updated_at": "2024-03-26T..."
  }
}
```

### Delete Message

- **DELETE** `/messages/:id`
- Deletes a message by ID
- Response:

```json
{
  "status": "Message deleted successfully!",
  "deleted": {
    "id": "01HRBX...",
    "topic": "test-topic",
    "message": {"key": "value"}
  }
}
```

## Database Management

Initialize database:

```bash
npm run init-db
```

Reset database (warning: this will delete all data):

```bash
npm run reset-db
```

## Running the Application

Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Error Handling

All endpoints return appropriate HTTP status codes:

- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Environment Variables

The application uses the following default configuration:

- PostgreSQL: localhost:5432
- Kafka: localhost:9092
- Application Port: 3000

## Graceful Shutdown

The application handles graceful shutdown for both Kafka and PostgreSQL connections when receiving a SIGTERM signal.
