import { useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { formatBRL } from '../utils/format'

const TYPES = ['Renda fixa', 'Ações', 'Fundos', 'Criptomoeda', 'Tesouro Direto', 'Outro']
const COLORS = ['#276B4A', '#D4AF5A', '#E27D5F', '#3E8EDE', '#7C5CBF', '#C9622E']

export default function InvestmentsView({ investments, onAdd, onUpdate, onDelete, actorName }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState(TYPES[0])
  const [invested, setInvested] = useState('')
  const [current, setCurrent] = useState('')

  const totals = useMemo(() => {
    const totalInvested = investments.reduce((s, i) => s + Number(i.invested || 0), 0)
    const totalCurrent = investments.reduce((s, i) => s + Number(i.current ?? i.invested ?? 0), 0)
    const diff = totalCurrent - totalInvested
    const pct = totalInvested > 0 ? (diff / totalInvested) * 100 : 0
    return { totalInvested, totalCurrent, diff, pct }
  }, [investments])

  const byType = useMemo(() => {
    const map = {}
    investments.forEach((i) => {
      const v = Number(i.current ?? i.invested ?? 0)
      map[i.type] = (map[i.type] || 0) + v
    })
    return Object.entries(map).map(([type, value], idx) => ({ name: type, value, color: COLORS[idx % COLORS.length] }))
  }, [investments])

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim() || !invested) return
    await onAdd(
      {
        name: name.trim(),
        type,
        invested: Number(String(invested).replace(',', '.')),
        current: current ? Number(String(current).replace(',', '.')) : Number(String(invested).replace(',', '.')),
      },
      actorName
    )
    setName('')
    setInvested('')
    setCurrent('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Investimentos</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo investimento
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-vault-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-lg border flex items-center justify-center mb-4 text-white bg-white/5 border-white/10">
            <Wallet className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <p className="text-vault-500 text-xs uppercase tracking-wide mb-1">Total investido</p>
          <p className="font-display text-2xl text-white">{formatBRL(totals.totalInvested)}</p>
        </div>
        <div className="bg-vault-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-lg border flex items-center justify-center mb-4 text-gold-400 bg-gold-500/10 border-gold-500/20">
            <Wallet className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <p className="text-vault-500 text-xs uppercase tracking-wide mb-1">Valor atual</p>
          <p className="font-display text-2xl text-white">{formatBRL(totals.totalCurrent)}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-vault-900 border border-white/5 rounded-2xl p-5">
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-4 ${
              totals.diff >= 0
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-coral-500 bg-coral-500/10 border-coral-500/20'
            }`}
          >
            {totals.diff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <p className="text-vault-500 text-xs uppercase tracking-wide mb-1">Rentabilidade</p>
          <p className={`font-display text-2xl ${totals.diff >= 0 ? 'text-emerald-400' : 'text-coral-500'}`}>
            {totals.diff >= 0 ? '+' : ''}
            {formatBRL(totals.diff)}{' '}
            <span className="text-base">({totals.pct >= 0 ? '+' : ''}{totals.pct.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tesouro Selic, PETR4..."
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
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Valor investido</label>
            <input
              inputMode="decimal"
              value={invested}
              onChange={(e) => setInvested(e.target.value)}
              placeholder="0,00"
              className="w-28 border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Valor atual</label>
            <input
              inputMode="decimal"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="= investido"
              className="w-28 border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
            />
          </div>
          <button type="submit" className="bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            Adicionar
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl overflow-hidden">
          {investments.length === 0 ? (
            <div className="py-16 text-center text-vault-500 dark:text-vault-400 text-sm">
              Nenhum investimento cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-vault-900/5 dark:divide-white/10">
              {investments.map((inv) => {
                const diff = Number(inv.current ?? inv.invested) - Number(inv.invested)
                return (
                  <div key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3.5 group">
                    <div className="min-w-0">
                      <p className="text-sm text-vault-900 dark:text-white font-medium truncate">{inv.name}</p>
                      <p className="text-xs text-vault-500 dark:text-vault-400">{inv.type}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <input
                          inputMode="decimal"
                          defaultValue={inv.current ?? inv.invested}
                          onBlur={(e) => {
                            const v = Number(String(e.target.value).replace(',', '.'))
                            if (!Number.isNaN(v)) onUpdate(inv.id, { current: v })
                          }}
                          className="w-24 text-right text-sm font-semibold bg-transparent border-b border-dashed border-vault-900/20 dark:border-white/20 text-vault-900 dark:text-white outline-none focus:border-gold-500"
                        />
                        <p className={`text-xs ${diff >= 0 ? 'text-vault-600 dark:text-vault-300' : 'text-coral-500'}`}>
                          {diff >= 0 ? '+' : ''}{formatBRL(diff)}
                        </p>
                      </div>
                      <button
                        onClick={() => onDelete(inv.id)}
                        className="opacity-0 group-hover:opacity-100 text-vault-400 hover:text-coral-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {byType.length > 0 && (
          <div className="lg:col-span-2 bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
            <h3 className="font-display text-lg text-vault-900 dark:text-white mb-3">Por tipo</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                  {byType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {byType.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-vault-700 dark:text-vault-200">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                  <span className="text-vault-900 dark:text-white font-medium">{formatBRL(t.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-vault-500 dark:text-vault-400 -mt-2">
        Toque no valor atual de cada investimento pra atualizar sempre que conferir sua corretora.
      </p>
    </div>
  )
}
