import { useState, useEffect, useRef } from 'react'
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

/* ── Direction A: 木の積み木 (wooden building blocks, warm earth) ────────── */
const PAL = {
  bg: '#F1E7D3',
  bgTop: '#F7EFDF',
  crate: '#B08456',
  crateDark: '#9A6E42',
  well: '#E4D6BC',
  ink: '#43382A',
  sub: '#8A7A60',
  good: '#7C8B53',
  goodDark: '#5F6B3E',
  warn: '#C8452F',
  warnDark: '#9E3422',
}

// earthy block colours, assigned by the group's position in the list
const BLOCK_COLORS = [
  '#C2784F', '#7C8B53', '#CBA24C', '#6E8E84',
  '#B5705B', '#9A8A4E', '#84997F', '#A8794F',
]

function colorOf(groups: BudgetGroup[], group: BudgetGroup) {
  const idx = groups.findIndex(g => g.id === group.id)
  return BLOCK_COLORS[idx % BLOCK_COLORS.length]
}

const FRAME_HEIGHT = 286
const MAX_POKE = 44 // how far the stack may rise above the crate rim, max
const GAP = 4

export default function ProjectBuilder({ groups, onSave, onGroupsChange }: Props) {
  const [step, setStep] = useState<'start' | 'build'>('start')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [limitInput, setLimitInput] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  // shake the crate the instant the budget is first exceeded.
  // (kept at top level so hook order is stable across the start/build steps)
  const prevOver = useRef(false)
  useEffect(() => {
    const t = selectedIds
      .map(id => groups.find(g => g.id === id))
      .filter((g): g is BudgetGroup => !!g)
      .reduce((s, g) => s + calcGroupTotal(g), 0)
    const lim = limitInput ? Math.max(0, Number(limitInput)) : 0
    const over = lim > 0 && t > lim
    if (over && !prevOver.current) {
      // Force a DOM repaint between class removal and re-addition
      // by using requestAnimationFrame before setShake(true)
      setShake(false)
      const id = setTimeout(() => {
        setShake(true)
        setTimeout(() => setShake(false), 620)
      }, 20)
      prevOver.current = over
      return () => clearTimeout(id)
    }
    prevOver.current = over
  }, [selectedIds, limitInput, groups])

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
      setTimeout(() => setJustAdded(null), 560)
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
      <div style={{ fontFamily: '"Zen Maru Gothic", system-ui', color: PAL.ink }}>
        <div className="mb-5">
          <h2 className="text-base font-bold" style={{ color: PAL.ink }}>予算を組む</h2>
          <p className="text-sm mt-0.5" style={{ color: PAL.sub }}>テンプレートから始めるか、自分でゼロから組み立てます</p>
        </div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PAL.sub }}>テンプレートから始める</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className="text-left p-4 transition-all active:translate-y-0.5"
              style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 3px 0 #E0CFAE, inset 0 0 0 1.5px #EFE2C9',
              }}
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-bold text-sm" style={{ color: PAL.ink }}>{t.name}</div>
              <div className="text-xs mt-1" style={{ color: PAL.sub }}>{t.description}</div>
              <div className="text-xs mt-2" style={{ color: PAL.sub, opacity: 0.7 }}>{t.groups.length} グループ</div>
            </button>
          ))}
        </div>
        <div className="pt-4" style={{ borderTop: '1px solid #E3D4B8' }}>
          <button onClick={() => setStep('build')} className="text-sm font-bold" style={{ color: PAL.good }}>
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

  // ── Block heights with overflow guard ──
  // Base (un-squashed) height for one block. Proportional to the limit (or to
  // the running total when no limit is set), floored so labels stay legible.
  function baseH(group: BudgetGroup): number {
    const gt = calcGroupTotal(group)
    const ratio = limitNum > 0 ? gt / limitNum : (total > 0 ? gt / total : 0)
    return Math.max(34, Math.min(FRAME_HEIGHT * 0.58, ratio * FRAME_HEIGHT))
  }
  const gapsPx = Math.max(0, selectedGroups.length - 1) * GAP
  const baseSum = selectedGroups.reduce((s, g) => s + baseH(g), 0) + gapsPx
  // Over budget may poke above the rim; otherwise the stack must fit the well.
  const ceiling = (overBudget ? FRAME_HEIGHT + MAX_POKE : FRAME_HEIGHT)
  const squash = baseSum > ceiling ? (ceiling - gapsPx) / Math.max(1, baseSum - gapsPx) : 1
  const blockPx = (group: BudgetGroup) => baseH(group) * squash

  const unselectedGroups = groups.filter(g => !selectedIds.includes(g.id))

  return (
    <div className="space-y-4" style={{ fontFamily: '"Zen Maru Gothic", system-ui', color: PAL.ink }}>

      {/* ── Limit input ── */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold shrink-0" style={{ color: PAL.sub }}>予算の上限（任意）</span>
        <div className="flex items-center gap-1 px-2.5 py-1.5" style={{ background: '#fff', borderRadius: 11, boxShadow: `inset 0 0 0 1.5px ${overBudget ? PAL.warn : '#E3D4B8'}` }}>
          <span className="text-sm" style={{ color: PAL.sub }}>¥</span>
          <input
            type="number"
            value={limitInput}
            onChange={e => setLimitInput(e.target.value)}
            placeholder="1000000"
            className="w-28 text-sm font-bold focus:outline-none bg-transparent"
            style={{ color: PAL.ink }}
          />
        </div>
        {limitNum > 0 && (
          <button onClick={() => setLimitInput('')} className="text-lg leading-none" style={{ color: PAL.sub }}>×</button>
        )}
      </div>

      {/* ── Wooden crate ── */}
      <div
        className={shake ? 'crate-shake' : ''}
        style={{
          position: 'relative', background: PAL.crate, borderRadius: 20, padding: 10,
          boxShadow: '0 10px 24px rgba(120,86,46,0.28), inset 0 2px 0 rgba(255,255,255,0.25)',
          border: `2px solid ${overBudget ? PAL.warn : PAL.crateDark}`,
          transition: 'border-color .25s',
        }}
      >
        {overBudget && (
          <div style={{
            position: 'absolute', top: -13, right: 12, zIndex: 9, background: PAL.warn, color: '#fff',
            fontSize: 12, fontWeight: 800, padding: '5px 11px', borderRadius: 10, transform: 'rotate(2deg)',
            boxShadow: '0 5px 12px rgba(180,50,40,0.4)',
          }}>はみ出し +{formatCurrency(total - limitNum)}</div>
        )}

        {/* well */}
        <div style={{
          position: 'relative', height: FRAME_HEIGHT, background: PAL.well, borderRadius: 13,
          boxShadow: 'inset 0 8px 14px rgba(120,86,46,0.30), inset 0 -2px 0 rgba(255,255,255,0.4)',
          overflow: 'visible',
        }}>
          {/* empty hint */}
          {selectedGroups.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: PAL.sub, pointerEvents: 'none' }}>
              <div style={{ fontSize: 30, opacity: 0.5 }}>📥</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>下のグループをタップして積もう</div>
            </div>
          )}

          {/* remaining label */}
          {selectedGroups.length > 0 && !overBudget && limitNum > 0 && remaining > 0 && (
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center', color: PAL.sub, fontWeight: 700, fontSize: 13, pointerEvents: 'none' }}>
              のこり {formatCurrency(remaining)}
            </div>
          )}

          {/* rim dashed line on over */}
          {overBudget && (
            <div style={{ position: 'absolute', top: 0, left: -10, right: -10, borderTop: `2px dashed ${PAL.warn}`, zIndex: 7 }} />
          )}

          {/* stack from bottom */}
          <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', flexDirection: 'column-reverse', gap: GAP }}>
            {selectedGroups.map((group, i) => {
              const color = colorOf(groups, group)
              const poke = overBudget && i === selectedGroups.length - 1
              const isNew = justAdded === group.id
              const pct = total > 0 ? Math.round((calcGroupTotal(group) / total) * 100) : 0
              return (
                <div
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={isNew ? 'blk-drop' : ''}
                  title="タップで取り出す"
                  style={{
                    height: blockPx(group), flexShrink: 0, background: color, borderRadius: 9,
                    cursor: 'pointer', userSelect: 'none',
                    boxShadow: poke
                      ? 'inset 0 3px 0 rgba(255,255,255,0.35), inset 0 -6px 0 rgba(0,0,0,0.20), 0 7px 16px rgba(120,40,20,0.32)'
                      : 'inset 0 3px 0 rgba(255,255,255,0.32), inset 0 -6px 0 rgba(0,0,0,0.18)',
                    backgroundImage: 'linear-gradient(100deg, rgba(255,255,255,0.10), rgba(0,0,0,0.06) 70%)',
                    display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
                    position: 'relative', zIndex: poke ? 6 : 1,
                    transform: poke ? 'rotate(-1.6deg)' : 'none',
                    transition: 'transform .18s ease',
                  }}
                >
                  <span style={{ fontSize: 19, lineHeight: 1, filter: 'saturate(0.9)' }}>{group.icon}</span>
                  <span style={{ flex: 1, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '.01em', textShadow: '0 1px 1px rgba(0,0,0,0.18)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 11 }}>{pct}%</span>
                  <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, fontSize: 14, textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>{formatCurrency(calcGroupTotal(group))}</span>
                </div>
              )
            })}
          </div>
        </div>

        {selectedGroups.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 700, paddingTop: 6 }}>
            ブロックをタップで取り出す
          </div>
        )}
      </div>

      {/* ── Summary bar ── */}
      <div className="px-0.5">
        <div className="flex justify-between items-baseline mb-1.5">
          <span style={{ fontSize: 13, fontWeight: 700, color: PAL.sub }}>合計</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: overBudget ? PAL.warn : PAL.ink }}>{formatCurrency(total)}</span>
        </div>
        {limitNum > 0 && (
          <div style={{ height: 9, borderRadius: 9, background: '#E3D4B8', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)' }}>
            <div style={{
              height: '100%', width: `${usedPct}%`, borderRadius: 9,
              background: overBudget ? `linear-gradient(${PAL.warn},${PAL.warnDark})` : `linear-gradient(#8FA05E,${PAL.good})`,
              transition: 'width .4s cubic-bezier(.34,1.56,.64,1)',
            }} />
          </div>
        )}
      </div>

      {/* ── Tray: available groups ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PAL.sub }}>
          {unselectedGroups.length > 0 ? 'グループを放り込む' : '全部入っています'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {groups.map((group) => {
            const isSelected = selectedIds.includes(group.id)
            const color = colorOf(groups, group)
            return (
              <button
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className="relative text-center p-3 transition-transform active:translate-y-0.5"
                style={{
                  background: '#fff', borderRadius: 14,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${color}, 0 3px 0 #E0CFAE`
                    : '0 3px 0 #E0CFAE, inset 0 0 0 1.5px #EFE2C9',
                }}
              >
                <span
                  className="block mx-auto mb-1.5 flex items-center justify-center"
                  style={{ width: 34, height: 34, borderRadius: 9, background: color, fontSize: 18, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.15)' }}
                >{group.icon}</span>
                <span className="block truncate" style={{ fontSize: 11, fontWeight: 800, color: PAL.ink }}>{group.name}</span>
                <span className="block mt-0.5" style={{ fontSize: 10, fontWeight: 700, color: PAL.sub }}>{formatCurrency(calcGroupTotal(group))}</span>
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                    background: isSelected ? PAL.warn : PAL.good, color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: '19px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                  }}
                >{isSelected ? '−' : '+'}</span>
              </button>
            )
          })}
          <button
            onClick={() => setCreatingGroup(true)}
            className="text-center p-3 transition-transform active:translate-y-0.5"
            style={{ borderRadius: 14, border: '2px dashed #CBB892', background: 'transparent' }}
          >
            <span className="block mb-1.5" style={{ fontSize: 26, lineHeight: '34px', color: PAL.sub }}>＋</span>
            <span className="block" style={{ fontSize: 11, fontWeight: 800, color: PAL.sub }}>新しいグループ</span>
          </button>
        </div>
      </div>

      {/* ── Project info & save ── */}
      <div className="p-4 space-y-3" style={{ background: '#fff', borderRadius: 18, boxShadow: 'inset 0 0 0 1.5px #EFE2C9' }}>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: PAL.sub }}>プロジェクト名 <span style={{ color: PAL.warn }}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: 引越し準備 2026年春"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ borderRadius: 11, boxShadow: 'inset 0 0 0 1.5px #E3D4B8', color: PAL.ink }}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: PAL.sub }}>メモ</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="備考など"
            rows={2}
            className="w-full px-3 py-2 text-sm focus:outline-none resize-none"
            style={{ borderRadius: 11, boxShadow: 'inset 0 0 0 1.5px #E3D4B8', color: PAL.ink }}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setStep('start')}
            className="px-4 py-3 text-sm font-bold transition-transform active:translate-y-0.5"
            style={{ color: PAL.sub, borderRadius: 13, boxShadow: 'inset 0 0 0 1.5px #E3D4B8' }}
          >← 戻る</button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 font-bold text-sm transition-transform active:translate-y-0.5"
            style={{
              background: overBudget ? PAL.warn : PAL.good, color: '#fff', borderRadius: 13,
              boxShadow: overBudget ? `0 5px 0 ${PAL.warnDark}` : `0 5px 0 ${PAL.goodDark}`,
            }}
          >{overBudget ? '上限を見直す' : '予算を確定して保存'}</button>
        </div>
      </div>

    </div>
  )
}
