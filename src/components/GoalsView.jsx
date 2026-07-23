import { useState } from 'react'
import { Plus, Trash2, Target } from 'lucide-react'
import { formatBRL } from '../utils/format'

export default function GoalsView({ goals, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim() || !target) return
    await onAdd({ name: name.trim(), target: Number(target), current: 0 })
    setName('')
    setTarget('')
    setShowForm(false)
  }

  async function addProgress(goal, amount) {
    const next = Math.max(0, Number(goal.current || 0) + amount)
    await onUpdate(goal.id, { current: next })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Metas</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Nova meta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Nome da meta</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem, Reserva de emergência..."
              className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Valor alvo (R$)</label>
            <input
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0,00"
              className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </div>
          <button type="submit" className="bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            Criar meta
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl py-16 text-center text-vault-500 text-sm">
          <Target className="w-6 h-6 mx-auto mb-2 text-vault-400" strokeWidth={1.5} />
          Nenhuma meta criada ainda.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.current || 0) / Number(g.target || 1)) * 100))
            return (
              <div key={g.id} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-vault-900 dark:text-white">{g.name}</h3>
                  <button onClick={() => onDelete(g.id)} className="text-vault-400 hover:text-coral-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="w-full h-2 bg-vault-950/5 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-vault-600 dark:text-vault-300">{formatBRL(g.current || 0)} de {formatBRL(g.target)}</span>
                  <span className="text-gold-600 font-semibold">{pct}%</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addProgress(g, 50)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-vault-950/5 dark:bg-white/10 text-vault-700 hover:bg-vault-950/10"
                  >
                    + R$ 50
                  </button>
                  <button
                    onClick={() => addProgress(g, 200)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-vault-950/5 dark:bg-white/10 text-vault-700 hover:bg-vault-950/10"
                  >
                    + R$ 200
                  </button>
                  <button
                    onClick={() => addProgress(g, -50)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-vault-950/5 dark:bg-white/10 text-vault-700 hover:bg-vault-950/10"
                  >
                    − R$ 50
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
