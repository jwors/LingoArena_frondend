# LingoArena 业务逻辑流程图

## 一、业务逻辑总流程

```mermaid
flowchart TB
    subgraph A["🔐 认证阶段"]
        direction LR
        A1["/login 页面"] --> A2["登录/注册"]
        A2 --> A3["authStore.login/register()"]
        A3 --> A4["REST POST /api/auth/login"]
        A4 --> A5["保存 JWT → localStorage"]
        A5 --> A6["跳转 /lobby"]
    end

    subgraph B["🏠 大厅阶段"]
        direction LR
        B1["/lobby 页面"] --> B2{"创建房间 or 加入房间?"}
        B2 --> B3["CreateRoomPanel\n选择词库 & 模式"]
        B2 --> B4["JoinRoomPanel\n输入6位房间码"]
        B3 --> B5["REST POST /api/rooms"]
        B4 --> B6["REST POST /api/rooms/join"]
        B5 --> B7["gameStore 写入房间信息\nstatus→waiting"]
        B6 --> B7
        B7 --> B8["跳转 /room/:id"]
    end

    subgraph C["🎮 游戏房间阶段"]
        direction TB
        C0["/room/:id 页面"] --> C1["建立 WS 连接\nwsStore.connect(token, roomId, roomCode)"]
        
        subgraph C_wait["⏳ 等待中 (waiting)"]
            direction LR
            CW1["WS: room:joined\n→ gameStore.setRoom()"] --> CW2["WaitingLobby 展示\n房间码 / 玩家列表"]
            CW2 --> CW3{"点击 Ready?"}
            CW3 -->|"WS: player:ready"| CW4["按钮变 Unready"]
            CW3 -->|"WS: player:ready_status"| CW4
            CW4 --> CW5{"全部就绪?"}
            CW5 -->|"房主点击开始"| CW6["WS: game:start\n→ status→playing"]
        end

        subgraph C_play["⚔️ 游戏中 (playing)"]
            direction LR
            CP1["WS: question:new\n→ 展示中文词"] --> CP2["玩家输入英文"]
            CP2 --> CP3["WS: answer:submit"]
            CP3 --> CP4["WS: answer:result\n→ 对/错反馈"]
            CP4 --> CP5["WS: score:update\n→ 计分板更新"]
            CP5 --> CP6{"分数达标?"}
            CP6 -->|"否 → 下一题"| CP1
            CP6 -->|"WS: timer:tick\n倒计时"| CP2
        end

        subgraph C_end["🏁 游戏结束 (finished)"]
            direction LR
            CE1["WS: game:end\n→ gameStore.endGame()"] --> CE2["展示结果\nWinnerBanner + 数据统计"]
            CE2 --> CE3["点击 '返回房间'"]
            CE3 --> CE4["gameStore.resetToWaiting()\n→ status→waiting"]
            CE4 --> CW2
        end

        C1 --> C_wait
        C_wait --> C_play
        C_play --> C_end
    end

    A6 --> B
```

---

## 二、函数调用关系图

```mermaid
flowchart LR
    subgraph Pages["📄 Pages"]
        Login["LoginPage"]
        Lobby["LobbyPage"]
        GameRoom["GameRoomPage"]
        Results["ResultsPage"]
    end

    subgraph Components["🧩 Components"]
        CreateRoom["CreateRoomPanel"]
        JoinRoom["JoinRoomPanel"]
        WaitingLobby["WaitingLobby"]
        AnswerForm["AnswerForm"]
        QuestionCard["QuestionCard"]
        ScoreBoard["ScoreBoard"]
        ResultFeedback["ResultFeedback"]
        GameHeader["GameHeader"]
    end

    subgraph Stores["🏪 Zustand Stores"]
        AS["authStore\n· token/user\n· login/logout/register\n· initialize"]
        GS["gameStore\n· room/players/scores\n· questions/results\n· status 状态机\n· setRoom/setQuestion\n· endGame/resetToWaiting\n· submitAnswer"]
        WS["wsStore\n· connect/disconnect\n· send/onmessage\n· 自动重连\n· 消息分发"]
    end

    subgraph API["🌐 REST API"]
        AuthAPI["auth.ts\n· POST /login\n· POST /register\n· POST /refresh\n· POST /logout"]
        RoomAPI["room.ts\n· POST /rooms\n· POST /rooms/join\n· POST /rooms/start\n· POST /rooms/leave"]
        Client["client.ts\n· Axios 实例\n· JWT 拦截器\n· Token 自动刷新\n· 401 处理"]
    end

    subgraph WS_Events["📡 WebSocket 事件"]
        direction LR
        Incoming["← 服务端推送\nroom:joined\ngame:start\nquestion:new\nanswer:result\nscore:update\ntimer:tick\nturn:start\nopponent:status\ngame:end\nplayer:left\nroom:closed\nplayer:ready_status"]
        Outgoing["→ 客户端发送\nplayer:ready\ngame:start\nanswer:submit"]
    end

    %% 页面 → 组件
    Lobby --> CreateRoom
    Lobby --> JoinRoom
    GameRoom --> WaitingLobby
    GameRoom --> AnswerForm
    GameRoom --> QuestionCard
    GameRoom --> ScoreBoard
    GameRoom --> ResultFeedback
    GameRoom --> GameHeader

    %% 页面 → Store
    Login --> AS
    Lobby --> GS
    Lobby --> WS
    GameRoom --> GS
    GameRoom --> WS
    Results --> GS

    %% Store → Store
    WS -->|"消息分发\n调用 action"| GS
    WS -->|"读取 token"| AS

    %% Store → API
    AS -->|"login/register"| AuthAPI
    GS -->|"startGame"| RoomAPI

    %% API → Client
    AuthAPI --> Client
    RoomAPI --> Client

    %% WebSocket 消息路由
    WS -->|"解析事件"| Incoming
    Outgoing -->|"ws.send()"| WS

    %% 组件 → WebSocket
    WaitingLobby -->|"player:ready\ngame:start"| Outgoing
    AnswerForm -->|"answer:submit"| Outgoing

    %% 组件 → Store
    CreateRoom -->|"创建成功 →\ngameStore 更新"| GS
    JoinRoom -->|"加入成功 →\ngameStore 更新"| GS
    WaitingLobby -->|"读取 room/players\nreadyPlayerIds"| GS
    AnswerForm -->|"读取 question/turn\ntimeLeft/hasSubmitted"| GS
    ScoreBoard -->|"读取 scores"| GS
    GameHeader -->|"读取 players/status\nwordBook/round"| GS
    ResultFeedback -->|"读取 result"| GS

    %% API → Auth 状态
    Client -->|"401 → refresh 失败"| AS
```

---

## 三、游戏状态机

```mermaid
stateDiagram-v2
    [*] --> idle: 初始化/登出
    idle --> waiting: room:joined → setRoom()
    
    state waiting {
        [*] --> 等待玩家就绪
        等待玩家就绪 --> 全部就绪: player:ready_status\n(所有玩家 ready)
        全部就绪 --> 等待玩家就绪: 有人取消就绪
    end
    
    waiting --> playing: game:start WS 事件
    
    state playing {
        [*] --> 展示题目: question:new
        展示题目 --> 玩家作答: answer:submit (客户端)
        玩家作答 --> 对错反馈: answer:result
        对错反馈 --> 计分更新: score:update
        计分更新 --> 展示题目: 下一题\n(question:new)
        note right of playing
            同时运行:
            timer:tick 倒计时
            opponent:status 对手状态
            turn:start 回合模式
        end note
    end
    
    playing --> finished: game:end
    
    state finished {
        [*] --> 展示胜负结果
        展示胜负结果 --> 选择操作
        选择操作 --> [*]: 点击"返回房间"
    end
    
    finished --> waiting: resetToWaiting()
    idle --> [*]: 离开房间/重置
    
    note right of idle
        reset() 完全重置
        leaveRoom() 调用 REST + 重置
        room:closed → reset()
    end note
```

---

## 四、核心数据流（一次完整对局）

```mermaid
sequenceDiagram
    actor H as 房主
    actor G as 对手
    participant REST as REST API
    participant WS as WebSocket
    participant Store as gameStore
    participant UI as UI 组件

    Note over H,UI: === 创建/加入房间 ===
    H->>REST: POST /api/rooms (词库+模式)
    REST-->>H: { roomId, roomCode }
    H->>Store: setState(status=waiting)
    H->>UI: 跳转 /room/:id

    G->>REST: POST /api/rooms/join (roomCode)
    REST-->>G: { roomId, players }
    G->>Store: setState(status=waiting)
    G->>UI: 跳转 /room/:id

    Note over H,UI: === 等待阶段 ===
    H-->>WS: connect(token, roomId)
    G-->>WS: connect(token, roomId)
    WS-->>H: room:joined { players, hostId, wordBook }
    WS-->>G: room:joined { players, hostId, wordBook }
    Store->>UI: WaitingLobby 渲染

    G-->>WS: player:ready { ready: true }
    WS-->>H: player:ready_status { userId, ready: true }
    WS-->>G: player:ready_status { userId, ready: true }
    Store->>UI: 对手就绪 UI 更新

    H-->>WS: game:start { roomId }
    WS-->>H: game:start → status→playing
    WS-->>G: game:start → status→playing

    Note over H,UI: === 对局阶段 ===
    WS-->>H: question:new { chinese, round }
    WS-->>G: question:new { chinese, round }
    Store->>UI: QuestionCard 展示中文词
    WS-->>H: timer:tick { timeLeft }
    WS-->>G: timer:tick { timeLeft }

    H->>UI: 输入答案
    H-->>WS: answer:submit { roomId, answer }
    WS-->>H: answer:result { correct, playerId, answer }
    WS-->>G: opponent:status { status: "submitted" }
    Store->>UI: ResultFeedback 展示对错
    WS-->>H: score:update { scores }
    WS-->>G: score:update { scores }
    Store->>UI: ScoreBoard 更新分数

    Note over H,UI: === 游戏结束 ===
    WS-->>H: game:end { winnerId, scores, stats }
    WS-->>G: game:end { winnerId, scores, stats }
    Store->>UI: WinnerBanner + ScoreSummary + StatsTable

    H->>Store: resetToWaiting()
    Store->>UI: 回到 WaitingLobby
```

---

## 核心要点总结

| 阶段 | 关键事件 | 状态变化 | 主要组件 |
|------|---------|---------|---------|
| **认证** | REST 登录/注册 | → 获取 JWT | LoginPage |
| **创建/加入房间** | REST POST /rooms 或 /rooms/join | idle → waiting | CreateRoomPanel, JoinRoomPanel |
| **等待** | WS: room:joined, player:ready_status | waiting | WaitingLobby |
| **开始游戏** | WS: game:start | waiting → playing | WaitingLobby (房主触发) |
| **答题** | WS: question:new → answer:submit → answer:result → score:update | playing | QuestionCard, AnswerForm, ResultFeedback |
| **倒计时** | WS: timer:tick | playing | GameHeader |
| **回合模式** | WS: turn:start | playing | AnswerForm (disabled 非当前玩家) |
| **结束** | WS: game:end | playing → finished | WinnerBanner, ScoreSummary, StatsTable, PlayAgainButton |
| **再来一局** | resetToWaiting() | finished → waiting | "Return to Room" 按钮 |
