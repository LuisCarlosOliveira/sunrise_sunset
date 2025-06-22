class CreateSunriseRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :sunrise_records do |t|
      t.string :location, null: false, limit: 200      
      t.date :date, null: false
      # This translates to formats like 38.123456 (6 digits after decimal)
      t.decimal :latitude, precision: 10, scale: 6, null: false
      t.decimal :longitude, precision: 10, scale: 6, null: false
      # these can be null for edge cases where the sun might not rise or set on certain days
      t.datetime :sunrise
      t.datetime :sunset
      t.datetime :solar_noon
      t.string :day_length, limit: 20
      t.datetime :civil_twilight_begin
      t.datetime :civil_twilight_end
      t.datetime :nautical_twilight_begin
      t.datetime :nautical_twilight_end
      t.datetime :astronomical_twilight_begin
      t.datetime :astronomical_twilight_end
      t.timestamps
    end
    
    # composite index for cache lookups
    # This index makes "does data already exist?" queries faster
    # The unique constraint prevents duplicate data for the same location and date
    add_index :sunrise_records, [:location, :date], 
              unique: true, 
              name: 'index_sunrise_records_on_location_and_date'
    
    # Secondary index for coordinate-based queries
    # Useful if needed to find nearby locations or query by exact coordinates
    add_index :sunrise_records, [:latitude, :longitude, :date], 
              name: 'index_sunrise_records_on_coordinates_and_date'
  end
end