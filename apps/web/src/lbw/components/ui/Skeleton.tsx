import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height, 
  animation = 'pulse',
  style,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse'
  
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
    rounded: 'rounded-lg'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  const dimensions = {
    width: width || (variant === 'text' ? '100%' : variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '80px'),
    ...style
  }

  if (animation === 'wave') {
    return (
      <div
        className={clsx(
          'relative overflow-hidden bg-gray-200',
          variants[variant],
          className
        )}
        style={dimensions}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        animationClasses[animation],
        className
      )}
      style={dimensions}
      {...props}
    />
  )
}

// Pre-built skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="90%" />
      </div>
      <div className="mt-4">
        <Skeleton variant="rounded" height="120px" />
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width="64px" height="64px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height="20px" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  )
}

export function SkeletonButton() {
  return (
    <Skeleton 
      variant="rounded" 
      width="120px" 
      height="40px" 
      className="bg-gray-300"
    />
  )
}

export function SkeletonChart() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="30%" height="24px" />
        <Skeleton variant="text" width="20%" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton 
              variant="rounded" 
              width="40px" 
              height={`${Math.random() * 80 + 40}px`}
            />
            <Skeleton variant="text" width="30px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" height="32px" />
        <Skeleton variant="text" width="60%" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <Skeleton variant="circular" width="32px" height="32px" />
              <Skeleton variant="text" width="40px" height="24px" />
            </div>
            <div className="mt-2 space-y-1">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
