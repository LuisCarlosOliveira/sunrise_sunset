# HTTP client for sunrise-sunset.org API
# Handles rate limiting, batching, and error handling
class SunriseApiClient
  include HTTParty
  
  base_uri ENV.fetch('SUNRISE_API_BASE_URL', 'https://api.sunrise-sunset.org')
  
  # API configuration constants
  TIMEOUT = 15
  BATCH_SIZE = 10
  BATCH_DELAY = 0.2.seconds
  RATE_LIMIT_DELAY = 0.05.seconds
  
  def initialize(geocoding_result)
    @geocoding_result = geocoding_result
  end
  
  # Fetch data for a single date
  def fetch_single_date(date)
    response = self.class.get('/json', {
      query: {
        lat: @geocoding_result[:latitude],
        lng: @geocoding_result[:longitude],
        date: date.strftime('%Y-%m-%d'),
        formatted: 0
      },
      timeout: TIMEOUT
    })
    
    unless response.success?
      return {
        success: false,
        error: "Sunrise API unavailable (HTTP #{response.code})"
      }
    end
    
    data = response.parsed_response
    
    case data['status']
    when 'OK'
      { success: true, data: data }
    when 'INVALID_REQUEST'
      { success: false, error: "Invalid coordinates for #{@geocoding_result[:display_name]}" }
    when 'INVALID_DATE'
      { success: false, error: "Invalid date: #{date.strftime('%Y-%m-%d')}" }
    when 'UNKNOWN_ERROR'
      { success: false, error: "External API error - please try again later" }
    else
      { success: false, error: "Unexpected API response status: #{data['status']}" }
    end
    
  rescue HTTParty::Error, Net::TimeoutError => e
    { success: false, error: "Network error while fetching sunrise data: #{e.message}" }
  rescue StandardError => e
    { success: false, error: "Unexpected error: #{e.message}" }
  end
  
  # Fetch data for multiple dates in batches
  def fetch_date_batch(dates)
    results = {}
    
    dates.each do |date|
      results[date] = fetch_single_date(date)
      # Rate limiting between requests
      sleep(RATE_LIMIT_DELAY) unless date == dates.last
    end
    
    results
  end
end