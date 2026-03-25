# Pdspyse AI Talk Show Technical Specification

## 1. Introduction
This document outlines the technical architecture and implementation details for the "Pdspyse AI Talk Show" web application. The application will leverage React.js for the frontend, Supabase for the backend services, and integrate with a Large Language Model (LLM) for AI agent interactions. The focus is on a cool and cute UI using Ant Design principles, while ensuring robust features, security, and performance.

## 2. Architecture Overview

*   **Frontend:** React.js (TypeScript) with Ant Design (AntD) for UI components and responsive design. Utilizes a Mobile-First approach.
*   **Backend:** Supabase (PostgreSQL Database, Authentication, Storage, Edge Functions, Realtime).
*   **AI Engine:** External LLM API (e.g., OpenAI GPT, Google Gemini, Anthropic Claude) accessed securely via Supabase Edge Functions.
*   **Deployment:** Frontend deployed on a static hosting provider (e.g., Vercel, Netlify). Supabase handles its own hosting.

```mermaid
graph TD
    User[User] -->|Browser/Mobile App| Frontend[React.js App (Ant Design)]
    Frontend -->|API Requests| SupabaseAPI[Supabase API]
    SupabaseAPI --> SupabaseAuth[Supabase Auth (JWT)]
    SupabaseAPI --> SupabaseDB[Supabase PostgreSQL DB]
    SupabaseAPI --> SupabaseStorage[Supabase Storage]
    Frontend --> SupabaseEdge[Supabase Edge Functions]
    SupabaseEdge -->|Secure API Call| LLM_API[External LLM API (e.g., OpenAI)]
    SubGraph[Internal Supabase Services]
        SupabaseDB --> SupabaseRLS[Row-Level Security]
        SupabaseDB --> SupabaseRealtime[Realtime Subscriptions]
    End
    SupabaseAPI --- SubGraph
```

## 3. Frontend (React.js with Ant Design)

### 3.1. Core Technologies & Libraries
*   **Framework:** React.js (with React Router for navigation)
*   **Language:** TypeScript
*   **UI Library:** Ant Design (AntD) for comprehensive component set, themes, and responsiveness.
*   **State Management:** React Context API or Zustand/Jotai for lightweight global state. (Redux if complexity demands)
*   **API Client:** Supabase JavaScript client library (`@supabase/supabase-js`).
*   **PWA:** Workbox (via Create React App or Vite plugin) for Service Workers.

### 3.2. UI/UX Design Principles
*   **Antigravity Theme:** Implementation of a custom Ant Design theme to achieve a "cool and cute" aesthetic, focusing on playful colors, rounded corners, custom typography, and engaging animations.
*   **Mobile-First Responsive Design:** All components and layouts will be designed with mobile devices as the primary target, progressively enhancing for larger screens using Ant Design's grid system and responsive breakpoints.
*   **Accessibility:** Adherence to WCAG guidelines where possible, leveraging Ant Design's built-in accessibility features.
*   **User Feedback:** Clear loading states, success/error notifications using AntD `message` and `notification` components.

### 3.3. Key Frontend Modules & Components

#### 3.3.1. Authentication & Profile Management
*   **Login/Registration Forms:** AntD `Form` components with client-side validation.
*   **Profile Settings:** `Upload` for avatar, `DatePicker` for date of birth, `Input` for email, various `Switch` or `Select` for app settings.
*   **Route Guards:** Protect authenticated routes using React Router.

#### 3.3.2. AI Talk Show Generator
*   **Input Form:** AntD `Form` with `Input` for topic, `Select` for tone level (light, balanced, deep debate), `Slider` or `Select` for conversation length (short, medium, long).
*   **Persona Selector:** `Checkbox.Group` or `Select` with custom render for default (Comedian, Expert) and custom personas.
*   **Dynamic Output Display:** Real-time (or near real-time) rendering of the talk show as it's generated, structured with distinct sections (Intro, Dialogue, Highlights, Summary). Potentially using `Card` or `Timeline` components.
*   **Loading Indicators:** `Spin` component during AI generation.

#### 3.3.3. Conversation Management System
*   **Episode List:** `Table` or `List` component displaying saved episodes with metadata. Actions like View, Edit, Delete using `Button` or `Dropdown.Button`.
*   **Episode Detail View:** Display full conversation content, metadata, and options to share/delete.
*   **Save Modal:** `Modal` component for adding tags (`Tag` component) and selecting mood (`Select`) before saving.

#### 3.3.4. Smart Sorting & Filtering
*   **Filter Panel:** `Form` with `Select` (for topic, mood), `Tag` components for active filters, `DatePicker.RangePicker` for date filtering.
*   **Sort Controls:** `Select` or `Button.Group` for sorting by topic/datetime.

#### 3.3.5. Custom Persona Builder
*   **Persona Creation Form:** AntD `Form` with `Input` for persona name, `TextArea` or `Input.TextArea` for personality traits/description, potentially `Tag` input for keywords.
*   **Saved Persona List:** `List` or `Card` component for managing (view, edit, delete) custom personas.

#### 3.3.6. Social & Community Layer
*   **Public Feed:** `List` or `Card` components for each public talk show, displaying topic, creator, likes, comments count.
*   **Interaction Buttons:** `Button` components for Like, Comment, Share. `Modal` for comment input.
*   **Comment Section:** `Comment` or `List` components for displaying comments, potentially with infinite scrolling.

#### 3.3.7. Progressive Web App (PWA) Capabilities
*   **Service Worker:** Registration and lifecycle management for caching static assets and API responses (`stale-while-revalidate` strategy).
*   **Manifest File:** `manifest.json` for app icon, splash screen, display mode, and theme color.
*   **Push Notifications:** Integration with Push API (via Supabase Edge Functions or a dedicated push service) for sending alerts.

## 4. Backend (Supabase)

### 4.1. Core Supabase Services
*   **Supabase Auth:** User authentication (email/password), session management, Row-Level Security (RLS) policies.
*   **Supabase PostgreSQL Database:** Primary data store.
*   **Supabase Storage:** For user avatars and any episode-related media.
*   **Supabase Edge Functions:** Serverless functions for secure LLM API calls, complex backend logic, or custom integrations.
*   **Supabase Realtime:** Optional for real-time updates on social feeds or talk show generation progress.

### 4.2. Database Schema (PostgreSQL)

#### `users` table
*   `id`: UUID (Primary Key, Supabase Auth)
*   `email`: TEXT (Unique, Supabase Auth)
*   `avatar_url`: TEXT (Supabase Storage reference)
*   `date_of_birth`: DATE
*   `app_settings`: JSONB (e.g., notification preferences, theme)
*   `created_at`: TIMESTAMP WITH TIME ZONE (DEFAULT now())

#### `personas` table
*   `id`: UUID (Primary Key, DEFAULT gen_random_uuid())
*   `user_id`: UUID (Foreign Key to `users.id`, NULLABLE for default personas)
*   `name`: TEXT (e.g., Comedian, Expert, Custom Persona Name)
*   `personality_traits`: JSONB (e.g., `{ "tone": "witty", "style": "sarcastic" }`)
*   `created_at`: TIMESTAMP WITH TIME ZONE (DEFAULT now())
*   `is_default`: BOOLEAN (TRUE for system personas, FALSE for user-created)

#### `episodes` table
*   `id`: UUID (Primary Key, DEFAULT gen_random_uuid())
*   `user_id`: UUID (Foreign Key to `users.id`)
*   `topic`: TEXT
*   `tone_level`: TEXT (e.g., 'light', 'balanced', 'deep debate')
*   `conversation_length`: TEXT (e.g., 'short', 'medium', 'long')
*   `generated_content`: JSONB (Stores the structured talk show output: intro, discussion array, highlights array, summary)
*   `mood`: TEXT (e.g., 'funny', 'serious', 'controversial')
*   `is_public`: BOOLEAN (DEFAULT FALSE)
*   `created_at`: TIMESTAMP WITH TIME ZONE (DEFAULT now())
*   `updated_at`: TIMESTAMP WITH TIME ZONE (DEFAULT now())

#### `tags` table
*   `id`: UUID (Primary Key, DEFAULT gen_random_uuid())
*   `name`: TEXT (Unique, e.g., 'AI', 'finance', 'relationships')

#### `episode_tags` table (Junction table)
*   `episode_id`: UUID (Foreign Key to `episodes.id`)
*   `tag_id`: UUID (Foreign Key to `tags.id`)
*   PRIMARY KEY (`episode_id`, `tag_id`)

#### `likes` table
*   `id`: UUID (Primary Key, DEFAULT gen_random_uuid())
*   `episode_id`: UUID (Foreign Key to `episodes.id`)
*   `user_id`: UUID (Foreign Key to `users.id`)
*   `created_at`: TIMESTAMP WITH TIME ZONE (DEFAULT now())
*   UNIQUE (`episode_id`, `user_id`) to prevent duplicate likes.

#### `comments` table
*   `id`: UUID (Primary Key, DEFAULT gen_random_uuid())
*   `episode_id`: UUID (Foreign Key to `episodes.id`)
*   `user_id`: UUID (Foreign Key to `users.id`)
*   `content`: TEXT
*   `created_at`: TIMESTAMP WITH TIME ZONE (DEFAULT now())

### 4.3. Supabase Row-Level Security (RLS)
*   **`users`:** Users can `SELECT` their own profile, `UPDATE` their own profile. Admins can `SELECT`, `INSERT`, `UPDATE`, `DELETE` all.
*   **`personas`:** Users can `SELECT` default personas and their own custom personas, `INSERT`, `UPDATE`, `DELETE` their own custom personas.
*   **`episodes`:** Users can `SELECT` their own episodes, `INSERT`, `UPDATE`, `DELETE` their own episodes. Users can `SELECT` public episodes (`is_public = TRUE`).
*   **`tags`:** Publicly readable.
*   **`episode_tags`:** Read access for related episodes.
*   **`likes`:** Users can `SELECT` all likes, `INSERT` their own, `DELETE` their own.
*   **`comments`:** Users can `SELECT` all comments, `INSERT` their own, `UPDATE` their own, `DELETE` their own.

### 4.4. Supabase Storage
*   **Buckets:** `avatars` (for user profile pictures), `episode_media` (if future features require episode-specific media).
*   **Policies:** RLS for storage buckets ensuring users can only upload/manage their own files.

### 4.5. Supabase Edge Functions
*   **LLM Proxy Function (`generate-talk-show`):**
    *   Receives requests from the React frontend (topic, tone, length, selected personas' traits).
    *   Securely accesses LLM API keys via Supabase secrets/environment variables (never exposed to frontend or Git).
    *   Constructs a well-engineered prompt based on input parameters and persona definitions.
    *   Calls the external LLM API (e.g., OpenAI API).
    *   Parses the LLM response, formats it into the defined structured output (JSON).
    *   Returns the structured talk show content to the frontend.
    *   **Security:** Rate limiting, input sanitization, error handling.
*   **Push Notification Trigger Function (`send-push-notification`):** (If PWA push notifications are implemented via Supabase Edge Functions).
    *   Triggers sending notifications based on database events (e.g., new comment, episode trending).

## 5. AI Integration
*   **LLM Provider:** Selection of a suitable LLM (e.g., GPT-4, Claude 3, Gemini Pro) based on performance, cost, and persona generation capabilities.
*   **Prompt Engineering:**
    *   **Persona Definition:** Crafting detailed system prompts for Comedian, Expert, and custom personas, defining their speaking style, knowledge domain, and interaction patterns.
    *   **Show Structure:** Prompts will guide the LLM to generate content in the specified format: Intro, sequential dialogue, highlight bullet points, and a summary.
    *   **Dynamic Persona Injection:** The `generate-talk-show` Edge Function will dynamically inject the `personality_traits` of selected personas into the LLM prompt.
*   **Output Parsing:** Robust parsing of LLM's raw text response into a structured JSON format (`generated_content` in `episodes` table).

## 6. Security
*   **API Key Management:** All LLM API keys and other sensitive credentials will be stored as Supabase secrets/environment variables and accessed exclusively by Supabase Edge Functions, preventing client-side exposure and accidental Git commits.
*   **Row-Level Security (RLS):** Enabled and configured for all Supabase tables to ensure users only access data they are authorized to see/modify.
*   **Authentication:** Supabase Auth provides secure user management with JWTs.
*   **Input Validation:** Both frontend and backend (Edge Functions, database constraints) will validate user inputs to prevent injection attacks and data corruption.
*   **HTTPS:** All communication will occur over HTTPS.
*   **CORS:** Supabase automatically handles CORS, but specific origins may be configured.

## 7. Performance Optimizations
*   **Database Indexing:** Appropriate indexes on frequently queried columns in PostgreSQL.
*   **PWA Caching:** Service Workers for caching static assets and API responses (`Cache-First` for assets, `Stale-While-Revalidate` for data).
*   **Image Optimization:** Optimized loading of user avatars and other images (e.g., lazy loading, appropriate formats).
*   **Pagination/Infinite Scrolling:** For lists like saved episodes and public feeds to reduce initial load times.
*   **Debouncing/Throttling:** For search/filter inputs.

## 8. Development & Deployment
*   **Development Environment:** Local React development server, Supabase CLI for local database schema management and Edge Function testing.
*   **Version Control:** Git (GitHub) for source code management.
*   **CI/CD:** GitHub Actions for automated testing and deployment to Vercel/Netlify for the frontend.
*   **Deployment Strategy:**
    *   Frontend: Static site deployment (Vercel/Netlify) linked to GitHub repo.
    *   Backend: Supabase is a managed service; schema migrations handled via Supabase dashboard or CLI.
    *   Edge Functions: Deployed via Supabase CLI (`supabase functions deploy`).

## 9. Future Considerations
*   **Monetization:** Premium personas, ad-free experience, increased show generation limits.
*   **Multi-Agent Coordination:** More complex interactions between more than two agents.
*   **Voice Synthesis/Recognition:** Adding audio to the talk shows.
*   **Advanced Analytics:** Tracking popular topics, persona usage, user engagement.
*   **Admin Panel:** For content moderation, user management, and analytics dashboard.

This specification provides a detailed roadmap for building the Pdspyse AI Talk Show application, ensuring a solid technical foundation while addressing all functional and non-functional requirements. The combination of React with Ant Design for a delightful UI and Supabase for a robust and scalable backend positions the project for success. Harmony between the technical implementation and the described 