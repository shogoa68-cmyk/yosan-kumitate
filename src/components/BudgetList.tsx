import { AssembledBudget, BudgetModule } from '../types'
import { deleteBudget, calcBudgetTotal, formatCurrency } from '../store'

interface Props {
  budgets: AssembledBudget[]
  modules: BudgetModule[]
  onRefresh: () => void
  onView: (budget: AssembledBudget) => void
}

export default function BudgetList({ budgets, modules, onRefresh, onView }: Props) {
  function handleDelete(id: string, name: string) {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteBudget(id)
      onRefresh()
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">保存済み予算</h2>
        <p className="text-sm text-gray-500 mt-0.5">{budgets.length} 件</p>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">まだ予算がありません</p>
          <p className="text-gray-400 text-xs mt-1">「予算を組み立てる」タブから作成してください</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {budgets.map(budget => {
            const total = calcBudgetTotal(budget, modules)
            const activeModules = budget.moduleIds.filter(id => modules.some(m => m.id === id))
            return (
              <div
                key={budget.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{budget.name}</h3>
                    {budget.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{budget.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">
                        モジュール {activeModules.length} 件
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(budget.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(total)}</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => onView(budget)}
                        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-3 py-1 hover:bg-blue-50 transition-colors"
                      >
                        詳細
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id, budget.name)}
                        className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded px-3 py-1 hover:border-red-300 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
