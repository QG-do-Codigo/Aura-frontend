import { useState } from "react";
import { sidebarItems } from "./sidebar-items";
import { SidebarItem } from "./SidebarItem";
import { Button } from "../UI/button";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="flex">
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-slate-100 p-6 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <img src="/logoaura.png" alt="Aura Logo" className="w-8 h-8" />
          <span className="font-semibold text-lg">Aura</span>
        </div>

        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <SidebarItem
                key={item.label}
                {...item}
                isActive={isActive}
                onClick={() => navigate(item.href)}
              />
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 px-2 pt-6">
          <img
            src="https://i.pravatar.cc/40"
            className="w-10 h-10 rounded-full"
            alt=""
          />
          <div className="text-sm">
            <p className="font-medium">User</p>
            <p className="text-muted-foreground">Premium User</p>
          </div>
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
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.href;

                return (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    isActive={isActive}
                    onClick={() => {
                      navigate(item.href);
                      setIsMenuOpen(false);
                    }}
                  />
                );
              })}
            </nav>

            <div className="mt-auto flex items-center gap-3 pt-6">
              <img
                src="https://i.pravatar.cc/40"
                className="w-10 h-10 rounded-full"
                alt=""
              />
              <div className="text-sm">
                <p className="font-medium">User</p>
                <p className="text-muted-foreground">Premium User</p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
