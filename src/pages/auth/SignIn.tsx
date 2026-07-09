import { useState } from 'react'
import { Input } from '../../components/UI/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthLayout } from '../../components/auth/AuthLayout'
import auraLogo from '../../assets/logoaura.png'
import { Button } from '../../components/UI/button'
import { Link, useNavigate } from 'react-router-dom'
import { ForgotPasswordDialog } from '../../components/auth/ForgotPasswordDialog'
import { authService } from '../../services/auth/authService'
import { ToastAlert } from '../../utils/toastAlert'
import axios from 'axios'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  let navigate = useNavigate()

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const isFormValid =
    email.trim() !== '' &&
    password.trim() !== '' &&
    Object.keys(errors).length === 0

  function validateField(field: 'email' | 'password', value: string) {
    setErrors(prev => {
      const newErrors = { ...prev }

      if (!value.trim()) {
        newErrors[field] = 'Campo obrigatório'
      } else {
        delete newErrors[field]

        if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'E-mail inválido'
        }
      }

      return newErrors
    })
  }

  async function handleLogin(e: any) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = await authService.signIn({ email, password })

      if (data) {
        ToastAlert('Logado com sucesso!', 'success')
        // redirecionar se quiser
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status

        if (status === 401) {
          ToastAlert('Email ou senha incorretos', 'info')
          return
        }

        if (status === 400) {
          ToastAlert('Dados inválidos', 'info')
          return
        }
      }

      ToastAlert('Erro ao realizar o login', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-row items-center">
            <img className="mr-2 rounded-2xl h-12" src={auraLogo} alt="" />
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">
              Aura
            </h1>
          </div>

          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-[1.1]">
            Sinta a calma.
          </h2>

          <p className="text-slate-500 text-lg">
            Organize sua rotina e recupere seu tempo em um ambiente minimalista.
          </p>
        </div>

        <div className="space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              EMAIL
            </label>
            <Input
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                validateField('email', e.target.value)
              }}
              onBlur={e => validateField('email', e.target.value)}
              placeholder="Email"
              type="email"
              className="h-14 rounded-[20px] border-slate-100 bg-slate-50/50 px-6"
            />

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}

            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              SENHA
            </label>
            <div className="relative">
              <Input
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  validateField('password', e.target.value)
                }}
                onBlur={e => validateField('password', e.target.value)}
                placeholder="Senha"
                type={showPassword ? 'text' : 'password'}
                className="h-14 rounded-[20px] border-slate-100 bg-slate-50/50 px-6"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}

            <div className="text-right">
              <ForgotPasswordDialog />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full h-16 text-xl font-black shadow-[0_20px_40px_-12px_rgba(184,198,219,0.5)] bg-primary text-white hover:bg-primary-hover rounded-3xl transition-all hover:-translate-y-1"
            >
              {isSubmitting && <Loader2 className="size-5 animate-spin" />}
              {isSubmitting ? 'Entrando...' : 'Entrar na Aura'}
            </Button>
          </form>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
            ou
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          <span>Ainda não é membro? </span>
          <Link to="/register" className="font-semibold underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default SignIn
