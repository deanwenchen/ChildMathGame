#!/bin/bash
# 好友系统集成测试脚本
# 使用方法: ./test_friendship.sh [BASE_URL]

BASE_URL="${1:-http://localhost:3000/api}"
USER1_ID=1
USER2_ID=2

echo "========================================="
echo "  好友系统 API 集成测试"
echo "  服务地址: $BASE_URL"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"

    echo -e "\n${YELLOW}[测试]${NC} $name"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "x-user-id: $USER1_ID" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "x-user-id: $USER1_ID" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}[通过]${NC} HTTP $http_code"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        ((pass_count++))
    else
        echo -e "${RED}[失败]${NC} 期望 $expected_status, 实际 $http_code"
        echo "$body"
        ((fail_count++))
    fi
}

# 修改用户ID的测试函数
test_api_as_user() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local user_id="$6"

    echo -e "\n${YELLOW}[测试]${NC} $name"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "x-user-id: $user_id" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "x-user-id: $user_id" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}[通过]${NC} HTTP $http_code"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        ((pass_count++))
    else
        echo -e "${RED}[失败]${NC} 期望 $expected_status, 实际 $http_code"
        echo "$body"
        ((fail_count++))
    fi
}

echo -e "\n========== 1. 用户搜索测试 =========="

test_api "搜索用户" "GET" "/friends/search?q=test&limit=5" "" "200"
test_api "空搜索词应返回错误" "GET" "/friends/search?q=" "" "400"

echo -e "\n========== 2. 好友请求测试 =========="

test_api "获取待处理请求" "GET" "/friends/requests/pending" "" "200"
test_api "获取已发送请求" "GET" "/friends/requests/sent" "" "200"
test_api "发送好友请求" "POST" "/friends/request" "{\"addresseeId\": $USER2_ID}" "200"

echo -e "\n========== 3. 好友列表测试 =========="

test_api "获取好友列表" "GET" "/friends" "" "200"
test_api "获取在线好友" "GET" "/friends/online" "" "200"

echo -e "\n========== 4. 加油功能测试 =========="

test_api "获取加油消息类型" "GET" "/friends/cheers/messages" "" "200"
test_api "获取未读加油数量" "GET" "/friends/cheers/unread" "" "200"
test_api "获取收到的加油" "GET" "/friends/cheers/received" "" "200"

echo -e "\n========== 5. 在线状态测试 =========="

test_api "更新在线状态" "PUT" "/friends/status" "{\"status\": \"online\"}" "200"
test_api "更新忙碌状态" "PUT" "/friends/status" "{\"status\": \"busy\"}" "200"
test_api "更新离线状态" "PUT" "/friends/status" "{\"status\": \"offline\"}" "200"
test_api "无效状态应返回错误" "PUT" "/friends/status" "{\"status\": \"invalid\"}" "400"

echo -e "\n========== 6. 错误处理测试 =========="

test_api "给自己发请求应失败" "POST" "/friends/request" "{\"addresseeId\": $USER1_ID}" "400"
test_api "无效消息类型应失败" "POST" "/friends/cheers" "{\"receiverId\": $USER2_ID, \"messageType\": \"invalid\"}" "400"

echo -e "\n========================================="
echo -e "  测试完成"
echo -e "  ${GREEN}通过: $pass_count${NC}"
echo -e "  ${RED}失败: $fail_count${NC}"
echo -e "========================================="

# 返回退出码
if [ $fail_count -gt 0 ]; then
    exit 1
fi
exit 0