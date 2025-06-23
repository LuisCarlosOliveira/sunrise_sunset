import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { minutesToTime } from '@/utils/timeUtils'
import { ChartTooltip, prepareChartData, getOptimalTickInterval } from './chartUtils.jsx'

export function SunriseChart({ data, className = "" }) {
    const chartData = prepareChartData(data)
    const tickInterval = getOptimalTickInterval(chartData.length)

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
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {chartData.length} data points
                    </span>
                </p>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: chartData.length > 31 ? 80 : 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                            interval={tickInterval}
                            angle={chartData.length > 31 ? -45 : 0}
                            textAnchor={chartData.length > 31 ? 'end' : 'middle'}
                            height={chartData.length > 31 ? 80 : 60}
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