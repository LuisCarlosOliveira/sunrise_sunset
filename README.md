# Sunrise Sunset Application

A full-stack web application to track sunrise and sunset times, built with Ruby on Rails (backend) and React + Vite (frontend).

## Features

- Search sunrise/sunset data by location
- Interactive charts showing solar patterns
- Detailed data tables with pagination
- Golden hour calculations
- Responsive design with Tailwind CSS

## Docker Setup (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/sunrise_sunset
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### Docker Services

- **frontend**: React app served with Nginx (port 80/3001)
- **backend**: Rails API server (port 3000)
- **database**: PostgreSQL 16 (port 5432)

### Environment Variables

Copy `.env.example` to `.env` and modify as needed:
```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY_BASE`: Rails secret key
- `SUNRISE_API_BASE_URL`: External sunrise API endpoint
- `GEOCODING_API_BASE_URL`: Geocoding service endpoint
- `VITE_API_BASE_URL`: Frontend API base URL

### Development with Docker

For development with hot reloading:

```bash
# Use development docker-compose
docker-compose -f docker-compose.dev.yml up --build

# Access:
# - Frontend: http://localhost:3001 (hot reload enabled)
# - Backend: http://localhost:3000
# - Database: localhost:5433
```

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Stop services
docker-compose down

# Reset everything (including volumes)
docker-compose down -v --remove-orphans
```

## Manual Setup (Alternative)

### Backend (Rails)
```bash
cd sunrise_sunset_backend
bundle install
rails db:create db:migrate
rails server
```

### Frontend (React)
```bash
cd sunrise_sunset_frontend
npm install
npm run dev
```

## API Endpoints

- `GET /sunrise?location=<location>&start_date=<date>&end_date=<date>`
- `GET /up` (health check)

## Tech Stack

**Backend:**
- Ruby 3.4.4
- Rails 8.0.2
- PostgreSQL
- HTTParty for API calls

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Recharts for visualization
- Axios for HTTP requests

**Infrastructure:**
- Docker & Docker Compose
- Nginx for frontend serving
- PostgreSQL database

## Architecture

```
Frontend (React/Vite) → Backend (Rails API) → External APIs
                                ↓
                          PostgreSQL Database
```

The application follows a clean architecture with:
- Service layer for business logic
- API clients for external integrations
- Caching layer for performance
- RESTful API design