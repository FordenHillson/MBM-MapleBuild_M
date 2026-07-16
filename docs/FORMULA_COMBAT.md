# MapleStory M — สูตร Combat / Damage (จาก client dump)

แหล่งหลัก: disassembly ของ `GameAssembly.dll` ผ่าน Il2CppDumper RVA  
วันที่วิเคราะห์: 2026-07-14

## สรุปสั้น

| ฟังก์ชัน | ทำอะไรจริงๆ |
|----------|----------------|
| `Combat.GetExpectedDamage()` | **ไม่คำนวณ** — อ่านค่าที่ sync มาแล้ว (`object+0x48`) |
| `Combat.GetRenewalCombat()` | คำนวณ **Combat Power (CP)** จากสถิติบน client |
| ดาเมจต่อ hit จริง | อยู่ฝั่ง **server** — ใช้สูตรคอมมูนิตี้ + verify ในเกม |

---

## 1) Renewal Combat Power (`GetRenewalCombat`)

RVA: `0x39CA690`

### 1.1 เลือก Phys vs Mag

ตาม job type:

- Phys → `Stat.GetAttack` / `GetAttackPermill` / `GetDamageIncressPermill`
- Mag → `Stat.GetMagicAttack` / `GetMagicAttackPermill` / `GetMagicDamageIncreasePermill`

### 1.2 แปลงหน่วย raw → ratio

| Stat | หารด้วย | หมายเหตุ |
|------|---------|----------|
| ATK% / DMG% / BossATK% / CritDMG% | **100_000** | permyriad-scale |
| TotalDamageAdd (Final%) | **1_000** | permille |
| Crit Rate | **1_000** | และ **cap ที่ 1000** (= 100%) |

### 1.3 Crit expected multiplier

```text
critRate01 = min(critRateRaw + baseCritFromResult, 1000) / 1000
critMult   = (critDmgRatio + 0.20) * critRate01
```

เทียบเท่า average:

```text
(1 - CR) * 1.0 + CR * (1.20 + CritDMG)
= 1 + CR * (0.20 + CritDMG)
```

Base crit damage ใน client = **+20%** (ตรงกับ sheet ปี 2020)

### 1.4 สูตรหลัก (ก่อน job scale)

ค่าคงที่จาก float ใน binary: **0.3**, **1.0**, **0.20**

```text
atkTerm = (atk% + 0.3) + (boss% * 0.3)

raw =
    atkTerm
  * ATK
  * (1 + dmg%)
  * (1 + final%)
  * (1 + critMult)
```

หมายเหตุสำคัญ:

- โหมด CP ใช้ **Boss × 0.3** ไม่ใช่ ×2.5 ของเครื่องคิดเก่า
- ไม่มี `Skill%` ใน CP — CP เป็น proxy ของพลังรวม ไม่ใช่ DPS สกิลเดียว
- `ATK` = GetAttack(option) + `User.Result` field เสริม

### 1.5 Job / Damage-limit scale

```text
scale = pow(jobCoeff, totalDamageLimitIncrease / 1e8)
CP    = int(raw * scale)
```

- `jobCoeff` = float ที่ offset `+0x330` ของ object ที่ดึงจาก static context
- `0x4ee210` = native `pow`

---

## 2) Expected Damage ใน UI

`GetExpectedDamage` แค่:

1. เช็ค flag / content unlock (`Define.get_Item(0xA97)`)
2. เดิน pointer chain → อ่าน `int64` ที่ `+0x48`

ค่า ED จริงน่าจะมาจาก server / snapshot ที่ `UpdateCombatExpectedDamage` อัปเดต  
**ยังไม่ใช่สูตรดาเมจในสนามรบ**

---

## 3) สูตรดาเมจสาย (คอมมูนิตี้ sheet / สำหรับ sim DPS)

อ้างอิง `docs/_sheet_extract.txt` (อัปเดต ~2020) — ใช้ประมาณ DPS ยังต้อง verify กับแพตช์ปัจจุบัน

```text
NonCrit(Boss) =
    ATK
  * (1 + DMG%)
  * (1 + ATK% + Skill% * BossATK%)
  * Skill%
  * (1 + Final%)

CritLine = NonCrit * (1 + 0.20 + CritDMG%)

Average =
    (1 - CritRate) * NonCrit
  + CritRate * CritLine
```

ข้อต่างจาก CP client:

| | Client CP | Sheet DPS |
|--|-----------|-----------|
| Boss weight | ×0.3 บวกเข้า ATK% | `Skill% × Boss%` ในวงเล็บ |
| Skill% | ไม่มี | คูณสองจุด |
| Crit | expected ใน CP | แยก noncrit/crit แล้วเฉลี่ย |

---

## 4) Option enum ที่เกี่ยว (ย่อ)

ไฟล์อ้างอิงเต็มใน `dump/output/dump.cs`

**EPermill (สำคัญ):**

- `AttackPermill = 0`
- `DamageIncreasePermill = 2`
- `CriticalDamageIncreasePermill = 4`
- `MagicAttackPermill = 6`
- `MagicDamageIncreasePermill = 8`
- `BossAttackPermill = 10`
- `UserAttackPermill = 12`
- `BonusDamagePermill = 78`
- `GuardDefenseDisregardPermill = 210`

**EInteger (สำคัญ):**

- `Attack = 0`, `MagicAttack = 14`
- `CriticalIncreaseProbability = 11`
- `TotalDamageLimitIncrease = 146`
- `DamageAddPermill = 116` / `LastFinalDamagePermill = 197`

---

## 5) ไฟล์ใน repo

| Path | หน้าที่ |
|------|---------|
| `tools/disasm_combat.py` | disasm ฟังก์ชัน Combat |
| `docs/disasm_combat.txt` | ผล disasm |
| `sim/combat_power.py` | implement สูตร CP จาก binary |
| `sim/damage_line.py` | สูตร DPS ตาม sheet |
| `sim/test_formula.py` | unit tests |
