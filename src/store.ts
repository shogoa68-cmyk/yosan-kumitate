import { BudgetModule, AssembledBudget } from './types'

const MODULES_KEY = 'budget_modules'
const BUDGETS_KEY = 'assembled_budgets'

export function getModules(): BudgetModule[] {
  try {
    return JSON.parse(localStorage.getItem(MODULES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveModule(module: BudgetModule): void {
  const modules = getModules()
  const idx = modules.findIndex(m => m.id === module.id)
  if (idx >= 0) {
    modules[idx] = module
  } else {
    modules.push(module)
  }
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules))
}

export function deleteModule(id: string): void {
  const modules = getModules().filter(m => m.id !== id)
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules))
}

export function getBudgets(): AssembledBudget[] {
  try {
    return JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveBudget(budget: AssembledBudget): void {
  const budgets = getBudgets()
  const idx = budgets.findIndex(b => b.id === budget.id)
  if (idx >= 0) {
    budgets[idx] = budget
  } else {
    budgets.push(budget)
  }
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets))
}

export function deleteBudget(id: string): void {
  const budgets = getBudgets().filter(b => b.id !== id)
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets))
}

export function calcModuleTotal(module: BudgetModule): number {
  return module.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

export function calcBudgetTotal(budget: AssembledBudget, modules: BudgetModule[]): number {
  return budget.moduleIds.reduce((sum, mid) => {
    const m = modules.find(m => m.id === mid)
    return sum + (m ? calcModuleTotal(m) : 0)
  }, 0)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}
