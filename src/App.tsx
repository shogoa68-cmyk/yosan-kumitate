import { useState, useCallback } from 'react'
import { Project } from './types'
import { getGroups, getProjects } from './store'
import GroupList from './components/GroupList'
import ProjectBuilder from './components/ProjectBuilder'
import ProjectList from './components/ProjectList'
import ProjectDetail from './components/ProjectDetail'

type Tab = 'groups' | 'build' | 'projects'

export default function App() {
  const [tab, setTab] = useState<Tab>('build')
  const [groups, setGroups] = useState(getGroups)
  const [projects, setProjects] = useState(getProjects)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const refresh = useCallback(() => {
    setGroups(getGroups())
    setProjects(getProjects())
  }, [])

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'build', label: '予算を組む', icon: '🔧' },
    { id: 'groups', label: '費用グループ', icon: '📦' },
    { id: 'projects', label: '保存した予算', icon: '📋' },
  ]

  if (viewingProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-5 py-6">
          <ProjectDetail
            project={viewingProject}
            groups={groups}
            onBack={() => setViewingProject(null)}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-5">
        <nav className="flex gap-1 pt-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-blue-600 border border-b-white border-gray-200 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="bg-white border border-gray-200 rounded-b-2xl rounded-tr-2xl shadow-sm p-6 min-h-96">
          {tab === 'groups' && (
            <GroupList groups={groups} onRefresh={refresh} />
          )}
          {tab === 'build' && (
            <ProjectBuilder
              groups={groups}
              onSave={() => { refresh(); setTab('projects') }}
              onGroupsChange={refresh}
            />
          )}
          {tab === 'projects' && (
            <ProjectList
              projects={projects}
              groups={groups}
              onRefresh={refresh}
              onView={setViewingProject}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-5 py-4">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <span className="text-2xl">💰</span>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">予算くみたて</h1>
          <p className="text-xs text-gray-400">引越し・旅行・大きな買い物の費用を整理</p>
        </div>
        <span className="ml-auto text-xs text-gray-300">データはこのブラウザに保存</span>
      </div>
    </header>
  )
}
