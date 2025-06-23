import React from 'react'
function BaseInput({
    label,
    error,
    required = false,
    helpText,
    children,
    className = ''
}) {
    const inputId = React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const helpId = helpText ? `${inputId}-help` : undefined

    return (
        <div className={`space-y-2 ${className}`}>            {label && (
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

            {React.cloneElement(children, {
                id: inputId,
                'aria-invalid': error ? 'true' : 'false',
                'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
                className: `input-field ${error ? 'input-error' : ''} ${children.props.className || ''}`
            })}

            {helpText && (
                <p id={helpId} className="text-sm text-gray-500">
                    {helpText}
                </p>
            )}

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

function TextInput({
    value,
    onChange,
    placeholder,
    debounceMs = 0,
    ...baseProps
}) {
    const [internalValue, setInternalValue] = React.useState(value || '')
    const timeoutRef = React.useRef(null)

    const handleChange = React.useCallback((e) => {
        const newValue = e.target.value
        setInternalValue(newValue)

        if (debounceMs > 0) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                onChange(newValue)
            }, debounceMs)
        } else {
            onChange(newValue)
        }
    }, [onChange, debounceMs])

    React.useEffect(() => {
        setInternalValue(value || '')
    }, [value])

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
                autoComplete="off"
            />
        </BaseInput>
    )
}

function DateInput({
    value,
    onChange,
    min,
    max,
    ...baseProps
}) {
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <div className="spinner" />
                    ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>

                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                    autoComplete="off"
                    spellCheck="false"
                />

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

function Button({
    children,
    variant = 'primary',
    loading = false,
    disabled = false,
    onClick,
    type = "button",
    className = "",
    loadingText = "Loading...",
    ...props
}) {
    const isDisabled = disabled || loading
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary'

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`${variantClass} ${className}`}
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

const InputComponents = {
    Text: TextInput,
    Date: DateInput,
    Location: LocationInput
}

export { InputComponents as Input, Button, QuickDateRanges }