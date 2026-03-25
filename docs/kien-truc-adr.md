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
