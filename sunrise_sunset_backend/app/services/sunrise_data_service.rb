# Main orchestrator service for sunrise/sunset data
# Coordinates between geocoding, API calls, and database caching
# Usage: SunriseDataService.new(location, start_date, end_date).fetch_data
class SunriseDataService
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
    @cache_manager = SunriseCacheManager.new(@geocoding_result)
    @api_client = SunriseApiClient.new(@geocoding_result)
    
    if @cache_manager.data_exists_for_range?(@start_date, @end_date)
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
  
  def load_from_cache
    records = @cache_manager.load_records_for_range(@start_date, @end_date)
    SunriseDataFormatter.format_records_collection(records)
  end

  def fetch_missing_data_from_api
    all_data = []
    errors = []
    missing_dates = []
    
    # Collect existing data and identify missing dates
    (@start_date..@end_date).each do |date|
      if @cache_manager.record_exists_for_date?(date)
        existing_record = @cache_manager.find_existing_record(date)
        all_data << SunriseDataFormatter.format_record_for_response(existing_record) if existing_record
      else
        missing_dates << date
      end
    end
    
    # Process missing dates in batches
    missing_dates.each_slice(SunriseApiClient::BATCH_SIZE) do |date_batch|
      batch_results = @api_client.fetch_date_batch(date_batch)
      
      batch_results.each do |date, result|
        if result[:success]
          cached_record = @cache_manager.cache_api_response(result[:data], date)
          all_data << SunriseDataFormatter.format_record_for_response(cached_record)
        else
          errors << "#{date.strftime('%Y-%m-%d')}: #{result[:error]}"
        end
      end
      
      # Delay between batches to be respectful to external API
      sleep(SunriseApiClient::BATCH_DELAY) if missing_dates.size > SunriseApiClient::BATCH_SIZE
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
end