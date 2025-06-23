class SunriseDataService
  include HTTParty
  
  base_uri 'https://api.sunrise-sunset.org'
  
  def initialize(location, start_date, end_date)
    @location = location.to_s.strip
    @start_date = start_date
    @end_date = end_date
    @geocoding_result = nil
  end
  
  def fetch_data
    geocoding_result = geocode_location
    return geocoding_result unless geocoding_result[:success]
    
    @geocoding_result = geocoding_result[:data]
    
    if data_exists_in_cache?
      return {
        success: true,
        data: load_from_cache,
        source: 'cache',
        message: 'Data retrieved from cache'
      }
    end
    
    fetch_missing_data_from_api
  end

  private
  
  def geocode_location
    geocoding_service = GeocodingService.new(@location)
    result = geocoding_service.find_coordinates
    
    unless result[:success]
      return {
        success: false,
        error: "Location error: #{result[:error]}"
      }
    end
    
    result
  end
  
  def data_exists_in_cache?
    return false unless @geocoding_result
    
    SunriseRecord.data_exists_for?(
      @geocoding_result[:display_name], 
      @start_date, 
      @end_date
    )
  end
  
  def load_from_cache
    records = SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .for_date_range(@start_date, @end_date)
      .order(:date)
    
    records.map { |record| format_record_for_response(record) }
  end

  def fetch_missing_data_from_api
    all_data = []
    errors = []
    
    (@start_date..@end_date).each do |date|
      if record_exists_for_date?(date)
        existing_record = find_existing_record(date)
        all_data << format_record_for_response(existing_record) if existing_record
        next
      end
      
      api_result = fetch_single_date_from_api(date)
      
      if api_result[:success]
        cached_record = cache_api_response(api_result[:data], date)
        all_data << format_record_for_response(cached_record)
      else
        errors << "#{date.strftime('%Y-%m-%d')}: #{api_result[:error]}"
      end
      
      sleep(0.1) if (@end_date - @start_date).to_i > 1
    end
    
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
  
  def record_exists_for_date?(date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .where(date: date)
      .exists?
  end
  
  def find_existing_record(date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .find_by(date: date)
  end

  def fetch_single_date_from_api(date)
    response = self.class.get('/json', {
      query: {
        lat: @geocoding_result[:latitude],
        lng: @geocoding_result[:longitude],
        date: date.strftime('%Y-%m-%d'),
        formatted: 0
      },
      timeout: 15
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

  def cache_api_response(api_data, date)
    results = api_data['results']
    
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
  
  def parse_api_time(time_string)
    return nil if time_string.blank?
    Time.zone.parse(time_string)
  rescue ArgumentError
    nil
  end
  
  def format_day_length_from_seconds(seconds)
    return nil unless seconds.is_a?(Numeric)
    
    hours = seconds / 3600
    minutes = (seconds % 3600) / 60
    remaining_seconds = seconds % 60
    
    "%02d:%02d:%02d" % [hours, minutes, remaining_seconds]
  end
  
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