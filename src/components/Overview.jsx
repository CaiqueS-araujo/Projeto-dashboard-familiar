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
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, Check, Flame, Users } from 'lucide-react'
import { formatBRL, monthLabel, actorSplit } from '../utils/format'
import { useDarkMode } from '../hooks/useDarkMode'
import { ACTORS } from '../contexts/ActorContext'
import { getGymStreak } from '../utils/achievements'
import MonthOverviewCalendar from './MonthOverviewCalendar'

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

export default function Overview({
  transactions, categories, budgets, gymLogs, month, year,
  habits, habitLogs, onToggleHabit, actor, actorName, recurring,
}) {
  const [range, setRange] = useState(6)
  const [isDark] = useDarkMode()

  // Cores do gráfico não seguem classes do Tailwind (recharts pinta via SVG
  // direto), então precisam ser escolhidas na mão conforme o tema.
  const axisColor = isDark ? '#9DBBA8' : '#0A1F17aa'
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : '#0A1F1712'
  const tooltipStyle = isDark
    ? { borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#0F2E21', color: '#fff' }
    : { borderRadius: 10, border: '1px solid #eee' }
  const tooltipTextStyle = isDark ? { color: '#fff' } : undefined

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

  const gymData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const pad = (n) => String(n).padStart(2, '0')
    function statsFor(p) {
      let count = 0
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${year}-${pad(month + 1)}-${pad(d)}`
        if ((gymLogs || []).some((l) => l.date === date && l.person === p)) count++
      }
      return count
    }
    return Object.entries(ACTORS).map(([id, name]) => ({ name, Dias: statsFor(id) }))
  }, [gymLogs, month, year])

  const today = new Date().toISOString().slice(0, 10)
  const myHabits = useMemo(
    () => (habits || []).filter((h) => h.scope === 'family' || h.owner === actor),
    [habits, actor]
  )
  function isHabitDone(habitId) {
    return (habitLogs || []).some((l) => l.date === today && l.habitId === habitId && l.person === actor)
  }
  const pendingHabits = myHabits.filter((h) => !isHabitDone(h.id))
  const doneHabitsToday = myHabits.filter((h) => isHabitDone(h.id))
  const habitsDoneToday = doneHabitsToday.length
  const gymStreak = getGymStreak(gymLogs || [], actor)


  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">{monthLabel(year, month)}</h2>
        <p className="text-vault-600 dark:text-vault-300 text-sm">Resumo do mês</p>
      </div>

      <div className="bg-vault-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-white">Hábitos de hoje</h3>
          {gymStreak > 0 && (
            <span className="flex items-center gap-1 text-xs text-gold-400 font-medium">
              <Flame className="w-3.5 h-3.5" />
              {gymStreak} treinos seguidos
            </span>
          )}
        </div>
        {myHabits.length === 0 ? (
          <p className="text-sm text-vault-500">
            Nenhum hábito cadastrado ainda — crie um na aba Conquistas.
          </p>
        ) : pendingHabits.length === 0 ? (
          <p className="text-sm text-gold-400 font-medium">Tudo feito por hoje! 🎉</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-1.5">
            {pendingHabits.map((h) => (
              <button
                key={h.id}
                onClick={() => onToggleHabit(today, h.id, actor, true)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-left transition bg-white/5 text-vault-300 hover:bg-white/10"
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20" />
                <span className="flex-1 font-medium">{h.name}</span>
                {h.scope === 'family' && <Users className="w-3.5 h-3.5 text-vault-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
        {doneHabitsToday.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {doneHabitsToday.map((h) => (
              <button
                key={h.id}
                onClick={() => onToggleHabit(today, h.id, actor, false)}
                className="flex items-center gap-1.5 text-xs text-vault-500 hover:text-vault-300 transition"
                title="Toque pra desmarcar"
              >
                <Check className="w-3 h-3 text-gold-500" strokeWidth={3} />
                <span className="line-through">{h.name}</span>
              </button>
            ))}
          </div>
        )}
        {myHabits.length > 0 && (
          <p className="text-xs text-vault-500 pt-3">{habitsDoneToday} de {myHabits.length} feitos hoje</p>
        )}
      </div>

      <MonthOverviewCalendar
        month={month}
        year={year}
        gymLogs={gymLogs}
        habits={habits}
        habitLogs={habitLogs}
        recurring={recurring}
        transactions={transactions}
      />

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
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} />
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
                  <Tooltip formatter={(v) => formatBRL(v)} contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} />
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

      <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
        <h3 className="font-display text-lg text-vault-900 dark:text-white mb-1">Academia da família</h3>
        <p className="text-vault-500 dark:text-vault-400 text-xs mb-4">Dias treinados em {monthLabel(year, month)}</p>
        {gymData.every((g) => g.Dias === 0) ? (
          <EmptyChart text="Ninguém treinou neste mês ainda." />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={gymData} layout="vertical" margin={{ left: 4, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: axisColor }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                formatter={(v) => `${v} ${v === 1 ? 'dia' : 'dias'}`}
                contentStyle={tooltipStyle}
                itemStyle={tooltipTextStyle}
                labelStyle={tooltipTextStyle}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,31,23,0.04)' }}
              />
              <Bar dataKey="Dias" radius={[0, 4, 4, 0]} barSize={28}>
                {gymData.map((g, i) => (
                  <Cell key={g.name} fill={i === 0 ? '#D4AF5A' : '#276B4A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
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
