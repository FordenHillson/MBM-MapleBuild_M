import type { Build, FlameRank, GearItem, SkillEntry, StatSources } from '../types/build'
import { defaultFlameBases } from '../types/build'
import { buildEmblemLines, emblemById } from './emblems'
import { buildSoulBlock } from './souls'

/** Create a blank custom skill row (defaults keep DPM usable). */
export function createBlankSkill(partial?: Partial<SkillEntry>): SkillEntry {
  return {
    skillId: partial?.skillId ?? crypto.randomUUID(),
    name: partial?.name ?? '',
    enabled: partial?.enabled ?? true,
    skillPercent: partial?.skillPercent ?? 100,
    hitCount: partial?.hitCount ?? 1,
    cooldownSec: partial?.cooldownSec ?? 1,
    uptimePercent: partial?.uptimePercent ?? 100,
  }
}

/** Demo item from user screenshot */
export function demoMainWeapon(): GearItem {
  return {
    slotId: 'mainWeapon',
    itemName: 'AbsoLab Eclipse Pendulum',
    iconUrl: '',
    rank: 'Chaos',
    level: 42,
    star: 23,
    atkBase: 15930,
    atkBonus: 18704,
    phyDefBase: 0,
    magDefBase: 0,
    maxHpBase: 0,
    maxDamageBase: 0,
    flameRank: 'Legendary' satisfies FlameRank,
    mainLines: [
      {
        optionId: 'critDmgExp',
        label: 'Crit DMG scales with EXP▲',
        value: 9.6,
      },
      {
        optionId: 'phyAtkBossAtk',
        label: 'PHY ATK scales with Boss ATK',
        value: 73,
      },
    ],
    potential: {
      grade: 'Legendary',
      lines: [
        { optionId: 'critDmg', label: 'Crit DMG', value: 9.5 },
        { optionId: 'critDmg', label: 'Crit DMG', value: 2.84 },
        { optionId: 'mesoGainPercent', label: 'Meso Acquisition', value: 0.2 },
      ],
    },
    bonusPotential: {
      grade: 'Epic',
      lines: [
        { optionId: 'maxMpPercent', label: 'Max MP %', value: 1 },
        { optionId: 'acc', label: 'ACC', value: 0.3 },
        { optionId: '', label: '', value: 0 },
      ],
    },
    emblem: {
      typeId: 'ruthless',
      name: 'Ruthless Emblem',
      level: 1,
      baseOptionBoostPercent: 30,
      lines: buildEmblemLines(emblemById('ruthless')!, 5, 0),
    },
    highTierOption: null,
    sharenianAbility: null,
    soul: buildSoulBlock('will', 'hearty'),
  }
}

/** Baseline character-side percents so DPM works before full gearing. */
export function defaultStatSources(): StatSources {
  return {
    phyAtkPercent: { character: 100 },
    phyDmgPercent: { character: 35 },
    bossAtkPercent: { character: 80 },
    critRate: { character: 85 },
    finalPercent: { character: 40 },
  }
}

export function createEmptyBuild(id: 'A' | 'B', name: string): Build {
  return {
    id,
    name,
    jobId: 'custom',
    characterLevel: 250,
    skills: [],
    gear: id === 'A' ? { mainWeapon: demoMainWeapon() } : {},
    statSources: defaultStatSources(),
    flameBases: defaultFlameBases(),
  }
}
