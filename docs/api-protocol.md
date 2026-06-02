# LingoArena API 通信协议

## 分工原则

- **REST API**: 一次性操作，请求→响应，有明确结果
- **WebSocket**: 实时事件推送 + 客户端主动发送状态

---

## REST API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/auth/login` | 登录 |
| POST | `/auth/register` | 注册 |
| POST | `/auth/logout` | 登出 |
| POST | `/rooms` | 创建房间 |
| POST | `/rooms/join` | 加入房间（通过房间码） |
| POST | `/rooms/{id}/leave` | 退出房间 |
| POST | `/rooms/{id}/start` | 房主开始游戏 |

---

## WebSocket 事件

### 房间类事件（Server → Client）

| 事件 | 说明 |
|---|---|
| `room:joined` | 有人加入房间。携带 players 列表（首次加入）或单用户信息（后续加入） |
| `player:left` | 有人离开房间 |
| `player:ready_status` | 玩家准备/取消准备状态变更 |
| `room:closed` | 房间被销毁（最后一人退出） |
| `error` | 错误消息推送 |

### 游戏类事件（Server → Client）

| 事件 | 说明 |
|---|---|
| `game:start` | 游戏开始 |
| `question:new` | 新题目（chinese + round） |
| `timer:tick` | 倒计时更新 |
| `answer:result` | 答案对错结果 |
| `score:update` | 分数变更 |
| `opponent:status` | 对手状态（typing/submitted） |
| `turn:start` | 回合制模式下当前回合玩家 |
| `game:end` | 游戏结束（胜者、分数、统计） |

### 客户端主动发送（Client → Server）

| 事件 | 说明 |
|---|---|
| `room:join` | 通过 WebSocket 加入房间 |
| `player:ready` | 点击准备 / 取消准备 |
| `answer:submit` | 提交答案 |
| `player:input` | 输入中状态（让对手看到 typing...） |

---

## WebSocket 事件 payload 格式

### 通用格式

```json
{ "type": "event:name", "payload": { ... } }
```

或

```json
{ "event": "event:name", "data": { ... } }
```

前端 `wsStore.ts` 兼容两种格式。

### 各事件 payload

<details>
<summary><code>room:joined</code></summary>

```json
// 首次加入，全量数据
{ "players": [...], "wordBook": {...}, "hostId": 1, "roomCode": "ABC123" }

// 后续玩家加入，增量数据
{ "user": { "id": 2, "nickname": "Player2" }, "wordBook": {...} }
```
</details>

<details>
<summary><code>player:left</code></summary>

```json
{ "userId": 2 }
```
</details>

<details>
<summary><code>player:ready_status</code></summary>

```json
{ "userId": 1, "ready": true }
```
</details>

<details>
<summary><code>game:start</code></summary>

```json
{ "wordBook": "cet4", "totalRounds": 10 }
```
</details>

<details>
<summary><code>question:new</code></summary>

```json
{ "chinese": "苹果", "round": 1 }
```
</details>

<details>
<summary><code>answer:result</code></summary>

```json
{ "correct": true, "playerId": "1", "answer": "apple" }
```
</details>

<details>
<summary><code>score:update</code></summary>

```json
{ "scores": { "1": 3, "2": 1 } }
```
</details>

<details>
<summary><code>timer:tick</code></summary>

```json
{ "timeLeft": 10 }
```
</details>

<details>
<summary><code>opponent:status</code></summary>

```json
{ "status": "typing" }
// 或
{ "status": "submitted" }
```
</details>

<details>
<summary><code>game:end</code></summary>

```json
{
  "winner": "1",
  "scores": { "1": 5, "2": 3 },
  "stats": {
    "1": { "correct": 5, "wrong": 0, "avgTime": 2.1 },
    "2": { "correct": 3, "wrong": 2, "avgTime": 3.5 }
  }
}
```
</details>

<details>
<summary><code>room:closed</code></summary>

```json
{ "reason": "room closed" }
```
</details>

<details>
<summary><code>error</code></summary>

```json
{ "message": "error description", "code": "ERROR_CODE" }
```
</details>
