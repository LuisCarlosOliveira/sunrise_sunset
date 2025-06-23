# Sunrise Sunset Project

This repository contains a full-stack application for tracking sunrise and sunset data worldwide.

## Project Structure
- `sunrise_sunset_backend/`: Ruby on Rails API for sunrise/sunset data
- `sunrise_sunset_frontend/`: React + Vite frontend application

## Features

### Backend (Ruby on Rails)
- ✅ REST API endpoint for sunrise/sunset data
- ✅ Location geocoding via OpenStreetMap Nominatim
- ✅ Data caching with PostgreSQL database
- ✅ Batch processing for large date ranges
- ✅ Comprehensive error handling
- ✅ Arctic/Antarctic edge case support

### Frontend (React + Vite)
- ✅ Location and date range input forms
- ✅ Interactive charts (Recharts) with adaptive data sampling
- ✅ Detailed data tables with sorting
- ✅ Golden hour calculations and display
- ✅ Responsive design with Tailwind CSS
- ✅ Error handling and retry functionality

## Quick Start

### Backend Setup
```bash
cd sunrise_sunset_backend
bundle install
rails db:create db:migrate
rails server
```

### Frontend Setup
```bash
cd sunrise_sunset_frontend
cp .env.example .env  # Copy environment template
npm install
npm run dev
```

## Configuration

### Backend Environment Variables
Copy `.env.example` to `.env` and configure:
```
DATABASE_URL=postgresql://localhost/sunrise_sunset_development
PORT=3000
API_TIMEOUT_SECONDS=15
```

### Frontend Environment Variables
Copy `.env.example` to `.env` and configure:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=60000
```

## Performance Optimizations

- **Timeout Handling**: Frontend timeout increased to 60s for large date ranges
- **Batch Processing**: Backend processes API calls in batches of 10
- **Dynamic Charts**: Charts display all data with intelligent X-axis labeling
- **Table Pagination**: Data tables paginated at 10 results per page
- **Database Caching**: Repeated queries return cached data instantly

## API Usage

### Get Sunrise/Sunset Data
```
GET /sunrise?location=Berlin&start_date=2024-01-01&end_date=2024-01-07
```

**Response:**
```json
{
  "location": "Berlin, Germany",
  "requested_date_range": {
    "start": "2024-01-01",
    "end": "2024-01-07"
  },
  "data_source": "cache",
  "total_days": 7,
  "data": [...]
}
```
