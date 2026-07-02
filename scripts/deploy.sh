#!/bin/bash
# Prompt to Canvas - 部署脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Prompt to Canvas 部署脚本${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Codex skills 目录；可用 SKILLS_DIR 覆盖以部署到其他运行环境
SKILLS_DIR="${SKILLS_DIR:-$HOME/.codex/skills}"

echo -e "${YELLOW}项目目录:${NC} $PROJECT_DIR"
echo -e "${YELLOW}Skills 目录:${NC} $SKILLS_DIR"
echo ""

# 1. 创建 skill 目录
echo -e "${GREEN}[1/3] 创建 Skill 目录...${NC}"
SKILL_TARGET="$SKILLS_DIR/prompt-to-canvas"
mkdir -p "$SKILL_TARGET"

# 2. 复制 Skill 文件
echo -e "${GREEN}[2/3] 复制 Skill 文件...${NC}"
rsync -a --delete "$PROJECT_DIR/src/skills/prompt-to-canvas/" "$SKILL_TARGET/"

# 3. 创建静态文件链接/复制
echo -e "${GREEN}[3/3] 部署静态文件...${NC}"
STATIC_DIR="$PROJECT_DIR/src/static"

echo ""
echo -e "${GREEN}✅ 部署完成!${NC}"
echo ""
echo "部署的文件:"
echo "  - Skill: $SKILL_TARGET"
echo "  - 静态文件: $STATIC_DIR"
echo ""
echo "使用方式:"
echo "  1. 在 Codex 中调用: prompt-to-canvas"
echo "  2. 或直接描述需求: 帮我把这段经历制作成可视化图表"
echo ""
echo "静态编辑器访问方式:"
echo "  - 直接打开: file://$STATIC_DIR/index.html"
echo "  - 或部署到 CDN"
echo ""
