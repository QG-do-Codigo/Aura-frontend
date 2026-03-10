import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface CategoryOption {
  id: string
  title: string
  icon: string
}

interface Props {
  isOpen: boolean
  categories: CategoryOption[]
  selectedCategoryId: string
  onApply: (categoryId?: string) => void | Promise<void>
  onCancel: () => void
}

export function CategoryFilterModal({
  isOpen,
  categories,
  selectedCategoryId,
  onApply,
  onCancel,
}: Props) {
  const [value, setValue] = useState(selectedCategoryId)

  useEffect(() => {
    setValue(selectedCategoryId)
  }, [selectedCategoryId, isOpen])

  if (!isOpen) return null

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    void onApply(value || undefined)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm p-4 flex items-center justify-center"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-[30px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Filtrar</h2>
            <p className="text-sm text-slate-500 mt-1">
              Selecione uma categoria para listar.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center justify-center"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <select
            value={value}
            onChange={event => setValue(event.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.title}
              </option>
            ))}
          </select>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setValue('')
                void onApply(undefined)
              }}
              className="h-11 px-4 rounded-2xl text-slate-600 hover:bg-slate-100 transition"
            >
              Limpar
            </button>

            <button
              type="submit"
              className="h-11 px-5 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
