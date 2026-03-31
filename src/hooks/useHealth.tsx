import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import type { CreateHealthInput, HealthItem } from '../pages/health/types'

export function useHealth() {
  const [items, setItems] = useState<HealthItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem('token')

  const fetchHealth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get<HealthItem[]>('/health', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setItems(response.data ?? [])
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar saúde:', err)
      setError('Não foi possível carregar sua rotina de saúde.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const createHealth = async (data: CreateHealthInput) => {
    try {
      const response = await api.post<HealthItem>('/health', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setItems(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      console.error('Erro ao criar rotina:', err)
      throw err
    }
  }

  const getHealthById = async (id: string) => {
    const response = await api.get<HealthItem>(`/health/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  }

  const updateHealth = async (id: string, data: Partial<CreateHealthInput>) => {
    try {
      const response = await api.patch<HealthItem>(`/health/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setItems(prev =>
        prev.map(item => (item.id === id ? response.data : item))
      )
      return response.data
    } catch (err) {
      console.error('Erro ao atualizar rotina:', err)
      throw err
    }
  }

  const deleteHealth = async (id: string) => {
    await api.delete(`/health/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleDone = async (id: string) => {
    try {
      await api.patch<HealthItem>(`/health/${id}/done`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await fetchHealth()
    } catch (err) {
      console.error('Erro ao confirmar rotina:', err)
    }
  }

  useEffect(() => {
    void fetchHealth()
  }, [fetchHealth])

  return {
    items,
    isLoading,
    error,
    fetchHealth,
    createHealth,
    getHealthById,
    updateHealth,
    deleteHealth,
    toggleDone,
  }
}
