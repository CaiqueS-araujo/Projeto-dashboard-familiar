import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { formatBRL, formatDate } from '../utils/format'
import TransactionForm from './TransactionForm'

export default function TransactionsView({
  transactions,
  categories,
  onAdd,
  onUpdate,
  onDelete,
  month,
  year,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const monthTx = useMemo(
    () =>
      transactions.filter((t) => {
        const [ty, tm] = (t.date || '').split('-').map(Number)
        return ty === year && tm - 1 === month
      }),
    [transactions, month, year]
  )

  const filtered = monthTx.filter((t) => {
    if (filterType !== 'todos' && t.type !== filterType) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function categoryOf(id) {
    return categories.find((c) => c.id === id)
  }

  async function handleSave(data, installments) {
    if (editing) {
      await onUpdate(editing.id, data)
    } else {
      await onAdd(data, installments)
    }
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Lançamentos</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo lançamento
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-vault-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lançamento..."
            className="w-full bg-white border border-vault-900/10 dark:border-white/15 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gold-500"
          />
        </div>
        <div className="flex gap-1.5">
          {['todos', 'receita', 'despesa'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filterType === f
                  ? 'bg-vault-900 text-white'
                  : 'bg-white text-vault-600 border border-vault-900/10 dark:border-white/15'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-vault-500 text-sm">
            Nenhum lançamento neste mês ainda. Toque em "Novo lançamento" pra começar.
          </div>
        ) : (
          <div className="divide-y divide-vault-900/5 dark:divide-white/10">
            {filtered.map((t) => {
              const cat = categoryOf(t.category)
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-vault-950/[0.02] dark:bg-white/[0.03] transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat?.color || '#999' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-vault-900 font-medium truncate">{t.description}</p>
                      <p className="text-xs text-vault-500">
                        {cat?.name || 'Sem categoria'} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-sm font-semibold ${
                        t.type === 'receita' ? 'text-vault-600' : 'text-coral-500'
                      }`}
                    >
                      {t.type === 'receita' ? '+' : '−'} {formatBRL(t.value)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditing(t)
                          setShowForm(true)
                        }}
                        className="p-1.5 text-vault-500 hover:text-vault-900 dark:text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t)}
                        className="p-1.5 text-vault-500 hover:text-coral-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <TransactionForm
          categories={categories}
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-lg text-vault-900 mb-2">Excluir lançamento?</h3>
            <p className="text-sm text-vault-600 mb-5">
              "{confirmDelete.description}" será removido permanentemente.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await onDelete(confirmDelete.id)
                  setConfirmDelete(null)
                }}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-coral-500 text-white"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
