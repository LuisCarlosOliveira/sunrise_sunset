# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_06_22_101254) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "sunrise_records", force: :cascade do |t|
    t.string "location", limit: 200, null: false
    t.date "date", null: false
    t.decimal "latitude", precision: 10, scale: 6, null: false
    t.decimal "longitude", precision: 10, scale: 6, null: false
    t.datetime "sunrise"
    t.datetime "sunset"
    t.datetime "solar_noon"
    t.string "day_length", limit: 20
    t.datetime "civil_twilight_begin"
    t.datetime "civil_twilight_end"
    t.datetime "nautical_twilight_begin"
    t.datetime "nautical_twilight_end"
    t.datetime "astronomical_twilight_begin"
    t.datetime "astronomical_twilight_end"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["latitude", "longitude", "date"], name: "index_sunrise_records_on_coordinates_and_date"
    t.index ["location", "date"], name: "index_sunrise_records_on_location_and_date", unique: true
  end
end
