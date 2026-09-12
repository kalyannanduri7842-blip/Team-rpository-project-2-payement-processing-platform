# Deployment & Containerization Guide

## Running with Docker Compose

To start the full distributed stack with PostgreSQL, Redis, RabbitMQ, all 10 microservices, and the React Web App:

```bash
docker compose up --build
```

### Container Endpoints

- **Web Application**: `http://localhost:80` (or `http://localhost:5173`)
- **API Gateway**: `http://localhost:4000`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **RabbitMQ Dashboard**: `http://localhost:15672` (guest/guest)

---

## Running Locally (Standalone Mode)

No Docker or external database required! The application boots immediately with embedded data persistence:

```bash
# 1. Install dependencies
npm install

# 2. Start full stack (Backend Microservices + React Web UI)
npm run dev
```

Web UI will open at `http://localhost:5173` and API Gateway at `http://localhost:4000`.
