import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inPath =
  'C:/Users/saetanpee/.cursor/projects/d-backup-perso-MSMTest-test/agent-tools/32099d8b-3679-4ad4-b833-466d9c73d17f.txt'
const lines = fs.readFileSync(inPath, 'utf8').split('\n')

const OPTION_MAP = {
  'PHY DMG Increase': 'phyDmgPercent',
  'MAG DMG Increase': 'magDmgPercent',
  'Crit ATK': 'critAtk',
  'Crit DMG': 'critDmg',
  'Crit DMG (%)': 'critDmg',
  ACC: 'acc',
  'Max HP': 'maxHp',
  'Max MP': 'maxMp',
  'EXP Increase': 'expGainPercent',
  'Item Drop Rate Increase': 'itemDropPercent',
}

const LABELS = {
  phyDmgPercent: 'PHY DMG Increase',
  magDmgPercent: 'MAG DMG Increase',
  critAtk: 'Crit ATK',
  critDmg: 'Crit DMG',
  acc: 'ACC',
  maxHp: 'Max HP',
  maxHpPercent: 'Max HP %',
  maxMpPercent: 'Max MP %',
  expGainPercent: 'EXP Increase',
  itemDropPercent: 'Item Drop Rate Increase',
}

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary']

function parseVal(s) {
  s = s.trim()
  if (s.endsWith('%')) return parseFloat(s.slice(0, -1))
  return parseFloat(s)
}

function addVal(data, rank, pool, optName, statStr) {
  const baseId = OPTION_MAP[optName]
  const isPercent = statStr.trim().endsWith('%')
  let id = baseId
  if ((baseId === 'maxHp' || baseId === 'maxMp') && isPercent) {
    id = `${baseId}Percent`
  }
  if (!data[id]) {
    data[id] = {
      id,
      isPercent:
        id.endsWith('Percent') ||
        [
          'phyDmgPercent',
          'magDmgPercent',
          'critDmg',
          'acc',
          'expGainPercent',
          'itemDropPercent',
        ].includes(id),
      firstByRank: Object.fromEntries(RANKS.map((r) => [r, []])),
      laterByRank: Object.fromEntries(RANKS.map((r) => [r, []])),
    }
  }
  const key = pool === 'first' ? 'firstByRank' : 'laterByRank'
  data[id][key][rank].push(parseVal(statStr))
}

function parseMain() {
  const data = {}
  let rank = null
  let inGloves = false

  for (const line of lines) {
    if (line.includes('Bonus Potential Cube')) break

    const rankMatch = line.match(
      /\| Potential Rank \| \| (Rare|Epic|Unique|Legendary) \| Equipment Type \| \| Gloves \|/,
    )
    if (rankMatch) {
      rank = rankMatch[1]
      inGloves = true
      continue
    }
    if (!inGloves || !rank) continue

    const m = line.match(/^\| ([^|]*) \| ([^|]*) \| [^|]+ \| ([^|]*) \| ([^|]*) \|/)
    const cont = line.match(/^\| \| \| \| ([^|]+) \| ([^|]+) \|/)
    if (m) {
      const [, opt1, stat1, opt2, stat2] = m
      if (opt1.trim() && stat1.trim() && OPTION_MAP[opt1.trim()]) {
        addVal(data, rank, 'first', opt1.trim(), stat1.trim())
      }
      if (opt2.trim() && stat2.trim() && OPTION_MAP[opt2.trim()]) {
        addVal(data, rank, 'later', opt2.trim(), stat2.trim())
      }
    } else if (cont) {
      const [, opt2, stat2] = cont
      if (OPTION_MAP[opt2.trim()]) {
        addVal(data, rank, 'later', opt2.trim(), stat2.trim())
      }
    }
  }
  return data
}

function parseBonus() {
  const data = {}
  let inBonus = false

  for (const line of lines) {
    if (line.includes('Bonus Potential Cube')) {
      inBonus = true
      continue
    }
    if (!inBonus) continue

    const combined = line.match(
      /\| Gloves First Bonus Potential \((Rare|Epic|Unique|Legendary)\) \| ([^|]+) \| ([^|]+) \| [^|]+ \| Gloves Second\/Third Bonus Potential \((Rare|Epic|Unique|Legendary)\) \| ([^|]+) \| ([^|]+) \|/,
    )
    if (combined) {
      addVal(data, combined[1], 'first', combined[2].trim(), combined[3].trim())
      addVal(data, combined[4], 'later', combined[5].trim(), combined[6].trim())
      continue
    }

    const firstMatch = line.match(
      /\| Gloves First Bonus Potential \((Rare|Epic|Unique|Legendary)\) \| ([^|]+) \| ([^|]+) \|/,
    )
    if (firstMatch) {
      addVal(data, firstMatch[1], 'first', firstMatch[2].trim(), firstMatch[3].trim())
      continue
    }
    const laterMatch = line.match(
      /\| Gloves Second\/Third Bonus Potential \((Rare|Epic|Unique|Legendary)\) \| ([^|]+) \| ([^|]+) \|/,
    )
    if (laterMatch) {
      addVal(data, laterMatch[1], 'later', laterMatch[2].trim(), laterMatch[3].trim())
      continue
    }
    const contMatch = line.match(
      /^\| (?:\| )*Gloves Second\/Third Bonus Potential \((Rare|Epic|Unique|Legendary)\) \| ([^|]+) \| ([^|]+) \|/,
    )
    if (contMatch) {
      addVal(data, contMatch[1], 'later', contMatch[2].trim(), contMatch[3].trim())
    }
  }
  return data
}

function toOptions(data) {
  const order = [
    'phyDmgPercent',
    'magDmgPercent',
    'critAtk',
    'critDmg',
    'acc',
    'maxHp',
    'maxHpPercent',
    'maxMpPercent',
    'expGainPercent',
    'itemDropPercent',
  ]
  return order.filter((id) => data[id]).map((id) => data[id])
}

function emitTs(exportName, ranksExport, options, tableId, comment) {
  const out = []
  out.push(`import type { PotentialGrade } from '../types/build'`)
  out.push(`import type { PotentialOptionDef } from './potentialWeapon'`)
  out.push('')
  out.push(`function pools(`)
  out.push(`  legendaryFirst: number[],`)
  out.push(`  legendaryLater: number[],`)
  out.push(`  uniqueFirst: number[],`)
  out.push(`  uniqueLater: number[],`)
  out.push(`  epicFirst: number[],`)
  out.push(`  epicLater: number[],`)
  out.push(`  rareFirst: number[],`)
  out.push(`  rareLater: number[],`)
  out.push(`): Pick<PotentialOptionDef, 'firstByRank' | 'laterByRank'> {`)
  out.push(`  return {`)
  out.push(`    firstByRank: {`)
  out.push(`      Legendary: legendaryFirst,`)
  out.push(`      Unique: uniqueFirst,`)
  out.push(`      Epic: epicFirst,`)
  out.push(`      Rare: rareFirst,`)
  out.push(`    },`)
  out.push(`    laterByRank: {`)
  out.push(`      Legendary: legendaryLater,`)
  out.push(`      Unique: uniqueLater,`)
  out.push(`      Epic: epicLater,`)
  out.push(`      Rare: rareLater,`)
  out.push(`    },`)
  out.push(`  }`)
  out.push(`}`)
  out.push('')
  out.push(`/** Gloves ${comment} ranks — Nexon table ${tableId}. */`)
  out.push(`export const ${ranksExport}: PotentialGrade[] = [`)
  out.push(`  'Legendary',`)
  out.push(`  'Unique',`)
  out.push(`  'Epic',`)
  out.push(`  'Rare',`)
  out.push(`]`)
  out.push('')
  out.push(`/** Gloves ${comment} — Nexon table ${tableId}. */`)
  out.push(`export const ${exportName}: PotentialOptionDef[] = [`)

  for (const opt of options) {
    out.push(`  {`)
    out.push(`    id: '${opt.id}',`)
    out.push(`    label: '${LABELS[opt.id]}',`)
    out.push(`    isPercent: ${opt.isPercent},`)
    out.push(`    ...pools(`)
    out.push(`      ${JSON.stringify(opt.firstByRank.Legendary)},`)
    out.push(`      ${JSON.stringify(opt.laterByRank.Legendary)},`)
    out.push(`      ${JSON.stringify(opt.firstByRank.Unique)},`)
    out.push(`      ${JSON.stringify(opt.laterByRank.Unique)},`)
    out.push(`      ${JSON.stringify(opt.firstByRank.Epic)},`)
    out.push(`      ${JSON.stringify(opt.laterByRank.Epic)},`)
    out.push(`      ${JSON.stringify(opt.firstByRank.Rare)},`)
    out.push(`      ${JSON.stringify(opt.laterByRank.Rare)},`)
    out.push(`    ),`)
    out.push(`  },`)
  }
  out.push(`]`)
  out.push('')
  return out.join('\n')
}

const mainOpts = toOptions(parseMain())
const bonusOpts = toOptions(parseBonus())
const outDir = path.join(__dirname, '..', 'src', 'data')

fs.writeFileSync(
  path.join(outDir, 'potentialGloves.ts'),
  emitTs(
    'POTENTIAL_GLOVES_OPTIONS',
    'POTENTIAL_GLOVES_RANKS',
    mainOpts,
    '6443',
    'main Potential',
  ),
)
fs.writeFileSync(
  path.join(outDir, 'bonusPotentialGloves.ts'),
  emitTs(
    'BONUS_POTENTIAL_GLOVES_OPTIONS',
    'BONUS_POTENTIAL_GLOVES_RANKS',
    bonusOpts,
    '6443',
    'Bonus Potential',
  ),
)

console.log('main', mainOpts.length, 'bonus', bonusOpts.length)
