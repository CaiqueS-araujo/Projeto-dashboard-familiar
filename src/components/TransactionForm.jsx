import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionForm({ categories, initial, onSave, onClose }) {
  const [type, setType] = useState(initial?.type || 'despesa')
  const [description, setDescription] = useState(initial?.description || '')
  const [value, setValue] = useState(initial?.value ?? '')
  const [category, setCategory] = useState(initial?.category || '')
  const [date, setDate] = useState(initial?.date || today())
  const [installmentsOn, setInstallmentsOn] = useState(false)
  const [installments, setInstallments] = useState('2')
  const [error, setError] = useState('')

  const filteredCategories = categories.filter((c) => c.type === type)
  const canInstallment = !initial && type === 'despesa'

  useEffect(() => {
    if (!filteredCategories.find((c) => c.id === category)) {
      setCategory(filteredCategories[0]?.id || '')
    }
    if (type !== 'despesa') setInstallmentsOn(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const numValue = Number(String(value).replace(',', '.'))
    if (!description.trim()) return setError('Descreva o lançamento.')
    if (!numValue || numValue <= 0) return setError('Informe um valor válido.')
    if (!category) return setError('Escolha uma categoria.')
    if (!date) return setError('Escolha uma data.')

    const n = Number(installments)
    if (canInstallment && installmentsOn && (!n || n < 2 || n > 48)) {
      return setError('Número de parcelas deve ser entre 2 e 48.')
    }

    onSave(
      {
        type,
        description: description.trim(),
        value: numValue,
        category,
        date,
      },
      canInstallment && installmentsOn ? n : null
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-vault-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-vault-900 dark:text-white">
            {initial ? 'Editar lançamento' : 'Novo lançamento'}
          </h3>
          <button onClick={onClose} className="text-vault-500 hover:text-vault-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setType('despesa')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              type === 'despesa' ? 'bg-coral-500 text-white' : 'bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('receita')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              type === 'receita' ? 'bg-vault-600 text-white' : 'bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200'
            }`}
          >
            Receita
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">
              Descrição
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              placeholder="Ex: Supermercado, Salário..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">
                {installmentsOn ? 'Valor total (R$)' : 'Valor (R$)'}
              </label>
              <input
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">
                {installmentsOn ? '1ª parcela em' : 'Data'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {canInstallment && (
            <div className="bg-vault-950/[0.03] dark:bg-white/5 rounded-lg p-3.5">
              <label className="flex items-center gap-2.5 text-sm text-vault-800 dark:text-vault-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installmentsOn}
                  onChange={(e) => setInstallmentsOn(e.target.checked)}
                  className="w-4 h-4 accent-gold-500"
                />
                Compra parcelada
              </label>
              {installmentsOn && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-vault-500">Em</span>
                  <input
                    type="number"
                    min="2"
                    max="48"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-16 border border-vault-900/10 dark:border-white/15 rounded-md px-2 py-1.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white text-center"
                  />
                  <span className="text-xs text-vault-500">
                    parcelas de{' '}
                    {value
                      ? (Number(String(value).replace(',', '.')) / (Number(installments) || 1)).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : '—'}
                  </span>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-coral-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-vault-900 hover:bg-vault-800 text-white font-semibold text-sm py-2.5 rounded-lg transition"
          >
            {initial ? 'Salvar alterações' : 'Adicionar lançamento'}
          </button>
        </form>
      </div>
    </div>
  )
}
