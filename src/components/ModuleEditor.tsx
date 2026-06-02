import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { BudgetModule, BudgetItem } from '../types'
import { saveModule, formatCurrency } from '../store'

interface Props {
  module?: BudgetModule
  onSave: () => void
  onCancel: () => void
}

const CATEGORIES = ['人件費', '広告費', '設備費', '外注費', '交通費', '消耗品費', '光熱費', 'その他']

function emptyItem(): BudgetItem {
  return { id: uuidv4(), name: '', unitPrice: 0, quantity: 1, unit: '個', note: '' }
}

export default function ModuleEditor({ module, onSave, onCancel }: Props) {
  const [name, setName] = useState(module?.name ?? '')
  const [category, setCategory] = useState(module?.category ?? 'その他')
  const [items, setItems] = useState<BudgetItem[]>(module?.items ?? [emptyItem()])

  function updateItem(id: string, field: keyof BudgetItem, value: string | number) {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItems([...items, emptyItem()])
  }

  function removeItem(id: string) {
    if (items.length === 1) return
    setItems(items.filter(item => item.id !== id))
  }

  function handleSave() {
    if (!name.trim()) return alert('モジュール名を入力してください')
    if (items.some(i => !i.name.trim())) return alert('明細名をすべて入力してください')
    const now = new Date().toISOString()
    saveModule({
      id: module?.id ?? uuidv4(),
      name: name.trim(),
      category,
      items,
      createdAt: module?.createdAt ?? now,
      updatedAt: now,
    })
    onSave()
  }

  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">
        {module ? 'モジュールを編集' : '新しいモジュールを作成'}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">モジュール名 *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: Web広告費セット"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">明細</label>
          <button
            onClick={addItem}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + 明細を追加
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">名称</th>
                <th className="text-right px-3 py-2 font-medium w-28">単価</th>
                <th className="text-right px-3 py-2 font-medium w-20">数量</th>
                <th className="text-left px-3 py-2 font-medium w-16">単位</th>
                <th className="text-right px-3 py-2 font-medium w-28">小計</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      placeholder="明細名"
                      className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      min="0"
                      className="w-full border-0 bg-transparent text-right focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                      className="w-full border-0 bg-transparent text-right focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={e => updateItem(item.id, 'unit', e.target.value)}
                      className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 font-medium">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      disabled={items.length === 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-3 py-2 text-right font-semibold text-gray-700">合計</td>
                <td className="px-3 py-2 text-right font-bold text-blue-700">{formatCurrency(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          保存する
        </button>
      </div>
    </div>
  )
}
