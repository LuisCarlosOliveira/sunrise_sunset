// Custom React hooks for managing API state and interactions
// These hooks encapsulate complex state logic and make it reusable across components
import { useState, useCallback, useRef } from 'react'
import { fetchSunriseData, formatSunriseData, ApiError } from '@/services/api'

/**
 * Custom hook for managing sunrise/sunset data fetching with comprehensive state management
 * 
 * This hook handles the full lifecycle of an API request:
 * - Loading states (initial, loading, success, error)
 * - Data storage and formatting
 * - Error handling and retry logic
 * - Request deduplication to prevent multiple identical requests
 * 
 * Returns an object with state and actions that components can use
 */
export function useApiData() {
    // Core state for API interactions
    const [state, setState] = useState({
        data: null,          // Formatted API response data
        loading: false,      // True when a request is in progress
        error: null,         // Error object when requests fail
        hasSearched: false   // True after the first search attempt
    })

    // Ref to track the current request and enable cancellation
    // This prevents race conditions when users make rapid consecutive searches
    const currentRequestRef = useRef(null)

    /**
     * Fetch sunrise data with comprehensive state management
     * Using useCallback ensures this function has a stable reference,
     * preventing unnecessary re-renders in components that depend on it
     */
    const fetchData = useCallback(async (location, startDate, endDate) => {
        // Create a unique identifier for this request
        const requestId = Date.now()
        currentRequestRef.current = requestId

        // Set loading state and clear previous errors
        setState(prevState => ({
            ...prevState,
            loading: true,
            error: null,
            hasSearched: true
        }))

        try {
            console.log('🔍 Searching for sunrise data:', { location, startDate, endDate })

            // Make the API call using our service layer
            const apiResponse = await fetchSunriseData(location, startDate, endDate)

            // Check if this request is still the current one (prevents race conditions)
            if (currentRequestRef.current !== requestId) {
                console.log('⏭️ Request superseded, ignoring response')
                return
            }

            // Format the raw API response for component consumption
            const formattedData = formatSunriseData(apiResponse)

            console.log('✅ Data fetched successfully:', {
                location: formattedData.location,
                totalDays: formattedData.totalDays,
                dataSource: formattedData.dataSource
            })

            // Update state with successful response
            setState(prevState => ({
                ...prevState,
                data: formattedData,
                loading: false,
                error: null
            }))

        } catch (error) {
            // Only update state if this is still the current request
            if (currentRequestRef.current !== requestId) {
                console.log('⏭️ Error for superseded request, ignoring')
                return
            }

            console.error('❌ Failed to fetch sunrise data:', error.message)

            // Update state with error information
            setState(prevState => ({
                ...prevState,
                data: null,
                loading: false,
                error: error instanceof ApiError ? error : new ApiError(error.message)
            }))
        }
    }, [])

    /**
     * Reset function to clear all state back to initial values
     * Useful when users want to start a fresh search
     */
    const reset = useCallback(() => {
        // Cancel any ongoing request
        currentRequestRef.current = null

        setState({
            data: null,
            loading: false,
            error: null,
            hasSearched: false
        })

        console.log('🔄 API state reset')
    }, [])

    /**
     * Retry function that repeats the last successful search parameters
     * This requires components to track their last search params
     */
    const retry = useCallback((lastLocation, lastStartDate, lastEndDate) => {
        if (!lastLocation || !lastStartDate || !lastEndDate) {
            console.warn('⚠️ Cannot retry: missing search parameters')
            return
        }

        console.log('🔄 Retrying last search')
        fetchData(lastLocation, lastStartDate, lastEndDate)
    }, [fetchData])

    // Return the state and actions for components to use
    return {
        // State values
        data: state.data,
        loading: state.loading,
        error: state.error,
        hasSearched: state.hasSearched,

        // Computed state helpers
        hasData: state.data !== null,
        hasError: state.error !== null,
        isEmpty: state.hasSearched && !state.data && !state.loading,

        // Actions
        fetchData,
        reset,
        retry
    }
}

/**
 * Specialized hook for form state management
 * Handles form inputs, validation, and submission logic
 * 
 * This separation of concerns keeps form logic separate from API logic,
 * making both easier to test and maintain
 */
export function useSearchForm() {
    // Form field state
    const [formData, setFormData] = useState({
        location: '',
        startDate: '',
        endDate: ''
    })

    // Form validation state
    const [validationErrors, setValidationErrors] = useState({})

    // Track if form has been submitted (for showing validation)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    /**
     * Generic field update handler
     * This pattern reduces boilerplate for handling multiple input fields
     */
    const updateField = useCallback((fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))

        // Clear validation error for this field when user starts typing
        if (validationErrors[fieldName]) {
            setValidationErrors(prev => ({
                ...prev,
                [fieldName]: undefined
            }))
        }
    }, [validationErrors])

    /**
     * Comprehensive form validation
     * Returns true if form is valid, false otherwise
     * Side effect: updates validationErrors state
     */
    const validateForm = useCallback(() => {
        const errors = {}

        // Location validation
        if (!formData.location.trim()) {
            errors.location = 'Please enter a location'
        }

        // Date validation
        if (!formData.startDate) {
            errors.startDate = 'Please select a start date'
        }

        if (!formData.endDate) {
            errors.endDate = 'Please select an end date'
        }

        // Date range validation (only if both dates are provided)
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate)
            const end = new Date(formData.endDate)

            if (start > end) {
                errors.endDate = 'End date must be after start date'
            }

            // Check date range limits (matching API service validation)
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
            if (daysDiff > 365) {
                errors.endDate = `Date range too large (${daysDiff} days). Maximum is 365 days.`
            }
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }, [formData])

    /**
     * Form submission handler
     * Validates form and calls provided onSubmit function if valid
     */
    const handleSubmit = useCallback((onSubmit) => {
        setHasSubmitted(true)

        if (validateForm()) {
            console.log('📋 Form submitted:', formData)
            onSubmit(formData.location, formData.startDate, formData.endDate)
        } else {
            console.log('❌ Form validation failed:', validationErrors)
        }
    }, [formData, validateForm, validationErrors])

    /**
     * Reset form to initial state
     */
    const resetForm = useCallback(() => {
        setFormData({
            location: '',
            startDate: '',
            endDate: ''
        })
        setValidationErrors({})
        setHasSubmitted(false)
        console.log('🔄 Form reset')
    }, [])

    /**
     * Set default date range (useful for UX - e.g., "next 7 days")
     */
    const setDefaultDateRange = useCallback((days = 7) => {
        const today = new Date()
        const endDate = new Date(today)
        endDate.setDate(today.getDate() + days)

        setFormData(prev => ({
            ...prev,
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        }))
    }, [])

    return {
        // Form data
        formData,
        validationErrors,
        hasSubmitted,

        // Computed state
        isFormValid: Object.keys(validationErrors).length === 0,
        hasValidationErrors: Object.keys(validationErrors).length > 0,

        // Actions
        updateField,
        handleSubmit,
        resetForm,
        setDefaultDateRange,
        validateForm
    }
}

/**
 * Combined hook that manages both form and API state together
 * This provides a complete solution for search functionality
 * 
 * Use this when you want integrated form + API management
 * Use the individual hooks when you need more granular control
 */
export function useSearchWithApi() {
    const apiState = useApiData()
    const formState = useSearchForm()

    // Track the last search parameters for retry functionality
    const [lastSearchParams, setLastSearchParams] = useState(null)

    /**
     * Integrated search function that handles both form submission and API call
     */
    const performSearch = useCallback(() => {
        formState.handleSubmit(async (location, startDate, endDate) => {
            // Store search params for retry functionality
            setLastSearchParams({ location, startDate, endDate })

            // Execute the API call
            await apiState.fetchData(location, startDate, endDate)
        })
    }, [formState, apiState])

    /**
     * Retry the last search
     */
    const retryLastSearch = useCallback(() => {
        if (lastSearchParams) {
            apiState.fetchData(
                lastSearchParams.location,
                lastSearchParams.startDate,
                lastSearchParams.endDate
            )
        }
    }, [apiState, lastSearchParams])

    /**
     * Reset both form and API state
     */
    const resetAll = useCallback(() => {
        formState.resetForm()
        apiState.reset()
        setLastSearchParams(null)
    }, [formState, apiState])

    return {
        // Form state and actions
        ...formState,

        // API state and actions
        ...apiState,

        // Integrated actions
        performSearch,
        retryLastSearch,
        resetAll,

        // Additional state
        canRetry: lastSearchParams !== null && !apiState.loading
    }
}