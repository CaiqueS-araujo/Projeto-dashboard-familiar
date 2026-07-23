import { useState } from 'react'
import { Lock, ShieldCheck, Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde um pouco e tente de novo.')
      } else {
        // Mesma mensagem pra usuário inexistente ou senha errada,
        // pra não dar pista de quais usuários existem no sistema.
        setError('Usuário ou senha incorretos.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-vault-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #D4AF5A 0, transparent 35%), radial-gradient(circle at 80% 80%, #276B4A 0, transparent 40%)',
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-vault-800 border border-gold-500/30 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white tracking-tight text-center leading-tight">Família Caique e Carol</h1>
          <p className="text-vault-500 text-sm mt-1">Finanças da família</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-vault-900 border border-white/5 rounded-2xl p-7 shadow-2xl"
        >
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-2">
              Usuário
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-vault-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-vault-800 border border-white/10 rounded-lg pl-10 pr-3.5 py-2.5 text-white text-sm placeholder:text-white/25 focus:border-gold-500/50 outline-none transition"
                placeholder="usuário da família"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-vault-800 border border-white/10 rounded-lg px-3.5 py-2.5 pr-10 text-white text-sm placeholder:text-white/25 focus:border-gold-500/50 outline-none transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-500 hover:text-gold-400 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-coral-500 text-sm mb-4 -mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-vault-950 font-semibold text-sm py-2.5 rounded-lg transition"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-5 text-vault-600 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Acesso restrito à família</span>
        </div>
      </div>
    </div>
  )
}
