'use client'

import clsx from 'clsx'
import React from 'react'
import { useTheme } from '@/providers/Theme'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props
  const { theme } = useTheme()

  // Determine text color based on theme
  // Dark theme = white text, Light theme = black text
  const textColor = theme === 'dark' ? '#ffffff' : '#161d23'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="69.32"
      width="68.67"
      viewBox="0 0 68.67 69.32"
      className={clsx('max-w-[9.375rem] w-full h-auto', className)}
      aria-label="EY Logo"
    >
      {/* EY Text - changes color based on theme */}
      <path
        d="M11.09 61.4h17.37v7.92H.67V34.9h19.7l4.61 7.92H11.1v5.68h12.56v7.22H11.1zm35.86-26.5l-5.9 11.23-5.88-11.23H23.65l12.13 20.82v13.6h10.4v-13.6L58.31 34.9z"
        // fill={textColor}
        fillRule="evenodd"
        className="EY-logo"
      />
      {/* Yellow triangle - always stays yellow */}
      <path className="fill-accent" fillRule="evenodd" d="M68.67 12.81V0L0 24.83z" />
    </svg>
  )
}
