# Convex DB Notes (Northstar MVP)

**Indexes you'll actually use:**
- Users: `by_clerkId` to map Clerk → user row.
- Terms: `by_user`, `by_user_status`, `by_user_name` (search).
- Courses: `by_user_term` (list by term), `by_user_code` / `by_user_title` (search).
- Assignments: `by_user_course` (course detail), `by_user_status_due` (Due Soon), `by_user_due` (calendar/week), `by_user_title` (search).
- Files: `by_user_parent` (list under course/assignment), `by_user_name` (search).
- All entities: `by_purgeAt` to purge soft-deleted rows.

**Soft-delete / purge:**
- On delete: set `softDeletedAt = now`, `purgeAt = now + 30d`.
- Undo window: allow restore if `now <= softDeletedAt + 7d` (you may compute this at runtime; a separate field isn't required).
- A daily job can query each table with `withIndex("by_purgeAt", q => q.lte("purgeAt", now))` and permanently delete.

**Search (metadata):**
- Always write/update `lc_*` fields server-side: e.g., `lc_title = title.toLowerCase()`.
- To search, filter by `userId` with an index, then `startsWith/includes` on the `lc_*` field in JS (Convex filters on the server).

**Time fields:**
- Use epoch milliseconds for `createdAt`, `dueAt`, `uploadedAt`, `softDeletedAt`, `purgeAt`.
- Use ISO `YYYY-MM-DD` strings only for term `startDate`/`endDate` where UX benefits.

**Validation:**
- Use Zod on the client, and re-validate on the server with simple checks + `containsObviousPII()` where relevant.