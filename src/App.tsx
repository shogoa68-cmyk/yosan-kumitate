import { useState, useCallback } from 'react'
import { Project } from './types'
import { getGroups, getProjects } from './store'
import GroupList from './components/GroupList'
import ProjectBuilder from './components/ProjectBuilder'
import ProjectList from './components/ProjectList'
import ProjectDetail from './components/ProjectDetail'

type Tab = 'build' | 'groups' | 'projects'

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
    { id: 'groups', label: 'グループ', icon: '📦' },
    { id: 'projects', label: '保存した予算', icon: '📋' },
  ]

  if (viewingProject) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-5">
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

      {/* Desktop tabs */}
      <div className="hidden md:block max-w-5xl mx-auto px-5">
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
          {tab === 'groups' && <GroupList groups={groups} onRefresh={refresh} />}
          {tab === 'build' && (
            <ProjectBuilder
              groups={groups}
              onSave={() => { refresh(); setTab('projects') }}
              onGroupsChange={refresh}
            />
          )}
          {tab === 'projects' && (
            <ProjectList projects={projects} groups={groups} onRefresh={refresh} onView={setViewingProject} />
          )}
        </div>
      </div>

      {/* Mobile content */}
      <div className="md:hidden pb-20">
        <div className="px-4 py-4">
          {tab === 'groups' && <GroupList groups={groups} onRefresh={refresh} />}
          {tab === 'build' && (
            <ProjectBuilder
              groups={groups}
              onSave={() => { refresh(); setTab('projects') }}
              onGroupsChange={refresh}
            />
          )}
          {tab === 'projects' && (
            <ProjectList projects={projects} groups={groups} onRefresh={refresh} onView={setViewingProject} />
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span>{t.label}</span>
            {tab === t.id && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        <span className="text-xl">💰</span>
        <div>
          <h1 className="text-sm font-bold text-gray-900 leading-tight">予算くみたて</h1>
          <p className="text-xs text-gray-400 hidden sm:block">引越し・旅行・大きな買い物の費用を整理</p>
        </div>
      </div>
    </header>
  )
}
