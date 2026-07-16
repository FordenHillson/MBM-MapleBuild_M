# MSM Build Planner — Equip Category Profile Design

**วันที่:** 2026-07-16  
**สถานะ:** อนุมัติแล้ว (สนทนาก่อน implement) · กิ่ง `feature/equip-category-profile`  
**สแตก:** Vite + React + TypeScript (planner)

## 1. เป้าหมาย

สร้าง **Category Profile** เป็นศูนย์กลางความสามารถของอุปกรณ์ (flat categories) เพื่อลดการกระจายของ `isFlameSlot` / `isPotentialSlot` / `supports*` และเตรียมชั้น **ItemPrefab** ในเฟสถัดไป

## 2. การตัดสินใจที่ล็อกแล้ว

| หัวข้อ | ตัดสินใจ |
|--------|----------|
| ขอบเขตเฟส 1 | Capability profile เท่านั้น · ยังไม่มี ItemPrefab |
| รูปแบบหมวด | Flat: `weapon` / `secondary` / `armor` / `accessory` / `misc` |
| belt | ∈ `accessory` (emblem default boost = 0) |
| พูลค่าออฟ | ยังอยู่ไฟล์เดิม · เปิด/ปิดผ่าน profile |
| สืบทอดซ้อนระหว่างหมวด | ไม่ทำ |
| รูป `GearItem` / localStorage | ไม่เปลี่ยนในเฟส 1 |

## 3. Category Profile

### 3.1 หมวด ↔ ช่อง

| Category | ช่อง |
|----------|------|
| `weapon` | `mainWeapon` |
| `secondary` | `secondary` |
| `armor` | hat, gloves, outfitTop, outfitBottom, shoulder, shoes, cape |
| `accessory` | ring1–4, pendant1–2, earrings, face, eye, **belt** |
| `misc` | title, badge, medal, socket |

### 3.2 โครงข้อมูล

```ts
type EquipCategory = 'weapon' | 'secondary' | 'armor' | 'accessory' | 'misc'
type MainLinesMode = 'flame' | 'free' | 'none'

interface CategoryProfile {
  category: EquipCategory
  flame: { enabled: boolean; lineCount: number }
  potential: { enabled: boolean; lineCount: number }
  bonusPotential: { enabled: boolean; lineCount: number }
  emblem: { enabled: boolean; defaultBaseBoostPercent: number }
  soul: { enabled: boolean }
  highTierOption: { enabled: boolean }
  sharenianAbility: { enabled: boolean }
  mainLinesMode: MainLinesMode
}
```

Lookup: `slotCategory(slot)` → `slotProfile(slot)`

### 3.3 ค่าเริ่มต้นเฟส 1 (สะท้อนพฤติกรรมปัจจุบัน + belt)

| | weapon | secondary | armor | accessory | misc |
|--|--------|-----------|-------|-----------|------|
| flame | ✓ 2 | ✓ 2 | — | — | — |
| potential | ✓ 3 | ✓ 3 | — | — | — |
| bonusPotential | ✓ 3 | ✓ 3 | — | — | — |
| emblem | ✓ +30% | ✓ +30% | ✓ +30% | ✓ **0%** | — |
| soul | ✓ | ✓ | — | — | — |
| highTierOption | ✓ (rank gate) | — | — | — | — |
| sharenianAbility | — | ✓ (rank gate) | — | — | — |
| mainLinesMode | flame | flame | free | free | none |

## 4. กฎ slot / rank (นอก profile)

- **CategoryProfile** = หมวดนี้ *รองรับ* ระบบอะไร
- **Rank gates** = เปิดจริงเมื่อ rank ถึง (high-tier, Sharenian Unique+)
- **Slot rules** = Dreamy Belt เฉพาะ `belt`; Root Abyss ตาม `ROOT_ABYSS_SLOTS`
- **Pair lock** = outfitTop ↔ outfitBottom — helper แยก ไม่เข้า profile
- `ranksForSlot` ยังเป็น API หลักของ UI

## 5. Migration เฟส 1

1. เพิ่ม `planner/src/data/equipCategory.ts` (+ เทสต์)
2. ห่อ helpers เดิมให้อ่านจาก profile:
   - `isFlameSlot` ← `flame.enabled`
   - `isPotentialSlot` ← `potential.enabled`
   - `supportsEmblem` / `slotEmblemCategory` / `defaultBaseBoost` ← emblem block
   - `isSoulSlot` ← `soul.enabled`
   - `supportsHighTierOption` / `supportsSharenianAbility` ← profile + rank gate
3. ย้าย belt ออกจาก armor เข้า accessory ใน map เดียวกับ profile
4. ไม่บังคับให้ UI เรียก `slotProfile` ทุกจุดในเฟส 1 — helpers เดิมยัง export ได้

## 6. เฟส 2 (นอกขอบเขตกิ่งนี้)

`ItemPrefab` ผูก `category` + `allowedSlots` + base stats → seed `GearItem` ตอนสร้างชิ้นใหม่

## 7. การทดสอบ

- เทสต์ใหม่: map หมวด, belt = accessory + boost 0, โปรไฟล์ weapon/secondary
- เทสต์เดิมของ flame / potential / high-tier / sharenian / soul / emblem ต้องผ่าน
