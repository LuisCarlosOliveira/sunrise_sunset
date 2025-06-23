# Sunrise Sunset Application

A full-stack web application to track sunrise and sunset times, built with Ruby on Rails (backend) and React + Vite (frontend).

## Features

- Search sunrise/sunset data by location
- Interactive charts showing solar patterns
- Detailed data tables with pagination
- Golden hour calculations
- Responsive design with Tailwind CSS

## Setup Instructions

### Prerequisites
- Ruby 3.4.4
- Node.js 20+
- PostgreSQL (running and accessible)
- Git
- Bundler gem

### Environment Configuration

Both backend and frontend require environment variables to be configured:

#### Backend Environment (.env)
Copy the example file and configure:
```bash
cd sunrise_sunset_backend
cp .env.example .env
```

Edit the `.env` file with your specific configuration values.

#### Frontend Environment (.env)
Copy the example file and configure:
```bash
cd sunrise_sunset_frontend
cp .env.example .env
```

Edit the `.env` file with your specific configuration values.

### Installation & Setup

#### 1. Backend Setup (Rails)
```bash
cd sunrise_sunset_backend

# Install dependencies
bundle install

# Setup database
rails db:create
rails db:migrate

# Start the server
rails server
```

The backend will be available at `http://localhost:3000`

#### 2. Frontend Setup (React + Vite)
```bash
cd sunrise_sunset_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3001`

### Running the Application

1. **Start the backend:**
   ```bash
   cd sunrise_sunset_backend
   rails server
   ```

2. **Start the frontend (in a new terminal):**
   ```bash
   cd sunrise_sunset_frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

### Development Commands

#### Backend (Rails)
```bash
# Run tests
bundle exec rspec

# Run linter
bundle exec rubocop

# Database commands
rails db:migrate
rails db:seed
rails db:reset
```

#### Frontend (React)
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
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