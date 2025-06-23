import axios from 'axios'

// Configuration constants with environment variable support
const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 60000,
    ENDPOINTS: {
        SUNRISE: '/sunrise',
        HEALTH: '/health'
    }
}

// Create a configured axios instance with default settings
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

apiClient.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
)

export class ApiError extends Error {
    constructor(message, status, originalError) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.originalError = originalError
        this.timestamp = new Date().toISOString()
    }
}

function transformErrorMessage(error) {
    if (!error.response) {
        if (error.code === 'ECONNREFUSED') {
            return 'Unable to connect to the server. Please check if the backend is running on http://localhost:3000'
        }
        return `Network error: ${error.message}`
    }

    const { status, data } = error.response

    if (data?.error) {
        return data.error
    }

    switch (status) {
        case 422:
            return 'Invalid request parameters. Please check your input and try again.'
        case 500:
            return 'Server error. Please try again later.'
        case 404:
            return 'Service not found. Please check if the backend is properly configured.'
        default:
            return `Unexpected error (${status}). Please try again.`
    }
}

function validateDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ApiError('Invalid date format. Please use YYYY-MM-DD format.')
    }

    if (start > end) {
        throw new ApiError('Start date must be before or equal to end date.')
    }

    const daysDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (daysDifference > 365) {
        throw new ApiError(`Date range cannot exceed 365 days (requested: ${daysDifference} days).`)
    }

    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    if (start < fiveYearsAgo) {
        throw new ApiError('Start date cannot be more than 5 years in the past.')
    }

    const twoYearsFromNow = new Date()
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
    if (end > twoYearsFromNow) {
        throw new ApiError('End date cannot be more than 2 years in the future.')
    }
}

/**
 * Main API function to fetch sunrise/sunset data
 * This is the primary interface that components will use
 * 
 * @param {string} location - City name (e.g., "Berlin", "Lisbon")
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} API response with sunrise/sunset data
 */
export async function fetchSunriseData(location, startDate, endDate) {
    try {
        // Input validation - fail fast with clear messages
        if (!location?.trim()) {
            throw new ApiError('Location is required.')
        }

        if (!startDate) {
            throw new ApiError('Start date is required.')
        }

        if (!endDate) {
            throw new ApiError('End date is required.')
        }

        // Validate date range constraints
        validateDateRange(startDate, endDate)

        // Make the API call with validated parameters
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.SUNRISE, {
            params: {
                location: location.trim(),
                start_date: startDate,
                end_date: endDate
            }
        })

        // Return the response data directly
        return response.data

    } catch (error) {
        // Transform any error into our custom ApiError format
        if (error instanceof ApiError) {
            throw error
        }

        const message = transformErrorMessage(error)
        const status = error.response?.status
        throw new ApiError(message, status, error)
    }
}

/**
 * Health check function to verify backend connectivity
 * Useful for debugging and application health monitoring
 */
export async function checkApiHealth() {
    try {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH)
        return {
            healthy: true,
            data: response.data
        }
    } catch (error) {
        return {
            healthy: false,
            error: transformErrorMessage(error)
        }
    }
}

/**
 * Utility function to format API response data for components
 */
export function formatSunriseData(apiResponse) {
    if (!apiResponse?.data) {
        return {
            location: 'Unknown',
            dateRange: { start: '', end: '' },
            days: [],
            totalDays: 0,
            dataSource: 'unknown'
        }
    }

    return {
        location: apiResponse.location,
        dateRange: apiResponse.requested_date_range,
        days: apiResponse.data,
        totalDays: apiResponse.total_days,
        dataSource: apiResponse.data_source,
        message: apiResponse.message
    }
}

export { API_CONFIG }