# 抢答制/回合制双模式设计

## 概述

在现有 MVP 基础上增加回合制对战模式。创建房间时房主选择模式，后端通过 WS 事件通知前端当前回合状态，前端根据模式和回合状态渲染不同的 UI。

## 两种模式对比

| | 抢答制 (rush) | 回合制 (turn) |
|---|---|---|
| **玩法** | 双方同时答题，先答对者得分 | A 答 → B 答 → 出结果 → 下一轮 |
| **非活跃玩家** | 正常答题（双方都是活跃的） | 显示"等待对手答题" |
| **计分** | 答对即计分 | 每轮结束后双方分别计分 |
| **获胜条件** | 先到 5 分 | 先到 5 分（不变） |

## 影响范围

### 1. 类型定义 (`src/types/index.ts`)

新增：
```typescript
export type GameMode = 'rush' | 'turn';

export interface TurnInfo {
  currentPlayerId: string;
  round: number;
}
```

### 2. Lobby 创建房间 (`src/components/lobby/CreateRoomPanel.tsx`)

在词库选择下方、创建按钮上方添加模式选择：
```
[抢答制 (推荐)] [回合制]
```
- 默认选抢答制
- 简单两个按钮切换，显示模式名称和简短说明

### 3. API (`src/api/room.ts`)

`createRoom` 请求参数增加 `mode`:
```typescript
export const createRoom = (data: { wordBook: string; name?: string; mode: GameMode }) =>
  apiClient.post<Room>('/rooms', data);
```

### 4. Game Store (`src/stores/gameStore.ts`)

新增字段：
```typescript
gameMode: GameMode;
currentTurnPlayerId: string | null;
```

新增 action：
```typescript
setGameMode: (mode: GameMode) => void;
setTurn: (playerId: string) => void;
```

### 5. WS Store (`src/stores/wsStore.ts`)

新增事件处理：
```typescript
case 'turn:start': g.setTurn(data.currentPlayerId); break;
case 'turn:end': break; // 分数更新通过 score:update 处理
```

### 6. Game Room 页面

- `GameHeader`: 在回合制下显示"当前回合: A 的回合"
- `AnswerForm`: 回合制下，非当前回合玩家看不到输入框，显示"等待对手..."
- `AnswerForm`: 抢答制下行为不变

### 7. 修复现有 TODO

当前 GameRoomPage 中有 `const myScore = 0` 的 TODO，需要改为从 auth store 获取当前用户 ID，这样才能正确判断回合制下轮到谁。

## 后端假设

- 创建房间时传入 `mode` 参数
- WS 事件新增 `turn:start` (data: { currentPlayerId, round })
- 其他事件（question:new, score:update, game:end）两种模式共用

## 不出 MVP 的

- 观战/复盘
- 模式切换（进入房间后不可更改）
- 回合制详细统计（每人的 A 回合/B 回合数据）
