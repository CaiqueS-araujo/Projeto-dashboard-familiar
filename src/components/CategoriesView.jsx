import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { formatBRL } from '../utils/format'

const PALETTE = ['#276B4A', '#D4AF5A', '#E27D5F', '#7C5CBF', '#3E8EDE', '#C9622E', '#9A9A4F', '#4F7A5E']

export default function CategoriesView({ categories, budgets, onAdd, onDelete, onSetBudget }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('despesa')
  const [color, setColor] = useState(PALETTE[0])

  const despesas = categories.filter((c) => c.type === 'despesa')
  const receitas = categories.filter((c) => c.type === 'receita')

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd({ name: name.trim(), type, color })
    setName('')
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-vault-900 dark:text-white">Categorias</h2>

      <form onSubmit={handleAdd} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pet, Viagens..."
            className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Cor</label>
          <div className="flex gap-1.5">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-vault-900 dark:ring-offset-vault-900' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        <CategoryGroup title="Despesas" items={despesas} onDelete={onDelete} budgets={budgets} onSetBudget={onSetBudget} />
        <CategoryGroup title="Receitas" items={receitas} onDelete={onDelete} />
      </div>
    </div>
  )
}

function CategoryGroup({ title, items, onDelete, budgets, onSetBudget }) {
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')

  function startEdit(cat) {
    setEditing(cat.id)
    setDraft(budgets?.[cat.id] ? String(budgets[cat.id]) : '')
  }

  async function commitEdit(catId) {
    await onSetBudget(catId, Number(String(draft).replace(',', '.')))
    setEditing(null)
  }

  return (
    <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
      <h3 className="font-display text-lg text-vault-900 dark:text-white mb-3">{title}</h3>
      <div className="space-y-1">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-2 group gap-2">
            <span className="flex items-center gap-2.5 text-sm text-vault-800 dark:text-vault-100 min-w-0 truncate">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onSetBudget && (
                editing === c.id ? (
                  <input
                    autoFocus
                    inputMode="decimal"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commitEdit(c.id)}
                    onKeyDown={(e) => e.key === 'Enter' && commitEdit(c.id)}
                    placeholder="Sem limite"
                    className="w-24 text-xs border border-vault-900/10 dark:border-white/15 rounded-md px-2 py-1 outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(c)}
                    className="text-xs text-vault-500 hover:text-gold-600 dark:hover:text-gold-400 transition"
                    title="Definir orçamento mensal"
                  >
                    {budgets?.[c.id] ? formatBRL(budgets[c.id]) : 'Definir limite'}
                  </button>
                )
              )}
              {c.userCreated !== false && (
                <button
                  onClick={() => onDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-vault-400 hover:text-coral-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-vault-500">Nenhuma categoria ainda.</p>}
      </div>
    </div>
  )
}
