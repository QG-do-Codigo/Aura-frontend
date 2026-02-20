import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { ShoppingListGrid } from './components/ShoppingListGrid'
import { NewCategoryCardModal } from './components/NewCategoryCardModal'
import { useShopping } from '../../hooks/useShopping'
import type { ShoppingItemInput } from './types'

export function ShoppingListPage() {
  const shoppingList = useShopping()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleCreateCard(categoryId: string, values: ShoppingItemInput[]) {
    shoppingList.createCategoryCard(categoryId, values)
    setIsModalOpen(false)
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-gray-500">O que não pode faltar em casa.</p>
        </div>

        <div className="flex gap-4">
          <button className="p-2 bg-white rounded-2xl hover:bg-gray-100 transition cursor-pointer">
            <Filter size={18} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      <ShoppingListGrid
        categories={shoppingList.categories}
        toggleItem={shoppingList.toggleItem}
        deleteItem={shoppingList.deleteItem}
        addItem={shoppingList.addItem}
      />

      <NewCategoryCardModal
        isOpen={isModalOpen}
        categories={shoppingList.categoryTemplates}
        onSubmit={handleCreateCard}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  )
}
