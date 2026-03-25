# 📋 Nhật Ký Xây Dựng - Pdspyse AI Talk Show

> **Vai trò:** Người Quan Sát Xây Dựng
> **Nhiệm vụ:** Giám sát quá trình xây dựng dự án

---

## Giai đoạn 1: Khởi tạo dự án [2026-03-25]

| Thời gian | Hành động | Lý do quyết định |
|-----------|-----------|-------------------|
| T+0 | Khởi tạo Vite 8 + React + TypeScript | Vite 8 cho tốc độ build nhanh, HMR tức thì |
| T+1 | Cài đặt AntD, Zustand, React Router, Supabase | AntD UI sẵn có, Zustand nhẹ, Supabase BaaS toàn diện |
| T+2 | Tạo cấu trúc thư mục phân theo chức năng | components, stores, services, types, lib, hooks |
| T+3 | Cấu hình theme AntD (#6C5CE7, bo tròn 12px) | Theme "cool and cute" theo spec |
| T+4 | Tạo Supabase client + .env | Kết nối frontend với backend |
| T+5 | Định nghĩa TypeScript types | Interfaces cho schema DB + business logic |
| T+6 | Xây dựng 6 services | Tách biệt API logic: auth, generator, episode, persona, social, profile |
| T+7 | Xây dựng 5 Zustand stores | State cho auth, generator, episodes, personas, feed |
| T+8 | Xây dựng Auth (Login/Register/ProtectedRoute) | AntD Form + Supabase Auth |
| T+9 | Xây dựng AppLayout + 10 routes | Layout Sider/Header + React Router nested routes |
| T+10 | Xây dựng Generator (form, persona, output, save) | Core feature: tạo talk show AI |
| T+11 | Xây dựng Episode Management | Table, detail, filter, sort, delete |
| T+12 | Xây dựng Persona Builder + List | Form tạo persona + grid cards |
| T+13 | Xây dựng Feed + Social | PublicFeed, EpisodeCard, CommentSection |
| T+14 | Xây dựng Profile page | Avatar, ngày sinh, cài đặt ứng dụng |
| T+15 | Build thành công ✅ | 0 lỗi TypeScript, bundle 468KB gzipped |

## Giai đoạn 2: Kết nối Supabase + Bổ sung tính năng [2026-03-25]

| Thời gian | Hành động | Lý do quyết định |
|-----------|-----------|-------------------|
| T+16 | Tạo Supabase project (ap-southeast-1) | Vùng gần Việt Nam nhất, free tier |
| T+17 | Áp dụng migration SQL (7 bảng + RLS + triggers) | Schema đầy đủ từ technical-specs.md |
| T+18 | Tạo 5 default personas (Comedian, Expert, Host, Moderator, Villain) | Theo user story US002 |
| T+19 | Deploy Edge Function `generate-talk-show` | Gemini 2.5 Flash, structured JSON output |
| T+20 | Lưu Gemini API key vào Supabase Vault | Bảo mật API key, không lộ phía client |
| T+21 | Thêm nút Like/Comment/Share vào EpisodeCard | Interactive social buttons theo US011 |
| T+22 | Thêm social section vào EpisodeDetail (feed/:id) | Comments + like/share cho public episodes |
| T+23 | Thêm app_settings vào ProfilePage | Notifications, theme, language theo US013 |
| T+24 | Tạo manifest.json + Service Worker | PWA: caching, offline, push notifications |
| T+25 | Thêm online/offline detection | Hook useOnlineStatus + hiển thị trên header |
| T+26 | Thêm notificationService | Push notification request/register |
| T+27 | Thêm pagination vào PublicFeed | 10 items/trang, AntD Pagination |
| T+28 | Build lại thành công ✅ | 471KB gzipped, 0 lỗi |

## Hệ thống phân cấp Component (cập nhật)

```
App
├── ConfigProvider (AntD theme + locale vi_VN)
└── RouterProvider
    ├── /login → LoginForm
    ├── /register → RegisterForm
    └── / → ProtectedRoute → AppLayout [+ Online/Offline status]
        ├── Header (avatar dropdown + connectivity tag)
        ├── Sider (navigation menu)
        └── Content (Outlet)
            ├── GeneratorForm
            │   ├── PersonaSelector
            │   ├── TalkShowOutput
            │   └── SaveEpisodeModal
            ├── EpisodeList
            │   └── EpisodeFilterBar
            ├── EpisodeDetail [+ Social buttons + CommentSection for public]
            │   └── TalkShowOutput
            ├── PersonaList
            ├── PersonaBuilder
            ├── PublicFeed [+ Pagination]
            │   └── EpisodeCard [+ Like/Comment/Share buttons]
            └── ProfilePage [+ App Settings]
```

## Kết nối State + Backend

- **Supabase Project:** `tvearuykhzwtbpzzomvr` (ap-southeast-1)
- **Edge Function:** `generate-talk-show` → Gemini 2.5 Flash API
- **Auth flow:** Supabase Auth → auto-create user profile (trigger)
- **RLS:** Bật cho tất cả 7 bảng, policies theo technical-specs
- **Vault:** Lưu GEMINI_API_KEY bảo mật

## Giai đoạn 3: Kiểm tra & sửa lỗi lần 3 [2026-03-25]

| Thời gian | Hành động | Lý do quyết định |
|-----------|-----------|-------------------|
| T+20 | Sửa package.json name → `pdspyse-ai-talk-show` | Tên còn sót từ scaffold tạm |
| T+21 | Tạo Supabase `avatars` bucket + policies | profileService cần bucket để upload avatar |
| T+22 | Responsive: LoginForm, RegisterForm, GeneratorForm, FilterBar | Dùng `maxWidth` + `width: 100%` + `minWidth` thay vì fixed width |
| T+23 | Kết nối notification Switch → notificationService | UI có Switch nhưng chưa gọi requestPermission() |
| T+24 | Thêm Zustand persist middleware cho episodeStore | US015: xem episode offline cần lưu localStorage |

## Giai đoạn 4: Sửa lỗi & Cải thiện tính năng [2026-03-25]

| Thời gian | Hành động | Lý do quyết định |
|-----------|-----------|-------------------|
| T+25 | Xóa dark theme & ngôn ngữ tiếng Anh (settingsStore, darkTheme, enUS locale) | App chỉ hỗ trợ tiếng Việt, giao diện sáng duy nhất — đơn giản hóa |
| T+26 | Edge Function: cập nhật prompt yêu cầu output hoàn toàn tiếng Việt, tăng maxOutputTokens 4096→8192 | Đảm bảo nội dung talk show luôn bằng tiếng Việt, tăng độ dài output |
| T+27 | Edge Function: đổi verify_jwt từ true→false (fix lỗi 401), version 2→5 | JWT Supabase không tự đính kèm khi gọi từ frontend → 401 liên tục |
| T+28 | Thêm togglePublic vào episodeService + episodeStore; EpisodeDetail có Switch Công khai/Riêng tư | User cần tự kiểm soát visibility của từng tập |
| T+29 | Xóa like/share khỏi EpisodeDetail; chỉ giữ trong EpisodeCard trên feed | Tránh trùng lặp UI, social chỉ có ý nghĩa trên feed cộng đồng |
| T+30 | getPublicEpisodes join bảng likes + comments để lấy số đếm thật; sửa socialService.toggleLike và hasLiked dùng array query thay .single() | .single() throw lỗi khi 0 kết quả; join cho count chính xác |
| T+31 | Đổi RLS bảng users từ "chỉ profile của mình" → "đọc công khai" | Email người khác hiển thị "Ẩn danh" do không fetch được → sửa |
| T+32 | Đăng ký không auto-login; hiển thị thông báo xác nhận email, redirect /login | Supabase yêu cầu xác nhận email trước → auto-login sẽ fail |
| T+33 | getEpisodes lọc theo user_id để "Tập của tôi" chỉ hiện tập của chủ sở hữu | RLS chưa đủ — query cần filter rõ ràng để tránh lộ dữ liệu |
| T+34 | PersonaBuilder hỗ trợ cả create + edit (route /personas/:id/edit); PersonaList có nút Edit/Delete cho custom personas | Cho phép sửa persona tùy chỉnh; default personas vẫn read-only |
| T+35 | Sửa lưu tag: đổi từ upsert → select-first-then-insert | Upsert thất bại im lặng do RLS; pattern mới kiểm tra trước khi insert |
| T+36 | Xóa .env khỏi git (filter-branch), thêm vào .gitignore | Tránh lộ Supabase key trong lịch sử git |
