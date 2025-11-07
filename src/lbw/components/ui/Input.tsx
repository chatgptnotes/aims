import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'wellness'
  animate?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, variant = 'default', animate = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    
    const baseClasses = 'block w-full px-4 py-3 text-base border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm'
    
    const variants = {
      default: 'border-gray-200 focus:border-brain-500 focus:ring-brain-500/20 hover:border-gray-300',
      wellness: 'border-wellness-200 focus:border-wellness-500 focus:ring-wellness-500/20 hover:border-wellness-300'
    }
    
    const errorClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : variants[variant]

    const containerVariants = animate ? {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    } : {}

    const Container = animate ? motion.div : 'div'

    return (
      <Container 
        className="w-full"
        {...containerVariants}
      >
        {label && (
          <motion.label 
            className={clsx(
              "block text-base font-semibold mb-2 transition-colors duration-200 leading-6",
              error ? "text-red-700" : 
              isFocused ? (variant === 'wellness' ? "text-wellness-700" : "text-brain-700") : 
              "text-gray-800 dark:text-gray-100"
            )}
            animate={animate ? { 
              scale: isFocused ? 1.02 : 1,
              color: isFocused ? (variant === 'wellness' ? '#047857' : '#0369a1') : '#374151'
            } : {}}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={ref}
            className={clsx(
              baseClasses,
              errorClasses,
              'placeholder:text-gray-600',  // Improved contrast for placeholders
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          {/* Focus ring enhancement */}
          {animate && isFocused && (
            <motion.div
              className={clsx(
                "absolute inset-0 rounded-xl -z-10",
                variant === 'wellness' ? "bg-wellness-100/30" : "bg-brain-100/30"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </motion.div>
        {animate ? (
          <>
            {error && (
              <motion.p 
                className="mt-2 text-base text-red-600 flex items-center font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-red-500 mr-1">⚠</span>
                {error}
              </motion.p>
            )}
            {helperText && !error && (
              <motion.p 
                className="mt-2 text-base text-gray-700 dark:text-gray-200 font-medium leading-6"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {helperText}
              </motion.p>
            )}
          </>
        ) : (
          <>
            {error && (
              <p className="mt-2 text-base text-red-600 font-medium">{error}</p>
            )}
            {helperText && !error && (
              <p className="mt-2 text-base text-gray-700 dark:text-gray-200 font-medium leading-6">{helperText}</p>
            )}
          </>
        )}
      </Container>
    )
  }
)

Input.displayName = 'Input'

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'wellness'
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, variant = 'default', options, ...props }, ref) => {
    const baseClasses = 'block w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      default: 'border-gray-300 focus:border-brain-500 focus:ring-brain-500',
      wellness: 'border-wellness-300 focus:border-wellness-500 focus:ring-wellness-500'
    }
    
    const errorClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : variants[variant]

    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-semibold text-gray-800 dark:text-gray-100 mb-1 leading-6">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            baseClasses,
            errorClasses,
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-base text-red-600 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-base text-gray-700 dark:text-gray-200 font-medium leading-6">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
