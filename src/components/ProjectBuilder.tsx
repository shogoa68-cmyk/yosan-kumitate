import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { BudgetGroup, Template } from '../types'
import { saveGroup, saveProject, calcGroupTotal, formatCurrency } from '../store'
import { TEMPLATES } from '../templates'
import GroupEditor from './GroupEditor'

interface Props {
  groups: BudgetGroup[]
  onSave: () => void
  onGroupsChange: () => void
}

const BLOCK_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#14B8A6',
]

function colorOf(groups: BudgetGroup[], group: BudgetGroup) {
  const idx = groups.findIndex(g => g.id === group.id)
  return BLOCK_COLORS[idx % BLOCK_COLORS.length]
}

const FRAME_HEIGHT = 280

export default function ProjectBuilder({ groups, onSave, onGroupsChange }: Props) {
  const [step, setStep] = useState<'start' | 'build'>('start')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [limitInput, setLimitInput] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)

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
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id))
    } else {
      setSelectedIds(prev => [...prev, id])
      setJustAdded(id)
      setTimeout(() => setJustAdded(null), 400)
    }
  }

  function handleSave() {
    if (!name.trim()) return alert('プロジェクト名を入力してください')
    if (selectedIds.length === 0) return alert('グループを1つ以上選んでください')
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
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-800">予算を組む</h2>
          <p className="text-sm text-gray-400 mt-0.5">テンプレートから始めるか、自分でゼロから組み立てます</p>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">テンプレートから始める</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all group active:bg-blue-50"
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-medium text-gray-800 text-sm group-hover:text-blue-700">{t.name}</div>
              <div className="text-xs text-gray-400 mt-1">{t.description}</div>
              <div className="text-xs text-gray-300 mt-2">{t.groups.length} グループ</div>
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <button onClick={() => setStep('build')} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            ゼロから組み立てる →
          </button>
        </div>
      </div>
    )
  }

  // ── Build step ──────────────────────────────────────
  const selectedGroups = selectedIds
    .map(id => groups.find(g => g.id === id))
    .filter((g): g is BudgetGroup => !!g)

  const total = selectedGroups.reduce((s, g) => s + calcGroupTotal(g), 0)
  const limitNum = limitInput ? Math.max(0, Number(limitInput)) : 0
  const overBudget = limitNum > 0 && total > limitNum
  const usedPct = limitNum > 0 ? Math.min((total / limitNum) * 100, 100) : 0
  const remaining = limitNum > 0 ? limitNum - total : 0

  // Each block's pixel height within the frame
  function blockPx(group: BudgetGroup): number {
    const gt = calcGroupTotal(group)
    if (limitNum > 0) {
      return (gt / limitNum) * FRAME_HEIGHT
    }
    return total > 0 ? (gt / total) * FRAME_HEIGHT : 0
  }

  const totalFilledPx = limitNum > 0
    ? Math.min((total / limitNum) * FRAME_HEIGHT, FRAME_HEIGHT)
    : FRAME_HEIGHT

  const unselectedGroups = groups.filter(g => !selectedIds.includes(g.id))

  return (
    <div className="space-y-4">

      {/* ── Budget frame ── */}
      <div>
        {/* Limit input */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gray-600 shrink-0">予算の上限（任意）</span>
          <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white gap-1">
            <span className="text-gray-400 text-sm">¥</span>
            <input
              type="number"
              value={limitInput}
              onChange={e => setLimitInput(e.target.value)}
              placeholder="1500000"
              className="w-28 text-sm focus:outline-none text-gray-700"
            />
          </div>
          {limitNum > 0 && (
            <button onClick={() => setLimitInput('')} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
          )}
        </div>

        {/* Visual frame */}
        <div
          className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
            overBudget ? 'border-red-400' : 'border-gray-200'
          } bg-gray-50`}
          style={{ height: FRAME_HEIGHT }}
        >
          {/* Empty state */}
          {selectedGroups.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300 select-none">
              <span className="text-5xl">📦</span>
              <p className="text-sm">下のグループを放り込んでみよう</p>
            </div>
          )}

          {/* Stacked blocks — build from bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse overflow-hidden" style={{ height: totalFilledPx }}>
            {selectedGroups.map((group) => {
              const px = blockPx(group)
              const color = colorOf(groups, group)
              const pct = total > 0 ? Math.round((calcGroupTotal(group) / total) * 100) : 0
              const isNew = justAdded === group.id
              return (
                <div
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    height: px,
                    backgroundColor: color,
                    minHeight: 36,
                    transition: 'height 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    animation: isNew ? 'blockDrop 0.35s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
                  }}
                  className="relative cursor-pointer hover:brightness-110 active:brightness-90 transition-[filter] shrink-0"
                  title={`タップで取り出す`}
                >
                  {/* Separator */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
                  {/* Label */}
                  <div className="absolute inset-0 flex items-center px-3 gap-2 overflow-hidden">
                    <span className="text-lg shrink-0 leading-none">{group.icon}</span>
                    <span className="text-white font-medium text-xs sm:text-sm truncate flex-1 leading-tight">{group.name}</span>
                    <span className="text-white/80 text-xs shrink-0 hidden sm:block">{pct}%</span>
                    <span className="text-white/90 text-xs sm:text-sm font-semibold shrink-0">{formatCurrency(calcGroupTotal(group))}</span>
                    <span className="text-white/50 text-xs shrink-0 leading-none">✕</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Remaining space label */}
          {limitNum > 0 && !overBudget && selectedGroups.length > 0 && remaining > 0 && (
            <div
              className="absolute left-0 right-0 top-0 flex items-center justify-center"
              style={{ height: FRAME_HEIGHT - totalFilledPx }}
            >
              <span className="text-gray-400 text-sm font-medium">残り {formatCurrency(remaining)}</span>
            </div>
          )}

          {/* Over budget banner */}
          {overBudget && (
            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1.5 font-semibold z-10">
              ⚠️ 予算オーバー {formatCurrency(total - limitNum)}
            </div>
          )}
        </div>

        {/* Summary bar */}
        <div className="mt-2.5 px-0.5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">合計 {formatCurrency(total)}</span>
            {limitNum > 0 && (
              <span className={overBudget ? 'text-red-500 font-semibold' : ''}>
                上限 {formatCurrency(limitNum)}
              </span>
            )}
          </div>
          {limitNum > 0 && (
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${overBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Available blocks ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {unselectedGroups.length > 0 ? 'グループを放り込む' : '全部入っています'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {groups.map((group) => {
            const isSelected = selectedIds.includes(group.id)
            const color = colorOf(groups, group)
            return (
              <button
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                style={isSelected ? { backgroundColor: color } : {}}
                className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'border-transparent shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 text-white/80 text-sm font-bold">✓</span>
                )}
                <span className="text-2xl block mb-1 leading-none">{group.icon}</span>
                <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                  {group.name}
                </span>
                <span className={`text-xs mt-0.5 block font-medium ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {formatCurrency(calcGroupTotal(group))}
                </span>
              </button>
            )
          })}
          <button
            onClick={() => setCreatingGroup(true)}
            className="p-3 rounded-xl border-2 border-dashed border-gray-200 text-left hover:border-blue-300 transition-colors active:scale-95"
          >
            <span className="text-2xl block mb-1 leading-none text-gray-400">＋</span>
            <span className="text-xs font-semibold text-gray-400 block">新しいグループ</span>
          </button>
        </div>
      </div>

      {/* ── Project info & save ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">プロジェクト名 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: 引越し準備 2024年秋"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="備考など"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => setStep('start')} className="px-4 py-3 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            ← 戻る
          </button>
          <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm shadow-sm">
            予算を確定して保存
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blockDrop {
          from { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
          to   { transform: scaleY(1); opacity: 1; transform-origin: bottom; }
        }
      `}</style>
    </div>
  )
}
