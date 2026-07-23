import { useMemo, useState } from 'react'
import { Plus, Trash2, ShoppingCart, Check } from 'lucide-react'
import { formatBRL } from '../utils/format'

export default function MercadoView({ items, onAdd, onUpdate, onDelete, onDeleteMany, onFinalize, actorName }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [confirmFinalize, setConfirmFinalize] = useState(false)

  const checkedItems = items.filter((i) => i.checked)
  const total = useMemo(
    () => checkedItems.reduce((s, i) => s + Number(i.quantity || 1) * Number(i.unitPrice || 0), 0),
    [checkedItems]
  )
  const listTotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.quantity || 1) * Number(i.unitPrice || 0), 0),
    [items]
  )

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(
      {
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unitPrice: unitPrice ? Number(String(unitPrice).replace(',', '.')) : 0,
      },
      actorName
    )
    setName('')
    setQuantity('1')
    setUnitPrice('')
  }

  async function handleFinalize() {
    if (checkedItems.length === 0) return
    await onFinalize(total, checkedItems.length)
    await onDeleteMany(checkedItems.map((i) => i.id))
    setConfirmFinalize(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-vault-900 dark:text-white">Mercado</h2>
        <p className="text-vault-600 dark:text-vault-300 text-sm">
          Lista de compras — o que marcar como comprado vira gasto automático no Financeiro.
        </p>
      </div>

      <form onSubmit={handleAdd} className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Item</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Arroz, Leite, Detergente..."
            className="w-full border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Qtd.</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-16 border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white text-center"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-vault-500 mb-1.5">Preço unit. (opcional)</label>
          <input
            inputMode="decimal"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0,00"
            className="w-28 border border-vault-900/10 dark:border-white/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500 bg-white dark:bg-vault-800 dark:text-white"
          />
        </div>
        <button type="submit" className="flex items-center gap-1.5 bg-vault-900 hover:bg-vault-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </form>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl py-16 text-center text-vault-500 dark:text-vault-400 text-sm">
          <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-vault-400" strokeWidth={1.5} />
          Lista vazia. Adicione o que precisa comprar.
        </div>
      ) : (
        <div className="bg-white dark:bg-vault-900 border border-vault-900/5 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-vault-900/5 dark:divide-white/10">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 group">
              <button
                onClick={() => onUpdate(item.id, { checked: !item.checked })}
                className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition ${
                  item.checked ? 'bg-gold-500' : 'border-2 border-vault-900/20 dark:border-white/25'
                }`}
              >
                {item.checked && <Check className="w-3.5 h-3.5 text-vault-950" strokeWidth={3} />}
              </button>

              <div className={`flex-1 min-w-0 ${item.checked ? 'opacity-50' : ''}`}>
                <p className={`text-sm font-medium truncate ${item.checked ? 'line-through text-vault-500' : 'text-vault-900 dark:text-white'}`}>
                  {item.name}
                </p>
                {item.addedBy && <p className="text-xs text-vault-500 dark:text-vault-400">adicionado por {item.addedBy}</p>}
              </div>

              <input
                type="number"
                min="1"
                defaultValue={item.quantity}
                onBlur={(e) => onUpdate(item.id, { quantity: Number(e.target.value) || 1 })}
                className="w-12 text-center text-sm bg-transparent border-b border-dashed border-vault-900/20 dark:border-white/20 text-vault-800 dark:text-vault-100 outline-none focus:border-gold-500 flex-shrink-0"
              />

              <input
                inputMode="decimal"
                defaultValue={item.unitPrice || ''}
                placeholder="R$ 0,00"
                onBlur={(e) => onUpdate(item.id, { unitPrice: Number(String(e.target.value).replace(',', '.')) || 0 })}
                className="w-20 text-right text-sm bg-transparent border-b border-dashed border-vault-900/20 dark:border-white/20 text-vault-800 dark:text-vault-100 outline-none focus:border-gold-500 flex-shrink-0"
              />

              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-vault-400 hover:text-coral-500 transition flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-vault-900 border border-white/5 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-vault-500 text-xs uppercase tracking-wide">Total da lista</p>
            <p className="font-display text-xl text-white">{formatBRL(listTotal)}</p>
            {checkedItems.length > 0 && (
              <p className="text-xs text-gold-400 mt-0.5">{checkedItems.length} marcado(s) · {formatBRL(total)}</p>
            )}
          </div>
          <button
            onClick={() => setConfirmFinalize(true)}
            disabled={checkedItems.length === 0}
            className="bg-gold-500 hover:bg-gold-400 disabled:opacity-30 text-vault-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition"
          >
            Finalizar compra
          </button>
        </div>
      )}

      {confirmFinalize && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-vault-900 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-lg text-vault-900 dark:text-white mb-2">Finalizar compra?</h3>
            <p className="text-sm text-vault-600 dark:text-vault-300 mb-5">
              Isso cria um lançamento de <strong>{formatBRL(total)}</strong> na categoria Mercado
              ({checkedItems.length} {checkedItems.length === 1 ? 'item' : 'itens'}) e remove os itens marcados da lista.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmFinalize(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-vault-950/5 dark:bg-white/10 text-vault-700 dark:text-vault-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalize}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-gold-500 text-vault-950"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
