import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { DEFAULT_CATEGORIES } from '../utils/format'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar transações:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addTransaction(data, authorEmail, actorName) {
    return addDoc(collection(db, 'transactions'), {
      ...data,
      actor: actorName || null,
      createdBy: authorEmail,
      createdAt: serverTimestamp(),
    })
  }

  // Cria as N parcelas de uma compra automaticamente, uma em cada mês,
  // já com "(parcela X/N)" na descrição. O valor informado é o total da
  // compra — o sistema divide sozinho (a última parcela absorve o
  // arredondamento pra fechar certinho).
  async function addInstallmentPurchase(data, installments, authorEmail, actorName) {
    const batch = writeBatch(db)
    const totalCents = Math.round(Number(data.value) * 100)
    const baseCents = Math.floor(totalCents / installments)
    const remainderCents = totalCents - baseCents * installments
    const groupId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const [baseYear, baseMonth, baseDay] = data.date.split('-').map(Number)

    for (let i = 0; i < installments; i++) {
      const d = new Date(baseYear, baseMonth - 1 + i, baseDay)
      const cents = baseCents + (i === installments - 1 ? remainderCents : 0)
      const ref = doc(collection(db, 'transactions'))
      batch.set(ref, {
        ...data,
        value: cents / 100,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        description: `${data.description} (parcela ${i + 1}/${installments})`,
        installmentGroupId: groupId,
        installmentIndex: i + 1,
        installmentTotal: installments,
        actor: actorName || null,
        createdBy: authorEmail,
        createdAt: serverTimestamp(),
      })
    }
    return batch.commit()
  }

  async function updateTransaction(id, data, actorName) {
    return updateDoc(doc(db, 'transactions', id), { ...data, lastEditedBy: actorName || null })
  }

  async function deleteTransaction(id) {
    return deleteDoc(doc(db, 'transactions', id))
  }

  return { transactions, loading, addTransaction, addInstallmentPurchase, updateTransaction, deleteTransaction }
}

export function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setCategories(DEFAULT_CATEGORIES)
        } else {
          setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        }
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar categorias:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addCategory(data) {
    return addDoc(collection(db, 'categories'), data)
  }

  async function deleteCategory(id) {
    return deleteDoc(doc(db, 'categories', id))
  }

  return { categories, loading, addCategory, deleteCategory }
}

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'goals'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar metas:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addGoal(data) {
    return addDoc(collection(db, 'goals'), { ...data, createdAt: serverTimestamp() })
  }

  async function updateGoal(id, data) {
    return updateDoc(doc(db, 'goals', id), data)
  }

  async function deleteGoal(id) {
    return deleteDoc(doc(db, 'goals', id))
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal }
}

// Orçamento mensal por categoria. Guardado num único documento
// (settings/budgets) no formato { categoriaId: limite }, pra ser rápido
// de ler e escrever.
export function useBudgets() {
  const [budgets, setBudgets] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = doc(db, 'settings', 'budgets')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setBudgets(snap.exists() ? snap.data() : {})
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar orçamentos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function setBudget(categoryId, limit) {
    const ref = doc(db, 'settings', 'budgets')
    if (!limit || limit <= 0) {
      const { [categoryId]: _drop, ...rest } = budgets
      return setDoc(ref, rest)
    }
    return setDoc(ref, { ...budgets, [categoryId]: Number(limit) })
  }

  return { budgets, loading, setBudget }
}

// Contas fixas recorrentes (aluguel, assinaturas...). Cada regra fica
// salva uma vez, e todo mês o sistema confere sozinho se já lançou a
// transação daquele mês — se não lançou, cria automaticamente.
export function useRecurring() {
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'recurring'), orderBy('description', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRecurring(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar contas fixas:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addRecurring(data) {
    return addDoc(collection(db, 'recurring'), { ...data, active: true, createdAt: serverTimestamp() })
  }

  async function toggleRecurring(id, active) {
    return updateDoc(doc(db, 'recurring', id), { active })
  }

  async function deleteRecurring(id) {
    return deleteDoc(doc(db, 'recurring', id))
  }

  return { recurring, loading, addRecurring, toggleRecurring, deleteRecurring }
}

// Roda em segundo plano: pra cada conta fixa ativa, confere se o mês
// atual já tem o lançamento gerado (usando recurringId + mês/ano). Se
// não tiver, cria sozinho — assim, ao abrir o app no mês, as contas
// fixas já aparecem lançadas sem precisar fazer nada.
export async function generateDueRecurring(recurring, authorEmail) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  for (const rule of recurring) {
    if (!rule.active) continue
    const day = Math.min(Number(rule.dayOfMonth) || 1, 28)
    if (day > today) continue // ainda não chegou o dia desse mês

    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-31`
    const q = query(
      collection(db, 'transactions'),
      where('recurringId', '==', rule.id),
      where('date', '>=', monthStart),
      where('date', '<=', monthEnd)
    )
    const existing = await getDocs(q)
    if (!existing.empty) continue

    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    await addDoc(collection(db, 'transactions'), {
      description: rule.description,
      value: Number(rule.value),
      category: rule.category,
      type: rule.type,
      date,
      recurringId: rule.id,
      createdBy: authorEmail || 'automático',
      createdAt: serverTimestamp(),
    })
  }
}

// ---------- Investimentos ----------
export function useInvestments() {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'investments'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setInvestments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar investimentos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addInvestment(data, actorName) {
    return addDoc(collection(db, 'investments'), { ...data, actor: actorName || null, createdAt: serverTimestamp() })
  }

  async function updateInvestment(id, data) {
    return updateDoc(doc(db, 'investments', id), data)
  }

  async function deleteInvestment(id) {
    return deleteDoc(doc(db, 'investments', id))
  }

  return { investments, loading, addInvestment, updateInvestment, deleteInvestment }
}

// ---------- Academia: treinos personalizados ----------
export function useWorkouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'workouts'), orderBy('name', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setWorkouts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar treinos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addWorkout(data) {
    return addDoc(collection(db, 'workouts'), { ...data, createdAt: serverTimestamp() })
  }

  async function deleteWorkout(id) {
    return deleteDoc(doc(db, 'workouts', id))
  }

  return { workouts, loading, addWorkout, deleteWorkout }
}

// ---------- Academia: presença ----------
export function useGymLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'gymLogs'), orderBy('date', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar presença na academia:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Um doc por dia+pessoa (id determinístico), pra nunca duplicar.
  async function markDay(date, person, workoutId, workoutName, completedExercises = []) {
    return setDoc(doc(db, 'gymLogs', `${date}_${person}`), {
      date,
      person,
      workoutId: workoutId || null,
      workoutName: workoutName || 'Treino livre',
      completedExercises: completedExercises || [],
    })
  }

  async function unmarkDay(date, person) {
    return deleteDoc(doc(db, 'gymLogs', `${date}_${person}`))
  }

  return { logs, loading, markDay, unmarkDay }
}

// ---------- Conquistas: guarda a data em que cada uma foi desbloqueada ----------
// O progresso em si é sempre calculado na hora (veja src/utils/achievements.js).
// Aqui só fica registrado o "carimbo" de quando bateu a meta pela primeira vez,
// pra continuar valendo mesmo que o saldo ou a sequência de treino mudem depois.
export function useAchievementUnlocks() {
  const [unlocked, setUnlocked] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = collection(db, 'achievementUnlocks')
    const unsub = onSnapshot(
      q,
      (snap) => {
        const map = {}
        snap.docs.forEach((d) => {
          map[d.id] = d.data()
        })
        setUnlocked(map)
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar conquistas:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function unlockAchievement(id, meta) {
    return setDoc(doc(db, 'achievementUnlocks', id), {
      unlockedAt: serverTimestamp(),
      ...meta,
    })
  }

  return { unlocked, loading, unlockAchievement }
}

// ---------- Mercado: lista de compras ----------
export function useGroceryList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'groceryItems'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar lista de mercado:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addItem(data, actorName) {
    return addDoc(collection(db, 'groceryItems'), {
      ...data,
      checked: false,
      addedBy: actorName || null,
      createdAt: serverTimestamp(),
    })
  }

  async function updateItem(id, data) {
    return updateDoc(doc(db, 'groceryItems', id), data)
  }

  async function deleteItem(id) {
    return deleteDoc(doc(db, 'groceryItems', id))
  }

  async function deleteItems(ids) {
    const batch = writeBatch(db)
    ids.forEach((id) => batch.delete(doc(db, 'groceryItems', id)))
    return batch.commit()
  }

  return { items, loading, addItem, updateItem, deleteItem, deleteItems }
}

// ---------- Hábitos / conquistas diárias ----------
// Cada hábito é criado uma vez (ex: "Beber 2L de água") com um escopo:
// 'personal' (só quem criou) ou 'family' (aparece pros dois, cada um
// marca o seu dia independente).
export function useDailyHabits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'dailyHabits'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar hábitos diários:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function addHabit(data, actorId) {
    return addDoc(collection(db, 'dailyHabits'), {
      name: data.name,
      scope: data.scope, // 'personal' | 'family'
      owner: data.scope === 'personal' ? actorId : null,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteHabit(id) {
    return deleteDoc(doc(db, 'dailyHabits', id))
  }

  return { habits, loading, addHabit, deleteHabit }
}

// Um doc por dia+hábito+pessoa (id determinístico), pra nunca duplicar
// e ser fácil de conferir se já foi marcado.
export function useDailyHabitLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'dailyHabitLogs'), orderBy('date', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Erro ao carregar registro de hábitos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  async function toggleHabit(date, habitId, person, done) {
    const ref = doc(db, 'dailyHabitLogs', `${date}_${habitId}_${person}`)
    if (done) {
      return setDoc(ref, { date, habitId, person, done: true })
    }
    return deleteDoc(ref)
  }

  return { logs, loading, toggleHabit }
}


