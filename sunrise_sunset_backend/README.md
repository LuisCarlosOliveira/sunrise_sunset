# Sunrise Sunset Backend

Ruby on Rails API backend for the Sunrise Sunset application.

## Setup

### Prerequisites
- Ruby 3.4.4
- PostgreSQL
- Bundler

### Environment Configuration

Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration values. See `.env.example` for all required environment variables.

### Installation

1. **Install dependencies:**
   ```bash
   bundle install
   ```

2. **Setup database:**
   ```bash
   rails db:create
   rails db:migrate
   ```

3. **Start the server:**
   ```bash
   rails server
   ```

The API will be available at `http://localhost:3000`

## Development

### Running Tests
```bash
bundle exec rspec
```

### Code Quality
```bash
# Run RuboCop linter
bundle exec rubocop

# Run Brakeman security scanner
bundle exec brakeman
```

### Database Management
```bash
# Run migrations
rails db:migrate

# Seed database
rails db:seed

# Reset database
rails db:reset
```

## API Endpoints

### Sunrise Data
- `GET /sunrise?location=<location>&start_date=<date>&end_date=<date>`
  - Returns sunrise/sunset data for a location and date range
  - Parameters:
    - `location`: City name or coordinates
    - `start_date`: Start date (YYYY-MM-DD)
    - `end_date`: End date (YYYY-MM-DD)

### Health Check
- `GET /up`
  - Returns application status

## Tech Stack

- **Ruby** 3.4.4
- **Rails** 8.0.2
- **PostgreSQL** for database
- **HTTParty** for external API calls
- **RSpec** for testing
- **RuboCop** for code style
- **Brakeman** for security analysis

## Architecture

The backend follows Rails conventions with:
- **Controllers** for handling HTTP requests
- **Services** for business logic
- **Models** for data persistence
- **API clients** for external service integration
