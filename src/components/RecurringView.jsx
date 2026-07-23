import { useState } from 'react'
import { Plus, Trash2, Repeat, Pause, Play } from 'lucide-react'
import { formatBRL } from '../utils/format'

export default function RecurringView({ recurring, categories, onAdd, onToggle, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState('despesa')
  const [category, setCategory] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('5')

  const filteredCategories = categories.filter((c) => c.type === type)

  async function handleAdd(e) {
    e.preventDefault()
    const numValue = Number(String(value).replace(',', '.'))
    if (!description.trim() || !numValue || numValue <= 0) return
    await onAdd({
      description: description.trim(),
      value: numValue,
      type,
      category: category || filteredCategories[0]?.id || '',
      dayOfMonth: Number(dayOfMonth) || 1,
    })
    setDescription('')
    setValue('')
    setShowForm(false)
  }

  function categoryOf(id) {
    return categories.find((c) => c.id === id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl text-vault-900 dark:text-white">Contas fixas</h2>
          <p className="text-vault-600 dark:text-vault-300 text-sm">
            Lançam sozinhas todo mês, no dia que você escolher.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Nova conta fixa
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('despesa')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${type === 'despesa' ? 'bg-coral-500 text-white' : 'bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200'}`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('receita')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${type === 'receita' ? 'bg-vault-600 text-white' : 'bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200'}`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Descrição</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Netflix, Salário..."
              className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Valor (R$)</label>
              <input
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Dia do mês</label>
              <input
                type="number"
                min="1"
                max="28"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Categoria</label>
              <select
                value={category || filteredCategories[0]?.id || ''}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-vault-900 hover:bg-vault-800 text-white font-semibold text-sm py-2.5 rounded-lg transition">
            Criar conta fixa
          </button>
        </form>
      )}

      {recurring.length === 0 ? (
        <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl py-16 text-center text-vault-500 dark:text-vault-400 text-sm">
          <Repeat className="w-6 h-6 mx-auto mb-2 text-vault-400" strokeWidth={1.5} />
          Nenhuma conta fixa cadastrada ainda.
        </div>
      ) : (
        <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-vault-900/5 dark:divide-white/10">
          {recurring.map((r) => {
            const cat = categoryOf(r.category)
            return (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color || '#999' }} />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${r.active ? 'text-vault-900 dark:text-white' : 'text-vault-400 line-through'}`}>
                      {r.description}
                    </p>
                    <p className="text-xs text-vault-500 dark:text-vault-400">
                      {cat?.name || 'Sem categoria'} · todo dia {r.dayOfMonth}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-semibold ${r.type === 'receita' ? 'text-vault-600 dark:text-vault-300' : 'text-coral-500'}`}>
                    {r.type === 'receita' ? '+' : '−'} {formatBRL(r.value)}
                  </span>
                  <button
                    onClick={() => onToggle(r.id, !r.active)}
                    className="p-1.5 text-vault-500 hover:text-vault-900 dark:hover:text-white"
                    title={r.active ? 'Pausar' : 'Reativar'}
                  >
                    {r.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => onDelete(r.id)} className="p-1.5 text-vault-500 hover:text-coral-500">
                    <Trash2 className="w-3.5 h-3.5" />
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
