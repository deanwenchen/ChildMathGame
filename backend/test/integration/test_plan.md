# 集成测试计划

## 测试环境

- **后端地址**: http://localhost:3000/api
- **数据库**: SQLite (./data/arithmetic.db)
- **测试框架**: Jest / Postman / curl

---

## 一、好友系统测试用例

### 1.1 用户搜索功能

| 用例ID | 测试场景 | 输入 | 预期结果 | 优先级 |
|--------|---------|------|---------|--------|
| FS-001 | 正常搜索用户 | q="test", userId=1 | 返回匹配用户列表 | P0 |
| FS-002 | 搜索自己 | q="当前用户名" | 不返回自己 | P0 |
| FS-003 | 空搜索词 | q="" | 返回400错误 | P1 |
| FS-004 | 无匹配结果 | q="不存在的用户" | 返回空数组 | P1 |
| FS-005 | 部分匹配搜索 | q="te" | 返回所有包含"te"的用户 | P1 |

### 1.2 好友请求功能

| 用例ID | 测试场景 | 前置条件 | 输入 | 预期结果 | 优先级 |
|--------|---------|---------|------|---------|--------|
| FS-010 | 发送好友请求 | 双方都有parent_approval | addresseeId=2 | 请求发送成功 | P0 |
| FS-011 | 无家长授权发送 | requester无parent_approval | addresseeId=2 | 返回403错误 | P0 |
| FS-012 | 重复发送请求 | 已存在pending请求 | addresseeId=2 | 返回400错误 | P0 |
| FS-013 | 添加自己为好友 | - | addresseeId=当前用户 | 返回400错误 | P0 |
| FS-014 | 好友数量超限 | 已有20个好友 | addresseeId=21 | 返回400错误 | P1 |
| FS-015 | 接受好友请求 | 存在pending请求 | requesterId=2 | 成功建立好友关系 | P0 |
| FS-016 | 拒绝好友请求 | 存在pending请求 | requesterId=2 | 请求状态变为rejected | P0 |
| FS-017 | 接受不存在的请求 | 无pending请求 | requesterId=999 | 操作无效果 | P1 |

### 1.3 好友列表功能

| 用例ID | 测试场景 | 前置条件 | 预期结果 | 优先级 |
|--------|---------|---------|---------|--------|
| FS-020 | 获取好友列表 | 有3个好友 | 返回3个好友信息 | P0 |
| FS-021 | 无好友 | 好友列表为空 | 返回空数组 | P1 |
| FS-022 | 获取在线好友 | 2个在线好友 | 仅返回在线好友 | P0 |
| FS-023 | 获取待处理请求 | 有2个pending请求 | 返回2个请求信息 | P0 |
| FS-024 | 获取已发送请求 | 有1个pending请求 | 返回1个请求信息 | P1 |
| FS-025 | 删除好友 | 存在好友关系 | 删除成功，好友列表更新 | P0 |

### 1.4 加油功能

| 用例ID | 测试场景 | 前置条件 | 输入 | 预期结果 | 优先级 |
|--------|---------|---------|------|---------|--------|
| FS-030 | 发送加油 | 好友关系 | receiverId=2, messageType="great_job" | 发送成功 | P0 |
| FS-031 | 给非好友发加油 | 非好友关系 | receiverId=3 | 返回400错误 | P0 |
| FS-032 | 使用无效消息类型 | - | messageType="invalid" | 返回400错误 | P0 |
| FS-033 | 超频率发送 | 1小时内已发3次 | receiverId=2 | 返回400错误 | P1 |
| FS-034 | 给自己发加油 | - | receiverId=当前用户 | 返回400错误 | P0 |
| FS-035 | 获取收到的加油 | 有3条未读加油 | 返回加油列表 | P0 |
| FS-036 | 获取未读数量 | 有5条未读 | 返回count=5 | P0 |
| FS-037 | 标记已读 | 有未读加油 | cheerId=1 | 成功标记 | P0 |
| FS-038 | 全部标记已读 | 有未读加油 | 全部变为已读 | P1 |

### 1.5 在线状态功能

| 用例ID | 测试场景 | 输入 | 预期结果 | 优先级 |
|--------|---------|------|---------|--------|
| FS-040 | 更新为在线 | status="online" | 状态更新成功 | P0 |
| FS-041 | 更新为离线 | status="offline" | 状态更新成功 | P0 |
| FS-042 | 更新为忙碌 | status="busy" | 状态更新成功 | P1 |
| FS-043 | 无效状态 | status="invalid" | 返回400错误 | P1 |

---

## 二、排行榜系统测试用例

### 2.1 排行榜查询

| 用例ID | 测试场景 | 输入 | 预期结果 | 优先级 |
|--------|---------|------|---------|--------|
| LB-001 | 获取总积分排行 | limit=10 | 返回前10名用户 | P0 |
| LB-002 | 获取周积分排行 | type="weekly", limit=10 | 返回本周前10名 | P0 |
| LB-003 | 获取好友排行 | type="friends", userId=1 | 返回好友排行 | P0 |
| LB-004 | 获取我的排名 | userId=1 | 返回当前用户排名 | P0 |
| LB-005 | 空排行榜 | 无用户数据 | 返回空数组 | P1 |
| LB-006 | 限制数量范围 | limit=100 | 返回最多50条 | P1 |

### 2.2 积分更新

| 用例ID | 测试场景 | 前置条件 | 预期结果 | 优先级 |
|--------|---------|---------|---------|--------|
| LB-010 | 答题获得积分 | 用户答对题目 | total_points增加 | P0 |
| LB-011 | 排行榜实时更新 | 积分变化后查询 | 排名正确更新 | P0 |
| LB-012 | 周积分重置 | 新的一周开始 | weekly_points重置为0 | P1 |

---

## 三、API 接口测试脚本

### 3.1 环境准备脚本

```bash
#!/bin/bash
# test_setup.sh

# 创建测试数据库
rm -f ./data/test_arithmetic.db
cp ./data/arithmetic.db ./data/test_arithmetic.db

# 启动测试服务器
PORT=3001 npm start &

# 等待服务器启动
sleep 3

echo "测试环境准备完成"
```

### 3.2 好友系统测试脚本

```bash
#!/bin/bash
# test_friendship.sh

BASE_URL="http://localhost:3000/api"
USER1_ID=1
USER2_ID=2

echo "=== 好友系统API测试 ==="

# 1. 设置家长授权
echo -e "\n[1] 设置用户1家长授权"
curl -s -X PUT "$BASE_URL/users/$USER1_ID/approval" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}' | jq .

# 2. 设置用户2家长授权
echo -e "\n[2] 设置用户2家长授权"
curl -s -X PUT "$BASE_URL/users/$USER2_ID/approval" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}' | jq .

# 3. 搜索用户
echo -e "\n[3] 搜索用户"
curl -s -X GET "$BASE_URL/friends/search?q=test&limit=5" \
  -H "x-user-id: $USER1_ID" | jq .

# 4. 发送好友请求
echo -e "\n[4] 发送好友请求 (用户1 -> 用户2)"
curl -s -X POST "$BASE_URL/friends/request" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER1_ID" \
  -d "{\"addresseeId\": $USER2_ID}" | jq .

# 5. 获取待处理请求 (用户2视角)
echo -e "\n[5] 用户2查看待处理请求"
curl -s -X GET "$BASE_URL/friends/requests/pending" \
  -H "x-user-id: $USER2_ID" | jq .

# 6. 接受好友请求
echo -e "\n[6] 用户2接受好友请求"
curl -s -X POST "$BASE_URL/friends/accept" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER2_ID" \
  -d "{\"requesterId\": $USER1_ID}" | jq .

# 7. 获取好友列表
echo -e "\n[7] 获取好友列表"
curl -s -X GET "$BASE_URL/friends" \
  -H "x-user-id: $USER1_ID" | jq .

# 8. 更新在线状态
echo -e "\n[8] 更新在线状态"
curl -s -X PUT "$BASE_URL/friends/status" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER1_ID" \
  -d '{"status": "online"}' | jq .

# 9. 获取在线好友
echo -e "\n[9] 获取在线好友"
curl -s -X GET "$BASE_URL/friends/online" \
  -H "x-user-id: $USER2_ID" | jq .

# 10. 获取可用加油消息
echo -e "\n[10] 获取可用加油消息类型"
curl -s -X GET "$BASE_URL/friends/cheers/messages" | jq .

# 11. 发送加油
echo -e "\n[11] 发送加油消息"
curl -s -X POST "$BASE_URL/friends/cheers" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER1_ID" \
  -d "{\"receiverId\": $USER2_ID, \"messageType\": \"great_job\"}" | jq .

# 12. 获取收到的加油
echo -e "\n[12] 获取收到的加油消息"
curl -s -X GET "$BASE_URL/friends/cheers/received" \
  -H "x-user-id: $USER2_ID" | jq .

# 13. 获取未读加油数量
echo -e "\n[13] 获取未读加油数量"
curl -s -X GET "$BASE_URL/friends/cheers/unread" \
  -H "x-user-id: $USER2_ID" | jq .

# 14. 全部标记已读
echo -e "\n[14] 全部标记已读"
curl -s -X POST "$BASE_URL/friends/cheers/read-all" \
  -H "x-user-id: $USER2_ID" | jq .

# 15. 删除好友
echo -e "\n[15] 删除好友"
curl -s -X DELETE "$BASE_URL/friends/$USER2_ID" \
  -H "x-user-id: $USER1_ID" | jq .

echo -e "\n=== 测试完成 ==="
```

### 3.3 排行榜系统测试脚本

```bash
#!/bin/bash
# test_leaderboard.sh

BASE_URL="http://localhost:3000/api"
USER_ID=1

echo "=== 排行榜API测试 ==="

# 1. 获取总积分排行榜
echo -e "\n[1] 获取总积分排行榜"
curl -s -X GET "$BASE_URL/leaderboard?limit=10" | jq .

# 2. 获取周积分排行榜
echo -e "\n[2] 获取周积分排行榜"
curl -s -X GET "$BASE_URL/leaderboard?type=weekly&limit=10" | jq .

# 3. 获取好友排行榜
echo -e "\n[3] 获取好友排行榜"
curl -s -X GET "$BASE_URL/leaderboard?type=friends" \
  -H "x-user-id: $USER_ID" | jq .

# 4. 获取我的排名
echo -e "\n[4] 获取我的排名"
curl -s -X GET "$BASE_URL/leaderboard/me" \
  -H "x-user-id: $USER_ID" | jq .

echo -e "\n=== 测试完成 ==="
```

### 3.4 自动化测试脚本 (Node.js)

```javascript
// test/integration/friendship.test.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

describe('好友系统集成测试', () => {
  let user1Id, user2Id;

  beforeAll(async () => {
    // 创建测试用户
    const user1 = await axios.post(`${BASE_URL}/users`, {
      username: 'testuser1',
      age: 8,
      grade: 2
    });
    user1Id = user1.data.userId;

    const user2 = await axios.post(`${BASE_URL}/users`, {
      username: 'testuser2',
      age: 9,
      grade: 3
    });
    user2Id = user2.data.userId;
  });

  test('搜索用户', async () => {
    const res = await axios.get(`${BASE_URL}/friends/search?q=test`, {
      headers: { 'x-user-id': user1Id }
    });
    expect(res.data.results).toBeDefined();
    expect(res.data.results.length).toBeGreaterThan(0);
  });

  test('发送好友请求', async () => {
    // 先设置家长授权
    await axios.put(`${BASE_URL}/users/${user1Id}/approval`, { approved: true });
    await axios.put(`${BASE_URL}/users/${user2Id}/approval`, { approved: true });

    const res = await axios.post(`${BASE_URL}/friends/request`,
      { addresseeId: user2Id },
      { headers: { 'x-user-id': user1Id } }
    );
    expect(res.data.message).toBe('好友请求已发送');
  });

  test('接受好友请求', async () => {
    const res = await axios.post(`${BASE_URL}/friends/accept`,
      { requesterId: user1Id },
      { headers: { 'x-user-id': user2Id } }
    );
    expect(res.data.message).toBe('已添加为好友');
  });

  test('发送加油消息', async () => {
    const res = await axios.post(`${BASE_URL}/friends/cheers`,
      { receiverId: user2Id, messageType: 'great_job' },
      { headers: { 'x-user-id': user1Id } }
    );
    expect(res.data.message).toBe('加油消息已发送');
  });
});
```

---

## 四、测试执行清单

### 4.1 测试前检查

- [ ] 数据库已初始化
- [ ] 后端服务正常运行
- [ ] 测试用户已创建
- [ ] 家长授权已设置

### 4.2 功能测试顺序

1. 用户管理测试
2. 好友请求流程测试
3. 好友列表功能测试
4. 加油功能测试
5. 在线状态测试
6. 排行榜测试

### 4.3 边界条件测试

- [ ] 无效用户ID
- [ ] 空参数请求
- [ ] 重复操作
- [ ] 并发请求
- [ ] 超限操作

### 4.4 安全测试

- [ ] 未授权访问
- [ ] 越权操作
- [ ] SQL注入测试
- [ ] XSS测试

---

## 五、测试报告模板

```
## 测试报告

**测试日期**: YYYY-MM-DD
**测试人员**:
**测试环境**:

### 测试结果汇总

| 模块 | 用例总数 | 通过 | 失败 | 通过率 |
|------|---------|------|------|--------|
| 好友系统 | 25 | - | - | - |
| 排行榜系统 | 12 | - | - | - |

### 问题列表

| 问题ID | 描述 | 严重程度 | 状态 |
|--------|------|---------|------|
| - | - | - | - |

### 建议

-
```