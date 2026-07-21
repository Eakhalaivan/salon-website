# LuxeSuite Monorepo

Welcome to LuxeSuite, an enterprise spa and salon management platform.

## Architecture
- **Backend**: Spring Boot 3
- **Frontend**: React + TypeScript + Vite

## Running Locally

**Ports Convention**
The application uses port **8080** for the backend across all environments (both local dev and Docker).
The frontend runs on port **3000** via nginx when using docker-compose, and **5173** when using the local vite dev server.

### Local Development (Without Docker)

**1. Backend**
Navigate to the `backend` directory and run:
```bash
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8080`.

**2. Frontend**
Navigate to the `frontend` directory and run:
```bash
npm install
npm run dev
```
The frontend will start on `http://localhost:5173` and proxy `/api` requests to `http://localhost:8080`.

### Docker Compose
To run the entire stack (Database, Redis, Backend, Frontend) via Docker:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
