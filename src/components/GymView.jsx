import { useMemo, useState } from 'react'
import { Dumbbell, Plus, Trash2, X, Check } from 'lucide-react'
import { ACTORS } from '../contexts/ActorContext'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function pad(n) {
  return String(n).padStart(2, '0')
}

// Aceita colar uma lista com quebras de linha (bloco de notas) ou separada por vírgula.
function parseExercises(text) {
  return text
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function GymView({ workouts, logs, onAddWorkout, onDeleteWorkout, onMarkDay, onUnmarkDay, month, year, defaultPerson }) {
  const [person, setPerson] = useState(defaultPerson || 'caique')
  const [picker, setPicker] = useState(null) // { date } | null
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [wName, setWName] = useState('')
  const [wExercises, setWExercises] = useState('')

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  const logsByKey = useMemo(() => {
    const map = {}
    logs.forEach((l) => {
      map[`${l.date}_${l.person}`] = l
    })
    return map
  }, [logs])

  function statsFor(p) {
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${pad(month + 1)}-${pad(d)}`
      if (logsByKey[`${date}_${p}`]) count++
    }
    return { count, pct: Math.round((count / daysInMonth) * 100) }
  }

  const statsCaique = statsFor('caique')
  const statsCarol = statsFor('carol')

  function handleDayClick(d) {
    const date = `${year}-${pad(month + 1)}-${pad(d)}`
    const existing = logsByKey[`${date}_${person}`]
    if (existing) {
      setPicker({ date, existing })
    } else {
      setPicker({ date })
    }
  }

  // Treinos ficam vinculados a quem os criou (calendário selecionado no momento).
  // Treinos antigos, sem dono definido, continuam aparecendo pros dois — pra não
  // sumir nada que já existia antes dessa mudança.
  const personWorkouts = useMemo(
    () => workouts.filter((w) => !w.person || w.person === person),
    [workouts, person]
  )

  async function handleAddWorkout(e) {
    e.preventDefault()
    if (!wName.trim()) return
    await onAddWorkout({
      name: wName.trim(),
      exercises: parseExercises(wExercises),
      person,
    })
    setWName('')
    setWExercises('')
    setShowWorkoutForm(false)
  }

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Academia</h2>
        <p className="text-vault-600 dark:text-vault-300 text-sm">Marque os dias que treinou e o que fez.</p>
      </div>

      {/* comparativo dos dois */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(ACTORS).map(([id, name]) => {
          const s = id === 'caique' ? statsCaique : statsCarol
          return (
            <div key={id} className="bg-vault-900 border border-white/5 rounded-2xl p-5">
              <p className="text-vault-500 text-xs uppercase tracking-wide mb-1">{name}</p>
              <p className="font-display text-2xl text-white mb-2">{s.pct}%</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-gold-500 rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
              <p className="text-vault-500 text-xs">{s.count} de {daysInMonth} dias do mês</p>
            </div>
          )
        })}
      </div>

      {/* seletor de pessoa pro calendário */}
      <div className="flex items-center gap-2">
        {Object.entries(ACTORS).map(([id, name]) => (
          <button
            key={id}
            onClick={() => setPerson(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              person === id
                ? 'bg-vault-900 dark:bg-gold-500 text-white dark:text-vault-950'
                : 'bg-white dark:bg-vault-900 text-vault-600 dark:text-vault-300 border border-vault-900/10 dark:border-white/10'
            }`}
          >
            Calendário de {name}
          </button>
        ))}
      </div>

      {/* calendário */}
      <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-[11px] text-vault-500 dark:text-vault-400 font-medium">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const date = `${year}-${pad(month + 1)}-${pad(d)}`
            const done = logsByKey[`${date}_${person}`]
            const isToday = date === todayStr
            return (
              <button
                key={i}
                onClick={() => handleDayClick(d)}
                className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition relative ${
                  done
                    ? 'bg-gold-500 text-vault-950'
                    : isToday
                    ? 'bg-vault-950/10 dark:bg-white/15 text-vault-900 dark:text-white ring-1 ring-gold-500/50'
                    : 'bg-vault-950/[0.03] dark:bg-white/5 text-vault-700 dark:text-vault-300 hover:bg-vault-950/10 dark:hover:bg-white/10'
                }`}
                title={done ? done.workoutName : 'Marcar treino'}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {/* treinos personalizados */}
      <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg text-vault-900 dark:text-white">Treinos personalizados</h3>
          <button
            onClick={() => setShowWorkoutForm((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium text-gold-600 dark:text-gold-400"
          >
            <Plus className="w-4 h-4" />
            Novo treino
          </button>
        </div>
        <p className="text-vault-500 dark:text-vault-400 text-xs mb-4">De {ACTORS[person]}</p>

        {showWorkoutForm && (
          <form onSubmit={handleAddWorkout} className="mb-4 space-y-3 bg-vault-950/[0.03] dark:bg-white/5 rounded-xl p-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Nome do treino</label>
              <input
                value={wName}
                onChange={(e) => setWName(e.target.value)}
                placeholder="Ex: Treino A — Peito e tríceps"
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Exercícios (um por linha, ou separados por vírgula)</label>
              <textarea
                value={wExercises}
                onChange={(e) => setWExercises(e.target.value)}
                placeholder={'Supino reto\nCrucifixo\nTríceps corda'}
                rows={5}
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white resize-y"
              />
              <p className="text-[11px] text-vault-500 dark:text-vault-400 mt-1">Pode colar a lista de outro lugar, cada exercício numa linha.</p>
            </div>
            <button type="submit" className="bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Salvar treino
            </button>
          </form>
        )}

        {personWorkouts.length === 0 ? (
          <p className="text-sm text-vault-500 dark:text-vault-400">Nenhum treino cadastrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {personWorkouts.map((w) => (
              <div key={w.id} className="flex items-start justify-between gap-3 py-2 border-b border-vault-900/5 dark:border-white/10 last:border-0 group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Dumbbell className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-vault-900 dark:text-white">{w.name}</p>
                    {w.exercises?.length > 0 && (
                      <p className="text-xs text-vault-500 dark:text-vault-400 truncate">{w.exercises.join(', ')}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteWorkout(w.id)}
                  className="opacity-0 group-hover:opacity-100 text-vault-400 hover:text-coral-500 transition flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {picker && (
        <WorkoutPicker
          date={picker.date}
          existing={picker.existing}
          workouts={personWorkouts}
          personName={ACTORS[person]}
          onConfirm={async (workoutId, workoutName, completedExercises) => {
            await onMarkDay(picker.date, person, workoutId, workoutName, completedExercises)
            setPicker(null)
          }}
          onRemove={async () => {
            await onUnmarkDay(picker.date, person)
            setPicker(null)
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

function WorkoutPicker({ date, existing, workouts, personName, onConfirm, onRemove, onClose }) {
  // 'summary' = dia já marcado, só exibindo o que foi feito
  // 'choose'  = escolhendo qual treino vai fazer
  // 'session' = checklist do treino em andamento
  const [step, setStep] = useState(existing ? 'summary' : 'choose')
  const [selectedId, setSelectedId] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [checked, setChecked] = useState(new Set())

  const [y, m, d] = date.split('-')
  const niceDate = `${d}/${m}/${y}`

  const selectedWorkout = workouts.find((w) => w.id === selectedId)

  function toggleExercise(name) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function startSession(id, name) {
    const w = workouts.find((x) => x.id === id)
    if (id === 'free' || !w?.exercises?.length) {
      // Treino livre ou sem exercícios cadastrados: nada pra marcar, salva direto.
      onConfirm(id === 'free' ? null : id, name, [])
      return
    }
    setSelectedId(id)
    setSelectedName(name)
    setChecked(new Set())
    setStep('session')
  }

  function finishSession() {
    onConfirm(selectedId, selectedName, Array.from(checked))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-vault-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-xl text-vault-900 dark:text-white">
            {step === 'session' ? selectedName : step === 'summary' ? 'Treino do dia' : 'Foi treinar?'}
          </h3>
          <button onClick={onClose} className="text-vault-500 hover:text-vault-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-vault-500 dark:text-vault-400 mb-5">{personName} · {niceDate}</p>

        {step === 'summary' && existing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3.5 py-3 text-sm text-vault-900 dark:text-white">
              <Check className="w-4 h-4 text-gold-600 flex-shrink-0" />
              {existing.workoutName}
            </div>
            {existing.completedExercises?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-vault-500 mb-2">Exercícios feitos</p>
                <div className="space-y-1.5">
                  {existing.completedExercises.map((ex) => (
                    <div key={ex} className="flex items-center gap-2 text-sm text-vault-700 dark:text-vault-200">
                      <Check className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={onRemove}
              className="w-full bg-coral-500/10 text-coral-500 font-semibold text-sm py-2.5 rounded-lg transition hover:bg-coral-500/15"
            >
              Remover marcação
            </button>
          </div>
        )}

        {step === 'choose' && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-vault-500">Qual treino você vai fazer?</p>
            <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-thin">
              <button
                onClick={() => startSession('free', 'Treino livre')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition bg-vault-950/[0.04] dark:bg-white/5 text-vault-800 dark:text-vault-200"
              >
                Treino livre / outra atividade
              </button>
              {workouts.map((w) => (
                <button
                  key={w.id}
                  onClick={() => startSession(w.id, w.name)}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition bg-vault-950/[0.04] dark:bg-white/5 text-vault-800 dark:text-vault-200"
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'session' && selectedWorkout && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-vault-500">Marque conforme for fazendo</p>
            <div className="space-y-1.5">
              {selectedWorkout.exercises.map((ex) => {
                const done = checked.has(ex)
                return (
                  <button
                    key={ex}
                    onClick={() => toggleExercise(ex)}
                    className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-lg text-sm transition ${
                      done
                        ? 'bg-gold-500/15 text-vault-900 dark:text-white'
                        : 'bg-vault-950/[0.04] dark:bg-white/5 text-vault-800 dark:text-vault-200'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                        done ? 'bg-gold-500 border-gold-500' : 'border-vault-900/20 dark:border-white/25'
                      }`}
                    >
                      {done && <Check className="w-3 h-3 text-vault-950" />}
                    </span>
                    <span className={done ? 'line-through opacity-70' : ''}>{ex}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200 font-medium text-sm py-2.5 rounded-lg transition"
              >
                Voltar
              </button>
              <button
                onClick={finishSession}
                className="flex-[2] bg-vault-900 hover:bg-vault-800 text-white font-semibold text-sm py-2.5 rounded-lg transition"
              >
                Fim de treino
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
