import { useState, useCallback, useRef } from 'react'
import { fetchSunriseData, formatSunriseData, ApiError } from '@/services/api'

export function useSearchWithApi() {
    const [formData, setFormData] = useState({
        location: '',
        startDate: '',
        endDate: ''
    })
    
    const [validationErrors, setValidationErrors] = useState({})
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [lastSearchParams, setLastSearchParams] = useState(null)
    
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
        hasSearched: false
    })
    
    const currentRequestRef = useRef(null)

    const updateField = useCallback((fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }))
        
        if (validationErrors[fieldName]) {
            setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }))
        }
    }, [validationErrors])

    const validateForm = useCallback(() => {
        const errors = {}

        if (!formData.location.trim()) {
            errors.location = 'Please enter a location'
        }

        if (!formData.startDate) {
            errors.startDate = 'Please select a start date'
        }

        if (!formData.endDate) {
            errors.endDate = 'Please select an end date'
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate)
            const end = new Date(formData.endDate)

            if (start > end) {
                errors.endDate = 'End date must be after start date'
            }

            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
            if (daysDiff > 365) {
                errors.endDate = `Date range too large (${daysDiff} days). Maximum is 365 days.`
            }
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }, [formData])

    const fetchData = useCallback(async (location, startDate, endDate) => {
        const requestId = Date.now()
        currentRequestRef.current = requestId

        setState(prevState => ({
            ...prevState,
            loading: true,
            error: null,
            hasSearched: true
        }))

        try {
            const apiResponse = await fetchSunriseData(location, startDate, endDate)

            if (currentRequestRef.current !== requestId) {
                return
            }

            const formattedData = formatSunriseData(apiResponse)

            setState(prevState => ({
                ...prevState,
                data: formattedData,
                loading: false,
                error: null
            }))

        } catch (error) {
            if (currentRequestRef.current !== requestId) {
                return
            }

            setState(prevState => ({
                ...prevState,
                data: null,
                loading: false,
                error: error instanceof ApiError ? error : new ApiError(error.message)
            }))
        }
    }, [])

    const performSearch = useCallback(() => {
        setHasSubmitted(true)

        if (validateForm()) {
            setLastSearchParams({ 
                location: formData.location, 
                startDate: formData.startDate, 
                endDate: formData.endDate 
            })
            
            fetchData(formData.location, formData.startDate, formData.endDate)
        }
    }, [formData, validateForm, fetchData])

    const retryLastSearch = useCallback(() => {
        if (lastSearchParams) {
            fetchData(
                lastSearchParams.location,
                lastSearchParams.startDate,
                lastSearchParams.endDate
            )
        }
    }, [fetchData, lastSearchParams])

    const resetAll = useCallback(() => {
        setFormData({ location: '', startDate: '', endDate: '' })
        setValidationErrors({})
        setHasSubmitted(false)
        setLastSearchParams(null)
        currentRequestRef.current = null
        
        setState({
            data: null,
            loading: false,
            error: null,
            hasSearched: false
        })
    }, [])

    return {
        formData,
        validationErrors,
        hasSubmitted,
        updateField,
        validateForm,
        
        data: state.data,
        loading: state.loading,
        error: state.error,
        hasSearched: state.hasSearched,
        hasData: state.data !== null,
        
        performSearch,
        retryLastSearch,
        resetAll,
        canRetry: lastSearchParams !== null && !state.loading
    }
}