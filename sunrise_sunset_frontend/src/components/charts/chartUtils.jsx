import { format } from 'date-fns'
import { timeToMinutes, minutesToTime, parseDayLength, parseGoldenHourTime } from '@/utils/timeUtils'

export function ChartTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null

    return (
        <div className="glass-strong p-4 rounded-lg shadow-lg border border-white/30">
            <p className="font-semibold text-gray-900 mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-700">
                        {entry.name}: {entry.value !== null ? minutesToTime(entry.value) : 'N/A'}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function prepareChartData(apiData) {
    if (!apiData?.days) return []
    return apiData.days.map(day => formatChartDataPoint(day))
}

export function getOptimalTickInterval(dataLength) {
    if (dataLength <= 7) return 0  // Show all
    if (dataLength <= 14) return 1
    if (dataLength <= 30) return 2
    if (dataLength <= 60) return 4
    if (dataLength <= 90) return 6
    if (dataLength <= 180) return 10
    return Math.floor(dataLength / 12)  // Always show ~12 labels max
}

function formatChartDataPoint(day) {
    const date = new Date(day.date)
    const formattedDate = format(date, 'MMM dd')

    return {
        date: formattedDate,
        fullDate: day.date,
        location: day.location,
        sunrise: timeToMinutes(day.sunrise),
        sunset: timeToMinutes(day.sunset),
        solarNoon: timeToMinutes(day.solar_noon),
        dayLength: parseDayLength(day.day_length),
        civilTwilightStart: timeToMinutes(day.twilight?.civil_begin),
        civilTwilightEnd: timeToMinutes(day.twilight?.civil_end),
        nauticalTwilightStart: timeToMinutes(day.twilight?.nautical_begin),
        nauticalTwilightEnd: timeToMinutes(day.twilight?.nautical_end),
        morningGoldenStart: parseGoldenHourTime(day.golden_hour, 'morning', 'start'),
        morningGoldenEnd: parseGoldenHourTime(day.golden_hour, 'morning', 'end'),
        eveningGoldenStart: parseGoldenHourTime(day.golden_hour, 'evening', 'start'),
        eveningGoldenEnd: parseGoldenHourTime(day.golden_hour, 'evening', 'end'),
    }
}