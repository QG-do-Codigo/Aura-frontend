import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  title: string
  onSubmit: (values: string[]) => void
  onCancel: () => void
}

export function ItemModal({ isOpen, title, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<string[]>([''])

  useEffect(() => {
    if (!isOpen) {
      setValues([''])
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  function handleChange(index: number, value: string) {
    const updated = [...values]
    updated[index] = value
    setValues(updated)
  }

  function handleAddField() {
    setValues([...values, ''])
  }

  function handleRemoveField(index: number) {
    const updated = values.filter((_, i) => i !== index)
    setValues(updated.length ? updated : [''])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const filtered = values.map(value => value.trim()).filter(Boolean)
    if (!filtered.length) return

    onSubmit(filtered)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm p-4 flex items-center justify-center"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-lg rounded-[30px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Adicionar itens
            </h2>
            <p className="text-sm text-slate-500 mt-1">Categoria: {title}</p>
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
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {values.map((value, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={value}
                  onChange={e => handleChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                />

                {values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="h-11 w-11 rounded-2xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                    aria-label="Remover item"
                  >
                    <X size={18} className="mx-auto" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddField}
            className="w-full h-11 rounded-2xl border border-dashed border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={16} />
            Adicionar outro item
          </button>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-4 rounded-2xl text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="h-11 px-5 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition font-medium"
            >
              Salvar itens
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
