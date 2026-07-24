import { ACTORS } from '../contexts/ActorContext'

// Calcula a sequência atual de treinos, tolerando até 3 dias de descanso
// entre uma ida e outra. Só zera se faltar 4 dias seguidos ou mais.
// Ex: treinou dia 1, descansou 2-3-4, treinou dia 5 → continua contando.
//     treinou dia 1, descansou 2-3-4-5, treinou dia 6 → zera e recomeça.
function currentStreakWithGrace(dateStrings, todayStr) {
  if (dateStrings.size === 0) return 0
  const sorted = Array.from(dateStrings).sort()
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const cur = new Date(sorted[i] + 'T00:00:00')
    const missed = Math.round((cur - prev) / 86400000) - 1
    streak = missed <= 3 ? streak + 1 : 1
  }
  // se já faz mais de 3 dias que não treina desde a última vez, a
  // sequência já quebrou mesmo sem precisar esperar o próximo treino
  const last = new Date(sorted[sorted.length - 1] + 'T00:00:00')
  const today = new Date(todayStr + 'T00:00:00')
  const missedUntilToday = Math.round((today - last) / 86400000) - 1
  if (missedUntilToday > 3) streak = 0
  return streak
}

const GYM_MILESTONES = [5, 10, 20, 30, 60, 100]
const MONEY_MILESTONES = [200, 500, 1000, 2500, 5000, 10000, 20000]

export function getGymStreak(gymLogs, personId) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const dates = new Set(gymLogs.filter((l) => l.person === personId).map((l) => l.date))
  return currentStreakWithGrace(dates, todayStr)
}

// Recebe os dados já carregados do app e devolve a lista completa de
// conquistas com o progresso atual calculado. Não sabe nada sobre o que
// já foi "desbloqueado de verdade" — isso é responsabilidade de quem usa
// (useAchievementUnlocks), pra manter registrado mesmo se os dados mudarem depois.
//
// `actor` filtra pra só devolver a trilha de Academia da pessoa que está
// usando o app agora (a trilha "Financeiro da família" é sempre exibida,
// já que não é de ninguém em especial).
export function buildAchievements({ transactions = [], goals = [], investments = [], gymLogs = [] }, actor) {
  const groups = []
  const todayStr = new Date().toISOString().slice(0, 10)

  // ---- Academia: sequência de treinos da pessoa que está usando agora ----
  Object.entries(ACTORS).forEach(([personId, personName]) => {
    if (actor && personId !== actor) return
    const dates = new Set(gymLogs.filter((l) => l.person === personId).map((l) => l.date))
    const streak = currentStreakWithGrace(dates, todayStr)
    groups.push({
      id: `gym_${personId}`,
      title: `Academia · ${personName}`,
      icon: 'dumbbell',
      items: GYM_MILESTONES.map((n) => ({
        id: `gym_${personId}_${n}`,
        title: `Sequência de ${n}`,
        description: `${personName} treinou ${n} vezes seguidas (pode descansar até 3 dias entre uma ida e outra).`,
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
