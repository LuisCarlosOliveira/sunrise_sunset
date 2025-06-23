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
    Bar
} from 'recharts'
import { format } from 'date-fns'
import { timeToMinutes, minutesToTime, parseDayLength, parseGoldenHourTime } from '@/utils/timeUtils'

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

function prepareChartData(apiData) {
    if (!apiData?.days) return []

    return apiData.days.map(day => {
        const date = new Date(day.date)
        const formattedDate = format(date, 'MMM dd')

        const chartPoint = {
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

        return chartPoint
    })
}

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

                        <Line
                            type="monotone"
                            dataKey="sunrise"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                            name="Sunrise"
                            connectNulls={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="sunset"
                            stroke="#dc2626"
                            strokeWidth={3}
                            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                            name="Sunset"
                            connectNulls={false}
                        />

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
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />

                        <Bar
                            dataKey="dayLength"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            opacity={0.8}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

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

export function ChartsContainer({ data }) {
    if (!data) return null

    return (
        <div className="space-y-8">
            <SunriseChart data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DayLengthChart data={data} />
                <GoldenHourChart data={data} />
            </div>

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