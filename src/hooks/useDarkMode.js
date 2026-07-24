import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Cada componente que usa esse hook mantém seu próprio estado local, então
  // se o tema for trocado em outro lugar (ex: o botão sol/lua no cabeçalho),
  // esse observer garante que este componente também fique sabendo — sem
  // isso, gráficos e outros elementos que dependem de isDark ficariam
  // desatualizados até a próxima renderização por outro motivo.
  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains('dark'))
    })
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return [isDark, () => setIsDark((d) => !d)]
}
