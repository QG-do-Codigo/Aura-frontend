import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Card = ({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      'bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
)

export const Button = ({
  children,
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) => {
  const variants = {
    primary: 'bg-[#B8C6DB] text-slate-800 hover:bg-[#A8B6CB]',
    secondary: 'bg-[#D4E2D4] text-slate-800 hover:bg-[#C4D2C4]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
  }
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B8C6DB] bg-white/50"
    {...props}
  />
)
