class ApplicationController < ActionController::API
    # These helper methods provide consistent JSON response formatting across all controllers
    # This ensures our API always returns data in a predictable, professional format
    
    # Standard success response method used throughout the application
    # This method provides consistent formatting for successful API responses
    def render_json_response(data, status = :ok)
      render json: data, status: status
    end
    
    # Standard error response method used throughout the application  
    # This method provides consistent formatting for error responses with appropriate HTTP status codes
    def render_error_response(message, status = :unprocessable_entity)
      render json: { error: message }, status: status
    end
    
    private
    
    # Global error handling for unexpected exceptions
    # This safety net catches any errors that slip through other error handling
    # and provides a consistent response format while logging details for debugging
    rescue_from StandardError do |exception|
      # Log the full error details for debugging purposes
      # This information helps developers identify and fix issues quickly
      Rails.logger.error "Unexpected API Error: #{exception.message}"
      Rails.logger.error "Backtrace: #{exception.backtrace.join("\n")}"
      
      # Return a user-friendly error message without exposing internal system details
      # In production environments, you never want to expose stack traces or internal errors to users
      render_error_response("An unexpected error occurred. Please try again later.", :internal_server_error)
    end
  end