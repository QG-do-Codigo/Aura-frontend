import { useState } from "react";
import { sidebarItems } from "./sidebar-items";
import { SidebarItem } from "./SidebarItem";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-slate-100 p-6 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <img src="/logoaura.png" alt="Aura Logo" className="w-8 h-8" />
        <span className="font-semibold text-lg">Aura</span>
      </div>

      <nav className="flex flex-col gap-1">
        {sidebarItems.map((item) => {
          const isActive = activeTab === item.label;

          return (
            <SidebarItem
              key={item.label}
              {...item}
              isActive={isActive}
              onClick={() => {
                setActiveTab(item.label);
              }}
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
  );
}
