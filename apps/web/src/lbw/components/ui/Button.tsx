import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'wellness' | 'brain' | 'calm' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  as?: React.ElementType
  animate?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, animate = true, as: Component = 'button', children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brain-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden'
    
    const variants = {
      primary: 'bg-brain-600 text-white hover:bg-brain-700 shadow-sm hover:shadow-md',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400',
      ghost: 'text-gray-700 hover:bg-gray-100',
      wellness: 'bg-gradient-to-r from-brain-600 to-wellness-600 text-white hover:from-brain-700 hover:to-wellness-700 shadow-lg hover:shadow-xl',
      brain: 'bg-brain-600 text-white hover:bg-brain-700 shadow-sm hover:shadow-md',
      calm: 'bg-calm-600 text-white hover:bg-calm-700 shadow-sm hover:shadow-md',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12'
    }

    const MotionComponent = animate ? motion.create(Component) : Component

    const animationProps = animate ? {
      whileHover: { 
        scale: variant === 'wellness' ? 1.05 : 1.02,
        boxShadow: variant === 'wellness' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : undefined
      },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.15 }
    } : {}

    return (
      <MotionComponent
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...animationProps}
        {...props}
      >
        {/* Ripple effect background */}
        <motion.div 
          className="absolute inset-0 rounded-lg"
          initial={{ scale: 0, opacity: 0.8 }}
          whileTap={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: variant === 'outline' || variant === 'ghost' 
              ? 'rgba(0, 0, 0, 0.1)' 
              : 'rgba(255, 255, 255, 0.2)'
          }}
        />
        
        <span className="relative z-10 flex items-center">
          {loading && (
            <motion.svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </motion.svg>
          )}
          {children}
        </span>
      </MotionComponent>
    )
  }
)

Button.displayName = 'Button'
