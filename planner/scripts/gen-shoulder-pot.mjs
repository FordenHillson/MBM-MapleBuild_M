import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inPath =
  'C:/Users/saetanpee/.cursor/projects/d-backup-perso-MSMTest-test/agent-tools/8e21cc0a-b2b5-4f7a-b014-3e8d4788748c.txt'
const lines = fs.readFileSync(inPath, 'utf8').split('\n')

const OPTION_MAP = {
  'PHY DEF': 'phyDef',
  'MAG DEF': 'magDef',
  'Boss DEF Increase': 'bossDefPercent',
  ACC: 'acc',
  'Max HP': 'maxHp',
  'Max MP': 'maxMp',
  'EXP Increase': 'expGainPercent',
  'PHY DMG Increase': 'phyDmgPercent',
  'MAG DMG Increase': 'magDmgPercent',
}

const LABELS = {
  phyDef: 'PHY DEF',
  magDef: 'MAG DEF',
  bossDefPercent: 'Boss DEF Increase',
  acc: 'ACC',
  maxHp: 'Max HP',
  maxMp: 'Max MP',
  maxHpPercent: 'Max HP %',
  maxMpPercent: 'Max MP %',
  expGainPercent: 'EXP Increase',
  phyDmgPercent: 'PHY DMG Increase',
  magDmgPercent: 'MAG DMG Increase',
}

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary']
const EQUIP = 'Shoulders'

function parseVal(s) {
  s = s.trim()
  if (s.endsWith('%')) return parseFloat(s.slice(0, -1))
  return parseFloat(s)
}

function addVal(data, rank, pool, optName, statStr) {
  const baseId = OPTION_MAP[optName]
  if (!baseId) return
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
          'bossDefPercent',
          'acc',
          'expGainPercent',
          'phyDmgPercent',
          'magDmgPercent',
        ].includes(id),
      firstByRank: Object.fromEntries(RANKS.map((r) => [r, []])),
      laterByRank: Object.fromEntries(RANKS.map((r) => [r, []])),
    }
  }
  const key = pool === 'first' ? 'firstByRank' : 'laterByRank'
  data[id][key][rank].push(parseVal(statStr))
}

function parseBonus() {
  const data = {}
  let inBonus = false

  for (const line of lines) {
    if (
      line.includes('Bonus Potential Cube') ||
      line.includes('First Bonus Potential')
    ) {
      inBonus = true
    }
    if (!inBonus) continue
    if (!line.includes('Bonus Potential')) continue

    const combined = line.match(
      new RegExp(
        `\\| ${EQUIP} First Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\| [^|]+ \\| ${EQUIP} Second\\/Third Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
      ),
    )
    if (combined) {
      addVal(data, combined[1], 'first', combined[2].trim(), combined[3].trim())
      addVal(data, combined[4], 'later', combined[5].trim(), combined[6].trim())
      continue
    }

    const firstMatch = line.match(
      new RegExp(
        `\\| ${EQUIP} First Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
      ),
    )
    if (firstMatch) {
      addVal(
        data,
        firstMatch[1],
        'first',
        firstMatch[2].trim(),
        firstMatch[3].trim(),
      )
      continue
    }
    const laterMatch = line.match(
      new RegExp(
        `\\| ${EQUIP} Second\\/Third Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
      ),
    )
    if (laterMatch) {
      addVal(
        data,
        laterMatch[1],
        'later',
        laterMatch[2].trim(),
        laterMatch[3].trim(),
      )
    }
  }
  return data
}

function parseMain() {
  const data = {}
  let rank = null
  let inEquip = false

  for (const line of lines) {
    if (
      line.includes('Bonus Potential Cube') ||
      line.includes('First Bonus Potential')
    ) {
      break
    }

    const rankMatch = line.match(
      new RegExp(
        `\\| Potential Rank \\| \\| (Rare|Epic|Unique|Legendary) \\| Equipment Type \\| \\| ${EQUIP} \\|`,
      ),
    )
    if (rankMatch) {
      rank = rankMatch[1]
      inEquip = true
      continue
    }
    if (!inEquip || !rank) continue

    const m = line.match(
      /^\| ([^|]*) \| ([^|]*) \| [^|]+ \| ([^|]*) \| ([^|]*) \|/,
    )
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

function toOptions(data) {
  const order = [
    'phyDef',
    'magDef',
    'bossDefPercent',
    'acc',
    'maxHp',
    'maxMp',
    'maxHpPercent',
    'maxMpPercent',
    'expGainPercent',
    'phyDmgPercent',
    'magDmgPercent',
  ]
  return order.filter((id) => data[id]).map((id) => data[id])
}

function emitTs(exportName, ranksExport, options, comment) {
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
  out.push(`/** Shoulder ${comment} ranks — Nexon table 6450. */`)
  out.push(`export const ${ranksExport}: PotentialGrade[] = [`)
  out.push(`  'Legendary',`)
  out.push(`  'Unique',`)
  out.push(`  'Epic',`)
  out.push(`  'Rare',`)
  out.push(`]`)
  out.push('')
  out.push(`/** Shoulder ${comment} — Nexon table 6450. */`)
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
  path.join(outDir, 'potentialShoulder.ts'),
  emitTs(
    'POTENTIAL_SHOULDER_OPTIONS',
    'POTENTIAL_SHOULDER_RANKS',
    mainOpts,
    'main Potential',
  ),
)
fs.writeFileSync(
  path.join(outDir, 'bonusPotentialShoulder.ts'),
  emitTs(
    'BONUS_POTENTIAL_SHOULDER_OPTIONS',
    'BONUS_POTENTIAL_SHOULDER_RANKS',
    bonusOpts,
    'Bonus Potential',
  ),
)

console.log(
  'main',
  mainOpts.length,
  mainOpts.map((o) => o.id).join(','),
  'bonus',
  bonusOpts.length,
  bonusOpts.map((o) => o.id).join(','),
)
for (const opt of [...mainOpts, ...bonusOpts]) {
  for (const rank of RANKS) {
    const f = opt.firstByRank[rank].length
    const l = opt.laterByRank[rank].length
    if (f === 0 && l === 0) continue
    if ((f > 0) !== (l > 0)) {
      console.warn(`${opt.id} ${rank}: first=${f} later=${l}`)
    }
  }
}
