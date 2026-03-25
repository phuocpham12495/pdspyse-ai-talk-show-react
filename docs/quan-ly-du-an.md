# 📊 Quản Lý Dự Án - Pdspyse AI Talk Show

> **Vai trò:** Quản Lý Dự Án
> **Nhiệm vụ:** Kế hoạch triển khai, ưu tiên, phụ thuộc, rủi ro

---

## Phân tích tính năng (cập nhật 2026-03-25)

```json
{
  "features": [
    { "id": "F01", "name": "Authentication (Login/Register/Logout)", "priority": "P0", "sprint": 1, "status": "done" },
    { "id": "F02", "name": "Talk Show Generator (Gemini 2.5 Flash)", "priority": "P0", "sprint": 1, "status": "done" },
    { "id": "F03", "name": "Save Episode with metadata", "priority": "P0", "sprint": 1, "status": "done" },
    { "id": "F04", "name": "Episode List & Detail View", "priority": "P1", "sprint": 2, "status": "done" },
    { "id": "F05", "name": "Episode Filter (tags, mood) & Sort", "priority": "P1", "sprint": 2, "status": "done" },
    { "id": "F06", "name": "Delete Episode with confirmation", "priority": "P1", "sprint": 2, "status": "done" },
    { "id": "F07", "name": "Custom Persona Builder", "priority": "P1", "sprint": 3, "status": "done" },
    { "id": "F08", "name": "Persona Management (save/reuse)", "priority": "P1", "sprint": 3, "status": "done" },
    { "id": "F09", "name": "Public Feed with pagination", "priority": "P2", "sprint": 4, "status": "done" },
    { "id": "F10", "name": "Like/Comment/Share interactions", "priority": "P2", "sprint": 4, "status": "done" },
    { "id": "F11", "name": "User Profile + App Settings", "priority": "P2", "sprint": 4, "status": "done" },
    { "id": "F12", "name": "Responsive Design (mobile-first)", "priority": "P2", "sprint": 5, "status": "done" },
    { "id": "F13", "name": "PWA (manifest + Service Worker)", "priority": "P3", "sprint": 5, "status": "done" },
    { "id": "F14", "name": "Offline Mode (caching)", "priority": "P3", "sprint": 5, "status": "done" },
    { "id": "F15", "name": "Online/Offline Detection", "priority": "P3", "sprint": 5, "status": "done" },
    { "id": "F16", "name": "Push Notifications (SW)", "priority": "P3", "sprint": 6, "status": "done" },
    { "id": "F17", "name": "Supabase Backend Setup", "priority": "P0", "sprint": 1, "status": "done" }
  ]
}
```

## Tiến độ Sprint

### Sprint 1 (P0 - Foundation) ✅
- [x] Vite + React + TS scaffold
- [x] Supabase project + migration (7 bảng, RLS, triggers)
- [x] Auth: Login, Register, ProtectedRoute
- [x] AppLayout + 10 routes
- [x] Generator: Form → Edge Function (Gemini 2.5 Flash) → Output
- [x] Save episode with tags/mood

### Sprint 2 (P1 - Episode Management) ✅
- [x] EpisodeList (Table + pagination)
- [x] EpisodeDetail (full content view)
- [x] EpisodeFilterBar (tag + mood filters)
- [x] Sort (topic, datetime asc/desc)
- [x] Delete with Modal.confirm

### Sprint 3 (P1 - Personas) ✅
- [x] PersonaBuilder form
- [x] PersonaList grid cards
- [x] 5 default personas seeded

### Sprint 4 (P2 - Social) ✅
- [x] PublicFeed with pagination (10/page)
- [x] EpisodeCard with Like/Comment/Share buttons
- [x] EpisodeDetail social section (public mode)
- [x] CommentSection
- [x] ProfilePage + app_settings (notifications, theme, language)
- [x] Logout button on profile

### Sprint 5 (P2-P3 - PWA + Polish) ✅
- [x] manifest.json + meta tags
- [x] Service Worker (cache-first static, network-first API)
- [x] Online/offline detection (useOnlineStatus hook)
- [x] Push notification handler in SW
- [x] notificationService

### Giai đoạn 3 — Bug Fixes & Polish ✅ (2026-03-25)
- [x] Sửa `package.json` name thành `pdspyse-ai-talk-show`
- [x] Tạo Supabase Storage bucket `avatars` với RLS policies
- [x] Responsive UI: LoginForm, RegisterForm, GeneratorForm, EpisodeFilterBar (maxWidth + width:100% + minWidth)
- [x] Kết nối notification Switch trong ProfilePage với `notificationService.requestPermission()` + `registerServiceWorker()`
- [x] Thêm Zustand `persist` middleware vào `episodeStore` (localStorage cache cho US015)

### Sprint 6 (Tương lai) ⏳
- [ ] Code-splitting (React.lazy)
- [ ] Supabase Realtime cho live likes/comments
- [ ] E2E tests với Playwright
- [ ] Deploy lên Vercel/Netlify

## Đồ thị phụ thuộc

```
Supabase Setup (F17)
  └── Authentication (F01)
      ├── Generator + Gemini (F02) → Save Episode (F03)
      │   ├── Episode List (F04) → Filter/Sort (F05) + Delete (F06)
      │   └── Public Feed (F09) → Social (F10)
      ├── Persona Builder (F07) → Persona Mgmt (F08)
      └── Profile + Settings (F11)

PWA Layer (independent):
  ├── Manifest + SW (F13)
  ├── Offline Mode (F14)
  ├── Online Detection (F15)
  └── Push Notifications (F16)
```

## Đánh giá rủi ro (cập nhật)

| Rủi ro | Mức độ | Trạng thái | Giảm thiểu |
|--------|--------|-----------|------------|
| Gemini API downtime | Cao | ✅ Đã xử lý | Error handling + user message |
| API key bị lộ | Cao | ✅ Đã xử lý | Vault + Edge Function proxy |
| Bundle size lớn | Trung bình | ⚠️ 471KB | Code-splitting cần làm |
| vite-plugin-pwa lỗi | Thấp | ✅ Đã xử lý | Manual Service Worker |
| Edge Function cold start | Trung bình | ✅ Đã xử lý | Loading spinner UX |
| Offline data stale | Thấp | ✅ Đã xử lý | SW cache + online status |
