import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { BudgetModule } from '../types'
import { saveBudget, calcModuleTotal, formatCurrency } from '../store'

interface Props {
  modules: BudgetModule[]
  onSave: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  '人件費': 'bg-purple-100 text-purple-700 border-purple-200',
  '広告費': 'bg-orange-100 text-orange-700 border-orange-200',
  '設備費': 'bg-blue-100 text-blue-700 border-blue-200',
  '外注費': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  '交通費': 'bg-green-100 text-green-700 border-green-200',
  '消耗品費': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '光熱費': 'bg-red-100 text-red-700 border-red-200',
  'その他': 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function BudgetAssembler({ modules, onSave }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggleModule(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function moveUp(id: string) {
    const idx = selectedIds.indexOf(id)
    if (idx <= 0) return
    const next = [...selectedIds]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setSelectedIds(next)
  }

  function moveDown(id: string) {
    const idx = selectedIds.indexOf(id)
    if (idx < 0 || idx >= selectedIds.length - 1) return
    const next = [...selectedIds]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setSelectedIds(next)
  }

  function handleSave() {
    if (!name.trim()) return alert('予算名を入力してください')
    if (selectedIds.length === 0) return alert('モジュールを1つ以上選択してください')
    const now = new Date().toISOString()
    saveBudget({
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      moduleIds: selectedIds,
      createdAt: now,
      updatedAt: now,
    })
    onSave()
  }

  const selectedModules = selectedIds
    .map(id => modules.find(m => m.id === id))
    .filter((m): m is BudgetModule => !!m)

  const total = selectedModules.reduce((s, m) => s + calcModuleTotal(m), 0)

  const categories = Array.from(new Set(modules.map(m => m.category)))

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* Left: module picker */}
      <div className="col-span-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">モジュールを選択</h3>

          {modules.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              まだモジュールがありません。先にモジュールを作成してください。
            </div>
          ) : (
            <div className="space-y-5">
              {categories.map(cat => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{cat}</p>
                  <div className="grid gap-2">
                    {modules.filter(m => m.category === cat).map(module => {
                      const selected = selectedIds.includes(module.id)
                      const colorClass = CATEGORY_COLORS[module.category] ?? CATEGORY_COLORS['その他']
                      return (
                        <label
                          key={module.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selected
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleModule(module.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
                            {module.category}
                          </span>
                          <span className="flex-1 text-sm font-medium text-gray-800">{module.name}</span>
                          <span className="text-sm text-gray-600">{formatCurrency(calcModuleTotal(module))}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: assembler panel */}
      <div className="col-span-2 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">予算情報</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">予算名 *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 2024年度 Q1 マーケティング予算"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="備考・説明"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1">
          <h3 className="font-semibold text-gray-800 mb-3">
            選択中のモジュール
            <span className="ml-2 text-sm font-normal text-gray-500">{selectedIds.length} 件</span>
          </h3>

          {selectedModules.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">左からモジュールを選択してください</p>
          ) : (
            <div className="space-y-2 mb-4">
              {selectedModules.map((module, idx) => (
                <div key={module.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(module.id)}
                      disabled={idx === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(module.id)}
                      disabled={idx === selectedModules.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{module.name}</span>
                  <span className="text-sm text-gray-600 shrink-0">{formatCurrency(calcModuleTotal(module))}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">合計</span>
            <span className="text-xl font-bold text-blue-700">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          予算を確定して保存
        </button>
      </div>
    </div>
  )
}
