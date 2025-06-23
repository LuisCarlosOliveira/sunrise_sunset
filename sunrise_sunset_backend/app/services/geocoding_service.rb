class GeocodingService
  include HTTParty
  
  base_uri ENV.fetch('GEOCODING_API_BASE_URL', 'https://nominatim.openstreetmap.org')
  headers 'User-Agent' => 'SunriseApp/1.0 (Assignment Project)'
  
  def initialize(location_name)
    @location_name = location_name.to_s.strip
  end

  def find_coordinates
    return failure_result("Location name cannot be empty") if @location_name.blank?
    
    response = self.class.get('/search', {
      query: {
        q: @location_name,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      timeout: 10
    })
    
    unless response.success?
      return failure_result("Geocoding service unavailable (HTTP #{response.code})")
    end
    
    results = response.parsed_response
    
    if results.empty?
      return failure_result("Location '#{@location_name}' not found. Please try a more specific name like 'Lisbon, Portugal' or check spelling.")
    end
    
    result = results.first
    latitude = result['lat'].to_f
    longitude = result['lon'].to_f
    
    unless valid_coordinates?(latitude, longitude)
      return failure_result("Invalid coordinates received for '#{@location_name}'")
    end
    
    display_name = format_display_name(result)
    
    success_result({
      latitude: latitude,
      longitude: longitude,
      display_name: display_name,
      original_query: @location_name
    })
    
  rescue HTTParty::Error, Net::TimeoutError => e
    failure_result("Network error while geocoding: #{e.message}")
  rescue StandardError => e
    failure_result("Unexpected error during geocoding: #{e.message}")
  end
  
  private
  
  def valid_coordinates?(lat, lng)
    lat.between?(-90, 90) && lng.between?(-180, 180)
  end
  
  def format_display_name(result)
    address = result['address'] || {}
    parts = []
    
    city = address['city'] || address['town'] || address['village'] || address['municipality']
    parts << city if city.present?
    
    country = address['country']
    parts << country if country.present? && parts.any?
    
    if parts.empty?
      result['display_name']&.split(',')&.first || @location_name.titleize
    else
      parts.join(', ')
    end
  end
  
  def success_result(data)
    { success: true, data: data }
  end
  
  def failure_result(error_message)
    { success: false, error: error_message }
  end
end