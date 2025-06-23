// Data visualization components using Recharts for interactive sunrise/sunset displays
// These components transform raw API data into meaningful visual insights
import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Area,
    AreaChart
} from 'recharts'
import { format, parseISO } from 'date-fns'

/**
 * Utility function to convert time strings to minutes for chart calculations
 * This allows us to plot times on a numerical axis for meaningful comparisons
 * 
 * @param {string} timeString - Time in "HH:MM:SS UTC" format
 * @returns {number} - Minutes since midnight
 */
function timeToMinutes(timeString) {
    if (!timeString || timeString === '00:00:01 UTC') return null

    const [hours, minutes] = timeString.replace(' UTC', '').split(':').map(Number)
    return hours * 60 + minutes
}

/**
 * Utility function to format minutes back to readable time
 * This provides clean axis labels and tooltip displays
 * 
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Formatted time string
 */
function minutesToTime(minutes) {
    if (minutes === null || minutes === undefined) return '--'

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Custom tooltip component for charts
 * Provides rich, contextual information when users hover over data points
 */
function ChartTooltip({ active, payload, label }) {
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

/**
 * Transform raw API data into chart-ready format
 * This function handles the complex data transformation needed for visualization
 */
function prepareChartData(apiData) {
    if (!apiData?.days) return []

    return apiData.days.map(day => {
        // Parse the date for proper formatting
        const date = new Date(day.date)
        const formattedDate = format(date, 'MMM dd')

        // Convert all time values to minutes for plotting
        const chartPoint = {
            date: formattedDate,
            fullDate: day.date,
            location: day.location,

            // Core sunrise/sunset times
            sunrise: timeToMinutes(day.sunrise),
            sunset: timeToMinutes(day.sunset),
            solarNoon: timeToMinutes(day.solar_noon),

            // Calculate day length in minutes
            dayLength: day.day_length ? (() => {
                const [hours, minutes, seconds] = day.day_length.split(':').map(Number)
                return hours * 60 + minutes + Math.round(seconds / 60)
            })() : null,

            // Twilight times for advanced visualizations
            civilTwilightStart: timeToMinutes(day.twilight?.civil_begin),
            civilTwilightEnd: timeToMinutes(day.twilight?.civil_end),
            nauticalTwilightStart: timeToMinutes(day.twilight?.nautical_begin),
            nauticalTwilightEnd: timeToMinutes(day.twilight?.nautical_end),

            // Golden hour data (if available)
            morningGoldenStart: day.golden_hour?.morning_golden_hour?.start ?
                timeToMinutes(format(parseISO(day.golden_hour.morning_golden_hour.start), 'HH:mm:ss') + ' UTC') : null,
            morningGoldenEnd: day.golden_hour?.morning_golden_hour?.end ?
                timeToMinutes(format(parseISO(day.golden_hour.morning_golden_hour.end), 'HH:mm:ss') + ' UTC') : null,
            eveningGoldenStart: day.golden_hour?.evening_golden_hour?.start ?
                timeToMinutes(format(parseISO(day.golden_hour.evening_golden_hour.start), 'HH:mm:ss') + ' UTC') : null,
            eveningGoldenEnd: day.golden_hour?.evening_golden_hour?.end ?
                timeToMinutes(format(parseISO(day.golden_hour.evening_golden_hour.end), 'HH:mm:ss') + ' UTC') : null,
        }

        return chartPoint
    })
}

/**
 * Main Sunrise/Sunset Times Chart
 * Shows the progression of sunrise and sunset times over the selected date range
 * This is the primary visualization that most users will focus on
 */
export function SunriseChart({ data, className = "" }) {
    const chartData = prepareChartData(data)

    if (!chartData.length) {
        return (
            <div className="card p-8 text-center">
                <div className="text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No data to display. Search for a location to see sunrise and sunset charts.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`card p-6 ${className}`}>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sunrise & Sunset Times
                </h3>
                <p className="text-gray-600 text-sm">
                    Daily progression of sunrise and sunset times for {data.location}
                </p>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <YAxis
                            domain={['dataMin - 60', 'dataMax + 60']}
                            tickFormatter={minutesToTime}
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />

                        {/* Sunrise line */}
                        <Line
                            type="monotone"
                            dataKey="sunrise"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                            name="Sunrise"
                            connectNulls={false}
                        />

                        {/* Sunset line */}
                        <Line
                            type="monotone"
                            dataKey="sunset"
                            stroke="#dc2626"
                            strokeWidth={3}
                            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                            name="Sunset"
                            connectNulls={false}
                        />

                        {/* Solar noon line (optional, lighter) */}
                        <Line
                            type="monotone"
                            dataKey="solarNoon"
                            stroke="#64748b"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Solar Noon"
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

/**
 * Day Length Chart
 * Shows how the length of daylight changes over time
 * This provides insights into seasonal patterns
 */
export function DayLengthChart({ data, className = "" }) {
    const chartData = prepareChartData(data)

    if (!chartData.length) return null

    return (
        <div className={`card p-6 ${className}`}>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Daylight Duration
                </h3>
                <p className="text-gray-600 text-sm">
                    Hours of daylight available each day
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={(value) => `${Math.floor(value / 60)}h ${value % 60}m`}
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <Tooltip
                            formatter={(value) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Daylight']}
                            labelStyle={{ color: '#374151' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="dayLength"
                            stroke="#3b82f6"
                            fill="url(#dayLengthGradient)"
                            strokeWidth={2}
                        />

                        {/* Gradient definition for area fill */}
                        <defs>
                            <linearGradient id="dayLengthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

/**
 * Golden Hour Chart
 * Visualizes the timing and duration of golden hour periods
 * This is particularly valuable for photographers and outdoor enthusiasts
 */
export function GoldenHourChart({ data, className = "" }) {
    const chartData = prepareChartData(data)

    // Filter out days without golden hour data
    const validData = chartData.filter(day =>
        day.morningGoldenStart !== null || day.eveningGoldenStart !== null
    )

    if (!validData.length) return null

    return (
        <div className={`card p-6 ${className}`}>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Golden Hour Times
                </h3>
                <p className="text-gray-600 text-sm">
                    Optimal photography lighting periods (morning and evening)
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={validData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <YAxis
                            domain={['dataMin - 30', 'dataMax + 30']}
                            tickFormatter={minutesToTime}
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />

                        {/* Morning golden hour */}
                        <Line
                            type="monotone"
                            dataKey="morningGoldenStart"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            dot={{ fill: '#fbbf24', r: 3 }}
                            name="Morning Start"
                            connectNulls={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="morningGoldenEnd"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', r: 3 }}
                            name="Morning End"
                            connectNulls={false}
                        />

                        {/* Evening golden hour */}
                        <Line
                            type="monotone"
                            dataKey="eveningGoldenStart"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: '#f97316', r: 3 }}
                            name="Evening Start"
                            connectNulls={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="eveningGoldenEnd"
                            stroke="#ea580c"
                            strokeWidth={2}
                            dot={{ fill: '#ea580c', r: 3 }}
                            name="Evening End"
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

/**
 * Chart Layout Component
 * Orchestrates the display of multiple charts in a responsive grid
 * This provides a comprehensive dashboard view of all solar data
 */
export function ChartsContainer({ data }) {
    if (!data) return null

    return (
        <div className="space-y-8">
            {/* Primary chart - always shown */}
            <SunriseChart data={data} />

            {/* Secondary charts in responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DayLengthChart data={data} />
                <GoldenHourChart data={data} />
            </div>

            {/* Chart summary information */}
            <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3 mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900">Chart Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <p className="text-gray-600">{data.location}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Date Range:</span>
                        <p className="text-gray-600">
                            {data.dateRange?.start} to {data.dateRange?.end}
                        </p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Total Days:</span>
                        <p className="text-gray-600">{data.totalDays} days</p>
                    </div>
                </div>
            </div>
        </div>
    )
}