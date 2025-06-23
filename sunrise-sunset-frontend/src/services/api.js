// API Service Layer for Sunrise Sunset application
// This module handles all HTTP communication with the Ruby backend
import axios from 'axios'

// Configuration constants - centralized for easy maintenance
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
    TIMEOUT: 10000, // 10 seconds - generous for API calls that might cache miss
    ENDPOINTS: {
        SUNRISE: '/sunrise',
        HEALTH: '/health'
    }
}

// Create a configured axios instance with default settings
// This approach ensures consistent behavior across all API calls
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Request interceptor - logs outgoing requests for debugging
// In production, you might want to add authentication tokens here
apiClient.interceptors.request.use(
    (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            timestamp: new Date().toISOString()
        })
        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor - handles common response patterns and errors
// This centralizes error handling so components don't need to repeat logic
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.url}`, {
            status: response.status,
            dataSource: response.data?.data_source,
            timestamp: new Date().toISOString()
        })
        return response
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
    }
)

/**
 * Custom error class for API-specific errors
 * This provides more context than generic Error objects
 */
export class ApiError extends Error {
    constructor(message, status, originalError) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.originalError = originalError
        this.timestamp = new Date().toISOString()
    }
}

/**
 * Transforms raw error responses into user-friendly messages
 * The backend provides detailed error messages, but we may want to
 * customize them for better UX
 */
function transformErrorMessage(error) {
    // Handle network errors (backend not running, internet issues)
    if (!error.response) {
        if (error.code === 'ECONNREFUSED') {
            return 'Unable to connect to the server. Please check if the backend is running on http://localhost:3000'
        }
        return `Network error: ${error.message}`
    }

    // Handle HTTP error responses from the backend
    const { status, data } = error.response

    // Backend sends error messages in data.error field
    if (data?.error) {
        return data.error
    }

    // Fallback for unexpected error formats
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

/**
 * Validates date parameters before sending to API
 * This provides immediate feedback without a round trip to the server
 */
function validateDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    // Check for valid date objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ApiError('Invalid date format. Please use YYYY-MM-DD format.')
    }

    // Check date range logic
    if (start > end) {
        throw new ApiError('Start date must be before or equal to end date.')
    }

    // Check against backend constraints (from API documentation)
    const daysDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (daysDifference > 365) {
        throw new ApiError(`Date range cannot exceed 365 days (requested: ${daysDifference} days).`)
    }

    // Check past date limits (5 years as per backend docs)
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    if (start < fiveYearsAgo) {
        throw new ApiError('Start date cannot be more than 5 years in the past.')
    }

    // Check future date limits (2 years as per backend docs)
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
        // The backend already provides a well-structured response
        return response.data

    } catch (error) {
        // Transform any error into our custom ApiError format
        if (error instanceof ApiError) {
            throw error // Re-throw our custom errors as-is
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
 * This provides a clean interface between raw API data and React components
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

// Export configuration for components that might need it
export { API_CONFIG }