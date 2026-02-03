import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import auraImage from '../../assets/aura.png'
import { Heart, Moon } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBFBFD] overflow-hidden">
      <div className="hidden md:flex md:w-[55%] bg-[#B8C6DB]/5 items-center justify-center p-12 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/30 blur-[150px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-xl group"
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-[60px] transform group-hover:scale-105 transition-transform duration-700" />

          <img
            className="relative w-full h-auto rounded-[60px] shadow-[0_32px_64px_-12px_rgba(184,198,219,0.4)] border-[12px] border-white/80"
            src={auraImage}
            alt=""
          />

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-[32px] shadow-xl flex items-center justify-center p-6 border border-slate-50"
          >
            <Heart className="w-full h-full text-rose-300" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-10 -left-10 w-28 h-28 bg-white rounded-[32px] shadow-xl flex items-center justify-center p-6 border border-slate-50"
          >
            <Moon className="w-full h-full text-indigo-300" />
          </motion.div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
