# MSM Build Planner — Hat (หมวก) Gear Design

**วันที่:** 2026-07-16
**สถานะ:** รอผู้ใช้ตรวจ spec · กิ่ง `feature/equip-category-profile`
**สแตก:** Vite + React + TypeScript (planner)

## 1. เป้าหมาย

เพิ่มความสามารถเต็มรูปแบบให้ช่อง **หมวก (`hat`)**: สเตตพื้นฐาน DEF/HP/DMG, Option หลักแบบ dropdown, Rebirth Flame (พูล Hat), Potential + Bonus Potential (พูล Hat), Emblem (Unique+) โดยไม่รองรับ Soul

## 2. การตัดสินใจที่ล็อกแล้ว

| หัวข้อ | ตัดสินใจ |
|--------|----------|
| ขอบเขต | เฉพาะช่อง `hat` (เกราะอื่นทำภายหลัง) |
| แนวทาง | Slot override บน `hat` ผ่าน helper + พูลไฟล์ใหม่ · ไม่แก้โปรไฟล์ `armor` ทั้งหมวด |
| สเตตพื้นฐาน | ช่องตัวเลขคงที่ 4 ช่อง: PHY DEF, MAG DEF, HP สูงสุด, DMG สูงสุด |
| Option หลัก | dropdown + ค่า % · โชว์ **ทุกระดับยกเว้น Root Abyss** · ตัวเลือก: Crit DMG %, Boss ATK Increase %, Crit ATK, EXP Increase % |
| ระดับหมวก | **ไม่มี Genesis** (และไม่มี Dreamy Belt); มี Root Abyss ได้ |
| Flame | เปิด 2 แถว · พูล **Hat** (ตาราง Nexon 6459) |
| Potential | เปิด 3 แถว · พูล **Hat** (ตาราง Nexon 6439) |
| Bonus Potential | เปิด 3 แถว · พูล **Hat** (ตาราง Nexon 6439) |
| Emblem | เลือกได้เมื่อ item rank ≥ Unique · ต่ำกว่าถูกเคลียร์ |
| Soul | ไม่รองรับ |

## 3. โครงข้อมูล `GearItem`

เพิ่มฟิลด์พื้นฐานของเกราะ (ค่าเริ่มต้น 0 สำหรับช่องที่ไม่ใช้):

```ts
phyDefBase: number
magDefBase: number
maxHpBase: number
maxDamageBase: number
```

- **อาวุธ/Secondary** — ยังใช้ `atkBase` / `atkBonus`; ฟิลด์ใหม่ = 0 และไม่โชว์ใน UI
- **หมวก** — โชว์ 4 ช่องใหม่แทน ATK; `atkBase`/`atkBonus` = 0 และไม่โชว์
- `highTierOption` / `flameRank`+`mainLines` / `potential` / `bonusPotential` / `emblem` ใช้โครงเดิม
- Migration ใน `BuildContext`: เติมฟิลด์ใหม่ด้วย 0 ถ้าไม่มี

## 4. Category Profile / กฎช่อง

- ยังคง `hat ∈ armor` แต่เปิดความสามารถผ่าน slot override (helper รู้จัก `hat` เป็นกรณีพิเศษ):
  - `isFlameSlot('hat')` → true
  - `isPotentialSlot('hat')` → true (pot + bonus)
  - `supportsHatMainOption('hat')` → true
- `ranksForSlot('hat')` — ตัด `Genesis` ออกจากชุดแรงก์ high-tier ของ hat (คง Necro/Absolab/Arcane, Root Abyss, และแรงก์ปกติอื่น)
- `supportsEmblem('hat')` → true (คงเดิม) แต่ UI เกตด้วย rank ≥ Unique

## 5. พูลข้อมูลใหม่

### 5.1 `flameHat.ts` (ตาราง 6459 · ส่วน Hat)
ออฟ (ค่าไล่จาก Rare→Mythic ตามตาราง):
- `phyDefMaxHp`, `magDefMaxHp` — Fixed×Fixed → flat DEF
- `phyDefMaxMp`, `magDefMaxMp` — Fixed×Fixed → flat DEF
- `phyDefExp`, `magDefExp` — %×% → DEF%
- `phyDefBossAtk`, `magDefBossAtk` — %×% → DEF%
- `phyDefCritRate`, `magDefCritRate` — %×% → DEF%
- `phyDefCritDmg`, `magDefCritDmg` — %×% → DEF%
- `critDmgExp`, `critDmgBossAtk`, `critDmgCritRate` — %×% → Crit DMG% (ใช้ id เดิมได้)
- `ignoreDef` (DEF Ignore Rate) — Legendary/Mythic เท่านั้น → `ignoreDefPercent`

### 5.2 `potentialHat.ts` (ตาราง 6439 · Potential)
ออฟ + ค่าตามแรงก์ Rare/Epic/Unique/Legendary (first & later pools): PHY ATK Increase (%), MAG ATK Increase (%), Crit DMG RES (%), EVD (flat), ACC (%), Max HP (flat), Max MP (flat), Max HP (%), Max MP (%), Meso Acquisition Increase (%)

### 5.3 `bonusPotentialHat.ts` (ตาราง 6439 · Bonus Potential)
พูลแยก: PHY/MAG ATK Increase (%), Crit DMG RES (%), EVD (flat), ACC (%), Max HP/MP (flat), Max HP/MP (%), EXP Increase (%)

> หมายเหตุ: ใช้ค่าจากตารางเป็น "พูลค่าที่เลือกได้" (ไม่ใช้ prob.) เหมือน `potentialWeapon.ts`

### 5.4 Hat main option (dropdown)
`HAT_MAIN_OPTIONS`: Crit DMG (`critDmgPercent`), Boss ATK Increase (`bossAtkPercent`), Crit ATK (`critAtk`), EXP Increase (`expGainPercent`) — ใส่ค่าเอง · ปิดเมื่อ rank = Root Abyss

## 6. การรวมสเตต (`gearStatMap.ts`)

- เพิ่มการเก็บสเตตพื้นฐานเกราะ: `phyDef += phyDefBase`, `magDef += magDefBase`, `maxHp += maxHpBase`, `maxDamage += maxDamageBase`
- Emblem base boost (+30%) ใช้กับ **DEF เท่านั้น** (`phyDef`+`magDef` ของชิ้นนั้น) — ไม่บูสต์ HP/Max DMG
- Option หลักหมวก / Pot / Bonus / Emblem lines → `contributeLines` ตามเดิม
- แมป optionId ใหม่ใน `resolveGearOptionId`: Crit DMG RES → `critDmgReducePercent`, EVD → `evd`, EXP Increase → `expGainPercent` (ตรวจว่ามีครบ)

## 7. Flame engine (`flameScale.ts`)

ขยาย `applyFlameScales` รองรับ id ใหม่:
- `phyDefMaxHp`/`magDefMaxHp`/`phyDefMaxMp`/`magDefMaxMp` → flat `phyDef`/`magDef` (Fixed×Fixed)
- `phyDefExp`/…BossAtk/…CritRate/…CritDmg (+MAG) → `phyDefPercent`/`magDefPercent` (%×%)
- `ignoreDef` → `ignoreDefPercent`
- `AtkStatBag` ปัจจุบันไม่มี phyDef/magDef → ต้องขยาย bag ให้รองรับ หรือแยกเส้นทาง DEF flame

> ต้องตัดสินใจ: ขยาย `AtkStatBag` ให้มี def keys หรือให้ flame หมวกคืน `GearStatBag` แทน (ดูข้อ 9)

## 8. UI (`GearEditModal` / `GearSummaryPopup` / `GearDoll`)

- `slot === 'hat'`: แทนบล็อก ATK ด้วย 4 ช่อง DEF/HP/DMG
- Option หลัก: dropdown + ช่องค่า % (ต่างจากการ์ดเรดิโอของอาวุธ)
- Flame: reuse `FlameLineEditor` แต่ดึงพูลจาก `flameHat`
- Pot/Bonus: reuse `PotentialLineEditor` + พูล hat
- Emblem: ปุ่มเลือก/ลบ เปิดเมื่อ `rank ≥ Unique`; ต่ำกว่าแสดงข้อความ; ลดแรงก์ต่ำกว่า Unique → เคลียร์ emblem
- Summary/Doll: แสดง DEF/HP/DMG แทน ATK

## 9. จุดที่ต้องตัดสินใจตอน implement

- **DEF ใน bag**: `AtkStatBag` มีเฉพาะ atk keys. flame หมวกให้ผล DEF% / flat DEF ต้องไปลง `GearStatBag` (superset) ได้ แต่ `applyFlameScales` คืน `AtkStatBag`. แนวทาง: ให้ flame หมวกทำงานบน bag ที่กว้างขึ้น หรือเพิ่ม def keys ลง flame bag แล้ว merge เข้า gear bag. เลือกตอนเขียน plan.

## 10. การทดสอบ

- `flameHat.test.ts`: มีออฟ DEF, ค่าไล่ตามแรงก์, ignoreDef เฉพาะ Legendary/Mythic
- `potentialHat.test.ts` / `bonusPotentialHat.test.ts`: พูลถูกต้องตามแรงก์, bonus มี EXP Increase
- `gearStatMap` hat test: DEF/HP/DMG base เข้า bag, Emblem +30% เฉพาะ DEF
- `ranksForSlot('hat')`: ไม่มี Genesis; มี Root Abyss; Option หลักปิดเมื่อ Root Abyss
- เทสต์เดิมทั้งหมดต้องผ่าน
