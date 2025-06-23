class SunriseRecord < ApplicationRecord
  validates :location, presence: true, length: { minimum: 2, maximum: 200 }
  validates :date, presence: true
  validates :latitude, presence: true, 
            numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
            numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validates :location, uniqueness: { scope: :date, 
                                   message: "already has sunrise data for this date" }
  
  scope :for_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :for_location, ->(location_name) { where(location: location_name) }
  
  def self.data_exists_for?(location, start_date, end_date)
    expected_days = (start_date..end_date).count
    actual_days = for_location(location).for_date_range(start_date, end_date).count
    actual_days == expected_days
  end
  
  def golden_hour_info
    return nil unless sunrise.present? && sunset.present?
    
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
end