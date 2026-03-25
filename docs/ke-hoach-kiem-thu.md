# 🧪 Kế Hoạch Kiểm Thử - Pdspyse AI Talk Show

> **Vai trò:** Kiến Trúc Sư QA
> **Nhiệm vụ:** Tạo tài liệu kiểm thử

---

## Tổng quan

| Loại | Công cụ | Phạm vi |
|------|---------|---------|
| Unit Test | Vitest + React Testing Library | Components, Stores, Services |
| Integration Test | Vitest + MSW | Service ↔ Store ↔ Component |
| E2E Test | Playwright | User flows end-to-end |
| CI/CD | GitHub Actions | Tự động chạy tests |

---

## Mẫu Unit Test

### Auth Store
```typescript
describe('authStore', () => {
  it('khởi tạo với user = null', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });
  it('login thành công cập nhật user + session', async () => { /* ... */ });
  it('login thất bại set error message', async () => { /* ... */ });
  it('logout xóa user + session', async () => { /* ... */ });
});
```

### Generator Service
```typescript
describe('generatorService', () => {
  it('gọi Edge Function với đúng payload', async () => { /* ... */ });
  it('parse response thành GeneratedContent', async () => { /* ... */ });
  it('throw error khi Edge Function lỗi', async () => { /* ... */ });
});
```

### EpisodeCard Component
```typescript
describe('EpisodeCard', () => {
  it('hiển thị topic, tags, mood', () => { /* ... */ });
  it('click Like toggle trạng thái', async () => { /* ... */ });
  it('click Share copy link vào clipboard', async () => { /* ... */ });
  it('click Comment navigate đến feed/:id#comments', () => { /* ... */ });
});
```

---

## Kịch bản Integration Test

### IT-001: Auth Flow
1. Register → Supabase tạo user + auto profile
2. Login → session lưu vào authStore
3. Navigate protected route → cho phép truy cập
4. Logout → redirect về /login

### IT-002: Generator → Save Flow
1. Chọn topic/tone/length/personas
2. Generate → Edge Function → Gemini 2.5 Flash → JSON response
3. Render TalkShowOutput (intro/discussion/highlights/summary)
4. Save → chọn mood/tags → lưu vào Supabase

### IT-003: Episode CRUD + Filter/Sort
1. Fetch episodes → hiển thị Table
2. Filter by tag "AI" → danh sách cập nhật
3. Sort by topic A-Z → thứ tự đúng
4. Delete → Modal confirm → xóa thành công

### IT-004: Social Interactions
1. Like episode → count +1, button đổi trạng thái
2. Unlike → count -1
3. Add comment → hiển thị trong danh sách
4. Share → copy URL vào clipboard

---

## Ma trận Test Case ↔ User Story

| TC ID | User Story | Mô tả | Ưu tiên | Trạng thái |
|-------|------------|-------|---------|-----------|
| TC001_001 | US001 | Tạo talk show ngắn, nhẹ nhàng | P0 | Sẵn sàng test |
| TC001_002 | US001 | Tạo talk show dài, tranh luận sâu | P0 | Sẵn sàng test |
| TC001_003 | US001 | Verify Comedian persona traits | P0 | Sẵn sàng test |
| TC001_004 | US001 | Verify Expert persona traits | P0 | Sẵn sàng test |
| TC002_001 | US002 | Thêm Host persona | P1 | Sẵn sàng test |
| TC003_001 | US003 | Lưu episode với metadata | P0 | Sẵn sàng test |
| TC004_001 | US004 | Xem danh sách episodes | P0 | Sẵn sàng test |
| TC005_001 | US005 | Xóa episode có xác nhận | P1 | Sẵn sàng test |
| TC005_002 | US005 | Hủy xóa episode | P1 | Sẵn sàng test |
| TC006_001 | US006 | Sort theo topic A-Z | P1 | Sẵn sàng test |
| TC006_002 | US006 | Sort theo datetime mới nhất | P1 | Sẵn sàng test |
| TC007_001 | US007 | Filter theo tag | P1 | Sẵn sàng test |
| TC007_002 | US007 | Filter theo mood | P1 | Sẵn sàng test |
| TC008_001 | US008 | Tạo custom persona | P1 | Sẵn sàng test |
| TC008_002 | US008 | Validate tên persona rỗng | P1 | Sẵn sàng test |
| TC009_001 | US009 | Lưu custom persona | P1 | Sẵn sàng test |
| TC009_002 | US009 | Dùng lại custom persona | P1 | Sẵn sàng test |
| TC010_001 | US010 | Xem feed công khai | P2 | Sẵn sàng test |
| TC011_001 | US011 | Like talk show | P2 | Sẵn sàng test |
| TC011_002 | US011 | Comment trên talk show | P2 | Sẵn sàng test |
| TC011_003 | US011 | Share link talk show | P2 | Sẵn sàng test |
| TC012_001 | US012 | Đăng ký tài khoản | P0 | Sẵn sàng test |
| TC012_002 | US012 | Đăng nhập | P0 | Sẵn sàng test |
| TC012_003 | US012 | Đăng nhập sai mật khẩu | P0 | Sẵn sàng test |
| TC012_004 | US012 | Đăng xuất | P0 | Sẵn sàng test |
| TC013_001 | US013 | Xem hồ sơ | P2 | Sẵn sàng test |
| TC013_002 | US013 | Đổi avatar | P2 | Sẵn sàng test |
| TC013_003 | US013 | Cập nhật ngày sinh | P2 | Sẵn sàng test |
| TC014_001 | US014 | Responsive mobile | P2 | Cần test thủ công |
| TC015_001 | US015 | Offline mode | P3 | Sẵn sàng test |
| TC016_001 | US016 | Push notification | P3 | Sẵn sàng test |
| TC017_001 | US017 | Load time tối ưu | P3 | Cần Lighthouse |

---

## Test Cases bổ sung — Giai đoạn 3 (2026-03-25)

### TC-G3-001: Offline Caching (US015 — Zustand persist)

```typescript
describe('episodeStore persist middleware', () => {
  it('lưu episodes vào localStorage sau khi fetch', async () => {
    await useEpisodeStore.getState().fetchEpisodes();
    const stored = JSON.parse(localStorage.getItem('episode-store') || '{}');
    expect(stored.state.episodes.length).toBeGreaterThan(0);
  });

  it('khôi phục episodes từ localStorage khi reload (offline)', () => {
    // Mock offline: không gọi Supabase
    const stored = JSON.parse(localStorage.getItem('episode-store') || '{}');
    expect(stored.state.episodes).toBeDefined();
  });

  it('hiển thị dữ liệu cache khi offline (useOnlineStatus = false)', () => {
    // Mock useOnlineStatus = false
    // episodeStore vẫn có episodes từ persist
    expect(useEpisodeStore.getState().episodes.length).toBeGreaterThan(0);
  });
});
```

### TC-G3-002: Responsive UI

```typescript
describe('Responsive forms', () => {
  const components = ['LoginForm', 'RegisterForm', 'GeneratorForm', 'EpisodeFilterBar'];

  components.forEach((name) => {
    it(`${name} có maxWidth và width: 100% trên viewport nhỏ`, () => {
      // Resize viewport đến 375px
      // Kiểm tra container không bị tràn
      const container = screen.getByTestId(`${name}-container`);
      expect(container).toHaveStyle({ width: '100%' });
    });
  });

  it('LoginForm không bị tràn trên màn hình 375px', () => { /* ... */ });
  it('GeneratorForm có minWidth phù hợp tránh collapse', () => { /* ... */ });
});
```

### TC-G3-003: Notification Permission

```typescript
describe('ProfilePage — notification switch', () => {
  it('bật switch gọi notificationService.requestPermission()', async () => {
    const spy = vi.spyOn(notificationService, 'requestPermission');
    const switchEl = screen.getByRole('switch', { name: /thông báo/i });
    await userEvent.click(switchEl);
    expect(spy).toHaveBeenCalled();
  });

  it('bật switch gọi registerServiceWorker()', async () => {
    const spy = vi.spyOn(navigator.serviceWorker, 'register');
    const switchEl = screen.getByRole('switch', { name: /thông báo/i });
    await userEvent.click(switchEl);
    expect(spy).toHaveBeenCalledWith('/service-worker.js');
  });

  it('permission denied hiển thị thông báo lỗi phù hợp', async () => {
    vi.spyOn(Notification, 'requestPermission').mockResolvedValue('denied');
    // Kiểm tra message.error được gọi
  });
});
```

### Ma trận cập nhật

| TC ID | User Story | Mô tả | Ưu tiên | Trạng thái |
|-------|------------|-------|---------|-----------|
| TC-G3-001a | US015 | Persist episodes vào localStorage | P3 | Sẵn sàng test |
| TC-G3-001b | US015 | Khôi phục cache khi offline | P3 | Sẵn sàng test |
| TC-G3-002a | US014 | LoginForm responsive 375px | P2 | Sẵn sàng test |
| TC-G3-002b | US014 | GeneratorForm responsive 375px | P2 | Sẵn sàng test |
| TC-G3-002c | US014 | EpisodeFilterBar responsive | P2 | Sẵn sàng test |
| TC-G3-003a | US016 | Switch notification gọi requestPermission | P3 | Sẵn sàng test |
| TC-G3-003b | US016 | Switch notification đăng ký SW | P3 | Sẵn sàng test |

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
```
