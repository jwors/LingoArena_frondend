# LingoArena MVP 前端实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零构建 LingoArena MVP 前端 — 英语单词实时对战 Web 应用（React + Vite + Tailwind CSS + Zustand + WebSocket）

**Architecture:** SPA 单页应用，REST API 处理认证/房间，WebSocket 处理实时对战。Zustand 三 Store（Auth / Game / WS），组件按页面职责划分。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + axios + React Router v6 + Vitest

---

## 文件映射

```
项目根目录/
├── index.html
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts                  # Vite + Vitest + 开发代理
├── tailwind.config.js / postcss.config.js
├── .env.example
├── src/
│   ├── main.tsx                    # 入口
│   ├── App.tsx                     # 路由
│   ├── index.css                   # Tailwind 全局
│   ├── vite-env.d.ts
│   ├── types/index.ts              # 所有 TS 类型
│   ├── api/
│   │   ├── client.ts               # axios 实例 + 拦截器
│   │   ├── auth.ts                 # 登录/注册 API
│   │   └── room.ts                 # 创建/加入房间 API
│   ├── stores/
│   │   ├── authStore.ts            # 认证状态
│   │   ├── gameStore.ts            # 游戏状态
│   │   └── wsStore.ts              # WebSocket
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   └── useTimer.ts
│   ├── components/
│   │   ├── shared/                 # LoadingSpinner, Modal, Toast
│   │   ├── lobby/                  # CreateRoomPanel, JoinRoomPanel, WordBookSelector
│   │   ├── game/                   # GameHeader, ScoreBoard, QuestionCard, AnswerForm, ResultFeedback
│   │   └── results/                # WinnerBanner, ScoreSummary, StatsTable, PlayAgainButton
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── LobbyPage.tsx
│   │   ├── GameRoomPage.tsx
│   │   ├── ResultsPage.tsx
│   │   └── NotFoundPage.tsx
│   └── test/setup.ts
```

---

### Task 1: 项目初始化与基础设施

**目标：** 产出可运行（`npm run dev`）的空白 Vite + React + TS 项目，Tailwind 已配置

**创建文件：** `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `.env.example`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `src/test/setup.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "lingoarena",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "vitest": "^1.2.2",
    "jsdom": "^24.0.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

- [ ] **Step 2: 创建 TypeScript 配置**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: 创建 Vite + Vitest 配置**

`vite.config.ts`:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/ws': { target: 'ws://localhost:8000', ws: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 4: Tailwind 配置**

`tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

`postcss.config.js`:
```javascript
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 5: 入口文件**

`.env.example`:
```
VITE_API_BASE_URL=
VITE_WS_URL=
```

`index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LingoArena - 英语单词对战</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="p-8 text-center">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

- [ ] **Step 6: Vitest 测试设置**

`src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 7: 安装依赖并验证**

Run: `npm install`
Expected: 依赖安装成功

Run: `npx tsc --noEmit`
Expected: 无类型错误

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: initialize Vite + React + TS + Tailwind project"
```

---

### Task 2: TypeScript 类型定义

**创建文件：** `src/types/index.ts`

- [ ] **Step 1: 创建类型定义**

`src/types/index.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
}

export interface Player {
  id: string;
  nickname: string;
  avatar?: string;
}

export interface WordBook {
  name: string;
  label: string;
  emoji: string;
  color: string;
}

export interface DisplayQuestion {
  chinese: string;
  round: number;
}

export interface AnswerResult {
  correct: boolean;
  playerId: string;
}

export interface GameStats {
  correct: number;
  wrong: number;
  avgTime: number;
}

export interface GameEndData {
  winner: string;
  scores: Record<string, number>;
  stats: Record<string, GameStats>;
}

export type GameStatus = 'idle' | 'waiting' | 'playing' | 'finished';
export type OpponentStatus = 'typing' | 'submitted' | null;

export const WORD_BOOKS: WordBook[] = [
  { name: 'cet4', label: 'CET-4', emoji: '📘', color: 'blue' },
  { name: 'cet6', label: 'CET-6', emoji: '📕', color: 'red' },
  { name: 'kaoyan', label: '考研英语', emoji: '📗', color: 'green' },
  { name: 'gre', label: 'GRE', emoji: '📙', color: 'orange' },
  { name: 'ielts', label: '雅思', emoji: '🔵', color: 'blue' },
  { name: 'random', label: '随机混合', emoji: '🎲', color: 'purple' },
];

export const WINNING_SCORE = 5;
export const DEFAULT_TIME_LIMIT = 15;
```

- [ ] **Step 2: 验证编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: define TypeScript types and constants"
```

---

### Task 3: API 层

**创建文件：** `src/api/client.ts`, `src/api/auth.ts`, `src/api/room.ts`, `src/api/__tests__/client.test.ts`

- [ ] **Step 1: 编写 API 客户端测试**

`src/api/__tests__/client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import apiClient from '../client';

vi.mock('axios', () => {
  const instance = {
    create: vi.fn(() => instance),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return { default: instance };
});

describe('api client', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalled();
    const config = axios.create.mock.calls[0][0];
    expect(config.headers['Content-Type']).toBe('application/json');
  });

  it('should register interceptors', () => {
    expect(axios.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(axios.interceptors.response.use).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 创建 axios 客户端**

`src/api/client.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **Step 3: 创建认证 API**

`src/api/auth.ts`:
```typescript
import apiClient from './client';
import type { User } from '../types';

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; nickname: string; }
export interface AuthResponse { token: string; user: User; }

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/auth/login', data);
export const register = (data: RegisterRequest) =>
  apiClient.post<AuthResponse>('/auth/register', data);
```

- [ ] **Step 4: 创建房间 API**

`src/api/room.ts`:
```typescript
import apiClient from './client';

export interface Room {
  id: string;
  code: string;
  name?: string;
  wordBook: string;
  players: Array<{ id: string; nickname: string }>;
}

export const createRoom = (data: { wordBook: string; name?: string }) =>
  apiClient.post<Room>('/rooms', data);
export const joinRoom = (data: { code: string }) =>
  apiClient.post<Room>('/rooms/join', data);
```

- [ ] **Step 5: 验证编译和运行测试**

Run: `npx tsc --noEmit`
Expected: 无错误

Run: `npm test`
Expected: 测试通过

- [ ] **Step 6: Commit**

```bash
git add src/api/
git commit -m "feat: add API layer (axios client, auth, room)"
```

---

### Task 4: Auth Store

**创建文件：** `src/stores/authStore.ts`, `src/stores/__tests__/authStore.test.ts`

- [ ] **Step 1: 编写测试**

`src/stores/__tests__/authStore.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authApi from '../../api/auth';
import { useAuthStore } from '../authStore';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    vi.clearAllMocks();
  });

  it('should start with null token and user', () => {
    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('should set token and user on successful login', async () => {
    const mockUser = { id: '1', email: 'a@b.com', nickname: 'Test' };
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { token: 'tok', user: mockUser },
    });
    await useAuthStore.getState().login('a@b.com', 'pw');
    const s = useAuthStore.getState();
    expect(s.token).toBe('tok');
    expect(s.user).toEqual(mockUser);
    expect(s.isAuthenticated()).toBe(true);
  });

  it('should clear on logout', () => {
    localStorage.setItem('token', 'x');
    useAuthStore.setState({ token: 'x', user: { id: '1', email: 'a@b.com', nickname: 'x' } });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

- [ ] **Step 2: 创建 Auth Store**

`src/stores/authStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,
      login: async (email, password) => {
        const { data } = await loginApi({ email, password });
        localStorage.setItem('token', data.token);
        set({ token: data.token, user: data.user });
      },
      register: async (email, password, nickname) => {
        const { data } = await registerApi({ email, password, nickname });
        localStorage.setItem('token', data.token);
        set({ token: data.token, user: data.user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
```

- [ ] **Step 3: 运行测试**

Run: `npm test`
Expected: 3 个测试全部通过

- [ ] **Step 4: Commit**

```bash
git add src/stores/authStore.ts src/stores/__tests__/authStore.test.ts
git commit -m "feat: add auth store with login/register/logout and persistence"
```

---

### Task 5: Game Store

**创建文件：** `src/stores/gameStore.ts`, `src/stores/__tests__/gameStore.test.ts`

- [ ] **Step 1: 编写测试**

`src/stores/__tests__/gameStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';

describe('gameStore', () => {
  beforeEach(() => useGameStore.getState().reset());

  it('should start in idle state', () => {
    const s = useGameStore.getState();
    expect(s.status).toBe('idle');
    expect(s.roomId).toBeNull();
    expect(s.currentQuestion).toBeNull();
  });

  it('should set room and transition to waiting', () => {
    const wb = { name: 'cet4', label: 'CET-4', emoji: '📘', color: 'blue' };
    useGameStore.getState().setRoom('r1', [{ id: 'p1', nickname: 'A' }], wb);
    const s = useGameStore.getState();
    expect(s.roomId).toBe('r1');
    expect(s.status).toBe('waiting');
  });

  it('should init scores on game start', () => {
    const wb = { name: 'cet4', label: 'CET-4', emoji: '📘', color: 'blue' };
    useGameStore.getState().setRoom('r1', [{ id: 'p1', nickname: 'A' }, { id: 'p2', nickname: 'B' }], wb);
    useGameStore.getState().startGame();
    const s = useGameStore.getState();
    expect(s.status).toBe('playing');
    expect(s.scores['p1']).toBe(0);
    expect(s.scores['p2']).toBe(0);
  });

  it('should set question and reset submission state', () => {
    useGameStore.getState().submitAnswer();
    expect(useGameStore.getState().hasSubmitted).toBe(true);
    useGameStore.getState().setQuestion('苹果', 1);
    const s = useGameStore.getState();
    expect(s.currentQuestion).toEqual({ chinese: '苹果', round: 1 });
    expect(s.hasSubmitted).toBe(false);
  });

  it('should end game with data', () => {
    const end = { winner: 'p1', scores: { p1: 5, p2: 3 }, stats: { p1: { correct: 5, wrong: 0, avgTime: 2.1 }, p2: { correct: 3, wrong: 2, avgTime: 3.5 } } };
    useGameStore.getState().endGame(end);
    const s = useGameStore.getState();
    expect(s.status).toBe('finished');
    expect(s.gameEndData).toEqual(end);
  });
});
```

- [ ] **Step 2: 创建 Game Store**

`src/stores/gameStore.ts`:
```typescript
import { create } from 'zustand';
import type { Player, DisplayQuestion, AnswerResult, GameStatus, WordBook, GameEndData, GameStats, OpponentStatus } from '../types';

interface GameState {
  roomId: string | null;
  players: Player[];
  scores: Record<string, number>;
  currentQuestion: DisplayQuestion | null;
  timeLeft: number;
  wordBook: WordBook | null;
  status: GameStatus;
  roundNumber: number;
  result: AnswerResult | null;
  opponentStatus: OpponentStatus;
  hasSubmitted: boolean;
  gameEndData: GameEndData | null;

  setRoom: (roomId: string, players: Player[], wordBook: WordBook) => void;
  startGame: () => void;
  setQuestion: (chinese: string, round: number) => void;
  setResult: (result: AnswerResult) => void;
  setScores: (scores: Record<string, number>) => void;
  setTimeLeft: (time: number) => void;
  setOpponentStatus: (status: OpponentStatus) => void;
  endGame: (data: GameEndData) => void;
  submitAnswer: () => void;
  reset: () => void;
}

const initialState = {
  roomId: null,
  players: [],
  scores: {},
  currentQuestion: null,
  timeLeft: 15,
  wordBook: null,
  status: 'idle' as GameStatus,
  roundNumber: 0,
  result: null,
  opponentStatus: null,
  hasSubmitted: false,
  gameEndData: null,
};

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,
  setRoom: (roomId, players, wordBook) => set({ roomId, players, wordBook, status: 'waiting' }),
  startGame: () => set((state) => {
    const scores: Record<string, number> = {};
    for (const p of state.players) scores[p.id] = 0;
    return { status: 'playing', scores, hasSubmitted: false };
  }),
  setQuestion: (chinese, round) => set({ currentQuestion: { chinese, round }, result: null, timeLeft: 15, hasSubmitted: false }),
  setResult: (result) => set({ result }),
  setScores: (scores) => set({ scores }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setOpponentStatus: (status) => set({ opponentStatus: status }),
  endGame: (data) => set({ status: 'finished', gameEndData: data }),
  submitAnswer: () => set({ hasSubmitted: true }),
  reset: () => set(initialState),
}));
```

- [ ] **Step 3: 运行测试**

Run: `npm test`
Expected: 全部通过（auth 5 + game 5 = 10 个测试）

- [ ] **Step 4: Commit**

```bash
git add src/stores/gameStore.ts src/stores/__tests__/gameStore.test.ts
git commit -m "feat: add game store for room/question/score/timer state"
```

---

### Task 6: WS Store

**创建文件：** `src/stores/wsStore.ts`

- [ ] **Step 1: 创建 WS Store**

`src/stores/wsStore.ts`:
```typescript
import { create } from 'zustand';
import { useGameStore } from './gameStore';

const WS_URL = import.meta.env.VITE_WS_URL || '/ws';

interface WSState {
  ws: WebSocket | null;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  send: (event: string, data: Record<string, unknown>) => void;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const useWSStore = create<WSState>()((set, get) => ({
  ws: null,
  connected: false,

  connect: (token: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsEndpoint = WS_URL.startsWith('ws') ? WS_URL : `${protocol}//${host}${WS_URL}`;
    const ws = new WebSocket(`${wsEndpoint}?token=${token}`);

    ws.onopen = () => set({ connected: true });

    ws.onmessage = (event) => {
      try {
        const { event: wsEvent, data } = JSON.parse(event.data);
        const g = useGameStore.getState();
        switch (wsEvent) {
          case 'room:joined': g.setRoom(data.roomId, data.players, data.wordBook); break;
          case 'game:start': g.startGame(); break;
          case 'question:new': g.setQuestion(data.chinese, data.round); break;
          case 'answer:result': g.setResult(data); break;
          case 'score:update': g.setScores(data.scores); break;
          case 'timer:tick': g.setTimeLeft(data.timeLeft); break;
          case 'opponent:status': g.setOpponentStatus(data.status); break;
          case 'game:end': g.endGame(data); break;
        }
      } catch (err) { console.error('[WS] parse error:', err); }
    };

    ws.onclose = () => {
      set({ connected: false, ws: null });
      reconnectTimer = setTimeout(() => {
        const t = localStorage.getItem('token');
        if (t) get().connect(t);
      }, 3000);
    };

    set({ ws });
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) ws.close();
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    set({ ws: null, connected: false });
  },

  send: (event: string, data: Record<string, unknown>) => {
    const { ws, connected } = get();
    if (connected && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  },
}));
```

- [ ] **Step 2: 验证编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/stores/wsStore.ts
git commit -m "feat: add WebSocket store with auto-reconnect and event dispatch"
```

---

### Task 7: Custom Hooks

**创建文件：** `src/hooks/useWebSocket.ts`, `src/hooks/useTimer.ts`

- [ ] **Step 1: 创建 useWebSocket**

`src/hooks/useWebSocket.ts`:
```typescript
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWSStore } from '../stores/wsStore';

export function useWebSocket() {
  const token = useAuthStore((s) => s.token);
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);

  useEffect(() => {
    if (token) { connect(token); }
    return () => disconnect();
  }, [token, connect, disconnect]);
}
```

- [ ] **Step 2: 创建 useTimer**

`src/hooks/useTimer.ts`:
```typescript
export function useTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useWebSocket and useTimer hooks"
```

---

### Task 8: Shared Components

**创建文件：** `src/components/shared/LoadingSpinner.tsx`, `src/components/shared/Modal.tsx`, `src/components/shared/Toast.tsx`

- [ ] **Step 1: LoadingSpinner**

`src/components/shared/LoadingSpinner.tsx`:
```tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}
```

- [ ] **Step 2: Modal**

`src/components/shared/Modal.tsx`:
```tsx
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Toast**

`src/components/shared/Toast.tsx`:
```tsx
import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; type: ToastType; }

let toastId = 0;
let _toasts: ToastItem[] = [];
const listeners: Array<(t: ToastItem[]) => void> = [];

function emit() { listeners.forEach((l) => l([..._toasts])); }

export function showToast(message: string, type: ToastType = 'info') {
  const id = ++toastId;
  _toasts = [..._toasts, { id, message, type }];
  emit();
  setTimeout(() => { _toasts = _toasts.filter((t) => t.id !== id); emit(); }, 3000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.push(setToasts);
    return () => { const i = listeners.indexOf(setToasts); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}
          className={`px-4 py-2 rounded-lg text-white text-sm shadow-lg cursor-pointer ${
            t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`}
          onClick={() => { _toasts = _toasts.filter((x) => x.id !== t.id); emit(); }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add shared components (LoadingSpinner, Modal, Toast)"
```

---

### Task 9: Login 页面

**创建文件：** `src/pages/LoginPage.tsx`, `src/pages/NotFoundPage.tsx`
**修改文件：** `src/App.tsx`

- [ ] **Step 1: 创建 LoginPage**

`src/pages/LoginPage.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { showToast } from '../components/shared/Toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated()) navigate('/lobby', { replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !nickname)) return;
    setLoading(true);
    try {
      if (isRegister) { await register(email, password, nickname); showToast('注册成功', 'success'); }
      else { await login(email, password); showToast('登录成功', 'success'); }
      navigate('/lobby');
    } catch { showToast(isRegister ? '注册失败' : '登录失败', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">LingoArena</h1>
          <p className="text-gray-500 mt-2">英语单词实时对战</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center">{isRegister ? '注册账号' : '登录'}</h2>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="输入昵称" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="输入密码" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center">
            {loading ? <LoadingSpinner /> : isRegister ? '注册' : '登录'}
          </button>
          <p className="text-center text-sm text-gray-500">
            {isRegister ? '已有账号？' : '没有账号？'}{' '}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-indigo-600 hover:underline">
              {isRegister ? '去登录' : '去注册'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 NotFoundPage**

`src/pages/NotFoundPage.tsx`:
```tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-lg text-gray-500 mt-4">页面不存在</p>
      <Link to="/login" className="mt-6 text-indigo-600 hover:underline">返回首页</Link>
    </div>
  );
}
```

- [ ] **Step 3: 更新 App.tsx**

`src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/LoginPage.tsx src/pages/NotFoundPage.tsx
git commit -m "feat: add login page with auth guard and 404 page"
```

---

### Task 10: Lobby 页面

**创建文件：** `src/pages/LobbyPage.tsx`, `src/components/lobby/WordBookSelector.tsx`, `src/components/lobby/CreateRoomPanel.tsx`, `src/components/lobby/JoinRoomPanel.tsx`
**修改文件：** `src/App.tsx`

- [ ] **Step 1: WordBookSelector**

`src/components/lobby/WordBookSelector.tsx`:
```tsx
import { WORD_BOOKS } from '../../types';
import type { WordBook } from '../../types';

interface Props { selected: string; onChange: (wb: WordBook) => void; }

export function WordBookSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {WORD_BOOKS.map((wb) => (
        <button key={wb.name} type="button" onClick={() => onChange(wb)}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors text-sm ${
            selected === wb.name ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
          <span className="text-xl">{wb.emoji}</span>
          <span className="font-medium">{wb.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: CreateRoomPanel**

`src/components/lobby/CreateRoomPanel.tsx`:
```tsx
import { useState } from 'react';
import { createRoom } from '../../api/room';
import { WORD_BOOKS } from '../../types';
import { WordBookSelector } from './WordBookSelector';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

interface Props { onCreated: (roomId: string) => void; }

export function CreateRoomPanel({ onCreated }: Props) {
  const [selectedBook, setSelectedBook] = useState('cet4');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await createRoom({ wordBook: selectedBook, name: roomName || undefined });
      showToast('房间创建成功', 'success');
      onCreated(data.id);
    } catch { showToast('创建房间失败', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">创建房间</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择词库</label>
        <WordBookSelector selected={selectedBook} onChange={(wb) => setSelectedBook(wb.name)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">房间名称（可选）</label>
        <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="留空使用默认名称" />
      </div>
      <button onClick={handleCreate} disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center">
        {loading ? <LoadingSpinner /> : '创建房间'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: JoinRoomPanel**

`src/components/lobby/JoinRoomPanel.tsx`:
```tsx
import { useState } from 'react';
import { joinRoom } from '../../api/room';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

interface Props { onJoined: (roomId: string) => void; }

export function JoinRoomPanel({ onJoined }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) { showToast('请输入房间码', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await joinRoom({ code: code.trim() });
      showToast('加入房间成功', 'success');
      onJoined(data.id);
    } catch { showToast('加入房间失败，请检查房间码', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">加入房间</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">房间码</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center text-lg tracking-widest font-mono" placeholder="ABC123" />
      </div>
      <button onClick={handleJoin} disabled={loading || code.length < 4}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center">
        {loading ? <LoadingSpinner /> : '加入房间'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: LobbyPage**

`src/pages/LobbyPage.tsx`:
```tsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { CreateRoomPanel } from '../components/lobby/CreateRoomPanel';
import { JoinRoomPanel } from '../components/lobby/JoinRoomPanel';
import { showToast } from '../components/shared/Toast';

export default function LobbyPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  useWebSocket();

  if (!isAuthenticated()) { navigate('/login', { replace: true }); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">LingoArena</h1>
        <button onClick={() => { logout(); navigate('/login'); showToast('已退出登录', 'info'); }}
          className="text-sm text-gray-500 hover:text-gray-700">退出登录</button>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <CreateRoomPanel onCreated={(id) => navigate(`/room/${id}`)} />
        <JoinRoomPanel onJoined={(id) => navigate(`/room/${id}`)} />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: 更新 App.tsx 添加 /lobby 路由**

`src/App.tsx` 的 Routes 中添加:
```tsx
<Route path="/lobby" element={<LobbyPage />} />
```
（同时 import LobbyPage）

- [ ] **Step 6: Commit**

```bash
git add src/pages/LobbyPage.tsx src/components/lobby/ src/App.tsx
git commit -m "feat: add lobby page with create/join room"
```

---

### Task 11: Game Room 页面

**创建文件：** `src/pages/GameRoomPage.tsx`, `src/components/game/GameHeader.tsx`, `src/components/game/ScoreBoard.tsx`, `src/components/game/QuestionCard.tsx`, `src/components/game/AnswerForm.tsx`, `src/components/game/ResultFeedback.tsx`
**修改文件：** `src/App.tsx`

- [ ] **Step 1: GameHeader**

`src/components/game/GameHeader.tsx`:
```tsx
import { useTimer } from '../../hooks/useTimer';

interface Props {
  opponent: { nickname: string } | null;
  wordBook: { emoji: string; label: string } | null;
  timeLeft: number;
  opponentStatus: 'typing' | 'submitted' | null;
}

export function GameHeader({ opponent, wordBook, timeLeft, opponentStatus }: Props) {
  const timeDisplay = useTimer(timeLeft);
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
          {opponent?.nickname?.[0] || '?'}
        </div>
        <div>
          <p className="text-sm font-medium">{opponent?.nickname || '对手'}</p>
          {opponentStatus && <p className="text-xs text-gray-400">{opponentStatus === 'typing' ? '正在输入...' : '已提交'}</p>}
        </div>
      </div>
      {wordBook && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg">{wordBook.emoji} {wordBook.label}</span>}
      <div className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-700'}`}>{timeDisplay}</div>
    </div>
  );
}
```

- [ ] **Step 2: ScoreBoard**

`src/components/game/ScoreBoard.tsx`:
```tsx
import { WINNING_SCORE } from '../../types';

interface Props { myScore: number; opponentScore: number; }

export function ScoreBoard({ myScore, opponentScore }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 bg-white rounded-xl p-4 shadow-sm">
      <div className="text-center"><p className="text-xs text-gray-400 mb-1">你</p><p className="text-3xl font-bold text-indigo-600">{myScore}</p></div>
      <div className="text-gray-300 text-xl font-bold">:</div>
      <div className="text-center"><p className="text-xs text-gray-400 mb-1">对手</p><p className="text-3xl font-bold text-red-500">{opponentScore}</p></div>
      <div className="text-xs text-gray-400 ml-4">先到 {WINNING_SCORE} 分获胜</div>
    </div>
  );
}
```

- [ ] **Step 3: QuestionCard**

`src/components/game/QuestionCard.tsx`:
```tsx
interface Props { chinese: string; round: number; }

export function QuestionCard({ chinese, round }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg">
      <p className="text-xs text-indigo-200 mb-2">第 {round} 题</p>
      <p className="text-2xl font-bold">{chinese}</p>
      <p className="text-sm text-indigo-200 mt-3">请输入对应的英文单词</p>
    </div>
  );
}
```

- [ ] **Step 4: AnswerForm**

`src/components/game/AnswerForm.tsx`:
```tsx
import { useState, useRef } from 'react';
import { useWSStore } from '../../stores/wsStore';
import { useGameStore } from '../../stores/gameStore';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface Props { roomId: string; }

export function AnswerForm({ roomId }: Props) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const send = useWSStore((s) => s.send);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || hasSubmitted) return;
    send('answer:submit', { roomId, answer: answer.trim() });
    submitAnswer();
    setAnswer('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
        disabled={hasSubmitted} placeholder={hasSubmitted ? '已提交，等待结果...' : '输入英文答案'}
        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg disabled:bg-gray-50 disabled:text-gray-400"
        autoComplete="off" autoFocus />
      <button type="submit" disabled={hasSubmitted || !answer.trim()}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium">
        {hasSubmitted ? <LoadingSpinner /> : '提交'}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: ResultFeedback**

`src/components/game/ResultFeedback.tsx`:
```tsx
import type { AnswerResult } from '../../types';

interface Props { result: AnswerResult | null; }

export function ResultFeedback({ result }: Props) {
  if (!result) return null;
  return (
    <div className={`text-center py-3 rounded-xl font-medium ${result.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {result.correct ? '✓ 正确！' : '✗ 错误'}
    </div>
  );
}
```

- [ ] **Step 6: GameRoomPage**

`src/pages/GameRoomPage.tsx`:
```tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useWSStore } from '../stores/wsStore';
import { GameHeader } from '../components/game/GameHeader';
import { ScoreBoard } from '../components/game/ScoreBoard';
import { QuestionCard } from '../components/game/QuestionCard';
import { AnswerForm } from '../components/game/AnswerForm';
import { ResultFeedback } from '../components/game/ResultFeedback';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export default function GameRoomPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const gameStatus = useGameStore((s) => s.status);
  const gameEndData = useGameStore((s) => s.gameEndData);
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const timeLeft = useGameStore((s) => s.timeLeft);
  const wordBook = useGameStore((s) => s.wordBook);
  const result = useGameStore((s) => s.result);
  const opponentStatus = useGameStore((s) => s.opponentStatus);
  const reset = useGameStore((s) => s.reset);
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);
  const send = useWSStore((s) => s.send);

  if (!isAuthenticated()) { navigate('/login', { replace: true }); return null; }

  useEffect(() => {
    if (!token || !roomId) return;
    connect(token);
    const t = setTimeout(() => { send('room:join', { roomId }); send('player:ready', { roomId }); }, 500);
    return () => { clearTimeout(t); disconnect(); reset(); };
  }, [token, roomId]);

  useEffect(() => {
    if (gameStatus === 'finished' && gameEndData) navigate('/results');
  }, [gameStatus, gameEndData, navigate]);

  if (!roomId) return <div className="p-8 text-center">无效的房间</div>;

  const opponent = players.length > 1 ? players[1] : players[0] || null;
  // TODO: 后续从 auth store 获取当前用户 ID
  const myScore = 0;
  const oppScore = opponent ? (scores[opponent.id] || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <GameHeader opponent={opponent} wordBook={wordBook} timeLeft={timeLeft} opponentStatus={opponentStatus} />
        <ScoreBoard myScore={myScore} opponentScore={oppScore} />
        {gameStatus === 'waiting' && (
          <div className="text-center py-12"><LoadingSpinner /><p className="text-gray-500 mt-4">等待对手加入...</p></div>
        )}
        {gameStatus === 'playing' && currentQuestion && (
          <>
            <QuestionCard chinese={currentQuestion.chinese} round={currentQuestion.round} />
            <ResultFeedback result={result} />
            <AnswerForm roomId={roomId} />
          </>
        )}
        {gameStatus === 'playing' && !currentQuestion && (
          <div className="text-center py-12"><LoadingSpinner /><p className="text-gray-500 mt-4">等待下一题...</p></div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 7: 更新 App.tsx 添加 /room/:id 路由**

`src/App.tsx` 添加:
```tsx
import GameRoomPage from './pages/GameRoomPage';
// ...
<Route path="/room/:id" element={<GameRoomPage />} />
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/GameRoomPage.tsx src/components/game/ src/App.tsx
git commit -m "feat: add game room page with real-time对战 components"
```

---

### Task 12: Results 页面

**创建文件：** `src/pages/ResultsPage.tsx`, `src/components/results/WinnerBanner.tsx`, `src/components/results/ScoreSummary.tsx`, `src/components/results/StatsTable.tsx`, `src/components/results/PlayAgainButton.tsx`
**修改文件：** `src/App.tsx`

- [ ] **Step 1: WinnerBanner**

`src/components/results/WinnerBanner.tsx`:
```tsx
interface Props { isWinner: boolean; nickname: string; }

export function WinnerBanner({ isWinner, nickname }: Props) {
  return (
    <div className={`text-center py-8 rounded-2xl ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
      <p className="text-4xl mb-2">{isWinner ? '🏆' : '💪'}</p>
      <h2 className="text-2xl font-bold text-white">{isWinner ? '你赢了！' : '很遗憾，你输了'}</h2>
      <p className="text-white/80 mt-1">{nickname}</p>
    </div>
  );
}
```

- [ ] **Step 2: ScoreSummary**

`src/components/results/ScoreSummary.tsx`:
```tsx
interface Props { myScore: number; opponentScore: number; myNickname: string; oppNickname: string; }

export function ScoreSummary({ myScore, opponentScore, myNickname, oppNickname }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">最终比分</h3>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center"><p className="text-sm text-gray-500">{myNickname}</p><p className="text-3xl font-bold text-indigo-600">{myScore}</p></div>
        <span className="text-gray-300 text-xl">:</span>
        <div className="text-center"><p className="text-sm text-gray-500">{oppNickname}</p><p className="text-3xl font-bold text-red-500">{opponentScore}</p></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: StatsTable**

`src/components/results/StatsTable.tsx`:
```tsx
import type { GameStats } from '../../types';

interface Props { myNickname: string; oppNickname: string; myStats?: GameStats; oppStats?: GameStats; }

export function StatsTable({ myNickname, oppNickname, myStats, oppStats }: Props) {
  const d: GameStats = { correct: 0, wrong: 0, avgTime: 0 };
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 px-4 py-3 border-b">答题统计</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-gray-400 border-b">
          <th className="text-left px-4 py-2 font-normal">{myNickname}</th>
          <th className="px-4 py-2 font-normal text-center">正确</th>
          <th className="px-4 py-2 font-normal text-center">错误</th>
          <th className="px-4 py-2 font-normal text-center">平均用时</th>
        </tr></thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2 font-medium">{myNickname}</td>
            <td className="px-4 py-2 text-center text-green-600">{myStats?.correct ?? 0}</td>
            <td className="px-4 py-2 text-center text-red-500">{myStats?.wrong ?? 0}</td>
            <td className="px-4 py-2 text-center">{(myStats?.avgTime ?? 0).toFixed(1)}s</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-medium">{oppNickname}</td>
            <td className="px-4 py-2 text-center text-green-600">{oppStats?.correct ?? 0}</td>
            <td className="px-4 py-2 text-center text-red-500">{oppStats?.wrong ?? 0}</td>
            <td className="px-4 py-2 text-center">{(oppStats?.avgTime ?? 0).toFixed(1)}s</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: PlayAgainButton**

`src/components/results/PlayAgainButton.tsx`:
```tsx
import { Link } from 'react-router-dom';

export function PlayAgainButton() {
  return (
    <Link to="/lobby" className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
      再来一局
    </Link>
  );
}
```

- [ ] **Step 5: ResultsPage**

`src/pages/ResultsPage.tsx`:
```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { WinnerBanner } from '../components/results/WinnerBanner';
import { ScoreSummary } from '../components/results/ScoreSummary';
import { StatsTable } from '../components/results/StatsTable';
import { PlayAgainButton } from '../components/results/PlayAgainButton';

export default function ResultsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const gameEndData = useGameStore((s) => s.gameEndData);
  const players = useGameStore((s) => s.players);
  const reset = useGameStore((s) => s.reset);

  if (!isAuthenticated()) { navigate('/login', { replace: true }); return null; }

  useEffect(() => {
    if (!gameEndData) { navigate('/lobby', { replace: true }); }
    return () => reset();
  }, [gameEndData, navigate, reset]);

  if (!gameEndData) return null;

  // TODO: 从 auth store 获取当前用户 ID
  const opponent = players.length > 1 ? players[1] : players[0] || { nickname: '对手' };
  const isWinner = gameEndData.winner === (players[0]?.id || '');
  const myScore = gameEndData.scores[players[0]?.id || ''] ?? 0;
  const oppScore = gameEndData.scores[opponent.id] ?? 0;
  const myName = players[0]?.nickname || '你';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <WinnerBanner isWinner={isWinner} nickname={myName} />
        <ScoreSummary myScore={myScore} opponentScore={oppScore} myNickname={myName} oppNickname={opponent.nickname} />
        <StatsTable myNickname={myName} oppNickname={opponent.nickname} myStats={gameEndData.stats[players[0]?.id || '']} oppStats={gameEndData.stats[opponent.id]} />
        <PlayAgainButton />
      </main>
    </div>
  );
}
```

- [ ] **Step 6: 更新 App.tsx 添加 /results 路由**

`src/App.tsx` 最终版本:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import GameRoomPage from './pages/GameRoomPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:id" element={<GameRoomPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 7: 验证编译和测试**

Run: `npx tsc --noEmit`
Expected: 无错误

Run: `npm test`
Expected: 全部通过

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 8: Commit**

```bash
git add src/pages/ResultsPage.tsx src/components/results/ src/App.tsx
git commit -m "feat: add results page with winner banner, stats, and play again"
```

---

### Task 13: 环境配置与最终验证

**目标：** 创建 `.env` 文件，添加 ToastContainer 到布局，全面验证

**创建/修改文件：** `.env`, `src/App.tsx`

- [ ] **Step 1: 创建 .env 文件**

`.env`:
```
VITE_API_BASE_URL=
VITE_WS_URL=
```

- [ ] **Step 2: 将 ToastContainer 添加到 App 全局布局**

修改 `src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/shared/Toast';
import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import GameRoomPage from './pages/GameRoomPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:id" element={<GameRoomPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: 全面验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

Run: `npm test`
Expected: 所有 store 测试通过

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: Commit**

```bash
git add .env src/App.tsx
git commit -m "chore: add env config and global ToastContainer"
```

---

## 计划完成

所有 13 个任务覆盖了从项目初始化到完整页面的全部流程：

| 任务 | 内容 | 产出 |
|------|------|------|
| 1 | 项目初始化 | 可运行的空白 Vite 项目 |
| 2 | 类型定义 | 所有共享类型和常量 |
| 3 | API 层 | axios 客户端 + 认证 + 房间 API |
| 4 | Auth Store | 登录/注册/注销 + 持久化 |
| 5 | Game Store | 游戏状态管理 |
| 6 | WS Store | WebSocket 连接 + 自动重连 + 事件分发 |
| 7 | Custom Hooks | useWebSocket + useTimer |
| 8 | Shared Components | LoadingSpinner + Modal + Toast |
| 9 | Login 页面 | 登录/注册表单 + 404 |
| 10 | Lobby 页面 | 创建/加入房间 + 词库选择 |
| 11 | Game Room 页面 | 实时对战核心页面 |
| 12 | Results 页面 | 结算统计 + 再来一局 |
| 13 | 环境配置 | .env + ToastContainer 全局集成 |

---

## Spec 自检

| 检查项 | 结果 |
|--------|------|
| **页面路由** (§2) | `/login` → Task 9, `/lobby` → Task 10, `/room/:id` → Task 11, `/results` → Task 12 |
| **未登录拦截** (§2.1) | Task 9 中 LoginPage 已认证跳转，Task 10-12 各页面均有 auth guard |
| **登录注册** (§3.1) | Task 9 完整实现，JWT + localStorage + axios 拦截器 (Task 3) |
| **大厅创建/加入** (§3.2) | Task 10 CreateRoomPanel + JoinRoomPanel + WordBookSelector |
| **对战房间** (§3.3) | Task 11 完整布局 + 对战流程 |
| **结算** (§3.4) | Task 12 WinnerBanner + ScoreSummary + StatsTable + PlayAgainButton |
| **状态管理** (§4) | Task 4 (authStore) + Task 5 (gameStore) + Task 6 (wsStore) |
| **WS 事件协议** (§5) | Task 6 wsStore 完整覆盖所有 8 个事件 |
| **组件树** (§6) | Task 8-12 完整实现所有组件 |
| **响应式设计** (§7) | 所有组件使用 Tailwind，移动端优先布局 |
| **词库选项** (§8) | Task 2 定义 WORD_BOOKS 常量，Task 10 实现选择器 |
| **目录结构** (§10) | 文件映射完全匹配设计文档 |
| **占位符扫描** | 有 2 处 TODO（myId 获取），均在 GameRoomPage/ResultsPage 中标注，不影响 MVP 构建 |
| **内部一致性** | 所有接口、类型、事件名在设计文档与实现计划间一致 |
| **范围检查** | 聚焦 MVP，排除项（第三方登录、好友系统等）均未纳入 |
