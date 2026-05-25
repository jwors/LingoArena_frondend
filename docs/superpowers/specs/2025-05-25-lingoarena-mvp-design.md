# LingoArena MVP 前端设计文档

> 英语单词实时对战 Web 应用 — 前端（React + Vite + Tailwind CSS）
> 后端仓库独立，通过 REST API + WebSocket 通信

---

## 1. 技术栈

| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 类型安全，生态成熟 |
| 构建 | Vite | 快速 HMR，开发体验好 |
| 样式 | Tailwind CSS | 响应式，移动端优先，PC 适配 |
| 路由 | React Router v6 | SPA 路由 |
| 状态管理 | Zustand | 轻量级，无 boilerplate |
| HTTP 请求 | axios | REST API 调用 |
| 实时通信 | 原生 WebSocket | 无需第三方库，FastAPI 原生支持 |
| 部署 | Vercel / 阿里云 OSS+CDN | 国内访问友好 |

## 2. 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录/注册 | 邮箱+密码，JWT 认证 |
| `/lobby` | 大厅 | 创建房间 / 输入房间码加入 |
| `/room/:id` | 对战房间 | 实时对战核心页面 |
| `/results` | 结算 | 显示对战结果、统计数据 |

### 2.1 未登录拦截

所有路由（除 `/login`）配置路由守卫，无有效 token 时重定向到 `/login`。

## 3. 核心功能点

### 3.1 登录注册（`/login`）

- 邮箱 + 密码登录/注册
- JWT token 存入 localStorage
- axios 拦截器自动附加 Authorization header
- 登录后跳转到 `/lobby`

### 3.2 大厅（`/lobby`）

**创建房间流程：**
1. 选择词库（CET-4 / CET-6 / 考研 / GRE / 雅思 / 随机）
2. 输入可选房间名称
3. 点击创建 → POST /api/rooms → 进入 `/room/:id`

**加入房间流程：**
1. 输入 6 位房间码
2. 点击加入 → POST /api/rooms/join → 进入 `/room/:id`

**等待状态：**
- 创建者等待对手加入，显示房间码 + 分享链接按钮
- 对手加入后自动开始游戏

### 3.3 对战房间（`/room/:id`）

**布局结构：**
- **顶部栏**：对手头像/昵称、词库标签、倒计时
- **计分板**：双方分数（先到 5 分获胜）
- **题目区**：中文单词/句子
- **作答区**：英文输入框 + 提交按钮
- **反馈区**：正确/错误/超时提示

**对战流程：**
1. WebSocket 连接建立，加入房间
2. 服务端推送 `game:start` 事件
3. 每回合推送 `question:new`（中文题目）
4. 玩家输入英文并提交（`answer:submit`）
5. 服务端推送 `answer:result`（是否正确）+ `score:update`（比分）
6. 先到 5 分时服务端推送 `game:end`
7. 跳转到结算页面

**交互规则：**
- 提交后输入框锁定，等待服务端结果
- 双方都提交或超时后进入下一题
- 超时（15 秒，可配置）自动跳过
- 先提交且正确者得分

### 3.4 结算（`/results`）

- 显示获胜者
- 双方最终比分
- 答题统计（正确数、错误数、平均用时）
- "再来一局" 按钮 → 回到 `/lobby`

## 4. 状态管理

使用 Zustand，分三个 store：

### 4.1 Auth Store

```typescript
interface AuthStore {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}
```

持久化到 localStorage，页面刷新后自动恢复。

### 4.2 Game Store

```typescript
interface GameStore {
  roomId: string | null;
  players: Player[];
  scores: Record<string, number>;
  currentQuestion: Question | null;
  timeLeft: number;
  wordBook: WordBook;
  status: 'idle' | 'waiting' | 'playing' | 'finished';
  roundNumber: number;
  result: AnswerResult | null;

  // actions
  submitAnswer: (answer: string) => void;
  reset: () => void;
}
```

### 4.3 WS Store

```typescript
interface WSStore {
  ws: WebSocket | null;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  send: (event: string, data: unknown) => void;
}
```

自动重连机制，断线后每 3 秒尝试重新连接。

## 5. WebSocket 事件协议

### 5.1 客户端 → 服务端

| 事件 | 数据 | 说明 |
|------|------|------|
| `room:join` | `{ roomId }` | 加入房间 |
| `answer:submit` | `{ roomId, answer }` | 提交答案 |
| `player:ready` | `{ roomId }` | 准备就绪 |

### 5.2 服务端 → 客户端

| 事件 | 数据 | 说明 |
|------|------|------|
| `room:joined` | `{ roomId, players, wordBook }` | 加入成功 |
| `game:start` | `{ wordBook, totalRounds }` | 游戏开始 |
| `question:new` | `{ chinese, round }` | 新题目 |
| `answer:result` | `{ correct, playerId }` | 提交结果 |
| `score:update` | `{ scores }` | 比分更新 |
| `timer:tick` | `{ timeLeft }` | 倒计时（每秒） |
| `opponent:status` | `{ status: 'typing' \| 'submitted' }` | 对手状态 |
| `game:end` | `{ winner, scores, stats }` | 游戏结束 |

## 6. 组件树

```
App
├── LoginPage
│   ├── LoginForm
│   └── RegisterForm
├── LobbyPage
│   ├── CreateRoomPanel
│   │   └── WordBookSelector  ← 词库选择
│   ├── JoinRoomPanel
│   │   └── RoomCodeInput
│   └── RoomList（可选，后续扩展）
├── GameRoomPage
│   ├── GameHeader
│   │   ├── OpponentInfo
│   │   ├── WordBookBadge
│   │   └── Timer
│   ├── ScoreBoard
│   ├── QuestionCard
│   ├── AnswerForm
│   │   ├── AnswerInput
│   │   └── SubmitButton
│   ├── ResultFeedback
│   └── RoomActions
│       ├── RoomCodeDisplay
│       └── ShareButton
├── ResultsPage
│   ├── WinnerBanner
│   ├── ScoreSummary
│   ├── StatsTable
│   └── PlayAgainButton
├── NotFoundPage
└── Shared Components
    ├── LoadingSpinner
    ├── Modal
    └── Toast
```

## 7. 响应式设计策略

- **移动端优先**（基础断点 < 640px）：
  - 全屏单列布局
  - 输入框 + 按钮底部固定（类似聊天输入）
  - 计分板紧凑显示
- **平板**（640px - 1024px）：
  - 居中卡片布局，最大宽度 600px
- **桌面**（> 1024px）：
  - 对战区居中，两侧留白
  - 字体和间距适度放大
  - hover 效果增强

## 8. 词库选项

| 词库 | 标签 | 颜色 |
|------|------|------|
| CET-4 | 📘 | 蓝 |
| CET-6 | 📕 | 红 |
| 考研英语 | 📗 | 绿 |
| GRE | 📙 | 橙 |
| 雅思 | 🔵 | 蓝 |
| 随机混合 | 🎲 | 紫 |

词库数据由后端管理，前端只展示选项和选中状态。

## 9. MVP 排除项（后续迭代）

- ~~微信/第三方登录~~（仅邮箱）
- ~~好友系统~~（仅房间码/链接邀请）
- ~~排行榜/天梯分~~（仅单局胜负）
- ~~观战模式~~
- ~~AI 对手~~
- ~~多人在线（>2 人）~~
- ~~句子翻译对战~~（仅单词）
- ~~历史战绩持久化~~（仅当局结算）

## 10. 目录结构

```
src/
├── api/              # axios 实例 + 接口函数
│   ├── client.ts
│   ├── auth.ts
│   └── room.ts
├── stores/           # Zustand stores
│   ├── authStore.ts
│   ├── gameStore.ts
│   └── wsStore.ts
├── pages/            # 页面组件
│   ├── LoginPage.tsx
│   ├── LobbyPage.tsx
│   ├── GameRoomPage.tsx
│   └── ResultsPage.tsx
├── components/       # 通用组件
│   ├── shared/       # 跨页面复用
│   ├── lobby/        # 大厅专用
│   ├── game/         # 对战专用
│   └── results/      # 结算专用
├── hooks/            # 自定义 hooks
│   ├── useWebSocket.ts
│   └── useTimer.ts
├── types/            # TypeScript 类型定义
│   └── index.ts
├── utils/            # 工具函数
├── App.tsx           # 路由配置
└── main.tsx          # 入口
```
