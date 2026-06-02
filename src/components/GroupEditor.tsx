import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { BudgetGroup, BudgetItem } from '../types'
import { saveGroup, formatCurrency } from '../store'
import { GROUP_ICON_SUGGESTIONS } from '../templates'

interface Props {
  group?: BudgetGroup
  onSave: (group: BudgetGroup) => void
  onCancel: () => void
}

function emptyItem(): BudgetItem {
  return { id: uuidv4(), name: '', unitPrice: 0, quantity: 1, unit: '個', memo: '' }
}

export default function GroupEditor({ group, onSave, onCancel }: Props) {
  const [name, setName] = useState(group?.name ?? '')
  const [icon, setIcon] = useState(group?.icon ?? '📦')
  const [items, setItems] = useState<BudgetItem[]>(group?.items.length ? group.items : [emptyItem()])
  const [showIconPicker, setShowIconPicker] = useState(false)

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
    if (!name.trim()) return alert('グループ名を入力してください')
    if (items.some(i => !i.name.trim())) return alert('費用名をすべて入力してください')
    const now = new Date().toISOString()
    const saved: BudgetGroup = {
      id: group?.id ?? uuidv4(),
      name: name.trim(),
      icon,
      items,
      createdAt: group?.createdAt ?? now,
      updatedAt: now,
    }
    saveGroup(saved)
    onSave(saved)
  }

  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-5">
        {group ? '費用グループを編集' : '費用グループを作成'}
      </h2>

      <div className="flex gap-3 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">アイコン</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-10 text-xl border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {icon}
            </button>
            {showIconPicker && (
              <div className="absolute top-12 left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 grid grid-cols-5 gap-1 w-44">
                {GROUP_ICON_SUGGESTIONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => { setIcon(ic); setShowIconPicker(false) }}
                    className={`text-xl p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${ic === icon ? 'bg-blue-50' : ''}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">グループ名 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: 賃貸初期費用、リビング家具、交通費..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-600">費用の内訳</label>
          <button
            onClick={addItem}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + 項目を追加
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2 font-medium">費用名</th>
                <th className="text-right px-3 py-2 font-medium w-28">金額</th>
                <th className="text-right px-3 py-2 font-medium w-16">数量</th>
                <th className="text-left px-3 py-2 font-medium w-14">単位</th>
                <th className="text-right px-3 py-2 font-medium w-28">小計</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      placeholder="費用名"
                      className="w-full border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded px-1 py-0.5"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      min="0"
                      placeholder="0"
                      className="w-full border-0 bg-transparent text-right focus:outline-none focus:bg-blue-50 rounded px-1 py-0.5"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                      className="w-full border-0 bg-transparent text-right focus:outline-none focus:bg-blue-50 rounded px-1 py-0.5"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={e => updateItem(item.id, 'unit', e.target.value)}
                      className="w-full border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded px-1 py-0.5"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-700">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </td>
                  <td className="pr-2 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-20 text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-3 py-2.5 text-right text-sm font-semibold text-gray-600">このグループの合計</td>
                <td className="px-3 py-2.5 text-right font-bold text-blue-700">{formatCurrency(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
