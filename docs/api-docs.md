# 📡 Tài Liệu API - Pdspyse AI Talk Show

> **Vai trò:** Người Viết Kỹ Thuật
> **Nhiệm vụ:** Tài liệu tất cả API endpoints

---

## Tổng quan

- **Backend:** Supabase (Project: `tvearuykhzwtbpzzomvr`, Region: `ap-southeast-1`)
- **Base URL:** `https://tvearuykhzwtbpzzomvr.supabase.co`
- **Xác thực:** Bearer JWT token trong header `Authorization`
- **AI Engine:** Gemini 2.5 Flash qua Edge Function

---

## 1. Authentication (`/auth/v1/`)

### POST `/auth/v1/signup` — Đăng ký
```typescript
// Request
interface SignUpRequest { email: string; password: string; }
// Response 200
interface SignUpResponse {
  user: { id: string; email: string; created_at: string } | null;
  session: { access_token: string; refresh_token: string } | null;
}
```
**Lỗi:** `400` Email đã tồn tại | `422` Dữ liệu không hợp lệ

> ℹ️ Trigger `on_auth_user_created` tự động tạo profile trong bảng `users`

### POST `/auth/v1/token?grant_type=password` — Đăng nhập
```typescript
// Request
interface LoginRequest { email: string; password: string; }
// Response 200
interface LoginResponse {
  user: { id: string; email: string };
  session: { access_token: string; refresh_token: string; expires_in: number };
}
```
**Lỗi:** `400` Sai email/mật khẩu

### POST `/auth/v1/logout` — Đăng xuất

---

## 2. Episodes (`/rest/v1/episodes`)

### GET — Lấy danh sách episodes
**Query params:** `select`, `order` (vd: `created_at.desc`), `mood=eq.funny`, `is_public=eq.true`

```typescript
interface Episode {
  id: string;
  user_id: string;
  topic: string;
  tone_level: 'light' | 'balanced' | 'deep debate';
  conversation_length: 'short' | 'medium' | 'long';
  generated_content: GeneratedContent;
  mood: 'funny' | 'serious' | 'controversial' | 'thought-provoking' | 'casual' | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface GeneratedContent {
  intro: string;
  discussion: { speaker: string; text: string }[];
  highlights: string[];
  summary: string;
}
```

**RLS:** User thấy episodes của mình + episodes `is_public=true`

### POST — Tạo episode mới
### DELETE `?id=eq.{id}` — Xóa episode (chỉ của mình)

---

## 3. Personas (`/rest/v1/personas`)

### GET — Lấy danh sách personas
```typescript
interface Persona {
  id: string;
  user_id: string | null;
  name: string;
  personality_traits: { tone: string; style: string; description?: string; keywords?: string[] };
  is_default: boolean;
  created_at: string;
}
```
**RLS:** User thấy personas mặc định + personas tùy chỉnh của mình
**Default Personas:** Comedian, Expert, Host, Moderator, Villain

### POST — Tạo persona tùy chỉnh
### PATCH `?id=eq.{id}` — Cập nhật (không cho sửa default)
### DELETE `?id=eq.{id}` — Xóa (không cho xóa default)

---

## 4. Tags (`/rest/v1/tags`)

### GET — Lấy danh sách tags (public read)
### POST — Tạo tag (authenticated)

---

## 5. Social

### Likes (`/rest/v1/likes`)
- **POST** — Like episode (UNIQUE constraint: 1 like/user/episode)
- **DELETE** `?id=eq.{id}` — Bỏ like (chỉ like của mình)
- **GET** `?episode_id=eq.{id}` — Đếm likes

### Comments (`/rest/v1/comments`)
- **GET** `?episode_id=eq.{id}&order=created_at.asc` — Lấy comments
- **POST** — Thêm comment
- **DELETE** `?id=eq.{id}` — Xóa comment (chỉ của mình)

---

## 6. Edge Function: `generate-talk-show`

### POST `/functions/v1/generate-talk-show`

```typescript
// Request
interface GenerateRequest {
  topic: string;
  tone: 'light' | 'balanced' | 'deep debate';
  length: 'short' | 'medium' | 'long';
  personas: { name: string; personality_traits: { tone: string; style: string } }[];
}

// Response 200
interface GeneratedContent {
  intro: string;
  discussion: { speaker: string; text: string }[];
  highlights: string[];
  summary: string;
}
```

**AI Model:** Google Gemini 2.5 Flash
**API Key:** Lưu trong Supabase Vault (`GEMINI_API_KEY`)
**Config:** `temperature: 0.9`, `topP: 0.95`, `maxOutputTokens: 4096`
**Lỗi:** `400` thiếu topic/personas | `429` rate limit | `500` Gemini API lỗi

---

## 7. Storage (`/storage/v1/object/`)

### Bucket: `avatars` (tạo trong Giai đoạn 3)

**Cấu hình:** Public bucket, RLS bật, region `ap-southeast-1`

| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| POST | `/storage/v1/object/avatars/{userId}/{filename}` | Upload avatar | Bearer JWT |
| PUT | `/storage/v1/object/avatars/{userId}/{filename}` | Cập nhật avatar | Bearer JWT |
| GET | `/storage/v1/object/public/avatars/{path}` | Lấy avatar public | Không cần |
| DELETE | `/storage/v1/object/avatars/{userId}/{filename}` | Xóa avatar | Bearer JWT |

```typescript
// Upload avatar — profileService
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/${filename}`, file, { upsert: true });

// Lấy public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/${filename}`);
```

**RLS Policies:**
- `INSERT`: `auth.uid()::text = (storage.foldername(name))[1]` — chỉ upload vào folder của mình
- `UPDATE`: Tương tự INSERT
- `SELECT`: Public — tất cả đều đọc được

**Lỗi thường gặp:**
| Mã | Nguyên nhân | Xử lý |
|----|-------------|-------|
| 400 | Bucket chưa tồn tại | Tạo bucket trong Supabase Dashboard |
| 403 | Sai userId trong path | Kiểm tra RLS policy |
| 413 | File quá lớn (> 50MB default) | Giảm kích thước ảnh trước upload |

---

## Mã lỗi chung

| Mã | Ý nghĩa | Xử lý Frontend |
|----|----------|----------------|
| 200/201 | Thành công | - |
| 400 | Dữ liệu không hợp lệ | `message.error()` |
| 401 | Chưa xác thực | Redirect `/login` |
| 403 | Không có quyền (RLS) | `message.error()` |
| 404 | Không tìm thấy | Hiển thị Empty |
| 429 | Rate limit | Retry sau delay |
| 500 | Server error | `message.error()` |
