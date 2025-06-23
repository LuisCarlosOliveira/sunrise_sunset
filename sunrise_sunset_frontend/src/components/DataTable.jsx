import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { formatTime, formatDuration, formatGoldenHour } from '@/utils/timeUtils'

function TableHeader({ children, sortKey, currentSort = {}, onSort, className = "" }) {
    const isSorted = currentSort.key === sortKey
    const isAscending = isSorted && currentSort.direction === 'asc'

    const handleClick = () => {
        if (sortKey) {
            const newDirection = isSorted && isAscending ? 'desc' : 'asc'
            onSort({ key: sortKey, direction: newDirection })
        }
    }

    return (
        <th
            className={`cursor-pointer select-none hover:bg-blue-100 transition-colors ${className}`}
            onClick={handleClick}
            role={sortKey ? "columnheader button" : "columnheader"}
            aria-sort={isSorted ? (isAscending ? 'ascending' : 'descending') : 'none'}
            tabIndex={sortKey ? 0 : -1}
        >
            <div className="flex items-center justify-between">
                <span>{children}</span>
                {sortKey && (
                    <div className="flex flex-col ml-2">
                        <svg
                            className={`w-3 h-3 ${isSorted && isAscending ? 'text-blue-600' : 'text-gray-400'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg
                            className={`w-3 h-3 ${isSorted && !isAscending ? 'text-blue-600' : 'text-gray-400'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </th>
    )
}

export function SunriseDataTable({ data, className = "" }) {
    const [sort, setSort] = useState({ key: 'date', direction: 'asc' })
    const [use12HourFormat, setUse12HourFormat] = useState(false)

    const sortedData = useMemo(() => {
        if (!data?.days) return []

        const sortedDays = [...data.days].sort((a, b) => {
            let aValue, bValue

            switch (sort.key) {
                case 'date':
                    aValue = new Date(a.date)
                    bValue = new Date(b.date)
                    break
                case 'sunrise':
                    aValue = a.sunrise
                    bValue = b.sunrise
                    break
                case 'sunset':
                    aValue = a.sunset
                    bValue = b.sunset
                    break
                case 'dayLength':
                    aValue = a.day_length
                    bValue = b.day_length
                    break
                default:
                    return 0
            }

            if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
            return 0
        })

        return sortedDays
    }, [data?.days, sort])

    if (!data?.days?.length) {
        return (
            <div className="card p-8 text-center">
                <div className="text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No data to display. Search for a location to see detailed information.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`card p-6 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Detailed Solar Data
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Complete sunrise, sunset, and solar information for {data.location}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={use12HourFormat}
                            onChange={(e) => setUse12HourFormat(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">12-hour format</span>
                    </label>

                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {sortedData.length} days
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
                <table className="data-table min-w-full">
                    <thead>
                        <tr>
                            <TableHeader sortKey="date" currentSort={sort} onSort={setSort}>
                                Date
                            </TableHeader>
                            <TableHeader sortKey="sunrise" currentSort={sort} onSort={setSort}>
                                Sunrise
                            </TableHeader>
                            <TableHeader sortKey="sunset" currentSort={sort} onSort={setSort}>
                                Sunset
                            </TableHeader>
                            <TableHeader>
                                Solar Noon
                            </TableHeader>
                            <TableHeader sortKey="dayLength" currentSort={sort} onSort={setSort}>
                                Day Length
                            </TableHeader>
                            <TableHeader>
                                Morning Golden Hour
                            </TableHeader>
                            <TableHeader>
                                Evening Golden Hour
                            </TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((day) => {
                            const morningGolden = formatGoldenHour(day.golden_hour, 'morning')
                            const eveningGolden = formatGoldenHour(day.golden_hour, 'evening')

                            return (
                                <tr key={day.date} className="hover:bg-blue-50/50">
                                    <td className="font-medium text-gray-900">
                                        {format(new Date(day.date), 'MMM dd, yyyy')}
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(day.date), 'EEEE')}
                                        </div>
                                    </td>
                                    <td className="text-sunrise-600 font-medium">
                                        {formatTime(day.sunrise, use12HourFormat)}
                                    </td>
                                    <td className="text-sunset-600 font-medium">
                                        {formatTime(day.sunset, use12HourFormat)}
                                    </td>
                                    <td className="text-gray-600">
                                        {formatTime(day.solar_noon, use12HourFormat)}
                                    </td>
                                    <td className="text-blue-600 font-medium">
                                        {formatDuration(day.day_length)}
                                    </td>
                                    <td className="text-golden-600">
                                        <div className="text-sm">
                                            {morningGolden.start} - {morningGolden.end}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {morningGolden.duration}
                                        </div>
                                    </td>
                                    <td className="text-golden-600">
                                        <div className="text-sm">
                                            {eveningGolden.start} - {eveningGolden.end}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {eveningGolden.duration}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-900">Earliest Sunrise</div>
                        <div className="text-blue-700">
                            {(() => {
                                const earliest = sortedData.reduce((min, day) =>
                                    !min || (day.sunrise && day.sunrise < min.sunrise) ? day : min, null)
                                return earliest ? formatTime(earliest.sunrise, use12HourFormat) : 'N/A'
                            })()}
                        </div>
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg">
                        <div className="font-medium text-red-900">Latest Sunset</div>
                        <div className="text-red-700">
                            {(() => {
                                const latest = sortedData.reduce((max, day) =>
                                    !max || (day.sunset && day.sunset > max.sunset) ? day : max, null)
                                return latest ? formatTime(latest.sunset, use12HourFormat) : 'N/A'
                            })()}
                        </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-900">Longest Day</div>
                        <div className="text-green-700">
                            {(() => {
                                const longest = sortedData.reduce((max, day) =>
                                    !max || (day.day_length && day.day_length > max.day_length) ? day : max, null)
                                return longest ? formatDuration(longest.day_length) : 'N/A'
                            })()}
                        </div>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-purple-900">Data Source</div>
                        <div className="text-purple-700 capitalize">
                            {data.dataSource || 'Unknown'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function CompactSunriseTable({ data, className = "" }) {
    if (!data?.days?.length) return null

    return (
        <div className={`card p-4 ${className}`}>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Reference
            </h4>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-700">Date</th>
                            <th className="text-left py-2 font-medium text-sunrise-600">Sunrise</th>
                            <th className="text-left py-2 font-medium text-sunset-600">Sunset</th>
                            <th className="text-left py-2 font-medium text-blue-600">Day Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.days.slice(0, 7).map((day) => (
                            <tr key={day.date} className="border-b border-gray-100">
                                <td className="py-2 text-gray-900">
                                    {format(new Date(day.date), 'MMM dd')}
                                </td>
                                <td className="py-2 text-sunrise-600">
                                    {formatTime(day.sunrise)}
                                </td>
                                <td className="py-2 text-sunset-600">
                                    {formatTime(day.sunset)}
                                </td>
                                <td className="py-2 text-blue-600">
                                    {formatDuration(day.day_length)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.days.length > 7 && (
                <p className="text-xs text-gray-500 mt-2">
                    Showing first 7 days of {data.days.length} total days
                </p>
            )}
        </div>
    )
}