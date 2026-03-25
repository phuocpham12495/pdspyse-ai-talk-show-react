# 🧑‍💻 Hướng Dẫn Code - Pdspyse AI Talk Show

> **Vai trò:** Mentor Lập Trình Viên Cao Cấp
> **Nhiệm vụ:** Hướng dẫn duyệt code, state, data fetching, design patterns

---

## 1. Điểm vào → Duyệt cây Component

### Entry: `src/main.tsx`
```typescript
createRoot(document.getElementById('root')!).render(<App />);
// + Service Worker registration cho PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

### App: `src/app/App.tsx`
```typescript
// 3 nhiệm vụ chính:
// 1. Auth initialization (kiểm tra session Supabase)
// 2. AntD ConfigProvider (theme tím #6C5CE7 + locale vi_VN)
// 3. RouterProvider (10 routes)
```

### Routes: `src/app/routes.tsx`
```
Public:  /login → LoginForm, /register → RegisterForm
Protected (AppLayout + Outlet):
  /              → GeneratorForm (home)
  /episodes      → EpisodeList
  /episodes/:id  → EpisodeDetail (private mode)
  /personas      → PersonaList
  /personas/new  → PersonaBuilder
  /feed          → PublicFeed (paginated)
  /feed/:id      → EpisodeDetail (public mode + social)
  /profile       → ProfilePage
```

---

## 2. Luồng quản lý State

### Pattern: Component → Store → Service → Supabase

```
┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────┐
│Component │────▶│ Zustand Store│────▶│  Service  │────▶│ Supabase │
│(re-render)◀────│ (state mgmt) │◀────│ (API call)│◀────│  (BaaS)  │
└──────────┘     └──────────────┘     └───────────┘     └──────────┘
```

### 5 Stores:
| Store | State | Actions |
|-------|-------|---------|
| `authStore` | user, session, isLoading | login, register, logout, initialize |
| `generatorStore` | topic, tone, length, personas, output | setTopic, setTone, generate, reset |
| `episodeStore` | episodes, filters, sort | fetchEpisodes, deleteEpisode, setFilter |
| `personaStore` | personas | fetchPersonas, createPersona, deletePersona |
| `feedStore` | publicEpisodes, comments | fetchPublicFeed, toggleLike, addComment |

### Selector Pattern (quan trọng cho performance):
```typescript
// ✅ Chỉ subscribe field cần thiết → tránh re-render thừa
const topic = useGeneratorStore((s) => s.topic);

// ❌ Subscribe toàn bộ store → re-render mọi thay đổi
const store = useGeneratorStore();
```

---

## 3. Chiến lược Fetch và Cache

### Fetch on Mount
```typescript
useEffect(() => {
  fetchEpisodes();
}, [fetchEpisodes, filters, sortField]); // Re-fetch khi filter/sort thay đổi
```

### Optimistic Delete
```typescript
deleteEpisode: async (id) => {
  await episodeService.deleteEpisode(id);        // API call
  set((s) => ({ episodes: s.episodes.filter(e => e.id !== id) })); // Local update
}
```

### Caching Layers:
1. **Zustand stores** — Memory cache (mất khi refresh)
2. **Zustand persist middleware** — localStorage cache (giữ qua refresh, dùng cho offline)
3. **Service Worker** — Cache-first cho static, network-first cho API
4. **Supabase client** — Auto token refresh

### Pattern: Zustand Persist Middleware (thêm trong Giai đoạn 3)

```typescript
// src/stores/episodeStore.ts
import { persist } from 'zustand/middleware';

export const useEpisodeStore = create<EpisodeStore>()(
  persist(
    (set, get) => ({
      episodes: [],
      // ... actions
      fetchEpisodes: async () => {
        // Nếu offline, dữ liệu persist vẫn có trong store
        const data = await episodeService.getEpisodes(/* ... */);
        set({ episodes: data });
      },
    }),
    {
      name: 'episode-store',        // key trong localStorage
      partialize: (state) => ({     // chỉ persist dữ liệu cần thiết
        episodes: state.episodes,
        filters: state.filters,
        sortField: state.sortField,
      }),
    }
  )
);
```

**Lưu ý khi dùng persist:**
- `partialize` để tránh persist actions (functions không serializable)
- Kết hợp với `useOnlineStatus` hook: khi offline hiển thị dữ liệu cache, khi online re-fetch
- Key `name` phải unique trong app để tránh xung đột

---

## 4. AI Integration Flow

```
GeneratorForm → generatorStore.generate()
  → generatorService.generateTalkShow()
    → supabase.functions.invoke('generate-talk-show')
      → Edge Function (Deno)
        → Vault: lấy GEMINI_API_KEY
        → Gemini 2.5 Flash API (responseMimeType: 'application/json')
        → Parse JSON → validate structure
      ← GeneratedContent { intro, discussion[], highlights[], summary }
    ← return parsed data
  ← set({ output, isGenerating: false })
← TalkShowOutput renders structured content
```

---

## 5. Các mẫu thiết kế chính

| Pattern | Vị trí | Lý do |
|---------|--------|-------|
| **Repository** | `services/` | Tách biệt data access, dễ thay backend |
| **Flux** | `stores/` (Zustand) | Unidirectional data flow |
| **Guard** | `ProtectedRoute` | Auth check trước render |
| **Compound Component** | AntD Layout | Sider + Header + Content linh hoạt |
| **Container/Presenter** | Pages vs Display components | Logic vs UI tách biệt |
| **Hook** | `useOnlineStatus` | Reusable cross-cutting concern |
| **Proxy** | Edge Function | Bảo vệ API key, rate limit |

---

## 6. Social Feature Architecture

```
EpisodeCard (feed list)
  ├── Like button → feedStore.toggleLike() → socialService.toggleLike()
  ├── Comment button → navigate('/feed/:id#comments')
  └── Share button → navigator.clipboard.writeText(url)

EpisodeDetail (feed/:id, public mode)
  └── CommentSection        ← Like/Share đã xóa khỏi EpisodeDetail (Giai đoạn 4)
      ├── List comments ← feedStore.fetchComments()
      ├── Add comment → feedStore.addComment()
      └── Delete own comment → feedStore.deleteComment()

> **Giai đoạn 4:** Like/Share chỉ còn trong EpisodeCard trên PublicFeed. EpisodeDetail có Switch Công khai/Riêng tư thay thế.

---

## 7. Các pattern bổ sung — Giai đoạn 4

### Select-First-Then-Insert cho Tags

Thay vì `upsert` (thất bại im lặng do RLS), dùng pattern kiểm tra trước:

```typescript
// src/services/episodeService.ts — saveTag()
async function saveTag(name: string): Promise<string> {
  // 1. Tìm tag đã tồn tại
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].id; // Reuse tag có sẵn
  }

  // 2. Chỉ INSERT khi chưa tồn tại
  const { data: newTag, error } = await supabase
    .from('tags')
    .insert({ name })
    .select('id')
    .single();

  if (error) throw error;
  return newTag.id;
}
```

**Lý do không dùng upsert:** RLS policy chỉ cho phép INSERT tag mới, không cho UPDATE tag của người khác. `upsert` sẽ attempt UPDATE khi tag đã tồn tại → vi phạm RLS → lỗi im lặng.

### Persona Edit Flow

```typescript
// Route mới trong routes.tsx (Giai đoạn 4)
{ path: '/personas/:id/edit', element: <PersonaBuilder /> }

// PersonaBuilder phân biệt create vs edit bằng useParams
const { id } = useParams();
const isEditMode = Boolean(id);

useEffect(() => {
  if (isEditMode) {
    // Load persona hiện tại vào form
    personaStore.fetchPersonaById(id!).then(setFormValues);
  }
}, [id]);

// Submit: gọi createPersona hoặc updatePersona tùy mode
const onFinish = (values) => {
  isEditMode
    ? personaStore.updatePersona(id!, values)
    : personaStore.createPersona(values);
};
```

**PersonaList:** Chỉ hiển thị nút Sửa/Xóa với `!persona.is_default`. Default personas (Comedian, Expert, Host, Moderator, Villain) luôn read-only.

### Cập nhật Routes (Giai đoạn 4)

```
/personas/new          → PersonaBuilder (create mode)
/personas/:id/edit     → PersonaBuilder (edit mode) ← MỚI
```
```
