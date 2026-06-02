import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { BudgetGroup, Project, Template } from '../types'
import { saveGroup, saveProject, calcGroupTotal, formatCurrency } from '../store'
import { TEMPLATES } from '../templates'
import GroupEditor from './GroupEditor'

interface Props {
  groups: BudgetGroup[]
  onSave: () => void
  onGroupsChange: () => void
}

export default function ProjectBuilder({ groups, onSave, onGroupsChange }: Props) {
  const [step, setStep] = useState<'start' | 'build'>('start')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [creatingGroup, setCreatingGroup] = useState(false)

  function applyTemplate(template: Template) {
    const now = new Date().toISOString()
    const newIds: string[] = []
    for (const tg of template.groups) {
      const group: BudgetGroup = {
        id: uuidv4(),
        name: tg.name,
        icon: tg.icon,
        items: tg.items.map(item => ({ ...item, id: uuidv4(), memo: '' })),
        createdAt: now,
        updatedAt: now,
      }
      saveGroup(group)
      newIds.push(group.id)
    }
    onGroupsChange()
    setName(template.name)
    setSelectedIds(newIds)
    setStep('build')
  }

  function toggleGroup(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function moveUp(id: string) {
    const idx = selectedIds.indexOf(id)
    if (idx <= 0) return
    const next = [...selectedIds]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setSelectedIds(next)
  }

  function moveDown(id: string) {
    const idx = selectedIds.indexOf(id)
    if (idx < 0 || idx >= selectedIds.length - 1) return
    const next = [...selectedIds]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setSelectedIds(next)
  }

  function handleSave() {
    if (!name.trim()) return alert('プロジェクト名を入力してください')
    if (selectedIds.length === 0) return alert('費用グループを1つ以上選んでください')
    const now = new Date().toISOString()
    saveProject({
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      groupIds: selectedIds,
      createdAt: now,
      updatedAt: now,
    })
    onSave()
  }

  if (creatingGroup) {
    return (
      <GroupEditor
        onSave={g => {
          onGroupsChange()
          setSelectedIds(prev => [...prev, g.id])
          setCreatingGroup(false)
        }}
        onCancel={() => setCreatingGroup(false)}
      />
    )
  }

  if (step === 'start') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-800">予算を組む</h2>
          <p className="text-sm text-gray-400 mt-0.5">テンプレートから始めるか、自分でゼロから組み立てます</p>
        </div>

        <div className="grid gap-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">テンプレートから始める</p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => applyTemplate(t)}
                className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-blue-700">{t.name}</div>
                <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                <div className="text-xs text-gray-300 mt-2">{t.groups.length} グループ</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <button
            onClick={() => setStep('build')}
            className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            ゼロから組み立てる →
          </button>
        </div>
      </div>
    )
  }

  const selectedGroups = selectedIds
    .map(id => groups.find(g => g.id === id))
    .filter((g): g is BudgetGroup => !!g)

  const total = selectedGroups.reduce((s, g) => s + calcGroupTotal(g), 0)

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* Left: group picker */}
      <div className="col-span-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">費用グループを選ぶ</h3>
            <button
              onClick={() => setCreatingGroup(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + 新しいグループ
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>費用グループがありません</p>
              <button
                onClick={() => setCreatingGroup(true)}
                className="mt-2 text-blue-500 hover:underline"
              >
                今すぐ作る
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              {groups.map(group => {
                const selected = selectedIds.includes(group.id)
                return (
                  <label
                    key={group.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleGroup(group.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xl">{group.icon}</span>
                    <span className="flex-1 text-sm font-medium text-gray-800">{group.name}</span>
                    <span className="text-sm text-gray-500">{formatCurrency(calcGroupTotal(group))}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: summary panel */}
      <div className="col-span-2 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-medium text-gray-800 mb-4">プロジェクト情報</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">プロジェクト名 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 引越し準備 2024年秋"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">メモ</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="備考など"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex-1">
          <h3 className="font-medium text-gray-800 mb-3">
            選択中
            <span className="ml-2 text-sm font-normal text-gray-400">{selectedIds.length} グループ</span>
          </h3>

          {selectedGroups.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">左からグループを選んでください</p>
          ) : (
            <div className="space-y-1.5 mb-4">
              {selectedGroups.map((group, idx) => (
                <div key={group.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(group.id)} disabled={idx === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▲</button>
                    <button onClick={() => moveDown(group.id)} disabled={idx === selectedGroups.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▼</button>
                  </div>
                  <span className="text-lg">{group.icon}</span>
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{group.name}</span>
                  <span className="text-sm text-gray-500 shrink-0">{formatCurrency(calcGroupTotal(group))}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">合計予算</span>
            <span className="text-2xl font-bold text-blue-700">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStep('start')}
            className="px-4 py-3 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← 戻る
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm"
          >
            予算を確定して保存
          </button>
        </div>
      </div>
    </div>
  )
}
