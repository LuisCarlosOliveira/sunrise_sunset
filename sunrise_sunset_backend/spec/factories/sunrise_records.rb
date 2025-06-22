FactoryBot.define do
  factory :sunrise_record do
    location { "MyString" }
    date { "2025-06-22" }
    latitude { "9.99" }
    longitude { "9.99" }
    sunrise { "2025-06-22 11:12:54" }
    sunset { "2025-06-22 11:12:54" }
    solar_noon { "2025-06-22 11:12:54" }
    day_length { "MyString" }
    civil_twilight_begin { "2025-06-22 11:12:54" }
    civil_twilight_end { "2025-06-22 11:12:54" }
    nautical_twilight_begin { "2025-06-22 11:12:54" }
    nautical_twilight_end { "2025-06-22 11:12:54" }
    astronomical_twilight_begin { "2025-06-22 11:12:54" }
    astronomical_twilight_end { "2025-06-22 11:12:54" }
  end
end
