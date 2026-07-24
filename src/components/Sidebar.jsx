import {
  LayoutGrid, ArrowLeftRight, Tags, Target, LogOut, Repeat, TrendingUp,
  Dumbbell, ShoppingCart, Trophy,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useActor, ACTORS } from '../contexts/ActorContext'
import { DISPLAY_NAME } from '../firebase'
import { actorSplit } from '../utils/format'
import ThemeToggle from './ThemeToggle'

const SECTIONS = [
  {
    title: 'Financeiro',
    items: [
      { id: 'overview', label: 'Visão geral', icon: LayoutGrid },
      { id: 'transactions', label: 'Lançamentos', icon: ArrowLeftRight },
      { id: 'recurring', label: 'Contas fixas', icon: Repeat },
      { id: 'categories', label: 'Categorias', icon: Tags },
      { id: 'goals', label: 'Metas', icon: Target },
      { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    ],
  },
  {
    title: 'Academia',
    items: [{ id: 'gym', label: 'Academia', icon: Dumbbell }],
  },
  {
    title: 'Mercado',
    items: [{ id: 'mercado', label: 'Lista de compras', icon: ShoppingCart }],
  },
  {
    title: 'Conquistas',
    items: [{ id: 'achievements', label: 'Conquistas', icon: Trophy }],
  },
]

export default function Sidebar({ active, onChange, transactions }) {
  const { logout } = useAuth()
  const { actor, setActor } = useActor()
  const split = actorSplit(transactions)

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-vault-950 border-r border-white/5 flex-shrink-0">
      <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-xl text-white leading-tight">{DISPLAY_NAME}</h1>
          <p className="text-vault-500 text-xs mt-1">Painel da família</p>
        </div>
        <ThemeToggle className="text-vault-500 hover:text-gold-400 transition p-1.5 -mr-1.5 flex-shrink-0" />
      </div>

      {/* participação de cada um nos lançamentos */}
      <div className="px-6 mb-5">
        <p className="text-vault-600 text-[10px] uppercase tracking-wide mb-2">Quem lançou este mês</p>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5">
          <div className="h-full bg-gold-500" style={{ width: `${split.caique}%` }} />
          <div className="h-full bg-vault-500" style={{ width: `${split.carol}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-vault-500 mt-1.5">
          <span>Caique {split.caique}%</span>
          <span>Carol {split.carol}%</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto scrollbar-thin">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3.5 mb-1.5 text-[10px] uppercase tracking-wide text-vault-600">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-vault-800 text-gold-400'
                        : 'text-vault-500 hover:text-white hover:bg-vault-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-6 pt-4 border-t border-white/5 mx-3">
        <p className="px-2 text-[10px] uppercase tracking-wide text-vault-600 mb-2">Usando agora</p>
        <div className="flex gap-1.5 mb-3 px-2">
          {Object.entries(ACTORS).map(([id, name]) => (
            <button
              key={id}
              onClick={() => setActor(id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                actor === id ? 'bg-gold-500 text-vault-950' : 'bg-white/5 text-vault-400 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-vault-500 hover:text-coral-500 transition"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  )
}
