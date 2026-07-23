import { useActor, ACTORS } from '../contexts/ActorContext'

export default function ActorGate({ children }) {
  const { actor, setActor } = useActor()

  if (actor) return children

  return (
    <div className="min-h-screen bg-vault-950 flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #D4AF5A 0, transparent 35%), radial-gradient(circle at 80% 80%, #276B4A 0, transparent 40%)',
        }}
      />
      <div className="relative w-full max-w-sm text-center">
        <p className="text-vault-500 text-xs uppercase tracking-wide mb-2">Antes de continuar</p>
        <h1 className="font-display text-2xl text-white mb-8">Quem está usando agora?</h1>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(ACTORS).map(([id, name]) => (
            <button
              key={id}
              onClick={() => setActor(id)}
              className="bg-vault-900 border border-white/10 hover:border-gold-500/50 active:scale-[0.98] rounded-2xl py-9 text-white font-display text-xl transition"
            >
              {name}
            </button>
          ))}
        </div>
        <p className="text-vault-600 text-xs mt-7 leading-relaxed">
          Isso ajuda a marcar quem lançou cada gasto, treino ou item da lista de compras.
          Dá pra trocar a qualquer momento tocando no nome, lá em cima.
        </p>
      </div>
    </div>
  )
}
