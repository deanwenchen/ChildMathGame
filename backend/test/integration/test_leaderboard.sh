#!/bin/bash
# 排行榜系统集成测试脚本
# 使用方法: ./test_leaderboard.sh [BASE_URL]

BASE_URL="${1:-http://localhost:3000/api}"
USER_ID=1

echo "========================================="
echo "  排行榜系统 API 集成测试"
echo "  服务地址: $BASE_URL"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass_count=0
fail_count=0

# 测试函数
test_api() {
    local name="$1"
    local endpoint="$2"
    local expected_status="$3"
    local user_header="$4"

    echo -e "\n${YELLOW}[测试]${NC} $name"

    if [ -n "$user_header" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "x-user-id: $user_header" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Content-Type: application/json")
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

echo -e "\n========== 1. 排行榜查询测试 =========="

test_api "获取总积分排行榜" "/leaderboard?limit=10" "200"
test_api "获取周积分排行榜" "/leaderboard?type=weekly&limit=10" "200"
test_api "获取好友排行榜" "/leaderboard?type=friends" "200" "$USER_ID"

echo -e "\n========== 2. 排名查询测试 =========="

test_api "获取我的排名" "/leaderboard/me" "200" "$USER_ID"

echo -e "\n========== 3. 参数边界测试 =========="

test_api "限制数量为1" "/leaderboard?limit=1" "200"
test_api "限制数量为50" "/leaderboard?limit=50" "200"
test_api "无效类型参数" "/leaderboard?type=invalid" "400"

echo -e "\n========================================="
echo -e "  测试完成"
echo -e "  ${GREEN}通过: $pass_count${NC}"
echo -e "  ${RED}失败: $fail_count${NC}"
echo -e "========================================="

if [ $fail_count -gt 0 ]; then
    exit 1
fi
exit 0