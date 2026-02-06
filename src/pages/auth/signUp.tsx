import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/auth/auth-layout'
import { Button } from '../../components/UI/button'
import { Input } from '../../components/UI/input'
import auraLogo from '../../assets/logoaura.png'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const MAX_PASSWORD = 6
  const isFormValid =
    name.trim() !== '' && email.trim() !== '' && password.trim() !== ''

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
  }>({})

  function validateField(field: 'name' | 'email' | 'password', value: string) {
    setErrors(prev => {
      const next = { ...prev }

      if (field === 'name') {
        if (!value.trim()) next.name = 'Campo obrigatório'
        else delete next.name
      }

      if (field === 'email') {
        if (!value.trim()) {
          next.email = 'Campo obrigatório'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          next.email = 'E-mail inválido'
        } else {
          delete next.email
        }
      }

      if (field === 'password') {
        if (!value.trim()) next.password = 'Campo obrigatório'
        else delete next.password
      }

      return next
    })
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-row  items-center">
          <img className="mr-2 rounded-2xl h-12" src={auraLogo} alt="" />
          <h1 className="text-2xl  font-black tracking-tighter text-slate-900">
            Aura
          </h1>
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-[1.1]">
            {' '}
            Comece agora.
          </h1>
          <p className="text-slate-500 text-lg">
            Crie sua conta e descubra como a simplicidade pode transformar seu
            dia.
          </p>
        </div>
        <form className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            Nome Completo *
          </label>
          <Input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={e => validateField('name', e.target.value)}
            className="h-14 rounded-[20px] border-slate-100 bg-slate-50/50 px-6"
            placeholder="Como quer ser chamado?"
          />

          {errors.name && (
            <p className="ml-2 mt-1 text-xs text-red-500">{errors.name}</p>
          )}
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            EMAIL *
          </label>
          <Input
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={e => validateField('email', e.target.value)}
            className="h-14 rounded-[20px] border-slate-100 bg-slate-50/50 px-6"
            placeholder="seu@email"
            type="email"
          />
          {errors.email && (
            <p className="ml-2 mt-1 text-xs text-red-500">{errors.email}</p>
          )}
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            SENHA *
          </label>
          <div className="relative">
            <Input
              required
              value={password}
              maxLength={MAX_PASSWORD}
              onChange={e => setPassword(e.target.value)}
              onBlur={e => validateField('password', e.target.value)}
              placeholder="Senha"
              type={showPassword ? 'text' : 'password'}
              className="h-14 rounded-[20px] border-slate-100 bg-slate-50/50 px-6"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-slate-400">
                {password.length} / {MAX_PASSWORD}
              </span>
            </div>

            {errors.password && (
              <p className="ml-2 mt-1 text-xs text-red-500">
                {errors.password}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full h-16 text-xl font-black shadow-[0_20px_40px_-12px_rgba(184,198,219,0.5)] bg-primary text-white hover:bg-primary-hover rounded-3xl transition-all hover:-translate-y-1"
          >
            Criar Aura
          </Button>
        </form>
        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
            ou
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <p className="text-sm text-center text-muted-foreground">
          <span> Já faz parte da nossa comunidade? </span>
          <Link to="/login" className="font-semibold underline">
            faça login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
export default SignUp
