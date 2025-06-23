# Use Ruby 3.4.4 Alpine for smaller image size
FROM ruby:3.4.4-alpine

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    tzdata \
    bash \
    curl

# Create app directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle config --global frozen 1 && \
    bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Create tmp and log directories
RUN mkdir -p tmp/pids log

# Precompile assets (if any) and bootsnap
RUN RAILS_ENV=production bundle exec bootsnap precompile --gemfile app/ lib/

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/up || exit 1

# Start the server
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]