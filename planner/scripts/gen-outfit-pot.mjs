import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OPTION_MAP = {
  'PHY DEF Increase': 'phyDefPercent',
  'MAG DEF Increase': 'magDefPercent',
  'Crit DMG RES': 'critDmgRes',
  ACC: 'acc',
  'Max HP': 'maxHp',
  'Max MP': 'maxMp',
  'PHY ATK': 'phyAtk',
  'MAG ATK': 'magAtk',
  'EXP Increase': 'expGainPercent',
}

const LABELS = {
  phyDefPercent: 'PHY DEF Increase',
  magDefPercent: 'MAG DEF Increase',
  critDmgRes: 'Crit DMG RES',
  acc: 'ACC',
  maxHp: 'Max HP',
  maxMp: 'Max MP',
  maxHpPercent: 'Max HP %',
  maxMpPercent: 'Max MP %',
  phyAtk: 'PHY ATK',
  magAtk: 'MAG ATK',
  expGainPercent: 'EXP Increase',
}

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary']

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
          'phyDefPercent',
          'magDefPercent',
          'critDmgRes',
          'acc',
          'expGainPercent',
        ].includes(id),
      firstByRank: Object.fromEntries(RANKS.map((r) => [r, []])),
      laterByRank: Object.fromEntries(RANKS.map((r) => [r, []])),
    }
  }
  const key = pool === 'first' ? 'firstByRank' : 'laterByRank'
  data[id][key][rank].push(parseVal(statStr))
}

function parseMain(lines, equipmentType) {
  const data = {}
  let rank = null
  let inEquip = false

  for (const line of lines) {
    if (line.includes('Bonus Potential Cube')) break

    const rankMatch = line.match(
      new RegExp(
        `\\| Potential Rank \\| \\| (Rare|Epic|Unique|Legendary) \\| Equipment Type \\| \\| ${equipmentType} \\|`,
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

function parseBonus(lines, equipmentType) {
  const data = {}
  let inBonus = false

  for (const line of lines) {
    if (line.includes('Bonus Potential Cube')) {
      inBonus = true
      continue
    }
    if (!inBonus) continue

    const combined = line.match(
      new RegExp(
        `\\| ${equipmentType} First Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\| [^|]+ \\| ${equipmentType} Second\\/Third Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
      ),
    )
    if (combined) {
      addVal(data, combined[1], 'first', combined[2].trim(), combined[3].trim())
      addVal(data, combined[4], 'later', combined[5].trim(), combined[6].trim())
      continue
    }

    const firstMatch = line.match(
      new RegExp(
        `\\| ${equipmentType} First Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
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
        `\\| ${equipmentType} Second\\/Third Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
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
      continue
    }
    const contMatch = line.match(
      new RegExp(
        `^\\| (?:\\| )*${equipmentType} Second\\/Third Bonus Potential \\((Rare|Epic|Unique|Legendary)\\) \\| ([^|]+) \\| ([^|]+) \\|`,
      ),
    )
    if (contMatch) {
      addVal(
        data,
        contMatch[1],
        'later',
        contMatch[2].trim(),
        contMatch[3].trim(),
      )
    }
  }
  return data
}

function toOptions(data) {
  // Legendary Max HP%/MP% first-line stats are blank in the scraped Nexon markdown;
  // fill from the known first-line ladder (matches later-line Legendary values).
  for (const id of ['maxHpPercent', 'maxMpPercent']) {
    if (data[id] && data[id].firstByRank.Legendary.length === 0) {
      data[id].firstByRank.Legendary = [3.4, 3.24, 3.08, 2.92, 2.76, 2.6]
    }
  }

  const order = [
    'phyDefPercent',
    'magDefPercent',
    'critDmgRes',
    'acc',
    'maxHp',
    'maxMp',
    'maxHpPercent',
    'maxMpPercent',
    'phyAtk',
    'magAtk',
    'expGainPercent',
  ]
  return order.filter((id) => data[id]).map((id) => data[id])
}

function emitTs(exportName, ranksExport, options, tableId, comment, slotLabel) {
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
  out.push(`/** ${slotLabel} ${comment} ranks — Nexon table ${tableId}. */`)
  out.push(`export const ${ranksExport}: PotentialGrade[] = [`)
  out.push(`  'Legendary',`)
  out.push(`  'Unique',`)
  out.push(`  'Epic',`)
  out.push(`  'Rare',`)
  out.push(`]`)
  out.push('')
  out.push(`/** ${slotLabel} ${comment} — Nexon table ${tableId}. */`)
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

function generate(slot, equipmentType, tableId, inPath) {
  const lines = fs.readFileSync(inPath, 'utf8').split('\n')
  const mainOpts = toOptions(parseMain(lines, equipmentType))
  const bonusOpts = toOptions(parseBonus(lines, equipmentType))
  const outDir = path.join(__dirname, '..', 'src', 'data')
  const slotKey = slot === 'Top' ? 'TOP' : 'BOTTOM'
  const slotCamel = slot === 'Top' ? 'Top' : 'Bottom'

  fs.writeFileSync(
    path.join(outDir, `potentialOutfit${slotCamel}.ts`),
    emitTs(
      `POTENTIAL_OUTFIT_${slotKey}_OPTIONS`,
      `POTENTIAL_OUTFIT_${slotKey}_RANKS`,
      mainOpts,
      tableId,
      'main Potential',
      `Outfit ${slot}`,
    ),
  )
  fs.writeFileSync(
    path.join(outDir, `bonusPotentialOutfit${slotCamel}.ts`),
    emitTs(
      `BONUS_POTENTIAL_OUTFIT_${slotKey}_OPTIONS`,
      `BONUS_POTENTIAL_OUTFIT_${slotKey}_RANKS`,
      bonusOpts,
      tableId,
      'Bonus Potential',
      `Outfit ${slot}`,
    ),
  )
  console.log(
    slot,
    'main',
    mainOpts.length,
    mainOpts.map((o) => o.id).join(','),
    'bonus',
    bonusOpts.length,
    bonusOpts.map((o) => o.id).join(','),
  )
}

generate(
  'Top',
  'Top',
  '6441',
  'C:/Users/saetanpee/.cursor/projects/d-backup-perso-MSMTest-test/agent-tools/258a271f-6ea7-4a41-81cd-71ee6eca3666.txt',
)
generate(
  'Bottom',
  'Bottom',
  '6442',
  'C:/Users/saetanpee/.cursor/projects/d-backup-perso-MSMTest-test/agent-tools/936b272c-24ef-4f40-ae59-e5cffcaedb1e.txt',
)
