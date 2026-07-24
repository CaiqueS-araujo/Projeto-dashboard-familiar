import { useMemo, useState } from 'react'
import { X, Dumbbell, CheckCircle2, Wallet, CalendarDays } from 'lucide-react'
import { ACTORS } from '../contexts/ActorContext'
import { formatBRL } from '../utils/format'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function pad(n) {
  return String(n).padStart(2, '0')
}

// Um calendário só, que junta o que já está espalhado pelo app (treino,
// hábitos, contas fixas e lançamentos) — pra dar pra ver o mês inteiro
// de uma olhada, sem precisar entrar em cada aba.
export default function MonthOverviewCalendar({ month, year, gymLogs, habits, habitLogs, recurring, transactions }) {
  const [selectedDay, setSelectedDay] = useState(null) // 'YYYY-MM-DD' | null

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  const dayInfo = useMemo(() => {
    const map = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
      const gym = (gymLogs || []).filter((l) => l.date === dateStr)
      const habitDone = (habitLogs || []).filter((l) => l.date === dateStr)
      const bills = (recurring || []).filter((r) => r.active !== false && Number(r.dayOfMonth) === d)
      const tx = (transactions || []).filter((t) => t.date === dateStr)
      map[dateStr] = { gym, habitDone, bills, tx }
    }
    return map
  }, [daysInMonth, month, year, gymLogs, habitLogs, recurring, transactions])

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selected = selectedDay ? dayInfo[selectedDay] : null

  return (
    <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <CalendarDays className="w-4 h-4 text-vault-500 dark:text-vault-400" strokeWidth={1.75} />
        <h3 className="font-display text-lg text-vault-900 dark:text-white">Calendário do mês</h3>
      </div>
      <p className="text-vault-500 dark:text-vault-400 text-xs mb-4">Toque num dia pra ver o que aconteceu.</p>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] text-vault-500 dark:text-vault-400 font-medium">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
          const info = dayInfo[dateStr]
          const isToday = dateStr === todayStr
          const trainedCaique = info.gym.some((l) => l.person === 'caique')
          const trainedCarol = info.gym.some((l) => l.person === 'carol')
          const hasHabit = info.habitDone.length > 0
          const hasBill = info.bills.length > 0
          const hasAny = trainedCaique || trainedCarol || hasHabit || hasBill

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(dateStr)}
              className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
                isToday
                  ? 'border-gold-500 bg-gold-500/10'
                  : hasAny
                  ? 'border-vault-900/10 dark:border-white/10 bg-vault-950/[0.02] dark:bg-white/[0.03]'
                  : 'border-transparent hover:bg-vault-950/[0.03] dark:hover:bg-white/[0.03]'
              }`}
            >
              <span className={`text-xs ${isToday ? 'font-bold text-gold-600 dark:text-gold-400' : 'text-vault-700 dark:text-vault-200'}`}>{d}</span>
              <div className="flex items-center gap-0.5 h-1.5">
                {trainedCaique && <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />}
                {trainedCarol && <span className="w-1.5 h-1.5 rounded-full bg-vault-500" />}
                {hasHabit && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                {hasBill && <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-vault-900/5 dark:border-white/10 text-[11px] text-vault-500 dark:text-vault-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold-500" /> Treino Caique</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-vault-500" /> Treino Carol</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" /> Hábito feito</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-coral-500" /> Conta a pagar</span>
      </div>

      {selected && (
        <DayDetail
          dateStr={selectedDay}
          info={selected}
          habits={habits}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

function DayDetail({ dateStr, info, habits, onClose }) {
  const [y, m, d] = dateStr.split('-')
  const niceDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  function habitName(id) {
    return (habits || []).find((h) => h.id === id)?.name || 'Hábito'
  }

  const nothing = info.gym.length === 0 && info.habitDone.length === 0 && info.bills.length === 0 && info.tx.length === 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-vault-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-vault-900 dark:text-white capitalize">{niceDate}</h3>
          <button onClick={onClose} className="text-vault-500 hover:text-vault-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {nothing && (
          <p className="text-sm text-vault-500 dark:text-vault-400">Nada registrado neste dia.</p>
        )}

        {info.gym.length > 0 && (
          <Section icon={Dumbbell} title="Academia">
            {info.gym.map((l) => (
              <div key={l.person} className="mb-2 last:mb-0">
                <p className="text-sm font-medium text-vault-900 dark:text-white">
                  {ACTORS[l.person] || l.person} · {l.workoutName || 'Treino livre'}
                </p>
                {l.completedExercises?.length > 0 && (
                  <p className="text-xs text-vault-500 dark:text-vault-400 mt-0.5">
                    {l.completedExercises.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        {info.habitDone.length > 0 && (
          <Section icon={CheckCircle2} title="Hábitos">
            {info.habitDone.map((l) => (
              <p key={`${l.habitId}_${l.person}`} className="text-sm text-vault-800 dark:text-vault-100 mb-1 last:mb-0">
                {habitName(l.habitId)} <span className="text-vault-500 dark:text-vault-400">· {ACTORS[l.person] || l.person}</span>
              </p>
            ))}
          </Section>
        )}

        {(info.bills.length > 0 || info.tx.length > 0) && (
          <Section icon={Wallet} title="Financeiro">
            {info.bills.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm mb-1.5 last:mb-0">
                <span className="text-vault-800 dark:text-vault-100">{r.description} <span className="text-coral-500 text-xs">· vence hoje</span></span>
                <span className={`font-medium ${r.type === 'receita' ? 'text-vault-600 dark:text-vault-300' : 'text-coral-500'}`}>
                  {r.type === 'receita' ? '+' : '−'} {formatBRL(r.value)}
                </span>
              </div>
            ))}
            {info.tx.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm mb-1.5 last:mb-0">
                <span className="text-vault-800 dark:text-vault-100">{t.description}</span>
                <span className={`font-medium ${t.type === 'receita' ? 'text-vault-600 dark:text-vault-300' : 'text-coral-500'}`}>
                  {t.type === 'receita' ? '+' : '−'} {formatBRL(t.value)}
                </span>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gold-600 dark:text-gold-400" strokeWidth={1.75} />
        <p className="text-xs uppercase tracking-wide text-vault-500 dark:text-vault-400">{title}</p>
      </div>
      {children}
    </div>
  )
}
