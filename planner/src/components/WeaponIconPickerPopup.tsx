import { useMemo, useState } from 'react'
import type { ItemRank } from '../types/build'
import {
  formatWeaponIconHarvestDate,
  isWeaponIconCatalogStale,
  listWeaponIconsForRank,
  weaponIconNamePrefixForRank,
  type WeaponIconEntry,
} from '../data/nexon/weaponIcons'
import './Popup.css'

export function WeaponIconPickerPopup({
  rank,
  selectedIconUrl,
  onClose,
  onPick,
}: {
  rank: ItemRank
  selectedIconUrl?: string
  onClose: () => void
  onPick: (entry: WeaponIconEntry) => void
}) {
  const [query, setQuery] = useState('')
  const stale = isWeaponIconCatalogStale()
  const harvestDate = formatWeaponIconHarvestDate()
  const rankPrefix = weaponIconNamePrefixForRank(rank)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = listWeaponIconsForRank(rank)
    if (!q) return all
    return all.filter(
      (w) =>
        w.itemNameEn.toLowerCase().includes(q) ||
        w.itemName.toLowerCase().includes(q) ||
        w.weaponTypeEn.toLowerCase().includes(q) ||
        w.weaponType.toLowerCase().includes(q) ||
        w.sampleClass.toLowerCase().includes(q),
    )
  }, [query, rank])

  return (
    <div
      className="popup-backdrop soul-picker-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="soul-picker weapon-icon-picker"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="เลือกไอคอนอาวุธ"
      >
        <header className="soul-picker-header">
          <div>
            <p className="summary-slot">Main Weapon · {rank}</p>
            <h3>เลือกไอคอนอาวุธ</h3>
            {rankPrefix && (
              <p className="weapon-icon-rank-hint">Showing {rankPrefix} line</p>
            )}
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        {stale && (
          <p className="weapon-icon-stale-banner" role="status">
            NOTICE: ข้อมูลจาก Nexon Open API ต้องอัปเดตอย่างน้อยทุก 30 วัน
            (harvest ล่าสุด {harvestDate}) — รัน{' '}
            <code>scripts/harvest_weapon_icons.py</code>
          </p>
        )}

        <div className="weapon-icon-picker-tools">
          <input
            type="search"
            className="weapon-icon-search"
            placeholder="Search name / weapon type…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <span className="weapon-icon-count">{filtered.length} items</span>
        </div>

        <div className="soul-grid weapon-icon-grid">
          {filtered.map((entry) => (
            <button
              key={entry.iconUrl}
              type="button"
              className={`soul-tile weapon-icon-tile${
                selectedIconUrl === entry.iconUrl ? ' selected' : ''
              }`}
              onClick={() => onPick(entry)}
              title={`${entry.itemNameEn} (${entry.itemName})`}
            >
              <img
                src={entry.iconUrl}
                alt=""
                className="weapon-icon-thumb"
                loading="lazy"
              />
              <span className="soul-tile-name">{entry.itemNameEn}</span>
              <span className="soul-tile-stat">{entry.weaponTypeEn}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="weapon-icon-empty">No weapons match your search</p>
          )}
        </div>
      </div>
    </div>
  )
}
