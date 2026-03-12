import type { ShoppingCategory, ShoppingItemInput } from '../types'
import { CategoryCard } from './ShoppingCard'

interface Props {
  categories: ShoppingCategory[]
  toggleItem: (categoryId: string, itemId: string) => Promise<void>
  addItems: (categoryId: string, items: ShoppingItemInput[]) => Promise<void>
  deleteItem: (categoryId: string, itemId: string) => Promise<void>
}

export function ShoppingListGrid({
  categories,
  toggleItem,
  addItems,
  deleteItem,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          categoryId={category.id}
          title={category.title}
          icon={category.icon}
          color={category.color}
          buttonColor={category.buttonColor}
          items={category.items}
          onToggle={toggleItem}
          onAdd={addItems}
          onDelete={deleteItem}
        />
      ))}
    </div>
  )
}
