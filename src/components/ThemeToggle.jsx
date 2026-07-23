import { Sun, Moon } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function ThemeToggle({ className = '' }) {
  const [isDark, toggle] = useDarkMode()
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={className}
    >
      {isDark ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
    </button>
  )
}
