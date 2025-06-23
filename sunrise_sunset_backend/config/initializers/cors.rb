Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins 'localhost:3000', 'localhost:3001', 'localhost:5173', '127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:5173'
      
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true
    end
  end