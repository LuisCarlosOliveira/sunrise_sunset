class SunriseCacheManager
  def initialize(geocoding_result)
    @geocoding_result = geocoding_result
  end
  
  # Check if all data exists for date range
  def data_exists_for_range?(start_date, end_date)
    SunriseRecord.data_exists_for?(
      @geocoding_result[:display_name], 
      start_date, 
      end_date
    )
  end
  
  # Check if data exists for a specific date
  def record_exists_for_date?(date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .where(date: date)
      .exists?
  end
  
  # Find existing record for a date
  def find_existing_record(date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .find_by(date: date)
  end
  
  # Load all records for date range
  def load_records_for_range(start_date, end_date)
    SunriseRecord
      .for_location(@geocoding_result[:display_name])
      .for_date_range(start_date, end_date)
      .order(:date)
  end
  
  # Save API response to database
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
  
  private
  
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
end