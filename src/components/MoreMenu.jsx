import { Repeat, Tags, Target, TrendingUp, ChevronRight } from 'lucide-react'

const ITEMS = [
  { id: 'recurring', label: 'Contas fixas', desc: 'Assinaturas e contas que lançam sozinhas', icon: Repeat },
  { id: 'categories', label: 'Categorias', desc: 'Organize e defina orçamentos', icon: Tags },
  { id: 'goals', label: 'Metas', desc: 'Objetivos de economia', icon: Target },
  { id: 'investments', label: 'Investimentos', desc: 'Sua carteira, tudo num lugar', icon: TrendingUp },
]

export default function MoreMenu({ onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-vault-900 dark:text-white">Mais opções</h2>
      <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-vault-900/5 dark:divide-white/10">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-vault-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-vault-500 dark:text-vault-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-vault-400 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
