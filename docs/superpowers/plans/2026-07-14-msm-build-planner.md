# MSM Build Planner Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Vite/React SPA ที่แก้ Build A/B, กรอกเกียร์แบบ doll+popup, คำนวณ DPM หลักและ CP รอง

**Architecture:** Client-only React state (A/B builds) + TS engine พอร์ตจาก `sim/` + Gear doll → summary popup → edit modal · localStorage

**Tech Stack:** Vite, React 19, TypeScript, CSS modules / plain CSS (no UI kit)

---

### Task 1: Scaffold + engine port
- Create: `planner/` Vite app
- Create: `planner/src/engine/combatPower.ts`, `damageLine.ts`, `dpm.ts`
- Create: `planner/src/engine/combatPower.test.ts` (vitest)
- [ ] Scaffold vite-react-ts
- [ ] Port formulas; match Python test cases
- [ ] `npm test` pass

### Task 2: Types + build state
- Create: `planner/src/types/build.ts`, `gear.ts`
- Create: `planner/src/state/useBuildStore.ts` (useState+context หรือ zustand เบาๆ)
- Create: seed Night Lord skills + empty gear slots
- [ ] localStorage load/save

### Task 3: Shell layout
- Create: App shell — left nav, A/B toggle, right DPM panel
- [ ] Tabs Gear / Skill / Stat
- [ ] Live DPM/CP recalculation

### Task 4: Gear doll + popups
- Create: `GearDoll`, `GearSummaryPopup`, `GearEditModal`
- [ ] Click slot → summary → edit details
- [ ] Empty slot → create form
- [ ] Aggregate gear into stats

### Task 5: Skill + Stat tabs
- [ ] Skill list toggles + manual %
- [ ] Stat totals / overrides
- [ ] Demo data from AbsoLab pendulum example

### Task 6: Polish + verify
- [ ] `npm run build` succeeds
- [ ] Document run instructions in planner/README.md
