# Equip Category Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม Category Profile กลาง (flat) แล้วห่อ helpers ความสามารถของช่องเกียร์ให้อ่านจากโปรไฟล์ รวมย้าย belt → accessory

**Architecture:** `equipCategory.ts` เป็นแหล่งความจริงของ `EquipCategory` + `CategoryProfile` · helpers เดิม (`isFlameSlot`, `supportsEmblem`, …) เป็น thin wrappers · พูลออฟและ `GearItem` ไม่เปลี่ยน

**Tech Stack:** TypeScript, Vitest, โค้ดใน `planner/src/data/`

**กิ่ง:** `feature/equip-category-profile` (rebase เข้า master ทีหลังเมื่อพร้อม)

---

### Task 1: `equipCategory` module + tests

**Files:**
- Create: `planner/src/data/equipCategory.ts`
- Create: `planner/src/data/equipCategory.test.ts`

- [x] **Step 1: Write failing tests** for slot→category map (belt=accessory), profile flags, `defaultBaseBoost` via profile for belt=0 / hat=30
- [x] **Step 2: Implement `equipCategory.ts`**
- [x] **Step 3: Run `npx vitest run src/data/equipCategory.test.ts` — pass**
- [ ] **Step 4: Commit** (เมื่อผู้ใช้ขอ หรือจบชุดงานบนกิ่งนี้)

### Task 2: Wire existing helpers

**Files:**
- Modify: `flameWeapon.ts`, `potentialWeapon.ts`, `highTierOption.ts`, `sharenianAbility.ts`, `souls.ts`, `emblems.ts`

- [x] **Step 1: Point each support helper at `slotProfile`**
- [x] **Step 2: Remove local ARMOR/ACCESSORY sets from emblems; use category map**
- [x] **Step 3: Run related vitest files — all pass**

### Task 3: Spec self-check

- [x] Confirm design doc matches code (belt accessory, flat categories)
- [x] No `GearItem` shape change
