# app/controllers/sunrise_controller.rb
class SunriseController < ApplicationController
  # This is the main API endpoint that handles requests for sunrise and sunset data
  # It accepts location, start_date, and end_date parameters and returns comprehensive sun information
  def show
    # Extract and validate the required parameters from the HTTP request
    # We handle parameter extraction carefully to provide clear error messages
    location = params[:location]
    start_date = parse_date(params[:start_date])
    end_date = parse_date(params[:end_date])
    
    # Validate that all required parameters are present and valid
    # Early validation prevents unnecessary processing and provides immediate feedback
    validation_error = validate_parameters(location, start_date, end_date)
    return render_error_response(validation_error) if validation_error
    
    # Delegate the complex business logic to our specialized service
    # This follows the Rails convention of keeping controllers thin and focused on HTTP concerns
    service = SunriseDataService.new(location, start_date, end_date)
    result = service.fetch_data
    
    # Handle the service response and format it appropriately for HTTP
    # We provide different responses based on whether the operation succeeded
    if result[:success]
      render_json_response({
        location: location,
        requested_date_range: {
          start: start_date.strftime('%Y-%m-%d'),
          end: end_date.strftime('%Y-%m-%d')
        },
        data_source: result[:source],
        message: result[:message],
        data: result[:data],
        total_days: result[:data]&.length || 0
      })
    else
      # Pass service errors directly to the user with appropriate HTTP status
      render_error_response(result[:error], :unprocessable_entity)
    end
  end
  
  private
  
  # Parse date strings safely, handling various input formats gracefully
  # This method prevents crashes from malformed date inputs
  def parse_date(date_string)
    # Handle nil or empty strings gracefully
    return nil if date_string.blank?
    
    # Use Ruby's built-in date parsing with error handling
    Date.parse(date_string)
  rescue ArgumentError
    # Return nil for any date that can't be parsed
    # This allows the validation method to provide appropriate error messages
    nil
  end
  
  # Comprehensive parameter validation with specific error messages
  # This method checks all the business rules for valid API requests
  def validate_parameters(location, start_date, end_date)
    # Check for required parameters first
    return "Location parameter is required" if location.blank?
    return "Start date parameter is required" if start_date.nil?
    return "End date parameter is required" if end_date.nil?
    
    # Validate the logical relationship between dates
    if start_date > end_date
      return "Start date must be before or equal to end date"
    end
    
    # Prevent abuse by limiting the date range size
    # This protects against requests that could overwhelm external APIs
    date_range_days = (end_date - start_date).to_i + 1
    if date_range_days > 365
      return "Date range cannot exceed 365 days (requested: #{date_range_days} days)"
    end
    
    # Prevent requests for dates too far in the past or future
    # Many external APIs have limitations on historical or future data
    if start_date < Date.current - 5.years
      return "Start date cannot be more than 5 years in the past"
    end
    
    if end_date > Date.current + 2.years
      return "End date cannot be more than 2 years in the future"
    end
    
    # Return nil if all validations pass
    nil
  end
end