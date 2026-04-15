import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Camera,
  Heart,
  Home,
  Lightbulb,
  Moon,
  Palette,
  Rocket,
  Sparkles,
  Star,
  Sun,
  Target,
} from 'lucide-react'

export interface IdeaCategoryMeta {
  Icon: LucideIcon
  iconClassName: string
  badgeClassName: string
}

function normalizeCategoryName(categoryName?: string) {
  return (categoryName ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function getIdeaCategoryMeta(categoryName?: string): IdeaCategoryMeta {
  const name = normalizeCategoryName(categoryName)

  if (name.includes('NEGOC')) {
    return {
      Icon: Lightbulb,
      iconClassName: 'text-amber-500',
      badgeClassName: 'bg-amber-100 text-amber-700',
    }
  }

  if (name.includes('PESSOAL')) {
    return {
      Icon: Heart,
      iconClassName: 'text-rose-500',
      badgeClassName: 'bg-rose-100 text-rose-700',
    }
  }

  if (name.includes('CASA') || name.includes('LAR')) {
    return {
      Icon: Home,
      iconClassName: 'text-emerald-600',
      badgeClassName: 'bg-emerald-100 text-emerald-700',
    }
  }

  if (name.includes('APREND') || name.includes('ESTUD') || name.includes('LIVRO')) {
    return {
      Icon: BookOpen,
      iconClassName: 'text-orange-500',
      badgeClassName: 'bg-orange-100 text-orange-700',
    }
  }

  if (name.includes('VIAGEM') || name.includes('TRIP')) {
    return {
      Icon: Rocket,
      iconClassName: 'text-red-500',
      badgeClassName: 'bg-red-100 text-red-700',
    }
  }

  if (name.includes('SAUDE') || name.includes('BEM') || name.includes('WELL')) {
    return {
      Icon: Sun,
      iconClassName: 'text-amber-500',
      badgeClassName: 'bg-amber-100 text-amber-700',
    }
  }

  if (name.includes('ARTE') || name.includes('CRIAT') || name.includes('DESIGN')) {
    return {
      Icon: Palette,
      iconClassName: 'text-fuchsia-600',
      badgeClassName: 'bg-fuchsia-100 text-fuchsia-700',
    }
  }

  if (name.includes('FOTO') || name.includes('IMAGEM') || name.includes('CAMERA')) {
    return {
      Icon: Camera,
      iconClassName: 'text-slate-700',
      badgeClassName: 'bg-slate-100 text-slate-700',
    }
  }

  if (name.includes('META') || name.includes('OBJET')) {
    return {
      Icon: Target,
      iconClassName: 'text-sky-600',
      badgeClassName: 'bg-sky-100 text-sky-700',
    }
  }

  if (name.includes('BRILH') || name.includes('INSPIR') || name.includes('SPARK')) {
    return {
      Icon: Sparkles,
      iconClassName: 'text-yellow-600',
      badgeClassName: 'bg-yellow-100 text-yellow-800',
    }
  }

  if (name.includes('NOITE') || name.includes('DORM') || name.includes('MOON')) {
    return {
      Icon: Moon,
      iconClassName: 'text-indigo-600',
      badgeClassName: 'bg-indigo-100 text-indigo-700',
    }
  }

  if (name.includes('FAVOR') || name.includes('STAR')) {
    return {
      Icon: Star,
      iconClassName: 'text-amber-500',
      badgeClassName: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    Icon: Lightbulb,
    iconClassName: 'text-amber-500',
    badgeClassName: 'bg-amber-100 text-amber-700',
  }
}

