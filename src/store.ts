import { BudgetGroup, Project } from './types'

const GROUPS_KEY = 'budget_groups'
const PROJECTS_KEY = 'budget_projects'

export function getGroups(): BudgetGroup[] {
  try {
    return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveGroup(group: BudgetGroup): void {
  const groups = getGroups()
  const idx = groups.findIndex(g => g.id === group.id)
  if (idx >= 0) {
    groups[idx] = group
  } else {
    groups.push(group)
  }
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
}

export function deleteGroup(id: string): void {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(getGroups().filter(g => g.id !== id)))
}

export function getProjects(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveProject(project: Project): void {
  const projects = getProjects()
  const idx = projects.findIndex(p => p.id === project.id)
  if (idx >= 0) {
    projects[idx] = project
  } else {
    projects.push(project)
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function deleteProject(id: string): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(getProjects().filter(p => p.id !== id)))
}

export function calcGroupTotal(group: BudgetGroup): number {
  return group.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

export function calcProjectTotal(project: Project, groups: BudgetGroup[]): number {
  return project.groupIds.reduce((sum, gid) => {
    const g = groups.find(g => g.id === gid)
    return sum + (g ? calcGroupTotal(g) : 0)
  }, 0)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}
