import type { ShoppingCategory } from '../types'
import { CategoryCard } from './ShoppingCard'

interface Props {
  categories: ShoppingCategory[]
  toggleItem: (categoryId: string, itemId: string) => void
  addItem: (categoryId: string, name: string) => void
}

export function ShoppingListGrid({ categories, toggleItem, addItem }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          categoryId={category.id}
          title={category.title}
          color={category.color}
          buttonColor={category.buttonColor}
          items={category.items}
          onToggle={toggleItem}
          onAdd={addItem}
        />
      ))}
    </div>
  )
}
