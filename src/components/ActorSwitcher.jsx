import { useState } from 'react'
import { ChevronDown, User } from 'lucide-react'
import { useActor, ACTORS } from '../contexts/ActorContext'

export default function ActorSwitcher() {
  const { actor, actorName, setActor } = useActor()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200 pl-2 pr-1.5 py-1.5 rounded-full"
      >
        <User className="w-3 h-3" />
        {actorName}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 bg-white dark:bg-vault-900 border border-vault-900/10 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 min-w-[130px]">
            {Object.entries(ACTORS).map(([id, name]) => (
              <button
                key={id}
                onClick={() => {
                  setActor(id)
                  setOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition ${
                  actor === id
                    ? 'text-gold-600 dark:text-gold-400 font-semibold bg-gold-500/5'
                    : 'text-vault-700 dark:text-vault-200 hover:bg-vault-950/5 dark:hover:bg-white/5'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
