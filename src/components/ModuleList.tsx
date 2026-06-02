import { useState } from 'react'
import { BudgetModule } from '../types'
import { deleteModule, calcModuleTotal, formatCurrency } from '../store'
import ModuleEditor from './ModuleEditor'

interface Props {
  modules: BudgetModule[]
  onRefresh: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  '人件費': 'bg-purple-100 text-purple-700',
  '広告費': 'bg-orange-100 text-orange-700',
  '設備費': 'bg-blue-100 text-blue-700',
  '外注費': 'bg-cyan-100 text-cyan-700',
  '交通費': 'bg-green-100 text-green-700',
  '消耗品費': 'bg-yellow-100 text-yellow-700',
  '光熱費': 'bg-red-100 text-red-700',
  'その他': 'bg-gray-100 text-gray-700',
}

export default function ModuleList({ modules, onRefresh }: Props) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<BudgetModule | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleDelete(id: string, name: string) {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteModule(id)
      onRefresh()
    }
  }

  if (creating) {
    return (
      <ModuleEditor
        onSave={() => { setCreating(false); onRefresh() }}
        onCancel={() => setCreating(false)}
      />
    )
  }

  if (editing) {
    return (
      <ModuleEditor
        module={editing}
        onSave={() => { setEditing(null); onRefresh() }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">予算モジュール</h2>
          <p className="text-sm text-gray-500 mt-0.5">{modules.length} 件のモジュール</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          + 新しいモジュール
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 text-sm">まだモジュールがありません</p>
          <p className="text-gray-400 text-xs mt-1">「新しいモジュール」ボタンから作成してください</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {modules.map(module => {
            const total = calcModuleTotal(module)
            const isExpanded = expandedId === module.id
            const colorClass = CATEGORY_COLORS[module.category] ?? CATEGORY_COLORS['その他']
            return (
              <div key={module.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : module.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${colorClass}`}>
                      {module.category}
                    </span>
                    <span className="font-medium text-gray-800 truncate">{module.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{module.items.length} 件</span>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="font-bold text-gray-800">{formatCurrency(total)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setEditing(module) }}
                        className="text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded px-2 py-1 hover:border-blue-300 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(module.id, module.name) }}
                        className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded px-2 py-1 hover:border-red-300 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-3">
                    <table className="w-full text-sm">
                      <thead className="text-gray-500 text-xs">
                        <tr>
                          <th className="text-left py-1 font-medium">名称</th>
                          <th className="text-right py-1 font-medium">単価</th>
                          <th className="text-right py-1 font-medium">数量</th>
                          <th className="text-left py-1 font-medium pl-2">単位</th>
                          <th className="text-right py-1 font-medium">小計</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {module.items.map(item => (
                          <tr key={item.id} className="text-gray-700">
                            <td className="py-1.5">{item.name}</td>
                            <td className="py-1.5 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-1.5 text-right">{item.quantity.toLocaleString()}</td>
                            <td className="py-1.5 pl-2 text-gray-500">{item.unit}</td>
                            <td className="py-1.5 text-right font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
