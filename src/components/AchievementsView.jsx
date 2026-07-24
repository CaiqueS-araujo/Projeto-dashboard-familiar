import { useEffect, useMemo, useRef } from 'react'
import { Dumbbell, PiggyBank, Lock, Check, Trophy } from 'lucide-react'
import { buildAchievements } from '../utils/achievements'

const GROUP_ICONS = { dumbbell: Dumbbell, piggy: PiggyBank }

function formatUnlockDate(ts) {
  if (!ts?.toDate) return 'agora mesmo'
  return ts.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AchievementsView({ transactions, goals, investments, gymLogs, unlocked, onUnlock }) {
  const groups = useMemo(
    () => buildAchievements({ transactions, goals, investments, gymLogs }),
    [transactions, goals, investments, gymLogs]
  )

  // Assim que uma conquista bate a meta pela primeira vez, registra o desbloqueio.
  // unlocked/onUnlock vêm do hook (Firestore), então isso persiste de verdade.
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Conquistas</h2>
        <p className="text-vault-600 dark:text-vault-300 text-sm">
          {totalUnlocked} de {totalItems} desbloqueadas
        </p>
      </div>

      {groups.map((group) => {
        const GroupIcon = GROUP_ICONS[group.icon] || Trophy
        return (
          <div key={group.id} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                <GroupIcon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg text-vault-900 dark:text-white">{group.title}</h3>
            </div>

            <div className="relative pl-1">
              {/* linha vertical conectando os marcos */}
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
