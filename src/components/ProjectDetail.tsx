import { Project, BudgetGroup } from '../types'
import { calcGroupTotal, calcProjectTotal, formatCurrency } from '../store'

interface Props {
  project: Project
  groups: BudgetGroup[]
  onBack: () => void
}

const BAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
]

export default function ProjectDetail({ project, groups, onBack }: Props) {
  const selectedGroups = project.groupIds
    .map(id => groups.find(g => g.id === id))
    .filter((g): g is BudgetGroup => !!g)

  const total = calcProjectTotal(project, groups)

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-700 mb-4 flex items-center gap-1 transition-colors"
      >
        ← 一覧に戻る
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(project.createdAt).toLocaleDateString('ja-JP')} 作成
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">総予算</p>
            <p className="text-3xl font-bold text-blue-700">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Stacked bar */}
        {selectedGroups.length > 0 && total > 0 && (
          <div className="mt-5">
            <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
              {selectedGroups.map((group, idx) => {
                const pct = (calcGroupTotal(group) / total) * 100
                return (
                  <div
                    key={group.id}
                    className={`${BAR_COLORS[idx % BAR_COLORS.length]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${group.name}: ${pct.toFixed(1)}%`}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {selectedGroups.map((group, idx) => {
                const pct = total > 0 ? Math.round((calcGroupTotal(group) / total) * 100) : 0
                return (
                  <div key={group.id} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${BAR_COLORS[idx % BAR_COLORS.length]}`} />
                    {group.icon} {group.name} {pct}%
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Group breakdown */}
      <div className="space-y-3">
        {selectedGroups.map((group, idx) => {
          const groupTotal = calcGroupTotal(group)
          const pct = total > 0 ? Math.round((groupTotal / total) * 100) : 0
          return (
            <div key={group.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className={`h-1 ${BAR_COLORS[idx % BAR_COLORS.length]}`} />
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{group.icon}</span>
                  <span className="font-semibold text-gray-800 flex-1 text-sm">{group.name}</span>
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="font-bold text-gray-800 text-sm">{formatCurrency(groupTotal)}</span>
                </div>
                <div className="space-y-1.5">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-baseline gap-2">
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
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer total */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-blue-900">合計</span>
        <span className="text-2xl font-bold text-blue-700">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
