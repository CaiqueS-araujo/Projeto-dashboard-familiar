import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ActorProvider } from './contexts/ActorContext'
import ActorGate from './components/ActorGate'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-vault-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <ActorProvider>
      <ActorGate>
        <Dashboard />
      </ActorGate>
    </ActorProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
