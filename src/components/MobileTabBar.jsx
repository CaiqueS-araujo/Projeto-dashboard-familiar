import { LayoutGrid, Wallet, Dumbbell, ShoppingCart, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Início', icon: LayoutGrid },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet, group: ['financeiro', 'transactions', 'recurring', 'categories', 'goals', 'investments'] },
  { id: 'gym', label: 'Academia', icon: Dumbbell },
  { id: 'mercado', label: 'Mercado', icon: ShoppingCart },
  { id: 'achievements', label: 'Conquistas', icon: Trophy },
]

export default function MobileTabBar({ active, onChange }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-vault-900 border-t border-vault-900/10 dark:border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.group ? item.group.includes(active) : active === item.id
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
      </div>
    </nav>
  )
}
