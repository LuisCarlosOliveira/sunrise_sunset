import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { prepareChartData, getOptimalTickInterval } from './chartUtils.jsx'

export function DayLengthChart({ data, className = "" }) {
    const chartData = prepareChartData(data)
    const tickInterval = getOptimalTickInterval(chartData.length)

    if (!chartData.length) return null

    return (
        <div className={`card p-6 ${className}`}>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Daylight Duration
                </h3>
                <p className="text-gray-600 text-sm">
                    Hours of daylight available each day
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {chartData.length} data points
                    </span>
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: chartData.length > 31 ? 80 : 60 }}>
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