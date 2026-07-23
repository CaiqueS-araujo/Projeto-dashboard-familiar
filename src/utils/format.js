export function formatBRL(value) {
  return (value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function monthLabel(year, month) {
  const date = new Date(year, month, 1)
  const label = date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function greetingWord() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function actorSplit(items, actorField = 'actor') {
  const counts = { caique: 0, carol: 0 }
  const nameToId = { Caique: 'caique', Carol: 'carol' }
  items.forEach((i) => {
    const raw = i[actorField]
    const id = nameToId[raw] || (raw ? String(raw).toLowerCase() : null)
    if (id === 'caique' || id === 'carol') counts[id]++
  })
  const total = counts.caique + counts.carol
  if (total === 0) return { caique: 50, carol: 50, total: 0 }
  return {
    caique: Math.round((counts.caique / total) * 100),
    carol: Math.round((counts.carol / total) * 100),
    total,
  }
}

export const DEFAULT_CATEGORIES = [
  { id: 'moradia', name: 'Moradia', color: '#276B4A', type: 'despesa' },
  { id: 'mercado', name: 'Mercado', color: '#D4AF5A', type: 'despesa' },
  { id: 'transporte', name: 'Transporte', color: '#E27D5F', type: 'despesa' },
  { id: 'saude', name: 'Saúde', color: '#7C5CBF', type: 'despesa' },
  { id: 'lazer', name: 'Lazer', color: '#3E8EDE', type: 'despesa' },
  { id: 'educacao', name: 'Educação', color: '#C9622E', type: 'despesa' },
  { id: 'assinaturas', name: 'Assinaturas', color: '#9A9A4F', type: 'despesa' },
  { id: 'outros-despesa', name: 'Outros', color: '#6B6B6B', type: 'despesa' },
  { id: 'salario', name: 'Salário', color: '#1D5039', type: 'receita' },
  { id: 'freelance', name: 'Freelance / RC Studio', color: '#B8924A', type: 'receita' },
  { id: 'outros-receita', name: 'Outras receitas', color: '#4F7A5E', type: 'receita' },
]
