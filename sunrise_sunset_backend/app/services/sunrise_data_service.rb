# app/services/sunrise_data_service.rb
class SunriseDataService
    # Include HTTParty to handle HTTP requests to the Sunrise-Sunset API
    include HTTParty
    
    # Configure the base URI for the Sunrise-Sunset API
    # This API provides free access to sunrise and sunset data worldwide
    base_uri 'https://api.sunrise-sunset.org'
    
    # Initialize the service with the user's request parameters
    # We accept the same parameters that users will send to our API endpoint
    def initialize(location, start_date, end_date)
      @location = location.to_s.strip
      @start_date = start_date
      @end_date = end_date
      
      # We'll store the geocoding result once we fetch it
      # This avoids repeated geocoding calls for the same location
      @geocoding_result = nil
    end
    
    # This is the main public method that orchestrates the entire data fetching process
    # It implements the caching logic required by your assignment
    def fetch_data
      # First, we need to convert the location name to coordinates
      # This step can fail if the location is invalid or the geocoding service is unavailable
      geocoding_result = geocode_location
      return geocoding_result unless geocoding_result[:success]
      
      # Store the successful geocoding result for use in subsequent operations
      @geocoding_result = geocoding_result[:data]
      
      # Check if we already have all the requested data in our cache
      # This is the core optimization requirement from your assignment
      if data_exists_in_cache?
        return {
          success: true,
          data: load_from_cache,
          source: 'cache',
          message: 'Data retrieved from cache'
        }
      end
      
      # If we don't have complete cached data, fetch missing data from the external API
      # This ensures we always return complete datasets to users
      fetch_missing_data_from_api
    end

    private
  
  # Convert the user's location input to precise coordinates using our geocoding service
  # This method encapsulates all the complexity of location resolution
  def geocode_location
    geocoding_service = GeocodingService.new(@location)
    result = geocoding_service.find_coordinates
    
    # If geocoding fails, we pass the error directly to the user
    # This provides clear feedback about location-related problems
    unless result[:success]
      return {
        success: false,
        error: "Location error: #{result[:error]}"
      }
    end
    
    result
  end
  
  # Check whether we already have complete data for the requested location and date range
  # This implements the caching optimization that your assignment specifically requires
  def data_exists_in_cache?
    # We can only check the cache if we have a valid location from geocoding
    return false unless @geocoding_result
    
    # Use the model's class method to efficiently check for complete data coverage
    # This query uses the database indexes we created for optimal performance
    SunriseRecord.data_exists_for?(
      @geocoding_result[:display_name], 
      @start_date, 
      @end_date
    )
  end
  
  # Load and format cached data for return to the user
  # This method ensures cached data has the same format as fresh API data
  def load_from_cache
    records = SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .for_date_range(@start_date, @end_date)
      .order(:date)
    
    # Transform database records into the API response format
    # This ensures consistency regardless of whether data comes from cache or API
    records.map { |record| format_record_for_response(record) }
  end

  # Fetch missing data from the Sunrise-Sunset API and cache it for future use
  # This method handles all the complexity of external API integration
  def fetch_missing_data_from_api
    all_data = []
    errors = []
    
    # Process each date in the requested range
    # This ensures we return complete datasets even for multi-day requests
    (@start_date..@end_date).each do |date|
      # Skip dates we already have cached to avoid unnecessary API calls
      if record_exists_for_date?(date)
        existing_record = find_existing_record(date)
        all_data << format_record_for_response(existing_record) if existing_record
        next
      end
      
      # Fetch data for this specific date from the external API
      api_result = fetch_single_date_from_api(date)
      
      if api_result[:success]
        # Cache the successful response for future use
        cached_record = cache_api_response(api_result[:data], date)
        all_data << format_record_for_response(cached_record)
      else
        # Collect errors for comprehensive error reporting
        errors << "#{date.strftime('%Y-%m-%d')}: #{api_result[:error]}"
      end
      
      # Be respectful to the external API by adding small delays between requests
      # This prevents overwhelming free services and reduces the chance of rate limiting
      sleep(0.1) if (@end_date - @start_date).to_i > 1
    end
    
    # Return results with appropriate success/failure status
    if errors.empty?
      {
        success: true,
        data: all_data.sort_by { |record| record[:date] },
        source: 'api',
        message: 'Data fetched from external API'
      }
    else
      {
        success: false,
        error: "Failed to fetch some data: #{errors.join('; ')}"
      }
    end
  end
  
  # Check if we have a record for a specific date (used in the iteration above)
  def record_exists_for_date?(date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .where(date: date)
      .exists?
  end
  
  # Find an existing record for a specific date
  def find_existing_record(date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .find_by(date: date)
  end

  # Fetch sunrise/sunset data for a specific date from the external API
  # This method handles all the API's documented status codes and edge cases
  def fetch_single_date_from_api(date)
    begin
      # Make the HTTP request to the Sunrise-Sunset API
      # We use formatted=0 to get ISO timestamps for easier parsing
      response = self.class.get('/json', {
        query: {
          lat: @geocoding_result[:latitude],
          lng: @geocoding_result[:longitude],
          date: date.strftime('%Y-%m-%d'),
          formatted: 0  # This gives us ISO 8601 timestamps instead of formatted strings
        },
        timeout: 15  # Slightly longer timeout for the external API
      })
      
      # Check if the HTTP request itself succeeded
      unless response.success?
        return {
          success: false,
          error: "Sunrise API unavailable (HTTP #{response.code})"
        }
      end
      
      # Parse the JSON response
      data = response.parsed_response
      
      # Handle the various status codes documented in the API specification
      case data['status']
      when 'OK'
        # Successful response - return the data for caching
        {
          success: true,
          data: data
        }
      when 'INVALID_REQUEST'
        # This indicates a problem with our coordinates
        {
          success: false,
          error: "Invalid coordinates for #{@geocoding_result[:display_name]}"
        }
      when 'INVALID_DATE'
        # This handles dates that are too far in the past or future
        {
          success: false,
          error: "Invalid date: #{date.strftime('%Y-%m-%d')}"
        }
      when 'UNKNOWN_ERROR'
        # The API documentation suggests retrying for this status
        {
          success: false,
          error: "External API error - please try again later"
        }
      else
        # Handle any unexpected status codes
        {
          success: false,
          error: "Unexpected API response status: #{data['status']}"
        }
      end
      
    rescue HTTParty::Error, Net::TimeoutError => e
      # Handle network-related errors
      {
        success: false,
        error: "Network error while fetching sunrise data: #{e.message}"
      }
    rescue StandardError => e
      # Safety net for any other unexpected errors
      {
        success: false,
        error: "Unexpected error: #{e.message}"
      }
    end
  end

  # Save API response data to our database for future caching
  # This method transforms external API data into our internal data structure
  def cache_api_response(api_data, date)
    results = api_data['results']
    
    # Create a new database record with all the sunrise/sunset information
    SunriseRecord.create!(
      location: @geocoding_result[:display_name],
      date: date,
      latitude: @geocoding_result[:latitude],
      longitude: @geocoding_result[:longitude],
      sunrise: parse_api_time(results['sunrise']),
      sunset: parse_api_time(results['sunset']),
      solar_noon: parse_api_time(results['solar_noon']),
      day_length: format_day_length_from_seconds(results['day_length']),
      civil_twilight_begin: parse_api_time(results['civil_twilight_begin']),
      civil_twilight_end: parse_api_time(results['civil_twilight_end']),
      nautical_twilight_begin: parse_api_time(results['nautical_twilight_begin']),
      nautical_twilight_end: parse_api_time(results['nautical_twilight_end']),
      astronomical_twilight_begin: parse_api_time(results['astronomical_twilight_begin']),
      astronomical_twilight_end: parse_api_time(results['astronomical_twilight_end'])
    )
  end
  
  # Parse ISO 8601 timestamps from the API response
  # The formatted=0 parameter gives us timestamps like "2025-01-27T06:15:32+00:00"
  def parse_api_time(time_string)
    return nil if time_string.blank?
    
    # Use Rails' Time.zone.parse for consistent timezone handling
    Time.zone.parse(time_string)
  rescue ArgumentError
    # Handle any malformed timestamp strings gracefully
    nil
  end
  
  # Convert day length from seconds to human-readable format
  # The API returns day length in seconds when formatted=0
  def format_day_length_from_seconds(seconds)
    return nil unless seconds.is_a?(Numeric)
    
    hours = seconds / 3600
    minutes = (seconds % 3600) / 60
    remaining_seconds = seconds % 60
    
    "%02d:%02d:%02d" % [hours, minutes, remaining_seconds]
  end
  
  # Format a database record for consistent API responses
  # This ensures cached and fresh data look identical to users
  def format_record_for_response(record)
    {
      date: record.date.strftime('%Y-%m-%d'),
      location: record.location,
      coordinates: {
        latitude: record.latitude.to_f,
        longitude: record.longitude.to_f
      },
      sunrise: record.sunrise&.strftime('%H:%M:%S UTC'),
      sunset: record.sunset&.strftime('%H:%M:%S UTC'),
      solar_noon: record.solar_noon&.strftime('%H:%M:%S UTC'),
      day_length: record.day_length,
      twilight: {
        civil_begin: record.civil_twilight_begin&.strftime('%H:%M:%S UTC'),
        civil_end: record.civil_twilight_end&.strftime('%H:%M:%S UTC'),
        nautical_begin: record.nautical_twilight_begin&.strftime('%H:%M:%S UTC'),
        nautical_end: record.nautical_twilight_end&.strftime('%H:%M:%S UTC'),
        astronomical_begin: record.astronomical_twilight_begin&.strftime('%H:%M:%S UTC'),
        astronomical_end: record.astronomical_twilight_end&.strftime('%H:%M:%S UTC')
      },
      golden_hour: record.golden_hour_info
    }
  end
end