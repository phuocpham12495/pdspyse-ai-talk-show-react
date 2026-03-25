# 🏗️ Bản Ghi Quyết Định Kiến Trúc (ADR) - Pdspyse AI Talk Show

> **Vai trò:** Kiểm Toán Kiến Trúc
> **Nhiệm vụ:** Ghi lại quyết định kiến trúc cho mỗi module

---

## ADR-001: Build Tool - Vite 8

- **Trạng thái:** Đã chấp nhận
- **Mẫu thiết kế:** Module bundler với Rolldown
- **Dependencies:** `vite@^8.0.1`, `@vitejs/plugin-react`
- **Đánh đổi:**
  - ✅ HMR <50ms, build ~1s (warm)
  - ✅ TypeScript native
  - ⚠️ `vite-plugin-pwa` chưa tương thích → dùng manual Service Worker

## ADR-002: UI Library - Ant Design 5

- **Trạng thái:** Đã chấp nhận
- **Dependencies:** `antd`, `@ant-design/icons`
- **Đánh đổi:**
  - ✅ Component đầy đủ, theme customization, locale vi_VN
  - ⚠️ Bundle size ~471KB gzipped → cần code-splitting tương lai

## ADR-003: State Management - Zustand

- **Trạng thái:** Đã chấp nhận
- **Dependencies:** `zustand`
- **Stores:** `authStore`, `generatorStore`, `episodeStore`, `personaStore`, `feedStore`
- **Đánh đổi:**
  - ✅ API đơn giản, selective re-renders, TypeScript tốt
  - ⚠️ Không có DevTools mạnh như Redux

## ADR-004: Backend - Supabase (ap-southeast-1)

- **Trạng thái:** Đã chấp nhận | **Project ID:** `tvearuykhzwtbpzzomvr`
- **Dependencies:** `@supabase/supabase-js`
- **Services sử dụng:** Auth, PostgreSQL, Storage, Edge Functions, Vault
- **Database:** 7 bảng với RLS, 2 triggers (auto user profile, auto updated_at)
- **Đánh đổi:**
  - ✅ All-in-one BaaS, RLS security, auto-generated SDK
  - ⚠️ Vendor lock-in, Edge Function cold start

## ADR-005: AI Engine - Google Gemini 2.5 Flash

- **Trạng thái:** Đã chấp nhận
- **Triển khai:** Supabase Edge Function `generate-talk-show`
- **API Key:** Lưu trong Supabase Vault (bảo mật)
- **Prompt:** Structured JSON output với `responseMimeType: 'application/json'`
- **Đánh đổi:**
  - ✅ Nhanh, rẻ, hỗ trợ structured output native
  - ✅ Không expose API key phía client
  - ⚠️ Phụ thuộc Google API availability

## ADR-006: Service Layer Pattern

- **Trạng thái:** Đã chấp nhận
- **Cấu trúc:** `Component → Store → Service → Supabase`
- **Services:** auth, generator, episode, persona, social, profile, notification
- **Đánh đổi:**
  - ✅ Tách biệt logic, dễ test/mock, dễ thay backend
  - ⚠️ Thêm abstraction layer

## ADR-007: PWA - Manual Service Worker

- **Trạng thái:** Đã chấp nhận
- **Lý do:** `vite-plugin-pwa` không tương thích Vite 8
- **Triển khai:** `public/service-worker.js` thủ công
- **Caching:** Cache-first cho static, network-first cho API
- **Push:** Web Push API + SW push event handler
- **Đánh đổi:**
  - ✅ Hoạt động với Vite 8, kiểm soát hoàn toàn
  - ⚠️ Không có Workbox utilities, phải tự quản lý cache

## ADR-008: Routing - React Router v7 Nested Routes

- **Trạng thái:** Đã chấp nhận
- **10 routes:** 2 public (login/register) + 8 protected (nested trong AppLayout)
- **Route guard:** `ProtectedRoute` component kiểm tra auth state
- **Đánh đổi:**
  - ✅ Outlet pattern chia sẻ layout, clean URL structure
  - ⚠️ Không SSR

## ADR-008: Zustand Persist Middleware cho Offline Caching

- **Trạng thái:** Đã chấp nhận
- **Bối cảnh:** US015 yêu cầu "các talk show đã xem trước đó có thể truy cập offline"
- **Quyết định:** Dùng `zustand/middleware` persist với `partialize` chỉ lưu `episodes` và `currentEpisode` vào localStorage
- **Đánh đổi:**
  - ✅ Đơn giản, không cần thư viện thêm, tích hợp sẵn trong Zustand
  - ✅ `partialize` tránh lưu state không cần thiết (filters, loading, error)
  - ⚠️ localStorage giới hạn ~5MB, đủ cho text nhưng không cho media lớn

## ADR-009: Chỉ hỗ trợ tiếng Việt (Vietnamese-only)

- **Trạng thái:** Đã chấp nhận (Giai đoạn 4)
- **Bối cảnh:** App ban đầu có `settingsStore` lưu `language` (vi/en) và locale `enUS` từ AntD
- **Quyết định:** Xóa hoàn toàn dark theme, `enUS` locale, language selector trong ProfilePage. App chỉ dùng `vi_VN` locale và light theme.
- **Đánh đổi:**
  - ✅ Giảm complexity, bundle nhỏ hơn, không cần quản lý i18n
  - ✅ Nội dung AI (Edge Function) nhất quán 100% tiếng Việt
  - ⚠️ Không mở rộng cho người dùng quốc tế

## ADR-010: Edge Function verify_jwt = false

- **Trạng thái:** Đã chấp nhận (Giai đoạn 4)
- **Bối cảnh:** Frontend gọi `supabase.functions.invoke()` nhưng Edge Function trả về 401 liên tục
- **Nguyên nhân gốc:** `verify_jwt: true` (default) yêu cầu Bearer JWT hợp lệ, nhưng Supabase JS client không tự đính kèm JWT khi gọi Edge Function theo một số cấu hình
- **Quyết định:** Đặt `verify_jwt: false` trong config Edge Function. Auth vẫn được kiểm tra qua RLS ở database layer.
- **Đánh đổi:**
  - ✅ Loại bỏ lỗi 401, function hoạt động ổn định
  - ⚠️ Edge Function không validate JWT tại entry point → phụ thuộc RLS bảo vệ dữ liệu

## ADR-011: RLS bảng users — đọc công khai

- **Trạng thái:** Đã chấp nhận (Giai đoạn 4)
- **Bối cảnh:** Policy cũ "chỉ đọc profile của mình" khiến tên/email người dùng khác hiển thị là "Ẩn danh" trong feed/comments
- **Quyết định:** Đổi policy SELECT trên bảng `users` thành `USING (true)` — cho phép đọc công khai
- **Đánh đổi:**
  - ✅ Email/tên người dùng hiển thị đúng trong cộng đồng
  - ⚠️ Email người dùng có thể bị lộ → cân nhắc ẩn email, chỉ hiện display_name trong tương lai

## ADR-012: Pattern lưu tag — select-first-then-insert

- **Trạng thái:** Đã chấp nhận (Giai đoạn 4)
- **Bối cảnh:** `upsert` trên bảng `tags` thất bại im lặng do RLS không cho phép UPDATE của user khác
- **Quyết định:** Thay bằng pattern: `SELECT` tag theo name → nếu chưa có thì `INSERT` mới
- **Đánh đổi:**
  - ✅ Không bao giờ cố UPDATE → không vi phạm RLS
  - ✅ Tag tồn tại rồi sẽ được reuse đúng
  - ⚠️ Thêm 1 query → latency tăng nhẹ khi lưu tags mới
