import { format, parseISO } from 'date-fns'

export function timeToMinutes(timeString) {
    if (!timeString || timeString === '00:00:01 UTC') return null
    
    const [hours, minutes] = timeString.replace(' UTC', '').split(':').map(Number)
    return hours * 60 + minutes
}

export function minutesToTime(minutes) {
    if (minutes === null || minutes === undefined) return '--'
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function formatTime(timeString, format12Hour = false) {
    if (!timeString || timeString === '00:00:01 UTC') return 'N/A'
    
    const timeOnly = timeString.replace(' UTC', '')
    
    if (!format12Hour) {
        return timeOnly.substring(0, 5)
    }
    
    const [hours, minutes] = timeOnly.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export function formatDuration(durationString) {
    if (!durationString) return 'N/A'
    
    const [hours, minutes] = durationString.split(':').map(Number)
    return `${hours}h ${minutes}m`
}

export function formatGoldenHour(goldenHourData, type = 'morning') {
    if (!goldenHourData) return { start: 'N/A', end: 'N/A', duration: 'N/A' }
    
    const data = type === 'morning' ? goldenHourData.morning_golden_hour : goldenHourData.evening_golden_hour
    
    if (!data) return { start: 'N/A', end: 'N/A', duration: 'N/A' }
    
    try {
        const startTime = format(parseISO(data.start), 'HH:mm')
        const endTime = format(parseISO(data.end), 'HH:mm')
        
        const start = parseISO(data.start)
        const end = parseISO(data.end)
        const durationMs = end - start
        const durationMinutes = Math.round(durationMs / 60000)
        const duration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
        
        return { start: startTime, end: endTime, duration }
    } catch {
        return { start: 'N/A', end: 'N/A', duration: 'N/A' }
    }
}

export function parseDayLength(dayLengthString) {
    if (!dayLengthString) return null
    
    const [hours, minutes, seconds] = dayLengthString.split(':').map(Number)
    return hours * 60 + minutes + Math.round(seconds / 60)
}

export function parseGoldenHourTime(goldenHourData, type, period) {
    if (!goldenHourData?.[`${type}_golden_hour`]?.[period]) return null
    
    try {
        const timeString = format(parseISO(goldenHourData[`${type}_golden_hour`][period]), 'HH:mm:ss') + ' UTC'
        return timeToMinutes(timeString)
    } catch {
        return null
    }
}