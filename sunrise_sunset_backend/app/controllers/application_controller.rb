class ApplicationController < ActionController::API
  def render_json_response(data, status = :ok)
    render json: data, status: status
  end
  
  def render_error_response(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end
  
  private
  
  rescue_from StandardError do |exception|
    Rails.logger.error "Unexpected API Error: #{exception.message}"
    Rails.logger.error "Backtrace: #{exception.backtrace.join("\n")}"
    
    render_error_response("An unexpected error occurred. Please try again later.", :internal_server_error)
  end
end