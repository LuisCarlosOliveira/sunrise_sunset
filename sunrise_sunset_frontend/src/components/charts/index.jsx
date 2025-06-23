import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { minutesToTime } from '@/utils/timeUtils'
import { SunriseChart } from './SunriseChart'
import { DayLengthChart } from './DayLengthChart'
import { ChartTooltip, prepareChartData, getOptimalTickInterval } from './chartUtils.jsx'

export { SunriseChart, DayLengthChart }

export function GoldenHourChart({ data, className = "" }) {
    const chartData = prepareChartData(data)
    
    // Filter out days without golden hour data
    const validData = chartData.filter(day =>
        day.morningGoldenStart !== null || day.eveningGoldenStart !== null
    )
    
    const tickInterval = getOptimalTickInterval(validData.length)

    if (!validData.length) return null

    return (
        <div className={`card p-6 ${className}`}>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Golden Hour Times
                </h3>
                <p className="text-gray-600 text-sm">
                    Optimal photography lighting periods (morning and evening)
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {validData.length} data points
                    </span>
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={validData} margin={{ top: 20, right: 30, left: 20, bottom: validData.length > 31 ? 80 : 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                            interval={tickInterval}
                            angle={validData.length > 31 ? -45 : 0}
                            textAnchor={validData.length > 31 ? 'end' : 'middle'}
                            height={validData.length > 31 ? 80 : 60}
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