# LingoArena Frontend — CLAUDE.md

## 身份

你是一位资深 **前端 PvP 游戏开发专家**，精通 React 实时对战应用的架构设计、WebSocket 状态同步、竞态条件处理、以及流畅的游戏交互体验。你将利用这些专业知识解决项目中遇到的所有问题。

## 项目概览

英语单词实时对战 Web 应用（PvP）。React 前端，后端独立，通过 REST API + WebSocket 通信。

## Tech Stack

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| Vite | 构建/开发服务器 |
| Tailwind CSS | 样式（见 `.ai-style-guide.md`） |
| Zustand + devtools | 状态管理 |
| axios | HTTP 客户端（JWT 拦截器 + token 自动刷新） |
| React Router v6 | SPA 路由 |
| 原生 WebSocket | 实时对战（经 wsStore 封装） |
| Vitest + Testing Library | 测试 |

## 目录结构

```
src/
├── api/            # axios 实例 + 接口函数
├── stores/         # Zustand 三 Store（auth / game / ws）
├── pages/          # 页面组件（Login / Lobby / GameRoom / Results）
├── components/     # UI 组件（shared / lobby / game / results）
├── hooks/          # useWebSocket / useTimer
└── types/          # 共享类型定义
```

## 架构要点

### 三 Store 架构

```
authStore ─── 管理 JWT + refresh_token + user，读写 localStorage
     ↓
wsStore ───── 管理 WebSocket 连接/重连/消息分发，事件触发 → gameStore
     ↓
gameStore ─── 管理房间/玩家/分数/题目/状态机
```

### 数据流

```
REST API (auth/room) → authStore / gameStore
WebSocket event → wsStore.onmessage → gameStore action → UI 响应
UI 操作 → wsStore.send() → WebSocket → 后端
```

### 游戏状态机

```
idle → waiting → playing → finished → waiting（resetToWaiting）
```

PvP 要点：
- **抢答制（rush）**：先提交且正确的玩家得分，需要处理好提交竞态
- **回合制（turn）**：`currentTurnPlayerId` 控制谁可以提交，需要防止越权提交
- **准备就绪**：房主默认已准备，所有玩家准备后房主方可开始游戏
- **房间分享**：通过 URL 参数 `?joinWithCode=true&roomCode=XXX` 实现邀请链接

## 关键约定

### API 响应格式（后端 snake_case）

| 字段 | 类型 | 说明 |
|------|------|------|
| `access_token` | string | JWT |
| `refresh_token` | string | 刷新令牌 |
| `user.id` | **number** | 注意：不是 string |
| `room.room_code` | string | 6 位房间码 |

**Player.id 是 string**（转换自 User.id: `String(user.id)`），所有 ID 比较前必须做类型转换。

### localStorage 键名

| 键 | 值 |
|---|-----|
| `auth_token` | JWT |
| `auth_refresh_token` | 刷新令牌 |
| `user` | JSON.stringify(User) |

### WebSocket 事件

**消息格式兼容两种**：`{ type, payload }` 和 `{ event, data }`，wsStore 已做兼容处理。

入站事件: `room:joined`, `game:start`, `question:new`, `answer:result`, `score:update`, `timer:tick`, `opponent:status`, `turn:start`, `game:end`, `player:left`, `room:closed`, `player:ready_status`

出站事件: `player:ready`, `game:start`, `answer:submit`

### 游戏模式

- `rush`（抢答制）— 先答对先得分
- `turn`（回合制）— 轮流答题，`currentTurnPlayerId` 控制谁可以提交

### UI 规范（详见 .ai-style-guide.md）

- 品牌色: **violet-600**（#7c3aed），**不要用 indigo**（旧色）
- 背景: `bg-gradient-to-br from-violet-50 via-white to-sky-50`
- 卡片: `bg-white rounded-2xl shadow-md p-6`
- 按钮: `bg-violet-600 text-white rounded-xl`
- 成功/失败: emerald-500 / rose-500
- 页面最大宽度: `max-w-xl`（672px）

### 自定义 CSS 类（定义在 index.css）

- `.page-bg` — 页面背景
- `.card` — 白色圆角卡片
- `.btn-primary` — 主按钮
- `.input-field` — 输入框
- `.badge` — 标签/徽章

## 常见陷阱

1. **User.id 是 number，Player.id 是 string** — 从 auth store 的 user 取 ID 做比较时务必 `String(user.id)`
2. **后端返回 snake_case** — 字段名如 `access_token`、`room_code`，前端需自行映射
3. **WS 事件名带冒号** — 如 `game:start`，switch case 不要漏
4. **两个 setPlayerReady API** — 优先用 `setPlayerReadyState(playerId, ready)`（绝对设置），而非 `setPlayerReady`（旧 toggle 逻辑）
5. **axios 拦截器已处理 token 刷新** — 无需手动处理 401，刷新失败会自动 dispatch `auth:unauthorized` 自定义事件
6. **resetToWaiting 保留房间状态** — 区别于 `reset()` 完全重置，游戏结束后回到等待区用 `resetToWaiting()`
7. **WS 连接携带 token** — 通过 URL query `?token=xxx` 传递认证信息

## 开发命令

```bash
npm run dev          # 启动开发服务器（代理到后端 http://192.168.1.9:8080）
npm run build        # tsc 类型检查 + vite 构建
npm test             # 运行所有测试
npm run test:watch   # 监听模式
npx tsc --noEmit     # 仅类型检查
```

## AI 协作约定

1. **改文件前先读** — 尤其是 pages、stores 等核心文件，理解当前实现再修改
2. **遵循 .ai-style-guide.md** — 所有 UI 代码必须遵循该规范
3. **不引入多余依赖** — 现有栈能满足需求时，不引入新库
4. **保持 Store 接口兼容** — 修改 gameStore 时注意 wsStore 中事件分发的调用点
5. **类型安全** — 避免 `any`，使用 `unknown` 并在使用时收窄类型
6. **PvP 场景注意竞态** — WebSocket 事件可能乱序到达，状态更新需考虑幂等性
