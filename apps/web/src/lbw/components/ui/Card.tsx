import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'gradient' | 'wellness'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', animate = true, children, ...props }, ref) => {
    const baseClasses = 'rounded-xl shadow-lg transition-all duration-200 backdrop-blur-sm'
    
    const variants = {
      default: 'bg-white/95 border border-gray-100/50 hover:shadow-xl hover:border-gray-200/70',
      interactive: 'bg-white/95 border border-gray-100/50 hover:shadow-2xl cursor-pointer hover:border-brain-200/50',
      gradient: 'bg-gradient-to-br from-brain-50/90 to-wellness-50/90 border border-brain-100/50 hover:shadow-xl',
      wellness: 'bg-gradient-to-r from-brain-500 to-wellness-500 text-white shadow-xl hover:shadow-2xl'
    }
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    const animationProps = animate ? {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.5 },
      ...(variant === 'interactive' ? {
        whileHover: { 
          y: -8,
          scale: 1.02,
          transition: { duration: 0.2 }
        },
        whileTap: { scale: 0.98 }
      } : {})
    } : {}

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={clsx(
            baseClasses,
            variants[variant],
            paddings[padding],
            className
          )}
          {...animationProps}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('mb-4', className)} {...props} />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={clsx('text-lg font-semibold text-gray-800 dark:text-gray-100', className)} {...props} />
  )
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={clsx('text-gray-700 dark:text-gray-200 font-medium text-base leading-6', className)} {...props} />
  )
)

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('mt-4 pt-4 border-t border-gray-100', className)} {...props} />
  )
)

CardFooter.displayName = 'CardFooter'
