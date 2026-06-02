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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800">費用グループ</h2>
          <p className="text-sm text-gray-400 mt-0.5">予算の「かたまり」を登録しておき、プロジェクトに組み合わせて使えます</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          + グループを追加
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 text-sm font-medium">まだ費用グループがありません</p>
          <p className="text-gray-400 text-xs mt-1">
            「グループを追加」か、「予算を組む」タブのテンプレートから始めてください
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {groups.map(group => {
            const total = calcGroupTotal(group)
            const isExpanded = expandedId === group.id
            return (
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                >
                  <span className="text-xl">{group.icon}</span>
                  <span className="font-medium text-gray-800 flex-1">{group.name}</span>
                  <span className="text-xs text-gray-400">{group.items.length} 項目</span>
                  <span className="font-bold text-gray-800 ml-2">{formatCurrency(total)}</span>
                  <div className="flex gap-1.5 ml-3">
                    <button
                      onClick={e => { e.stopPropagation(); setEditing(group) }}
                      className="text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded px-2 py-1 hover:border-blue-300 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(group.id, group.name) }}
                      className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded px-2 py-1 hover:border-red-300 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                  <span className="text-gray-300 text-xs ml-1">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100">
                        {group.items.map(item => (
                          <tr key={item.id} className="text-gray-600">
                            <td className="py-1.5 text-gray-700">{item.name}</td>
                            <td className="py-1.5 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-1.5 text-right text-gray-400 pl-2">× {item.quantity} {item.unit}</td>
                            <td className="py-1.5 text-right font-medium text-gray-700 pl-2">{formatCurrency(item.unitPrice * item.quantity)}</td>
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
