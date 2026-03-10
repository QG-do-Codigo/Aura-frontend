import type { ShoppingCategory } from '../types'

export const shoppingMock: ShoppingCategory[] = [
  {
    id: '1',
    title: 'Hortifruti',
    icon: '🥦',
    color: 'bg-green-100',
    buttonColor: 'bg-green-500 hover:bg-green-600',
    items: [
      { id: '1-1', name: 'Maçãs', quantity: 6, purchased: false },
      { id: '1-2', name: 'Bananas', quantity: 12, purchased: false },
      { id: '1-3', name: 'Brócolis', quantity: 2, purchased: false },
      { id: '1-4', name: 'Cenouras', quantity: 5, purchased: false },
    ],
  },
  {
    id: '2',
    title: 'Laticínios',
    icon: '🥛',
    color: 'bg-blue-100',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    items: [
      { id: '2-1', name: 'Leite', quantity: 2, purchased: false },
      { id: '2-2', name: 'Iogurte Grego', quantity: 4, purchased: false },
      { id: '2-3', name: 'Queijo Fresco', quantity: 1, purchased: false },
    ],
  },
]
