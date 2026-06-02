import { useState } from 'react'
import { BudgetGroup } from '../types'
import { deleteGroup, calcGroupTotal, formatCurrency } from '../store'
import GroupEditor from './GroupEditor'

interface Props {
  groups: BudgetGroup[]
  onRefresh: () => void
}

export default function GroupList({ groups, onRefresh }: Props) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<BudgetGroup | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleDelete(id: string, name: string) {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteGroup(id)
      onRefresh()
    }
  }

  if (creating) {
    return (
      <GroupEditor
        onSave={() => { setCreating(false); onRefresh() }}
        onCancel={() => setCreating(false)}
      />
    )
  }

  if (editing) {
    return (
      <GroupEditor
        group={editing}
        onSave={() => { setEditing(null); onRefresh() }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-800">費用グループ</h2>
          <p className="text-xs text-gray-400 mt-0.5">予算の「かたまり」を登録して組み合わせて使えます</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="shrink-0 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm"
        >
          + 追加
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 text-sm font-medium">まだ費用グループがありません</p>
          <p className="text-gray-400 text-xs mt-1">「予算を組む」のテンプレートから始めると便利です</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {groups.map(group => {
            const total = calcGroupTotal(group)
            const isExpanded = expandedId === group.id
            return (
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Collapsed row */}
                <div
                  className="flex items-center gap-2.5 px-3 py-3.5 cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                >
                  <span className="text-xl shrink-0">{group.icon}</span>
                  <span className="font-medium text-gray-800 flex-1 truncate text-sm">{group.name}</span>
                  <span className="font-bold text-gray-800 text-sm shrink-0">{formatCurrency(total)}</span>
                  <span className="text-gray-300 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Expanded: items + action buttons */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="px-3 py-2 bg-gray-50">
                      {group.items.map(item => (
                        <div key={item.id} className="py-1.5 flex items-baseline gap-2">
                          <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatCurrency(item.unitPrice)}×{item.quantity}{item.unit}
                          </span>
                          <span className="text-sm font-medium text-gray-700 shrink-0 w-20 text-right">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100 bg-white">
                      <button
                        onClick={() => setEditing(group)}
                        className="flex-1 text-sm text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 active:bg-blue-100 transition-colors font-medium"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(group.id, group.name)}
                        className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-lg py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                    </div>
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
