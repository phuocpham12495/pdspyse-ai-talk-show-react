# 🛠️ Hướng Dẫn Cài Đặt - Pdspyse AI Talk Show

> **Vai trò:** Kỹ Sư DevOps
> **Nhiệm vụ:** Hướng dẫn cài đặt và triển khai

---

## Yêu cầu tiên quyết

| Phần mềm | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| Node.js | v18+ | Khuyến nghị v20 LTS |
| npm | v9+ | Đi kèm Node.js |
| Git | v2.30+ | Quản lý mã nguồn |

## Cài đặt nhanh

```bash
# 1. Clone repository
git clone https://github.com/your-org/pdspyse-ai-talk-show-react.git
cd pdspyse-ai-talk-show-react

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình biến môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin Supabase

# 4. Khởi động dev server
npm run dev
# → http://localhost:5173
```

## Bảng tham chiếu biến môi trường

| Biến | Bắt buộc | Mô tả | Giá trị hiện tại |
|------|----------|-------|-------------------|
| `VITE_SUPABASE_URL` | ✅ | URL dự án Supabase | `https://tvearuykhzwtbpzzomvr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Khóa public Supabase | Xem file `.env` |

> ⚠️ **Bảo mật:** GEMINI_API_KEY được lưu trong Supabase Vault, KHÔNG ở phía client.

## Supabase Storage — Bucket `avatars` (Giai đoạn 3)

Bucket `avatars` phải được tạo thủ công trong Supabase Dashboard trước khi tính năng upload avatar hoạt động.

**Các bước tạo bucket:**
1. Vào Supabase Dashboard → Storage → New bucket
2. Tên bucket: `avatars`, bật **Public bucket**
3. Thêm RLS policies sau:

```sql
-- Cho phép user upload avatar của chính mình
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Cho phép user cập nhật avatar của chính mình
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Cho phép đọc public tất cả avatars
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

> Nếu thiếu bucket này, tính năng đổi avatar trong ProfilePage sẽ báo lỗi 400/404.

## Supabase Backend

- **Project:** pdspyse-ai-talk-show
- **Region:** ap-southeast-1 (Singapore)
- **Database:** 7 bảng với RLS (users, personas, episodes, tags, episode_tags, likes, comments)
- **Edge Function:** `generate-talk-show` (Gemini 2.5 Flash)
- **Default Personas:** Comedian, Expert, Host, Moderator, Villain

## Scripts

| Lệnh | Mô tả |
|-------|-------|
| `npm run dev` | Dev server (HMR) |
| `npm run build` | Build production → `dist/` |
| `npm run preview` | Preview build |
| `npm run lint` | Kiểm tra linting |

## Cấu trúc thư mục

```
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service Worker (offline + push)
│   └── icons/                 # PWA icons
├── src/
│   ├── app/                   # App config, routes, theme
│   ├── components/
│   │   ├── auth/              # Login, Register
│   │   ├── episodes/          # List, Detail, FilterBar
│   │   ├── feed/              # PublicFeed, EpisodeCard, Comments
│   │   ├── generator/         # Form, PersonaSelector, Output, SaveModal
│   │   ├── layout/            # AppLayout, ProtectedRoute
│   │   ├── personas/          # Builder, List
│   │   └── profile/           # ProfilePage
│   ├── hooks/                 # useOnlineStatus
│   ├── lib/                   # Supabase client
│   ├── services/              # 7 services (API layer)
│   ├── stores/                # 5 Zustand stores
│   └── types/                 # TypeScript interfaces
├── supabase/
│   └── functions/
│       └── generate-talk-show/ # Edge Function (Gemini 2.5 Flash)
├── docs/                       # Tài liệu tiếng Việt (9 files)
└── .env.example
```

## Triển khai Production

### Vercel (khuyến nghị)
```bash
npm install -g vercel
vercel --prod
```
Thêm biến môi trường trên Vercel Dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Lưu ý bảo mật — Giai đoạn 4 (2026-03-25)

### File .env đã được xóa khỏi lịch sử git

Trong Giai đoạn 4, file `.env` đã được phát hiện trong lịch sử git và đã xử lý:

```bash
# Đã chạy để xóa khỏi toàn bộ lịch sử
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

`.env` đã được thêm vào `.gitignore`. **Không bao giờ commit file `.env` lên repository.**

> Nếu clone repository, bạn phải tạo file `.env` thủ công từ `.env.example`.

### Luồng đăng ký — Xác nhận email

Kể từ Giai đoạn 4, sau khi đăng ký thành công, app **không** tự động đăng nhập. Thay vào đó:
1. Hiển thị thông báo: "Vui lòng kiểm tra email để xác nhận tài khoản"
2. Redirect về `/login`
3. User phải xác nhận email trước khi đăng nhập được

> Đây là yêu cầu bắt buộc của Supabase Auth khi bật email confirmation.
