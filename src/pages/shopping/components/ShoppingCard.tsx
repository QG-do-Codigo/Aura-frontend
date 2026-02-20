import { useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ShoppingItem, ShoppingItemInput } from '../types'
import { ItemModal } from './ItemForm'

interface Props {
  categoryId: string
  title: string
  icon: string
  color: string
  buttonColor: string
  items: ShoppingItem[]
  onToggle: (categoryId: string, itemId: string) => Promise<void>
  onAdd: (categoryId: string, item: ShoppingItemInput) => void
}

export function CategoryCard({
  categoryId,
  title,
  icon,
  color,
  buttonColor,
  items,
  onToggle,
  onAdd,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSubmit(values: ShoppingItemInput[]) {
    values.forEach(value => {
      onAdd(categoryId, value)
    })
    setIsOpen(false)
  }

  return (
    <>
      <div className={`${color} rounded-3xl p-6 shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none" aria-hidden>
              {icon}
            </span>
            <span className="font-semibold text-lg">{title}</span>
          </div>
          <span className="text-sm text-gray-500">{items.length} ITENS</span>
        </div>

        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => {
                void onToggle(categoryId, item.id)
              }}
              className={`flex items-center gap-3 bg-white px-4 py-3 rounded-3xl shadow-sm transition ${
                item.purchased ? 'opacity-55' : ''
              } cursor-pointer`}
            >
              <Checkbox.Root
                checked={item.purchased}
                onClick={event => {
                  event.stopPropagation()
                }}
                onCheckedChange={() => {
                  void onToggle(categoryId, item.id)
                }}
                className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              >
                <Checkbox.Indicator>
                  <Check size={14} className="text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>

              <span
                className={`text-gray-700 ${
                  item.purchased ? 'line-through' : ''
                }`}
              >
                {item.name}
              </span>

              <span
                className={`ml-auto text-xs font-semibold rounded-full px-2 py-1 ${
                  item.purchased
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Qtd: {item.quantity}
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
