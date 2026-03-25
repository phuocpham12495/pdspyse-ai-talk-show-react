# ⚡ Đánh Giá Hiệu Năng - Pdspyse AI Talk Show

> **Vai trò:** Kỹ Sư Hiệu Năng
> **Nhiệm vụ:** Đánh giá hiệu năng ứng dụng

---

## Chỉ số Build (cập nhật 2026-03-25)

| Chỉ số | Giá trị | Ngưỡng | Kết quả |
|--------|---------|--------|---------|
| Build time (cold) | ~20s | < 30s | ✅ ĐẠT |
| Build time (warm) | ~1s | < 5s | ✅ ĐẠT |
| Bundle JS (gzipped) | 471.04 KB | < 500 KB | ⚠️ SÁT NGƯỠNG |
| Bundle CSS (gzipped) | 0.33 KB | < 50 KB | ✅ ĐẠT |
| HTML (gzipped) | 0.42 KB | < 5 KB | ✅ ĐẠT |
| TypeScript errors | 0 | 0 | ✅ ĐẠT |

## Supabase Backend Performance

| Chỉ số | Giá trị | Ghi chú |
|--------|---------|---------|
| Region | ap-southeast-1 (Singapore) | Gần Việt Nam |
| DB Indexes | 5 indexes | episodes(user_id, is_public, created_at), likes/comments(episode_id) |
| RLS Policies | 18 policies | Trên tất cả 7 bảng |
| Edge Function | generate-talk-show | Gemini 2.5 Flash, ~2-5s response |

## Mục tiêu Lighthouse

| Chỉ số | Mục tiêu | Ghi chú |
|--------|----------|---------|
| Performance | ≥ 90 | Cần code-splitting |
| Accessibility | ≥ 90 | AntD ARIA tích hợp |
| Best Practices | ≥ 90 | HTTPS, manifest.json |
| SEO | ≥ 80 | Meta tags đã thêm |
| PWA | ≥ 80 | Service Worker + manifest |

## Khuyến nghị tối ưu hóa

### P0 - Cần làm ngay
1. **Code-splitting:** `React.lazy()` cho routes → giảm initial bundle ~40%
2. **AntD tree-shaking:** Chỉ import components cần thiết

### P1 - Nên làm
3. **Image lazy loading:** Cho avatars và media
4. **Debounce:** Filter/search inputs (300ms)
5. **Pagination server-side:** Cho PublicFeed khi dữ liệu lớn

### P2 - Có thể làm
6. **Prefetching:** Route data prefetch
7. **Bundle analyzer:** Xác định dependencies nặng

## Dấu chân bộ nhớ Runtime (ước tính)

| Trang | RAM | Ghi chú |
|-------|-----|---------|
| Login/Register | ~15 MB | Minimal |
| Generator | ~25 MB | Form + AI output |
| Episode List | ~30 MB | Table + filters |
| Public Feed | ~35 MB | Cards + pagination |
| Profile | ~20 MB | Form + avatar |

---

## Cập nhật Giai đoạn 3 (2026-03-25)

### Caching localStorage cho Offline (US015)

Zustand `episodeStore` hiện sử dụng `persist` middleware để lưu episodes vào `localStorage`. Điều này cho phép người dùng xem lại danh sách tập phim đã tải gần đây ngay cả khi mất kết nối mạng.

| Chỉ số | Giá trị | Ghi chú |
|--------|---------|---------|
| Storage key | `episode-store` | localStorage |
| Dữ liệu được persist | `episodes`, `filters`, `sortField` | Partial persist |
| Dung lượng ước tính | < 500 KB | Phụ thuộc số lượng tập |
| Chiến lược | Stale-while-revalidate | Hiển thị cache, fetch mới khi online |

> Lưu ý: localStorage có giới hạn ~5MB/domain. Nếu dữ liệu lớn cần xem xét IndexedDB.

---

## Cập nhật Giai đoạn 4 (2026-03-25)

### Edge Function — Tăng maxOutputTokens

| Thông số | Giai đoạn 3 | Giai đoạn 4 | Ghi chú |
|----------|-------------|-------------|---------|
| `maxOutputTokens` | 4096 | **8192** | Hỗ trợ talk show dài hơn, nội dung tiếng Việt đầy đủ hơn |
| `verify_jwt` | `true` | **`false`** | Fix lỗi 401; version function 2→5 |
| Ngôn ngữ output | Không ràng buộc | **Tiếng Việt 100%** | Prompt cập nhật: "ALL content MUST be written in Vietnamese language" |

### Truy vấn Social — Join thật

`getPublicEpisodes` nay join bảng `likes` và `comments` để lấy count thật thay vì đếm phía client. Loại bỏ lỗi do `.single()` khi không có kết quả (socialService.toggleLike, hasLiked chuyển sang array query).

| Thay đổi | Tác động hiệu năng |
|----------|-------------------|
| Join likes/comments trong 1 query | Giảm số round-trips từ 3 xuống 1 |
| Array query thay `.single()` | Loại bỏ exception overhead khi 0 rows |
