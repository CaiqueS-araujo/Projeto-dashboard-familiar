import { LayoutGrid, ArrowLeftRight, Dumbbell, ShoppingCart, Grid3x3 } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Início', icon: LayoutGrid },
  { id: 'transactions', label: 'Lançar', icon: ArrowLeftRight },
  { id: 'gym', label: 'Academia', icon: Dumbbell },
  { id: 'mercado', label: 'Mercado', icon: ShoppingCart },
]

const MORE_IDS = ['recurring', 'categories', 'goals', 'investments', 'achievements']

export default function MobileTabBar({ active, onChange }) {
  const isMoreActive = active === 'more' || MORE_IDS.includes(active)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-vault-900 border-t border-vault-900/10 dark:border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                isActive ? 'text-gold-600 dark:text-gold-400' : 'text-vault-500 dark:text-vault-400'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.75} />
              {item.label}
            </button>
          )
        })}
        <button
          onClick={() => onChange('more')}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
            isMoreActive ? 'text-gold-600 dark:text-gold-400' : 'text-vault-500 dark:text-vault-400'
          }`}
        >
          <Grid3x3 className="w-5 h-5" strokeWidth={isMoreActive ? 2 : 1.75} />
          Mais
        </button>
      </div>
    </nav>
  )
}
