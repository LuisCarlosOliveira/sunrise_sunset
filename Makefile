# Sunrise Sunset Application - Docker Management

.PHONY: help build up down dev logs clean restart

# Default target
help:
	@echo "Available commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start production environment"
	@echo "  make down      - Stop all services"
	@echo "  make dev       - Start development environment with hot reload"
	@echo "  make logs      - View logs from all services"
	@echo "  make clean     - Remove all containers, volumes, and images"
	@echo "  make restart   - Restart all services"

# Build all images
build:
	docker-compose build --no-cache

# Start production environment
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Start development environment
dev:
	docker-compose -f docker-compose.dev.yml up --build

# View logs
logs:
	docker-compose logs -f

# Clean everything
clean:
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -af

# Restart services
restart:
	docker-compose restart

# Database commands
db-migrate:
	docker-compose exec backend bundle exec rails db:migrate

db-seed:
	docker-compose exec backend bundle exec rails db:seed

db-reset:
	docker-compose exec backend bundle exec rails db:reset