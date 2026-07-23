import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import MobileTabBar from './MobileTabBar'
import MoreMenu from './MoreMenu'
import ActorSwitcher from './ActorSwitcher'
import ThemeToggle from './ThemeToggle'
import Overview from './Overview'
import TransactionsView from './TransactionsView'
import CategoriesView from './CategoriesView'
import GoalsView from './GoalsView'
import RecurringView from './RecurringView'
import InvestmentsView from './InvestmentsView'
import GymView from './GymView'
import MercadoView from './MercadoView'
import TransactionForm from './TransactionForm'
import { useAuth } from '../contexts/AuthContext'
import { useActor } from '../contexts/ActorContext'
import {
  useTransactions,
  useCategories,
  useGoals,
  useBudgets,
  useRecurring,
  generateDueRecurring,
  useInvestments,
  useWorkouts,
  useGymLogs,
  useGroceryList,
} from '../hooks/useFinanceData'
import { monthLabel, greetingWord } from '../utils/format'

const PAGE_TITLES = {
  overview: 'Início',
  transactions: 'Lançamentos',
  recurring: 'Contas fixas',
  categories: 'Categorias',
  goals: 'Metas',
  investments: 'Investimentos',
  gym: 'Academia',
  mercado: 'Mercado',
  more: 'Mais',
}

export default function Dashboard() {
  const { user } = useAuth()
  const { actor, actorName } = useActor()
  const [active, setActive] = useState('overview')
  const [quickAdd, setQuickAdd] = useState(false)

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  const { transactions, addTransaction, addInstallmentPurchase, updateTransaction, deleteTransaction } = useTransactions()
  const { categories, addCategory, deleteCategory } = useCategories()
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals()
  const { budgets, setBudget } = useBudgets()
  const { recurring, addRecurring, toggleRecurring, deleteRecurring } = useRecurring()
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestments()
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const { logs: gymLogs, markDay, unmarkDay } = useGymLogs()
  const { items: groceryItems, addItem, updateItem, deleteItem, deleteItems } = useGroceryList()

  // Contas fixas: confere sozinho, ao abrir o app, se já lançou as do mês.
  useEffect(() => {
    if (recurring.length > 0) generateDueRecurring(recurring, user?.email)
  }, [recurring, user?.email])

  function changeMonth(delta) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 } else if (m > 11) { m = 0; y += 1 }
    setMonth(m)
    setYear(y)
  }

  async function handleTransactionSave(data, installments) {
    if (installments) {
      await addInstallmentPurchase(data, installments, user.email, actorName)
    } else {
      await addTransaction(data, user.email, actorName)
    }
  }

  async function handleFinalizePurchase(total, count) {
    await addTransaction(
      {
        type: 'despesa',
        description: `Compra de mercado (${count} ${count === 1 ? 'item' : 'itens'})`,
        value: total,
        category: 'mercado',
        date: new Date().toISOString().slice(0, 10),
      },
      user.email,
      actorName
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] dark:bg-vault-950 flex">
      <Sidebar active={active} onChange={setActive} transactions={transactions} />

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-[#F7F4EC]/90 dark:bg-vault-950/90 backdrop-blur border-b border-vault-900/5 dark:border-white/10 px-5 py-4 flex items-center justify-between gap-3">
          <div className="md:hidden min-w-0">
            <p className="text-vault-500 dark:text-vault-400 text-xs leading-none">{greetingWord()}</p>
            <p className="font-display text-base text-vault-900 dark:text-white leading-tight truncate">
              {active === 'overview' ? 'Olá, família Caique e Carol' : PAGE_TITLES[active] || ''}
            </p>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            {['overview', 'transactions', 'gym'].includes(active) && (
              <div className="flex items-center gap-1 bg-white dark:bg-vault-900 border border-vault-900/10 dark:border-white/10 rounded-lg px-1 py-1">
                <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-md text-vault-600 dark:text-vault-300 hover:bg-vault-950/5 dark:hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-vault-900 dark:text-white px-2 min-w-[100px] sm:min-w-[130px] text-center capitalize">
                  {monthLabel(year, month)}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1.5 rounded-md text-vault-600 dark:text-vault-300 hover:bg-vault-950/5 dark:hover:bg-white/10">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle className="text-vault-500 dark:text-vault-400 p-1.5" />
              <ActorSwitcher />
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto">
          {active === 'overview' && (
            <Overview transactions={transactions} categories={categories} budgets={budgets} month={month} year={year} />
          )}
          {active === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              categories={categories}
              onAdd={handleTransactionSave}
              onUpdate={(id, data) => updateTransaction(id, data, actorName)}
              onDelete={deleteTransaction}
              month={month}
              year={year}
            />
          )}
          {active === 'recurring' && (
            <RecurringView
              recurring={recurring}
              categories={categories}
              onAdd={addRecurring}
              onToggle={toggleRecurring}
              onDelete={deleteRecurring}
            />
          )}
          {active === 'categories' && (
            <CategoriesView categories={categories} budgets={budgets} onAdd={addCategory} onDelete={deleteCategory} onSetBudget={setBudget} />
          )}
          {active === 'goals' && (
            <GoalsView goals={goals} onAdd={addGoal} onUpdate={updateGoal} onDelete={deleteGoal} />
          )}
          {active === 'investments' && (
            <InvestmentsView
              investments={investments}
              onAdd={addInvestment}
              onUpdate={updateInvestment}
              onDelete={deleteInvestment}
              actorName={actorName}
            />
          )}
          {active === 'gym' && (
            <GymView
              workouts={workouts}
              logs={gymLogs}
              onAddWorkout={addWorkout}
              onDeleteWorkout={deleteWorkout}
              onMarkDay={markDay}
              onUnmarkDay={unmarkDay}
              month={month}
              year={year}
              defaultPerson={actor}
            />
          )}
          {active === 'mercado' && (
            <MercadoView
              items={groceryItems}
              onAdd={addItem}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onDeleteMany={deleteItems}
              onFinalize={handleFinalizePurchase}
              actorName={actorName}
            />
          )}
          {active === 'more' && <MoreMenu onChange={setActive} />}
        </main>
      </div>

      {/* Botão flutuante — atalho rápido pra lançar algo, só no celular */}
      {['overview', 'transactions'].includes(active) && (
        <button
          onClick={() => setQuickAdd(true)}
          className="md:hidden fixed right-5 bottom-24 z-30 w-14 h-14 rounded-full bg-gold-500 text-vault-950 shadow-lg flex items-center justify-center active:scale-95 transition"
          aria-label="Novo lançamento"
        >
          <Plus className="w-6 h-6" strokeWidth={2.25} />
        </button>
      )}

      <MobileTabBar active={active} onChange={setActive} />

      {quickAdd && (
        <TransactionForm
          categories={categories}
          onSave={async (data, installments) => {
            await handleTransactionSave(data, installments)
            setQuickAdd(false)
          }}
          onClose={() => setQuickAdd(false)}
        />
      )}
    </div>
  )
}
