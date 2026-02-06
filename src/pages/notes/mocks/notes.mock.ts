import type { Note } from '../types'

export const NOTES_MOCK: Note[] = [
  {
    id: '1',
    title: 'Ideias de Viagem',
    content:
      'Japão em Outubro: Roteiro Tóquio, Quioto e Osaka.\nPesquisar JR Pass.',
    date: '30 JAN',
    color: 'var(--note-red)',
  },
  {
    id: '2',
    title: 'Livros para Ler',
    content:
      '1. Antifrágil\n2. Psicologia Financeira\n3. Meditações - Marco Aurélio',
    date: '29 JAN',
    color: 'var(--note-green)',
  },
  {
    id: '3',
    title: 'Projeto Aura',
    content:
      'Refinar paleta de cores para o módulo de sono.\nUsar tons de lavanda.',
    date: '28 JAN',
    color: 'var(--note-blue)',
  },
]
