# MSM Build Planner

Vite + React SPA ตาม spec ใน `docs/superpowers/specs/2026-07-14-msm-build-planner-design.md`

## รัน

```bash
cd planner
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ http://localhost:5173)

## สิ่งที่มีใน MVP

- Build A / B + แผง DPM เทียบ %
- แท็บ Gear: equipment doll → popup สรุป → แก้ไขรายละเอียด
- แท็บ Skill: อาชีพ + ติ๊กสกิล / กรอก %
- แท็บ Stat: รวมจากเกียร์ + override
- Save: localStorage + export/import JSON
- Build A มีตัวอย่าง AbsoLab Eclipse Pendulum จากสกรีน

## เทสต์สูตร

```bash
npm test
```
