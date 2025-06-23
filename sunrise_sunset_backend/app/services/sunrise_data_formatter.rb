class SunriseDataFormatter
  def self.format_record_for_response(record)
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
  
  def self.format_records_collection(records)
    records.map { |record| format_record_for_response(record) }
  end
end