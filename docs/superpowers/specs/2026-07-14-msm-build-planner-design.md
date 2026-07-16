# MSM Build Planner — Design Spec

**วันที่:** 2026-07-14  
**สถานะ:** รอรีวิวจากผู้ใช้ก่อนทำ implementation plan  
**สแตก:** Vite + React + TypeScript (SPA)

## 1. เป้าหมาย

สร้าง Build Planner แนว Path of Building สำหรับ MapleStory M โดย:

- แก้ **Build A / Build B** เทียบกันได้
- ตัวเลขหลักคือ **DPM / DPS โดยประมาณ** (บอส)
- Combat Power จากสูตร client เป็นตัวรอง
- เกียร์กรอกได้ครบชั้นเหมือนหน้าต่างไอเทมในเกม
- สกิลตามอาชีพ (ติ๊กเปิด/ปิด) แต่ % / hits / uptime กรอกมือใน MVP

## 2. การตัดสินใจที่ล็อกแล้ว

| หัวข้อ | ตัดสินใจ |
|--------|----------|
| ขอบเขต UI | ใกล้ PoB: Skill + Stat + Gear |
| เมตริกหลัก | Average boss DPM/DPS |
| เทียบ build | A vs B side-by-side + % |
| สกิล MVP | เลืออาชีพ → รายการสกิลหลัก ติ๊กได้ · กรอก % มือ |
| สแตก | Vite + React SPA · สูตรพอร์ตเป็น TS |
| เลย์เอาต์หลัก | C: แถบซ้าย + workspace + panel DPM ขวา |
| หน้า Gear | Equipment doll รอบตัวละคร (อิง UI ในเกม) |
| คลิกช่องเกียร์ | A: popup สรุป → ปุ่ม “แก้ไขรายละเอียด” → ฟอร์มเต็ม |
| ประเภท | = ช่องสวม (Main Weapon, Helmet, …) ไม่ใช่ชื่อรุ่นไอเทม |

## 3. เลย์เอาต์

```
┌────────┬──────────────────────────────┬─────────────┐
│ Gear   │  [A] [B]   Job ▾             │ DPM (ใหญ่)  │
│ Skill  │                              │ A / B / Δ%  │
│ Stat   │   workspace ตามแท็บซ้าย      │ CP (รอง)    │
│ Save   │                              │             │
└────────┴──────────────────────────────┴─────────────┘
```

### 3.1 แท็บ Gear

- ตัวละครตรงกลาง + ช่องเกียร์รอบตัว + แถวล่าง (medal/badge/… ตามที่รองรับใน MVP)
- แต่ละช่องแสดง badge ย่อ: เกรด Pot (L/E/…), ★, Lv, สถานะว่าง
- คลิกช่องที่มีของ → **Summary popup** (ชื่อ, ★, ATK รวม, บรรทัดสำคัญ, Emblem สั้นๆ)
- ปุ่ม **แก้ไขรายละเอียด** → **Edit modal** โครงตาม tooltip ในเกม
- คลิกช่องว่าง → เปิดฟอร์มสร้างชิ้นใหม่ (เลือกประเภทช่องล็อกตามช่องนั้น)

### 3.2 แท็บ Skill

- เลืออาชีพ
- รายการสกิลหลัก: checkbox, Skill%, hits, CD, uptime%
- รวม contribution → DPM

### 3.3 แท็บ Stat

- แสดงสถิติรวมหลังรวมเกียร์ + ค่าที่ override ด้วยมือได้
- ช่องหลัก: ATK, ATK%, DMG%, Boss%, CritRate, CritDMG, Final%

### 3.4 Panel ขวา

- DPM ของ build ที่กำลังแก้ (ใหญ่)
- DPM ของ A และ B
- Δ% (B vs A หรือ active vs other)
- CP รอง

## 4. โมเดลข้อมูล

### 4.1 Build

```ts
type BuildId = 'A' | 'B'

interface Build {
  id: BuildId
  name: string
  jobId: string
  skills: SkillEntry[]
  gear: Partial<Record<GearSlotId, GearItem | null>>
  /** manual overrides / aggregates shown in Stat tab */
  statOverrides?: Partial<AggregatedStats>
}
```

### 4.2 GearSlotId (ประเภทช่อง)

รวมอย่างน้อย (ขยายได้ภายหลัง):

- `mainWeapon`, `secondary`
- `hat`, `outfit`, `gloves`, `shoes`, `cape`, `shoulder`, `belt`
- `earrings`, `eye`, `face`
- `ring1`…`ring4`, `pendant1`, `pendant2`
- แถวล่าง MVP: `medal`, `badge`, `android`, `heart`, `pocket` — แสดงช่องครบ; ถ้ายังไม่มีแคตตาล็อก ช่องนั้นกรอกชื่อ/สเตตแบบอิสระได้

### 4.3 GearItem (ฟอร์มเต็ม)

อิงหน้าต่างไอเทมจริง (ตัวอย่าง AbsoLab Eclipse Pendulum):

| ส่วน | ฟิลด์ |
|------|--------|
| Meta | `slotId`, `itemId`/`itemName`, `rank`, `level`, `star` (0–30) |
| ATK | `atkBase`, `atkBonus` → total; phys/mag ตามอาชีพ |
| สายบนชิ้น | รวม `lines[]` เช่น Crit DMG%, Flame (เช่น PHY ATK ตาม Boss ATK) |
| Potential | `grade`, `lines[3]` = `{ optionId, value }` |
| Bonus Potential | `grade`, `lines[2..3]` |
| Emblem | `typeId`, `level`, `effects[]` (เช่น base options +30%, Crit DMG 5%) |
| Soul | `soulId`, `stat`, `skillId?` |
| Set | derive จาก `itemId` เซ็ตเดียวกันที่สวมอยู่ |
| Optional meta | karma/fail counts — **ไม่บังคับ MVP** (ไม่เข้า DPM) |

**ประเภท (slot)** ≠ **ชื่อไอเทม**  
แคตตาล็อกชื่อไอเทมกรองตาม `slotId`

### 4.4 SkillEntry

```ts
interface SkillEntry {
  skillId: string
  enabled: boolean
  skillPercent: number  // UI/เกมสไตล์: 850 = 850% skill damage (engine แปลง /100)
  hitCount: number
  cooldownSec: number
  uptimePercent: number // 0–100
}
```

### 4.5 AggregatedStats → Engine

รวมจากเกียร์ + overrides → ป้อน:

- `calc_renewal_combat` (CP)
- `calc_damage_line` ต่อสกิลที่เปิด → รวมเป็น DPM ตาม hits/CD/uptime

## 5. สูตร (อ้างอิงที่มีแล้ว)

รายละเอียดใน `docs/FORMULA_COMBAT.md` และ `sim/`:

- **CP:** จาก `Combat.GetRenewalCombat` (Boss weight 0.3, crit base +20%, …)
- **Damage line:** โมเดล sheet คอมมูนิตี้ (ประมาณการ — ระบุใน UI ว่าเป็น estimate)
- **DPM:** จาก average line × hits / cycle ตาม uptime·CD ของแต่ละสกิลที่เปิด

หมายเหตุ: ดาเมจจริงอยู่ฝั่งเซิร์ฟเวอร์ · planner เป็นเครื่องมือ theorycraft

## 6. Datamine vs กรอกมือ

| Datamine / แคตตาล็อก | ผู้เล่นกรอก |
|----------------------|-------------|
| รายการช่อง + ไอเทมตามช่อง | ★, flat ATK base/bonus |
| รายการออฟ Flame / Pot / Emblem / Soul | ค่าตัวเลขที่สุ่มได้ |
| base ATK ช่วง / rank ของไอเทม | เกรด Pot ที่ลงจริง, Emblem Lv |

**Phase data**

1. MVP: UI + schema + seed แคตตาล็อกเล็ก (มือ/CSV)
2. ต่อไป: เติมจาก dump/table เมื่อแตกไฟล์ข้อมูลได้

## 7. Persistence

- `localStorage` เก็บ Build A/B ทั้งก้อน (JSON)
- ปุ่ม Save / Export JSON / Import JSON ใน MVP
- ยังไม่มี sync บัญชี / คลาวด์

## 8. นอกขอบเขต MVP

- Datamine ครบอัตโนมัติทุกแพตช์
- ตารางสกิล damage จาก client แบบไม่ต้องกรอก %
- บัฟปาร์ตี้ / อาหารเต็มระบบ
- Rotation editor ละเอียดระดับ tick
- Mobile app native
- ตัวเลข DPM รับประกันตรง server 100%

## 9. การทดสอบ

- คง unit tests Python ใน `sim/`
- เพิ่มเทสต์ TS ให้เคสหลักตรงกับ Python (oracle)
- Smoke: เปิดแอป → ใส่เกียร์ตัวอย่างจากสกรีน → ได้ DPM / เทียบ A/B

## 10. Wireframe อ้างอิง

เซสชัน brainstorm: `.superpowers/brainstorm/48144-1784070603/content/`

- `layout.html` — เลย์เอาต์ C
- `design-section3b-item-form.html` — ฟอร์มไอเทม
- `layout-gear-doll.html` — doll + popup สรุป

## 11. ขั้นถัดไปหลังอนุมัติ spec

1. เขียน implementation plan (`writing-plans`)
2. Scaffold Vite/React ใน `planner/` (หรือชื่อเทียบเท่า)
3. พอร์ต engine → ต่อ Gear doll + popup + compare panel
