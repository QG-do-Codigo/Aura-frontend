import {
  Home,
  CheckSquare,
  FileText,
  ShoppingCart,
  Heart,
  Wallet,
  Moon,
  Lightbulb,
} from "lucide-react";

export const sidebarItems = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-indigo-500",
    bg: "bg-indigo-100",
  },
  {
    label: "Tarefas",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-blue-500",
    bg: "bg-blue-100/30",
  },
  {
    label: "Notas Rápidas",
    icon: FileText,
    href: "/notes",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    label: "Compras",
    icon: ShoppingCart,
    href: "/shopping",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    label: "Saúde",
    icon: Heart,
    href: "/health",
    color: "text-rose-500",
    bg: "bg-rose-100",
  },
  {
    label: "Finanças",
    icon: Wallet,
    href: "/finance",
    color: "text-violet-500",
    bg: "bg-violet-100",
  },
  {
    label: "Sono",
    icon: Moon,
    href: "/sleep",
    color: "text-sky-500",
    bg: "bg-sky-100",
  },
  {
    label: "Ideias",
    icon: Lightbulb,
    href: "/ideas",
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
];
