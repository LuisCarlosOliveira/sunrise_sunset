// SearchForm.jsx - Main search interface component
// Location: src/components/SearchForm.jsx

import React from 'react'
import { Input, Button, QuickDateRanges } from '@/components/forms'

/**
 * SearchForm Component
 * 
 * This component now receives the search state as props from the parent App component.
 * This ensures that the form state and the application's data display state are synchronized.
 * 
 * This pattern is called "lifting state up" - we move shared state to the lowest common
 * parent component that needs to access it.
 */
export default function SearchForm({ searchState }) {
    // Destructure all the state and actions from the shared searchState prop
    const {
        // Form state
        formData,
        validationErrors,
        updateField,

        // API state
        loading,
        error,
        hasSearched,

        // Actions
        performSearch,
        resetAll,
        retryLastSearch,
        canRetry
    } = searchState

    /**
     * Handle quick date range selection
     * This provides a better UX by allowing common date ranges with one click
     */
    const handleQuickRange = React.useCallback((range) => {
        updateField('startDate', range.startDate)
        updateField('endDate', range.endDate)
    }, [updateField])

    /**
     * Handle form submission
     * The actual API call is managed by our hook
     */
    const handleSubmit = React.useCallback((e) => {
        e.preventDefault()
        performSearch()
    }, [performSearch])

    /**
     * Handle retry action
     * Shows user-friendly retry UI for failed requests
     */
    const handleRetry = React.useCallback(() => {
        retryLastSearch()
    }, [retryLastSearch])

    return (
        <div className="card p-8 max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sunrise-500 to-sunset-500 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Search Sunrise & Sunset Data
                </h2>
                <p className="text-gray-600">
                    Enter a location and date range to get detailed solar information
                </p>
            </div>

            {/* Main Search Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Input */}
                <Input.Location
                    label="Location"
                    value={formData.location}
                    onChange={(value) => updateField('location', value)}
                    error={validationErrors.location}
                    required
                    helpText="Enter city name (e.g., Berlin, Lisbon, New York)"
                    loading={loading}
                    onClear={() => updateField('location', '')}
                />

                {/* Date Range Section */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <Input.Date
                            label="Start Date"
                            value={formData.startDate}
                            onChange={(value) => updateField('startDate', value)}
                            error={validationErrors.startDate}
                            required
                            helpText="Select the first day"
                        />

                        {/* End Date */}
                        <Input.Date
                            label="End Date"
                            value={formData.endDate}
                            onChange={(value) => updateField('endDate', value)}
                            error={validationErrors.endDate}
                            required
                            helpText="Select the last day"
                        />
                    </div>

                    {/* Quick Date Range Buttons */}
                    <QuickDateRanges onRangeSelect={handleQuickRange} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button.Primary
                        type="submit"
                        loading={loading}
                        loadingText="Searching..."
                        className="flex-1 sm:flex-none"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search Sunrise Data
                    </Button.Primary>

                    {/* Reset Button - only show if there's data to reset */}
                    {hasSearched && (
                        <Button.Secondary
                            onClick={resetAll}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset
                        </Button.Secondary>
                    )}
                </div>
            </form>

            {/* Error Display with Retry Option */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-red-800">
                                Search Failed
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                                {error.message}
                            </p>
                            {canRetry && (
                                <button
                                    onClick={handleRetry}
                                    className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {hasSearched && !loading && !error && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-green-800">
                            Search completed successfully! Results are displayed below.
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State with Animated Placeholder */}
            {loading && (
                <div className="mt-6 space-y-4 animate-pulse">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="spinner" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">
                                Searching for sunrise and sunset data...
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                This may take a few seconds for first-time searches
                            </p>
                        </div>
                    </div>

                    {/* Placeholder cards for future data display */}
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-48 bg-gray-200 rounded"></div>
                    </div>
                </div>
            )}
        </div>
    )
}