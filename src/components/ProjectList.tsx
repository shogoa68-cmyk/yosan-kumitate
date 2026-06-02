import { Project, BudgetGroup } from '../types'
import { deleteProject, calcProjectTotal, formatCurrency } from '../store'

interface Props {
  projects: Project[]
  groups: BudgetGroup[]
  onRefresh: () => void
  onView: (project: Project) => void
}

export default function ProjectList({ projects, groups, onRefresh, onView }: Props) {
  function handleDelete(id: string, name: string) {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteProject(id)
      onRefresh()
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800">保存した予算</h2>
        <p className="text-sm text-gray-400 mt-0.5">{projects.length} 件</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm font-medium">まだ予算がありません</p>
          <p className="text-gray-400 text-xs mt-1">「予算を組む」タブから作成してください</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map(project => {
            const total = calcProjectTotal(project, groups)
            const projectGroups = project.groupIds
              .map(id => groups.find(g => g.id === id))
              .filter((g): g is BudgetGroup => !!g)
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onView(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{project.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {projectGroups.slice(0, 5).map(g => (
                          <span key={g.id} className="text-base">{g.icon}</span>
                        ))}
                        {projectGroups.length > 5 && (
                          <span className="text-xs text-gray-400">+{projectGroups.length - 5}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{projectGroups.length} グループ</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(total)}</p>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(project.id, project.name) }}
                      className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
                    >
                      削除
                    </button>
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
