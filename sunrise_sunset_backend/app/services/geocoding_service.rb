class GeocodingService
    include HTTParty
    
    base_uri 'https://nominatim.openstreetmap.org'
    headers 'User-Agent' => 'SunriseApp/1.0 (Educational Project)'
    
    def initialize(location_name)
      # normalizing the input immediately to handle edge cases
      # prevents issues with extra whitespace or nil values
      @location_name = location_name.to_s.strip
    end
  
    # orchestrates the entire process of converting a location name to coordinates
    def find_coordinates
      # check for invalid input before doing any work
      return failure_result("Location name cannot be empty") if @location_name.blank?
      
      begin
        response = self.class.get('/search', {
          query: {
            q: @location_name,              
            format: 'json',                  
            limit: 1,                         
            addressdetails: 1                
          },
          timeout: 10                         
        })
        
        # validate that the HTTP request itself succeeded
        unless response.success?
          return failure_result("Geocoding service unavailable (HTTP #{response.code})")
        end
        
        # Parse the JSON response into Ruby data structures
        results = response.parsed_response
        
        # Handle the case where no locations matched the search term
        # (misspelled names, fictional places, or very obscure locations)
        if results.empty?
          return failure_result("Location '#{@location_name}' not found. Please try a more specific name like 'Lisbon, Portugal' or check spelling.")
        end
        
        # Extract the geographic coordinates from the best matching result
        # converted to float to ensure proper numeric values for calculations
        result = results.first
        latitude = result['lat'].to_f
        longitude = result['lon'].to_f
        
        # Validate that the coordinates we received are valid Earth coordinates
        unless valid_coordinates?(latitude, longitude)
          return failure_result("Invalid coordinates received for '#{@location_name}'")
        end
        
        # Create a user-friendly display name from the detailed geocoding result
        display_name = format_display_name(result)
        
        # Return all the information in a consistent structure
        success_result({
          latitude: latitude,
          longitude: longitude,
          display_name: display_name,
          original_query: @location_name
        })
        
      # Handle different types of network and parsing errors gracefully
      rescue HTTParty::Error, Net::TimeoutError => e
        failure_result("Network error while geocoding: #{e.message}")
      rescue StandardError => e
        # safety net for any unexpected errors not anticipated
        failure_result("Unexpected error during geocoding: #{e.message}")
      end
    end
    
    private
    
    # Validate that coordinates fall within the possible ranges for Earth
    def valid_coordinates?(lat, lng)
      lat.between?(-90, 90) && lng.between?(-180, 180)
    end
    
    # Extract the most relevant parts of a geocoding result to create clean location names
    def format_display_name(result)
      address = result['address'] || {}
      
      parts = []
      
      # Different regions use different administrative structures, checking multiple possibilities
      city = address['city'] || address['town'] || address['village'] || address['municipality']
      parts << city if city.present?
      
      # Add country information for additional context
      country = address['country']
      parts << country if country.present? && parts.any?
      
      # Provide a sensible fallback if not extracted clean address components
      if parts.empty?
        # Take just the first part of the complete address 
        result['display_name']&.split(',')&.first || @location_name.titleize
      else
        # Join the parts with commas to create a readable location name
        parts.join(', ')
      end
    end
    
    # These methods ensure consistent response formats throughout application
    def success_result(data)
      {
        success: true,
        data: data
      }
    end
    
    def failure_result(error_message)
      {
        success: false,
        error: error_message
      }
    end
  end