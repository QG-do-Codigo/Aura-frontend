import { useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ShoppingItem } from '../types'
import { ItemModal } from './ItemForm'

interface Props {
  categoryId: string
  title: string
  color: string
  buttonColor: string
  items: ShoppingItem[]
  onToggle: (categoryId: string, itemId: string) => void
  onAdd: (categoryId: string, itemName: string) => void
}

export function CategoryCard({
  categoryId,
  title,
  color,
  buttonColor,
  items,
  onToggle,
  onAdd,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSubmit(values: string[]) {
    values.forEach(value => {
      onAdd(categoryId, value)
    })
    setIsOpen(false)
  }

  return (
    <>
      <div className={`${color} rounded-3xl p-6 shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-lg">{title}</span>
          <span className="text-sm text-gray-500">{items.length} ITENS</span>
        </div>

        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-3xl shadow-sm"
            >
              <Checkbox.Root
                checked={item.checked}
                onCheckedChange={() => onToggle(categoryId, item.id)}
                className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              >
                <Checkbox.Indicator>
                  <Check size={14} className="text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>

              <span
                className={`text-gray-700 ${
                  item.checked ? 'line-through opacity-50' : ''
                }`}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className={`w-full py-2 rounded-2xl text-white font-medium transition ${buttonColor} cursor-pointer`}
        >
          Adicionar a {title}
        </button>
      </div>

      <ItemModal
        isOpen={isOpen}
        title={title}
        onSubmit={handleSubmit}
        onCancel={() => setIsOpen(false)}
      />
    </>
  )
}
