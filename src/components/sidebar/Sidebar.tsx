import { useState } from 'react'
import { sidebarItems } from './SidebarItems'
import { SidebarItem } from './SidebarItem'
import { Button } from '../UI/button'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../UI/utils'

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navigate = useNavigate()

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-slate-100 p-6 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <img src="/logoaura.png" alt="Aura Logo" className="w-8 h-8" />
          <span className="font-semibold text-lg">Aura</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {sidebarItems.map(item => {
            const isActive = activeTab === item.id

            return (
              <SidebarItem
                key={item.id}
                {...item}
                isActive={isActive}
                onClick={() => {
                  setActiveTab(item.id)
                  navigate(item.href)
                }}
              />
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <button
            onClick={() => {
              setActiveTab('profile')
              navigate('/dashboard/profile')
            }}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer',
              activeTab === 'profile'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50'
            )}
          >
            <div className="w-10 h-10 rounded-[10px] overflow-hidden shadow-sm">
              <img src="https://i.pravatar.cc/40" alt="user avatar" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black truncate">User</p>
              <p className="text-[10px] opacity-60">Premium User</p>
            </div>
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleMenu}
          className="lg:hidden fixed top-4 left-4 z-50 rounded-md p-2"
        >
          <Menu />
        </Button>

        {isMenuOpen && (
          <aside className="fixed top-0 left-0 h-screen w-72 z-50 bg-white p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <img src="/logoaura.png" alt="Aura Logo" className="w-8 h-8" />
                <span className="font-semibold text-lg">Aura</span>
              </div>

              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <X />
              </Button>
            </div>

            <nav className="flex flex-col gap-2">
              {sidebarItems.map(item => {
                const isActive = activeTab === item.id

                return (
                  <SidebarItem
                    key={item.id}
                    {...item}
                    isActive={isActive}
                    onClick={() => {
                      setActiveTab(item.id)
                      navigate(item.href)
                      setIsMenuOpen(false)
                    }}
                  />
                )
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-50">
              <button
                onClick={() => {
                  setActiveTab('profile')
                  navigate('/dashboard/profile')
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer',
                  activeTab === 'profile'
                    ? 'bg-slate-900 text-white'
                    : 'hover:bg-slate-50'
                )}
              >
                <div className="w-10 h-10 rounded-[10px] overflow-hidden shadow-sm">
                  <img src="https://i.pravatar.cc/40" alt="user avatar" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black truncate">User</p>
                  <p className="text-[10px] opacity-60">Premium User</p>
                </div>
              </button>
            </div>
          </aside>
        )}
      </div>
    </>
  )
}
