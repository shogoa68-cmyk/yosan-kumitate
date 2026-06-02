export interface BudgetItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  unit: string
  note: string
}

export interface BudgetModule {
  id: string
  name: string
  category: string
  items: BudgetItem[]
  createdAt: string
  updatedAt: string
}

export interface AssembledBudget {
  id: string
  name: string
  description: string
  moduleIds: string[]
  createdAt: string
  updatedAt: string
}

export type Page = 'modules' | 'assemble' | 'budgets' | 'budget-detail'
