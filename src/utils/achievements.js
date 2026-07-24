import { ACTORS } from '../contexts/ActorContext'

// Calcula a maior sequência de dias consecutivos dentro de um conjunto de datas 'YYYY-MM-DD'.
function longestStreak(dateStrings) {
  if (dateStrings.size === 0) return 0
  const sorted = Array.from(dateStrings).sort()
  let best = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const cur = new Date(sorted[i] + 'T00:00:00')
    const diffDays = Math.round((cur - prev) / 86400000)
    if (diffDays === 1) {
      current += 1
      best = Math.max(best, current)
    } else if (diffDays > 1) {
      current = 1
    }
  }
  return best
}

const GYM_MILESTONES = [5, 10, 20, 30, 60, 100]
const MONEY_MILESTONES = [200, 500, 1000, 2500, 5000, 10000, 20000]

// Recebe os dados já carregados do app e devolve a lista completa de
// conquistas com o progresso atual calculado. Não sabe nada sobre o que
// já foi "desbloqueado de verdade" — isso é responsabilidade de quem usa
// (useAchievementUnlocks), pra manter registrado mesmo se os dados mudarem depois.
export function buildAchievements({ transactions = [], goals = [], investments = [], gymLogs = [] }) {
  const groups = []

  // ---- Academia: uma trilha de sequência de dias por pessoa ----
  Object.entries(ACTORS).forEach(([personId, personName]) => {
    const dates = new Set(gymLogs.filter((l) => l.person === personId).map((l) => l.date))
    const streak = longestStreak(dates)
    groups.push({
      id: `gym_${personId}`,
      title: `Academia · ${personName}`,
      icon: 'dumbbell',
      items: GYM_MILESTONES.map((n) => ({
        id: `gym_${personId}_${n}`,
        title: `${n} dias seguidos`,
        description: `${personName} treinou ${n} dias seguidos, sem furar.`,
        current: Math.min(streak, n),
        target: n,
      })),
    })
  })

  // ---- Financeiro: dinheiro guardado, somando saldo + metas + investimentos ----
  const saldoTotal = transactions.reduce(
    (s, t) => s + (t.type === 'receita' ? Number(t.value || 0) : -Number(t.value || 0)),
    0
  )
  const emMetas = goals.reduce((s, g) => s + Number(g.current || 0), 0)
  const emInvestimentos = investments.reduce((s, i) => s + Number(i.current ?? i.invested ?? 0), 0)
  const totalGuardado = Math.max(0, saldoTotal) + emMetas + emInvestimentos

  groups.push({
    id: 'money',
    title: 'Financeiro da família',
    icon: 'piggy',
    items: MONEY_MILESTONES.map((n) => ({
      id: `money_${n}`,
      title: `R$ ${n.toLocaleString('pt-BR')} guardados`,
      description: 'Somando saldo, metas e investimentos da família.',
      current: Math.min(totalGuardado, n),
      target: n,
    })),
  })

  return groups
}
