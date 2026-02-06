import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../UI/dialog'
import { Input } from '../UI/input'
import { Button } from '../UI/button'
import { toast } from 'sonner'

export function ForgotPasswordDialog() {
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  function handleSubmit() {
    toast.success('Email de recuperação enviado com sucesso ✨')

    setOpen(false)
    setEmail('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest">
          Esqueceu a senha?
        </button>
      </DialogTrigger>

      <DialogContent className=" rounded-[20px] border-slate-100  px-6">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-slate-500 text-lg">
            Recuperar senha
          </DialogTitle>
          <DialogDescription className="flex justify-center text-slate-500 text-sm">
            Digite seu e-mail para receber o link de recuperação.
          </DialogDescription>
        </DialogHeader>

        <Input
          className="h-14 rounded-[20px] border-slate-200 bg-slate-50/50 px-6"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValidEmail}
            className="text-xl font-black shadow-[0_20px_40px_-12px_rgba(184,198,219,0.5)] bg-primary text-white hover:bg-primary-hover rounded-[8px] transition-all hover:-translate-y-1"
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
