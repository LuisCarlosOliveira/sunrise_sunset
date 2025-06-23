// Reusable form components with consistent styling and behavior
// These components handle accessibility, validation display, and user interaction patterns
import React from 'react'

/**
 * Base Input Component
 * 
 * This serves as the foundation for all input types. It handles:
 * - Consistent styling with our design system
 * - Error state management and display
 * - Accessibility features (labels, ARIA attributes)
 * - Focus management and user feedback
 * 
 * The compound pattern (Input.Text, Input.Date) keeps related components together
 * while allowing for specialized behavior in each variant.
 */
function BaseInput({
    label,
    error,
    required = false,
    helpText,
    children,
    className = ''
}) {
    // Generate unique IDs for accessibility
    const inputId = React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const helpId = helpText ? `${inputId}-help` : undefined

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label with required indicator */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1" aria-label="required">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Clone the child input element and add our props */}
            {React.cloneElement(children, {
                id: inputId,
                'aria-invalid': error ? 'true' : 'false',
                'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
                className: `input-field ${error ? 'input-error' : ''} ${children.props.className || ''}`
            })}

            {/* Help text */}
            {helpText && (
                <p id={helpId} className="text-sm text-gray-500">
                    {helpText}
                </p>
            )}

            {/* Error message with icon */}
            {error && (
                <p id={errorId} className="text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </p>
            )}
        </div>
    )
}

/**
 * Text Input Component
 * 
 * For location input and other text fields
 * Includes debouncing capability for search-as-you-type functionality
 */
function TextInput({
    value,
    onChange,
    placeholder,
    debounceMs = 0,
    ...baseProps
}) {
    const [internalValue, setInternalValue] = React.useState(value || '')
    const timeoutRef = React.useRef(null)

    // Handle debounced input for performance
    const handleChange = React.useCallback((e) => {
        const newValue = e.target.value
        setInternalValue(newValue)

        if (debounceMs > 0) {
            // Clear previous timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set new timeout
            timeoutRef.current = setTimeout(() => {
                onChange(newValue)
            }, debounceMs)
        } else {
            // Immediate callback for non-debounced inputs
            onChange(newValue)
        }
    }, [onChange, debounceMs])

    // Sync internal value with external value changes
    React.useEffect(() => {
        setInternalValue(value || '')
    }, [value])

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <BaseInput {...baseProps}>
            <input
                type="text"
                value={internalValue}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off" // Prevent browser autocomplete for location search
            />
        </BaseInput>
    )
}

/**
 * Date Input Component
 * 
 * For start and end date selection
 * Includes intelligent defaults and range validation
 */
function DateInput({
    value,
    onChange,
    min,
    max,
    ...baseProps
}) {
    // Calculate reasonable defaults for min/max dates
    const today = new Date().toISOString().split('T')[0]
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    const twoYearsFromNow = new Date()
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)

    const defaultMin = min || fiveYearsAgo.toISOString().split('T')[0]
    const defaultMax = max || twoYearsFromNow.toISOString().split('T')[0]

    return (
        <BaseInput {...baseProps}>
            <input
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                min={defaultMin}
                max={defaultMax}
            />
        </BaseInput>
    )
}

/**
 * Location Search Input Component
 * 
 * Specialized input for location search with enhanced UX features:
 * - Search icon
 * - Clear button
 * - Loading state
 * - Suggestions placeholder (for future enhancement)
 */
function LocationInput({
    value,
    onChange,
    placeholder = "Enter city name (e.g., Berlin, Lisbon)",
    loading = false,
    onClear,
    ...baseProps
}) {
    const handleClear = () => {
        onChange('')
        if (onClear) onClear()
    }

    return (
        <BaseInput {...baseProps}>
            <div className="relative">
                {/* Search icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <div className="spinner" />
                    ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>

                {/* Input field */}
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-10" // Space for icons
                    autoComplete="off"
                    spellCheck="false" // Prevent spell check on location names
                />

                {/* Clear button */}
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear location"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </BaseInput>
    )
}

/**
 * Primary Button Component
 * 
 * For form submission and primary actions
 * Includes loading states and accessibility features
 */
function PrimaryButton({
    children,
    loading = false,
    disabled = false,
    onClick,
    type = "button",
    className = "",
    loadingText = "Loading...",
    ...props
}) {
    const isDisabled = disabled || loading

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`btn-primary ${className}`}
            aria-label={loading ? loadingText : undefined}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center space-x-2">
                    <div className="spinner" />
                    <span>{loadingText}</span>
                </div>
            ) : (
                children
            )}
        </button>
    )
}

/**
 * Secondary Button Component
 * 
 * For secondary actions like reset, cancel
 */
function SecondaryButton({
    children,
    onClick,
    type = "button",
    className = "",
    ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn-secondary ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

/**
 * Quick Date Range Buttons
 * 
 * Provides common date range shortcuts for better UX
 */
function QuickDateRanges({ onRangeSelect, className = "" }) {
    const ranges = [
        { label: 'Today', days: 0 },
        { label: 'Next 7 days', days: 7 },
        { label: 'Next 30 days', days: 30 },
        { label: 'Next 3 months', days: 90 }
    ]

    const handleRangeClick = (days) => {
        const today = new Date()
        const endDate = new Date(today)
        endDate.setDate(today.getDate() + days)

        onRangeSelect({
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        })
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <p className="text-sm font-medium text-gray-700">Quick select:</p>
            <div className="flex flex-wrap gap-2">
                {ranges.map((range) => (
                    <button
                        key={range.label}
                        type="button"
                        onClick={() => handleRangeClick(range.days)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 transition-colors"
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

// Export all components using the compound component pattern
const Input = {
    Text: TextInput,
    Date: DateInput,
    Location: LocationInput
}

const Button = {
    Primary: PrimaryButton,
    Secondary: SecondaryButton
}

export { Input, Button, QuickDateRanges }