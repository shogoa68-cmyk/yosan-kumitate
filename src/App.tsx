import { useState, useCallback } from 'react'
import { AssembledBudget } from './types'
import { getModules, getBudgets } from './store'
import ModuleList from './components/ModuleList'
import BudgetAssembler from './components/BudgetAssembler'
import BudgetList from './components/BudgetList'
import BudgetDetail from './components/BudgetDetail'

type Tab = 'modules' | 'assemble' | 'budgets'

export default function App() {
  const [tab, setTab] = useState<Tab>('modules')
  const [modules, setModules] = useState(getModules)
  const [budgets, setBudgets] = useState(getBudgets)
  const [viewingBudget, setViewingBudget] = useState<AssembledBudget | null>(null)

  const refresh = useCallback(() => {
    setModules(getModules())
    setBudgets(getBudgets())
  }, [])

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'modules', label: 'モジュール管理', icon: '📦' },
    { id: 'assemble', label: '予算を組み立てる', icon: '🔧' },
    { id: 'budgets', label: '保存済み予算', icon: '📋' },
  ]

  if (viewingBudget) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-gray-900">予算組み立てアプリ</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-6">
          <BudgetDetail
            budget={viewingBudget}
            modules={modules}
            onBack={() => setViewingBudget(null)}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <h1 className="text-xl font-bold text-gray-900">予算組み立てアプリ</h1>
          <span className="ml-auto text-xs text-gray-400">データはブラウザに保存されます</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex gap-1 pt-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-blue-600 border border-b-white border-gray-200 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6 bg-white border border-gray-200 mx-6 rounded-b-xl shadow-sm" style={{ maxWidth: 'calc(100% - 3rem)', margin: '0 auto' }}>
        <div className="max-w-5xl mx-auto">
          {tab === 'modules' && (
            <ModuleList modules={modules} onRefresh={refresh} />
          )}
          {tab === 'assemble' && (
            <BudgetAssembler
              modules={modules}
              onSave={() => { refresh(); setTab('budgets') }}
            />
          )}
          {tab === 'budgets' && (
            <BudgetList
              budgets={budgets}
              modules={modules}
              onRefresh={refresh}
              onView={setViewingBudget}
            />
          )}
        </div>
      </main>
    </div>
  )
}
