# dsh-trilium 插件设计方案（v1.0 定稿）

> 日期：2026-08-16 ｜ 状态：已确认，待开发
> 决策来源：用户两轮确认（完整版/单实例/0600 配置/自动注入/内置周报/先本地开发/中文单语/侧边栏只读/删除需确认）

## 一、定位

把 Trilium（用户的记忆知识库）接入 DSH：agent 通过工具读写记忆与笔记，Web GUI 提供设置面板与侧边栏浏览。插件遵循既有《写入规则》：AI 写入默认归入 Agent笔记（p0dlKhBxlAEc）。

## 二、形态

双面插件（host Node 半 + client 浏览器半），参照 dsh-ssh / dsh-voice-webspeech：
- host：ETAPI 客户端 + 工具注册 + 记忆注入 section + 配置读写（~/.dsh/dsh-trilium.json, 0600）
- client：设置面板（设置 → Trilium）+ 侧边栏（笔记树浏览/搜索/预览）

## 三、配置（~/.dsh/dsh-trilium.json）

| 字段 | 默认 | 说明 |
|---|---|---|
| baseUrl | https://trilium.callmefirst.eu.org/etapi | ETAPI 基础地址 |
| token | （空） | ETAPI token，GUI 粘贴，不写入 cordis.yml |
| memoryNoteId | p0dlKhBxlAEc | 默认记忆目录（Agent笔记） |
| timeoutMs | 15000 | 请求超时 |
| autoInject | true | 会话开始自动注入记忆索引 |
| deleteConfirm | true | 删除前要求 confirm 参数 |

## 四、工具清单（trilium_* 前缀）

| 工具 | 说明 |
|---|---|
| trilium_app_info | 实例信息/连接测试 |
| trilium_search | 全文搜索（search 语法、ancestorNoteId、limit、orderBy） |
| trilium_get_note | 读笔记元数据（含 childNoteIds、attributes），可选读内容 |
| trilium_list_children | 列出子笔记（树浏览） |
| trilium_create_note | 创建笔记（parentNoteId/title/type/content/notePosition） |
| trilium_update_note | 改标题（PATCH）+ 改正文（PUT text/plain） |
| trilium_delete_note | 删除（需 confirm=true，进回收站可恢复） |
| trilium_undelete_note | 恢复已删除笔记 |
| trilium_attribute | 属性增删改查（label/relation） |
| trilium_remember | 记忆写入：自动归入记忆目录，标题带日期 |
| trilium_recall | 记忆检索：限定在记忆目录子树内搜索 |
| trilium_weekly_report | 周报工作流（见七） |
| trilium_export | 导出 ZIP（html/markdown） |
| trilium_history | 最近变更记录 |

## 五、记忆自动注入

- 时机：会话开始（system prompt section 提供方）
- 内容：Agent笔记 索引（标题+一句话摘要）+《写入规则》全文 + 周报规范要点
- 缓存：索引缓存 5 分钟，服务器不可达时静默跳过
- 开关：autoInject 配置项

## 六、侧边栏（只读）

- 笔记树：从 root 懒加载展开，显示类型图标
- 搜索框：ETAPI 搜索语法
- 内容预览：点击笔记预览内容（HTML→文本/渲染）
- 写操作不开放，统一走 agent 工具

## 七、周报工作流（trilium_weekly_report）

1. 输入：日期范围（默认本周）
2. 素材：搜索「关注项目/日程」下本周工作笔记 + 日记体系工作日报（按日期过滤）
3. 成文：按《周报撰写规范》9 条 + 写作档案风格（状态分组、编号列表、事实纪律）
4. 落盘：创建笔记到「关注项目/日程」，打 startDate/endDate 标签

## 八、技术要点

- 改正文：PUT /notes/:id/content，Content-Type text/plain，body 原始文本（非 JSON）
- PATCH 不接受 content 字段（PROPERTY_NOT_ALLOWED）
- Relation = attribute type=relation，value=目标 noteId
- 子节点用 childNoteIds 逐个 GET
- 删除后 GET 404，可 undelete 恢复

## 九、里程碑

- M1 骨架 + ETAPI 客户端 + 核心工具（app_info/search/get/create/update/delete/attribute）
- M2 配置存储（0600）+ 设置面板
- M3 记忆工具（remember/recall）+ 自动注入
- M4 周报工作流
- M5 侧边栏面板
- M6 本地安装联调 + README

## 十、开发位置

/datafs/projects/dsh-trilium，参照 dsh-voice-webspeech 构建链（tsc + tsdown + cordis.patch.yml + dsh.client 声明），本地 `pnpm dsh plugin --profile web add .` 联调。
