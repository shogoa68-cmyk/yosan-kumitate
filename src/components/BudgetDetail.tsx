import { AssembledBudget, BudgetModule } from '../types'
import { calcModuleTotal, calcBudgetTotal, formatCurrency } from '../store'

interface Props {
  budget: AssembledBudget
  modules: BudgetModule[]
  onBack: () => void
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

export default function BudgetDetail({ budget, modules, onBack }: Props) {
  const selectedModules = budget.moduleIds
    .map(id => modules.find(m => m.id === id))
    .filter((m): m is BudgetModule => !!m)

  const total = calcBudgetTotal(budget, modules)

  const categoryTotals = selectedModules.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + calcModuleTotal(m)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        ← 一覧に戻る
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{budget.name}</h2>
            {budget.description && (
              <p className="text-sm text-gray-500 mt-1">{budget.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              作成日: {new Date(budget.createdAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">総予算額</p>
            <p className="text-3xl font-bold text-blue-700">{formatCurrency(total)}</p>
          </div>
        </div>

        {Object.keys(categoryTotals).length > 1 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">カテゴリ別内訳</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryTotals).map(([cat, amt]) => (
                <div key={cat} className={`px-3 py-1.5 rounded-full text-sm ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['その他']}`}>
                  {cat}: {formatCurrency(amt)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {selectedModules.map((module, idx) => {
          const moduleTotal = calcModuleTotal(module)
          const pct = total > 0 ? Math.round((moduleTotal / total) * 100) : 0
          const colorClass = CATEGORY_COLORS[module.category] ?? CATEGORY_COLORS['その他']
          return (
            <div key={module.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <span className="text-sm text-gray-400 font-mono w-5">{idx + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                  {module.category}
                </span>
                <span className="font-semibold text-gray-800 flex-1">{module.name}</span>
                <span className="text-sm text-gray-500">{pct}%</span>
                <span className="font-bold text-gray-800">{formatCurrency(moduleTotal)}</span>
              </div>

              <div className="px-5 py-2">
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {module.items.map(item => (
                      <tr key={item.id} className="text-gray-600">
                        <td className="py-1.5 text-gray-700">{item.name}</td>
                        <td className="py-1.5 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-1.5 text-right text-gray-500 pl-2">× {item.quantity.toLocaleString()} {item.unit}</td>
                        <td className="py-1.5 text-right font-medium text-gray-700">{formatCurrency(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5 flex justify-between items-center">
        <span className="font-semibold text-blue-900">総合計</span>
        <span className="text-2xl font-bold text-blue-700">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
