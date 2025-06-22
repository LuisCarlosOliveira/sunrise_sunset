class SunriseRecord < ApplicationRecord
    # Validations ensure data integrity at the application level
    # These work together with database constraints to prevent invalid data
    validates :location, presence: true, length: { minimum: 2, maximum: 200 }
    validates :date, presence: true
    validates :latitude, presence: true, 
              numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
    validates :longitude, presence: true,
              numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
    
    # Ensure we don't store duplicate data for the same location and date
    # This works with our database unique index to prevent data duplication
    validates :location, uniqueness: { scope: :date, 
                                     message: "already has sunrise data for this date" }
    
    # Scopes provide reusable query building blocks
    # These make our controller and service code much cleaner and more readable
    scope :for_date_range, ->(start_date, end_date) { 
      where(date: start_date..end_date) 
    }
    
    scope :for_location, ->(location_name) { 
      where(location: location_name) 
    }
    
    # This is the key method that your service was looking for
    # It implements the caching logic required by your assignment
    def self.data_exists_for?(location, start_date, end_date)
      # Calculate how many days we should have data for
      expected_days = (start_date..end_date).count
      
      # Count how many days we actually have data for
      actual_days = for_location(location).for_date_range(start_date, end_date).count
      
      # We only consider the cache complete if we have data for every requested day
      actual_days == expected_days
    end
    
    # Calculate golden hour information based on actual sunrise and sunset times
    # Golden hour is prized by photographers for its soft, warm lighting
    def golden_hour_info
      # We can only calculate golden hour if we have both sunrise and sunset times
      return nil unless sunrise.present? && sunset.present?
      
      # Golden hour traditionally includes the hour after sunrise and hour before sunset
      # These times provide the most flattering natural lighting for photography
      {
        morning_golden_hour: {
          start: sunrise,
          end: sunrise + 1.hour,
          description: "Soft morning light ideal for photography"
        },
        evening_golden_hour: {
          start: sunset - 1.hour,
          end: sunset,
          description: "Warm evening light ideal for photography"
        }
      }
    end
    
    # Format all the sun data for consistent API responses
    # This method ensures that data looks the same whether it comes from cache or fresh API calls
    def formatted_sun_data
      {
        date: date.strftime('%Y-%m-%d'),
        location: location,
        coordinates: {
          latitude: latitude.to_f,
          longitude: longitude.to_f
        },
        sunrise: sunrise&.strftime('%H:%M:%S UTC'),
        sunset: sunset&.strftime('%H:%M:%S UTC'),
        solar_noon: solar_noon&.strftime('%H:%M:%S UTC'),
        day_length: day_length,
        twilight: {
          civil_begin: civil_twilight_begin&.strftime('%H:%M:%S UTC'),
          civil_end: civil_twilight_end&.strftime('%H:%M:%S UTC'),
          nautical_begin: nautical_twilight_begin&.strftime('%H:%M:%S UTC'),
          nautical_end: nautical_twilight_end&.strftime('%H:%M:%S UTC'),
          astronomical_begin: astronomical_twilight_begin&.strftime('%H:%M:%S UTC'),
          astronomical_end: astronomical_twilight_end&.strftime('%H:%M:%S UTC')
        },
        golden_hour: golden_hour_info
      }
    end
    
    # Check if this record contains valid sunrise and sunset data
    # Some locations (like polar regions) might not have sunrise or sunset on certain days
    def has_valid_sun_data?
      sunrise.present? && sunset.present?
    end
    
    # Calculate the duration of daylight in a human-readable format
    # This provides an alternative to the day_length field that comes from the API
    def daylight_duration
      return nil unless has_valid_sun_data?
      
      # Calculate the time difference between sunrise and sunset
      duration_seconds = (sunset - sunrise).to_i
      
      # Convert to hours, minutes, and seconds for easy reading
      hours = duration_seconds / 3600
      minutes = (duration_seconds % 3600) / 60
      seconds = duration_seconds % 60
      
      "%02d:%02d:%02d" % [hours, minutes, seconds]
    end
  end