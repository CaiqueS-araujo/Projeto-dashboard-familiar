import { useEffect, useMemo, useRef, useState } from 'react'
import { Dumbbell, PiggyBank, Lock, Check, Trophy, Plus, Trash2, Users, User, Flame } from 'lucide-react'
import { buildAchievements, getGymStreak } from '../utils/achievements'

const GROUP_ICONS = { dumbbell: Dumbbell, piggy: PiggyBank }
const todayStr = () => new Date().toISOString().slice(0, 10)

function formatUnlockDate(ts) {
  if (!ts?.toDate) return 'agora mesmo'
  return ts.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AchievementsView({
  transactions, goals, investments, gymLogs, unlocked, onUnlock,
  habits, habitLogs, onAddHabit, onDeleteHabit, onToggleHabit,
  actor, actorName,
}) {
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [habitScope, setHabitScope] = useState('personal')

  const groups = useMemo(
    () => buildAchievements({ transactions, goals, investments, gymLogs }, actor),
    [transactions, goals, investments, gymLogs, actor]
  )

  // Assim que uma conquista bate a meta pela primeira vez, registra o desbloqueio.
  const alreadyChecked = useRef(new Set())
  useEffect(() => {
    groups.forEach((group) => {
      group.items.forEach((item) => {
        const isDone = item.current >= item.target
        const key = item.id
        if (isDone && !unlocked[item.id] && !alreadyChecked.current.has(key)) {
          alreadyChecked.current.add(key)
          onUnlock(item.id, { title: item.title, group: group.title })
        }
      })
    })
  }, [groups, unlocked, onUnlock])

  const totalItems = groups.reduce((s, g) => s + g.items.length, 0)
  const totalUnlocked = groups.reduce(
    (s, g) => s + g.items.filter((i) => unlocked[i.id] || i.current >= i.target).length,
    0
  )

  // Só os hábitos meus + os da família
  const myHabits = useMemo(
    () => habits.filter((h) => h.scope === 'family' || h.owner === actor),
    [habits, actor]
  )

  const today = todayStr()
  function isDoneToday(habitId) {
    return habitLogs.some((l) => l.date === today && l.habitId === habitId && l.person === actor)
  }

  async function handleAddHabit(e) {
    e.preventDefault()
    if (!habitName.trim()) return
    await onAddHabit({ name: habitName.trim(), scope: habitScope }, actor)
    setHabitName('')
    setShowHabitForm(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Conquistas</h2>
        <p className="text-vault-600 dark:text-vault-300 text-sm">
          {totalUnlocked} de {totalItems} desbloqueadas · vendo como {actorName}
        </p>
      </div>

      {/* Hábitos diários */}
      <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-vault-900 dark:text-white">Hábitos de hoje</h3>
          <button
            onClick={() => setShowHabitForm((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium text-gold-600 dark:text-gold-400"
          >
            <Plus className="w-4 h-4" />
            Novo hábito
          </button>
        </div>

        {showHabitForm && (
          <form onSubmit={handleAddHabit} className="mb-4 space-y-3 bg-vault-950/[0.03] dark:bg-white/5 rounded-xl p-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Nome do hábito</label>
              <input
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Ex: Beber 2L de água, Almoço saudável..."
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHabitScope('personal')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                  habitScope === 'personal' ? 'bg-vault-900 dark:bg-gold-500 text-white dark:text-vault-950' : 'bg-white dark:bg-vault-800 text-vault-600 dark:text-vault-300 border border-vault-900/10 dark:border-white/15'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Só {actorName}
              </button>
              <button
                type="button"
                onClick={() => setHabitScope('family')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                  habitScope === 'family' ? 'bg-vault-900 dark:bg-gold-500 text-white dark:text-vault-950' : 'bg-white dark:bg-vault-800 text-vault-600 dark:text-vault-300 border border-vault-900/10 dark:border-white/15'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Toda a família
              </button>
            </div>
            <button type="submit" className="w-full bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium py-2.5 rounded-lg transition">
              Criar hábito
            </button>
          </form>
        )}

        {myHabits.length === 0 ? (
          <p className="text-sm text-vault-500 dark:text-vault-400">Nenhum hábito cadastrado ainda.</p>
        ) : (
          <div className="space-y-1.5">
            {myHabits.map((h) => {
              const done = isDoneToday(h.id)
              return (
                <div key={h.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => onToggleHabit(today, h.id, actor, !done)}
                    className={`flex-1 flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-left transition ${
                      done
                        ? 'bg-gold-500/15 text-vault-900 dark:text-white'
                        : 'bg-vault-950/[0.03] dark:bg-white/5 text-vault-700 dark:text-vault-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition ${
                        done ? 'bg-gold-500 border-gold-500 text-vault-950' : 'border-vault-900/20 dark:border-white/20'
                      }`}
                    >
                      {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 font-medium">{h.name}</span>
                    {h.scope === 'family' && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-vault-500 dark:text-vault-400">
                        <Users className="w-3 h-3" /> família
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteHabit(h.id)}
                    className="opacity-0 group-hover:opacity-100 text-vault-400 hover:text-coral-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trilhas de marcos (academia, financeiro...) */}
      {groups.map((group) => {
        const GroupIcon = GROUP_ICONS[group.icon] || Trophy
        return (
          <div key={group.id} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                <GroupIcon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg text-vault-900 dark:text-white">{group.title}</h3>
              {group.icon === 'dumbbell' && (
                <span className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 ml-auto">
                  <Flame className="w-3.5 h-3.5" />
                  {getGymStreak(gymLogs, actor)} seguidas
                </span>
              )}
            </div>

            <div className="relative pl-1">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-vault-900/10 dark:bg-white/10" />

              <div className="space-y-1">
                {group.items.map((item) => {
                  const done = item.current >= item.target
                  const unlockInfo = unlocked[item.id]
                  const pct = Math.min(100, Math.round((item.current / item.target) * 100))
                  return (
                    <div key={item.id} className="relative flex items-start gap-4 py-2.5">
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition ${
                          done
                            ? 'bg-gold-500 border-gold-500 text-vault-950'
                            : 'bg-vault-950/[0.03] dark:bg-white/5 border-vault-900/10 dark:border-white/10 text-vault-400'
                        }`}
                      >
                        {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Lock className="w-4 h-4" strokeWidth={1.75} />}
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <p className={`text-sm font-medium ${done ? 'text-vault-900 dark:text-white' : 'text-vault-600 dark:text-vault-300'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-vault-500 dark:text-vault-400 mt-0.5">{item.description}</p>
                        {done ? (
                          <p className="text-[11px] text-gold-600 dark:text-gold-400 mt-1 font-medium">
                            Desbloqueada {unlockInfo ? `em ${formatUnlockDate(unlockInfo.unlockedAt)}` : ''}
                          </p>
                        ) : (
                          <div className="mt-2 max-w-[220px]">
                            <div className="w-full h-1.5 bg-vault-950/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gold-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[11px] text-vault-500 dark:text-vault-400 mt-1">
                              {typeof item.current === 'number' && item.target > 100
                                ? `${Math.round(item.current).toLocaleString('pt-BR')} de ${item.target.toLocaleString('pt-BR')}`
                                : `${item.current} de ${item.target}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
