# 项目：儿童算数小能手 - 核心指令集

## 1. 启用的模式
- **Planning-with-Files**: 严格执行 [更新计划 -> 记录发现 -> 修改代码 -> 更新进度] 循环。
- **Superpowers (Reasoning & Multimodality)**: 在修改代码前，必须进行“深度思维链回溯”，考虑儿童心理学和 UI 交互的直观性。
- **NotebookLM-Skill (Grounded Knowledge)**: 所有业务逻辑（如算数教学法）必须基于项目定义的 Source 文件夹。

## 2. 行为准则 (更新版)
1. **先计划 (Planning)**: 更新 `task_plan.md`。
2. **调取知识 (NotebookLM-Skill)**: 检查 `docs/` 文件夹下的教学大纲或需求文档，确保逻辑符合“儿童教育”设定。
3. **深度思考 (Superpowers)**: 利用多模态推理能力，自检 UI 是否符合儿童操作习惯（如按钮够不够大、颜色是否刺眼）。
4. **记录发现 (Findings)**: 将上述思考过程记录在 `findings.md`。
5. **执行修改**: 修改代码。
6. **同步进度**: 更新 `progress.md`。