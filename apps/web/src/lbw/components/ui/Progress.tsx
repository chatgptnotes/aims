import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'default' | 'brain' | 'wellness' | 'calm'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = 'default', size = 'md', showLabel = false, label, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const containerClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }
    
    const variants = {
      default: 'bg-gray-600',
      brain: 'bg-brain-600',
      wellness: 'bg-gradient-to-r from-brain-500 to-wellness-500',
      calm: 'bg-calm-600'
    }

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100 leading-6">{label}</span>
            <span className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', containerClasses[size])}>
          <div
            className={clsx('h-full rounded-full transition-all duration-300 ease-out', variants[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'brain' | 'wellness' | 'calm'
  showLabel?: boolean
  label?: string
  className?: string
}

export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ value, max = 100, size = 100, strokeWidth = 8, variant = 'default', showLabel = false, label, className }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    const variants = {
      default: 'stroke-gray-600',
      brain: 'stroke-brain-600',
      wellness: 'stroke-wellness-600',
      calm: 'stroke-calm-600'
    }

    return (
      <div className={clsx('relative inline-flex items-center justify-center', className)}>
        <svg
          ref={ref}
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={clsx('transition-all duration-300 ease-out', variants[variant])}
          />
        </svg>
        
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(percentage)}</span>
            {label && <span className="text-base text-gray-700 dark:text-gray-200 font-medium leading-6">{label}</span>}
          </div>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'
