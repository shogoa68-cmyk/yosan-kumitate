export interface BudgetItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  unit: string
  memo: string
}

export interface BudgetGroup {
  id: string
  name: string
  icon: string
  items: BudgetItem[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  groupIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Template {
  name: string
  icon: string
  description: string
  groups: Array<{
    name: string
    icon: string
    items: Array<{ name: string; unitPrice: number; quantity: number; unit: string }>
  }>
}
