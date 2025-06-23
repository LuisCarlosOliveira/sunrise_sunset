class SunriseController < ApplicationController
  def show
    location = params[:location]
    start_date = parse_date(params[:start_date])
    end_date = parse_date(params[:end_date])
    
    validation_error = validate_parameters(location, start_date, end_date)
    return render_error_response(validation_error) if validation_error
    
    service = SunriseDataService.new(location, start_date, end_date)
    result = service.fetch_data
    
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
      render_error_response(result[:error], :unprocessable_entity)
    end
  end
  
  private
  
  def parse_date(date_string)
    return nil if date_string.blank?
    Date.parse(date_string)
  rescue ArgumentError
    nil
  end
  
  def validate_parameters(location, start_date, end_date)
    return "Location parameter is required" if location.blank?
    return "Start date parameter is required" if start_date.nil?
    return "End date parameter is required" if end_date.nil?
    
    if start_date > end_date
      return "Start date must be before or equal to end date"
    end
    
    date_range_days = (end_date - start_date).to_i + 1
    if date_range_days > 365
      return "Date range cannot exceed 365 days (requested: #{date_range_days} days)"
    end
    
    if start_date < Date.current - 5.years
      return "Start date cannot be more than 5 years in the past"
    end
    
    if end_date > Date.current + 2.years
      return "End date cannot be more than 2 years in the future"
    end
    
    nil
  end
end