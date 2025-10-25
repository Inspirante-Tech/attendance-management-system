# Marks System Migration TODO

## Status: PARTIALLY MIGRATED ⚠️

The new marks schema (TestComponent + StudentMark) is **fully functional** but some routes still use the old schema.

---

## ✅ Completed Migrations

1. **Admin Marks Routes** - `/backend/src/routes/admin/marksRoutes.ts`
   - Fully migrated to new schema
   - All CRUD operations working
   - Validates marks against test component max marks
2. **Import Routes** - `/backend/src/routes/admin/importRoutes.ts`
   - Fixed to query TestComponent instead of theoryMarks/labMarks

---

## ❌ Pending Migrations (WILL BREAK!)

### 1. Teacher Marks Routes - `/backend/src/routes/teacher/marksRoutes.ts`

**Current Issues:**

- Uses `prisma.theoryMarks` and `prisma.labMarks` (tables don't exist!)
- Hardcoded field names: `mse1_marks`, `mse2_marks`, etc.
- Cannot handle flexible test components

**Required Changes:**

```typescript
// OLD (will crash):
await prisma.theoryMarks.upsert({
  where: { enrollmentId },
  update: { mse1Marks: 85 },
});

// NEW (correct):
await prisma.studentMark.upsert({
  where: {
    enrollmentId_testComponentId: {
      enrollmentId,
      testComponentId: "uuid-of-mse1-component",
    },
  },
  update: { marksObtained: 85 },
});
```

**Action Items:**

- [ ] Rewrite `PUT /marks/:enrollmentId` to use StudentMark
- [ ] Rewrite `GET /marks` to fetch from StudentMark + TestComponent
- [ ] Remove hardcoded field references (mse1_marks, etc.)
- [ ] Use admin marks route logic as reference

---

### 2. Import Service - `/backend/src/services/importService.ts`

**Current Issues:**

- Lines 745 & 800: Creates theoryMarks and labMarks records
- CSV import will fail if using new schema

**Required Changes:**

- [ ] Update CSV format to include test component IDs or names
- [ ] Create TestComponents during import (or require them to exist)
- [ ] Create StudentMarks instead of theoryMarks/labMarks

---

### 3. Dump/Clear Routes - `/backend/src/routes/admin/dumpRoutes.ts`

**Current Issues:**

- Lines 314-315: Tries to delete theoryMarks and labMarks

**Required Changes:**

```typescript
// Replace:
await prisma.theoryMarks.deleteMany({});
await prisma.labMarks.deleteMany({});

// With:
await prisma.studentMark.deleteMany({});
await prisma.testComponent.deleteMany({});
```

---

## Testing Checklist

Once migrations are complete:

- [ ] **Teacher can view marks**: GET /api/teacher/marks
- [ ] **Teacher can update marks**: PUT /api/teacher/marks/:enrollmentId
- [ ] **Admin can create test components**: POST /api/admin/offerings/:offeringId/components
- [ ] **Admin can view marks**: GET /api/admin/marks
- [ ] **Admin can update marks**: PUT /api/admin/marks/:enrollmentId
- [ ] **CSV import creates marks correctly**
- [ ] **Database clear doesn't reference old tables**

---

## Migration Priority

1. **HIGH**: Teacher marks routes (breaks teacher functionality)
2. **MEDIUM**: Dump routes (breaks database clear)
3. **LOW**: Import service (only needed for CSV import feature)

---

## Schema Verification

Run this query to confirm old tables are gone:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('theory_marks', 'lab_marks');
```

Expected result: **0 rows** (tables removed)

---

## New Schema Benefits

✅ **Flexibility**: No longer limited to MSE1, MSE2, MSE3
✅ **Extensibility**: Can add any test type (Quiz, Assignment, Project)
✅ **Type Safety**: Separate theory/lab via `type` field
✅ **Validation**: Max marks enforced per test component
✅ **Consistency**: Single source of truth for test definitions
