import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs select-none'

    const variants = {
      primary:
        'bg-[#635bff] hover:bg-[#5349e0] active:bg-[#4339ca] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(99,91,255,0.2)] font-semibold',
      secondary:
        'bg-white dark:bg-[#1a2130] hover:bg-[#f4f6f8] dark:hover:bg-[#232a38] text-[#3c4257] dark:text-[#c1c9d2] border border-[#d8dee4] dark:border-[#2e3748] shadow-[0px_1px_1px_rgba(0,0,0,0.04)]',
      outline:
        'bg-transparent border border-[#d8dee4] dark:border-[#2e3748] hover:bg-[#f4f6f8] dark:hover:bg-[#1e2430] text-[#3c4257] dark:text-[#c1c9d2]',
      ghost:
        'bg-transparent hover:bg-[#f4f6f8] dark:hover:bg-[#1e2430] text-[#4f566b] dark:text-[#8792a2]',
      danger:
        'bg-[#df1b41] hover:bg-[#c9173a] text-white shadow-sm font-semibold',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-3.5 text-xs',
      lg: 'h-10 px-4 text-sm',
    }


    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
