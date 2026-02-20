import type { ShoppingCategory } from '../types'

export const shoppingMock: ShoppingCategory[] = [
  {
    id: '1',
    title: 'Hortifruti',
    color: 'bg-green-100',
    buttonColor: 'bg-green-500 hover:bg-green-600',
    items: [
      { id: '1-1', name: 'Maçãs', checked: false },
      { id: '1-2', name: 'Bananas', checked: false },
      { id: '1-3', name: 'Brócolis', checked: false },
      { id: '1-4', name: 'Cenouras', checked: false },
    ],
  },
  {
    id: '2',
    title: 'Laticínios',
    color: 'bg-blue-100',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    items: [
      { id: '2-1', name: 'Leite', checked: false },
      { id: '2-2', name: 'Iogurte Grego', checked: false },
      { id: '2-3', name: 'Queijo Fresco', checked: false },
    ],
  },
]
