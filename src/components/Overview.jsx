import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle } from 'lucide-react'
import { formatBRL, monthLabel, actorSplit } from '../utils/format'

function Card({ label, value, icon: Icon, tone }) {
  const tones = {
    gold: 'text-gold-400 bg-gold-500/10 border-gold-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    coral: 'text-coral-500 bg-coral-500/10 border-coral-500/20',
    white: 'text-white bg-white/5 border-white/10',
  }
  return (
    <div className="bg-vault-900 border border-white/5 rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-4 ${tones[tone]}`}>
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <p className="text-vault-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl text-white">{formatBRL(value)}</p>
    </div>
  )
}

export default function Overview({ transactions, categories, budgets, month, year }) {
  const [range, setRange] = useState(6)
  const monthTx = useMemo(
    () =>
      transactions.filter((t) => {
        const [ty, tm] = (t.date || '').split('-').map(Number)
        return ty === year && tm - 1 === month
      }),
    [transactions, month, year]
  )

  const receitas = monthTx
    .filter((t) => t.type === 'receita')
    .reduce((s, t) => s + Number(t.value || 0), 0)
  const despesas = monthTx
    .filter((t) => t.type === 'despesa')
    .reduce((s, t) => s + Number(t.value || 0), 0)
  const saldoMes = receitas - despesas

  const saldoTotal = useMemo(
    () =>
      transactions.reduce(
        (s, t) => s + (t.type === 'receita' ? Number(t.value || 0) : -Number(t.value || 0)),
        0
      ),
    [transactions]
  )

  const byCategory = useMemo(() => {
    const map = {}
    monthTx
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.value || 0)
      })
    return Object.entries(map)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId)
        return { id: catId, name: cat?.name || catId, value, color: cat?.color || '#6B6B6B' }
      })
      .sort((a, b) => b.value - a.value)
  }, [monthTx, categories])

  const monthsChart = useMemo(() => {
    const arr = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(year, month - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth()
      const items = transactions.filter((t) => {
        const [ty, tm] = (t.date || '').split('-').map(Number)
        return ty === y && tm - 1 === m
      })
      const r = items.filter((t) => t.type === 'receita').reduce((s, t) => s + Number(t.value || 0), 0)
      const dsp = items.filter((t) => t.type === 'despesa').reduce((s, t) => s + Number(t.value || 0), 0)
      arr.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        Receitas: r,
        Despesas: dsp,
      })
    }
    return arr
  }, [transactions, month, year, range])

  const yearTotals = useMemo(() => {
    const items = transactions.filter((t) => {
      const [ty] = (t.date || '').split('-').map(Number)
      return ty === year
    })
    const r = items.filter((t) => t.type === 'receita').reduce((s, t) => s + Number(t.value || 0), 0)
    const dsp = items.filter((t) => t.type === 'despesa').reduce((s, t) => s + Number(t.value || 0), 0)
    return { receitas: r, despesas: dsp, saldo: r - dsp }
  }, [transactions, year])

  // Orçamentos: cruza o limite definido em cada categoria com o gasto real do mês
  const budgetRows = useMemo(() => {
    return Object.entries(budgets || {})
      .map(([catId, limit]) => {
        if (!limit || limit <= 0) return null
        const cat = categories.find((c) => c.id === catId)
        const spent = byCategory.find((c) => c.id === catId)?.value || 0
        const pct = Math.min(999, Math.round((spent / limit) * 100))
        return { id: catId, name: cat?.name || catId, color: cat?.color || '#6B6B6B', limit, spent, pct }
      })
      .filter(Boolean)
      .sort((a, b) => b.pct - a.pct)
  }, [budgets, byCategory, categories])

  const overBudgetCount = budgetRows.filter((b) => b.pct >= 100).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">{monthLabel(year, month)}</h2>
        <p className="text-vault-600 dark:text-vault-300 text-sm">Resumo do mês</p>
      </div>

      <div className="md:hidden bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-4">
        <p className="text-vault-500 dark:text-vault-400 text-[11px] uppercase tracking-wide mb-2">Quem lançou este mês</p>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-vault-950/5 dark:bg-white/10">
          <div className="h-full bg-gold-500" style={{ width: `${actorSplit(monthTx).caique}%` }} />
          <div className="h-full bg-vault-600" style={{ width: `${actorSplit(monthTx).carol}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-vault-600 dark:text-vault-300 mt-1.5">
          <span>Caique {actorSplit(monthTx).caique}%</span>
          <span>Carol {actorSplit(monthTx).carol}%</span>
        </div>
      </div>

      {overBudgetCount > 0 && (
        <div className="flex items-center gap-2.5 bg-coral-500/10 border border-coral-500/25 rounded-xl px-4 py-3 text-sm text-coral-500">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {overBudgetCount === 1
            ? '1 categoria estourou o orçamento este mês.'
            : `${overBudgetCount} categorias estouraram o orçamento este mês.`}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Saldo total" value={saldoTotal} icon={Wallet} tone="white" />
        <Card label="Receitas do mês" value={receitas} icon={TrendingUp} tone="green" />
        <Card label="Despesas do mês" value={despesas} icon={TrendingDown} tone="coral" />
        <Card label="Economia do mês" value={saldoMes} icon={PiggyBank} tone="gold" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-vault-900 dark:text-white">Receitas x Despesas</h3>
            <div className="flex gap-1 bg-vault-950/5 dark:bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setRange(6)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${range === 6 ? 'bg-white dark:bg-vault-700 text-vault-900 dark:text-white shadow-sm' : 'text-vault-500'}`}
              >
                6 meses
              </button>
              <button
                onClick={() => setRange(12)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${range === 12 ? 'bg-white dark:bg-vault-700 text-vault-900 dark:text-white shadow-sm' : 'text-vault-500'}`}
              >
                12 meses
              </button>
            </div>
          </div>
          {monthsChart.every((m) => m.Receitas === 0 && m.Despesas === 0) ? (
            <EmptyChart text="Sem lançamentos no período." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0A1F1712" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0A1F17aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#0A1F17aa' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
                <Bar dataKey="Receitas" fill="#276B4A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#E27D5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-vault-900/5 dark:border-white/10 text-xs">
            <span className="text-vault-500 dark:text-vault-400">Total em {year}</span>
            <span className="text-vault-900 dark:text-white font-medium">
              Receitas {formatBRL(yearTotals.receitas)} · Despesas {formatBRL(yearTotals.despesas)} · Saldo {formatBRL(yearTotals.saldo)}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-display text-lg text-vault-900 dark:text-white mb-4">Despesas por categoria</h3>
          {byCategory.length === 0 ? (
            <EmptyChart text="Sem despesas neste mês." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: 10, border: '1px solid #eee' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto scrollbar-thin">
                {byCategory.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-vault-700 dark:text-vault-200">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="text-vault-900 dark:text-white font-medium">{formatBRL(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {budgetRows.length > 0 && (
        <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-display text-lg text-vault-900 dark:text-white mb-4">Orçamentos do mês</h3>
          <div className="space-y-4">
            {budgetRows.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 text-vault-800 dark:text-vault-100">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                    {b.name}
                  </span>
                  <span className={b.pct >= 100 ? 'text-coral-500 font-semibold' : 'text-vault-600 dark:text-vault-300'}>
                    {formatBRL(b.spent)} de {formatBRL(b.limit)}
                  </span>
                </div>
                <div className="w-full h-2 bg-vault-950/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${b.pct >= 100 ? 'bg-coral-500' : ''}`}
                    style={{ width: `${Math.min(100, b.pct)}%`, backgroundColor: b.pct >= 100 ? undefined : b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyChart({ text }) {
  return (
    <div className="h-52 flex items-center justify-center text-vault-500 dark:text-vault-400 text-sm text-center px-6">
      {text}
    </div>
  )
}
