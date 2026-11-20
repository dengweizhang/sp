# SP · Clinical Statistical Programming

**V0.3.7** — SAS 01–09 笔记 + 6 个问题驱动专题；跨列分组与 RTF 合并，代码区更紧凑；AI 继续隐藏。

## 页面与文件

- `/`：文章索引（不展示搜索框或大幅介绍）
- `/sas-notes/`：SAS 实战速查 01–09；目录可折叠，问题、关键代码、必要边界，首页固定置顶
- `/sas-learning/`：SAS 系统专题入口，六个问题驱动专题：SQL、FREQ、MEANS/SUMMARY/UNIVARIATE、PK 浓度统计、POWER、SGPLOT/SGPANEL
- `/pk-parameters/`：常用 PK 参数文章，含 14 个参数的 NCA 计算方法、QC 注意事项和手算示例
- `/indication-interview/`：治疗领域、适应症、受试者与研究目的的区别，SP 面试项目复盘、回答模板和自测
- `/trial-designs/`：临床试验设计，按研究结构/随机/盲法/对照/SAD-MAD/适应性分类，含可切换的小型流程图和 SP 面试卡片
- `/clinical-statistics/`：统计学基础，包括描述统计、假设检验、常见模型、生存分析、分析集、缺失数据、Estimand、SP 数据与 QC
- `/clinical-pharmacology/`：临床药理学，包括 ADME、PK/PD、SAD/MAD、稳态、DDI、BE、QTc、免疫原性与编程映射
- `public/assets/ai.js`：右下角 AI 面板源码（暂时停用）
- `functions/api/chat.js`：Cloudflare Pages Function，调用 DeepSeek API
- `public/knowledge-index.json`：本站公开文章的索引及检索关键词
- `public/_routes.json`：只有 `/api/*` 会调用 Function，其余静态请求不触发
- `/tools/`、`/knowledge/`：旧地址自动跳转首页

## 让 SP AI 真正回答（必须完成）

前端和后端代码已提交；还需要在 Cloudflare 设置 **你自己的 API Key**。请不要把密钥写进 GitHub 或浏览器端。

1. Cloudflare → Workers & Pages → SP Pages 项目 → Settings → Variables and Secrets → Add。
2. Name：`DEEPSEEK_API_KEY`，Value：你的 DeepSeek API Key，类型选择 **Encrypt / Secret**。
3. 可选但推荐：另设 `SP_AI_ACCESS_CODE` 加密 Secret，测试阶段访问 AI 时必须输入口令。
4. 保存后重新部署 main 分支，让 Functions 读取 Secret。
5. 访问 `https://sp.769967.xyz/api/chat`：若返回 `ready: true`，表示服务端已识别密钥（不代表付款、模型调用或联网已测试）。
6. 在 Cloudflare 安全规则为 `/api/chat` 配置每 IP 的速率限制，并监测 DeepSeek API 余额与调用成本，**公开给所有访客前必须考虑滥用风险**。

### 具体能力范围

- 用户通过对话提问，后端先从索引中选择可能相关的**公开站内文章**，抽取页面正文作为上下文。
- DeepSeek `deepseek-flash` 可以根据需要调用 DeepSeek 官方联网搜索和阅读链接工具，并返回可用来源链接。
- 当前已加入 PK 参数与临床试验适应症两篇文章；增加文章时更新 `public/knowledge-index.json`。
- **不包含全套 CDISC PDF/XLS 标准库索引**，也不支持上传文件；这是后续版本的工作。
- 聊天历史只保留在当前网页的内存中；刷新即清空。用户消息会发送到 Cloudflare Pages Function，再转发至 DeepSeek。

## Cloudflare Pages 构建设置

- Repository：`dengweizhang/sp`
- Production branch：`main`
- Framework preset：`None`
- Build command：留空
- Build output directory：`public`
- Functions 目录必须在 Git 仓库的根目录，与 `public` 同级。

## 本地预览

普通静态预览：在仓库根目录执行 `cd public && python3 -m http.server 8000`（只有页面可用，AI 不可用）。

完整本地测试：安装 Node.js，使用 `npx wrangler pages dev public`，并在仓库根目录创建 **不提交 Git** 的 `.dev.vars`（其中写入 `DEEPSEEK_API_KEY=...`）。

## 数据与内容安全

公开访问者不要输入或上传未脱敏临床试验数据、申办方保密资料、个人医疗信息。引用 CDISC PDF、XLS 等文件应确认许可与版本来源；目前代码没有将这些文件加入 AI 知识库。

文档参考：https://api-docs.deepseek.com/guides/web_tools/ 与 https://developers.cloudflare.com/pages/functions/get-started/ 。

## V0.2.12：暂时隐藏 AI

- 首页与 PK 文章都已移除 `/assets/ai.js` 引用，右下角不显示入口。
- 服务端 `functions/api/chat.js` 中 `AI_ENABLED = false`，避免直接访问 API 产生 DeepSeek 消耗。
- 恢复时：将 `AI_ENABLED` 改为 `true`，在需要显示的页面 `<head>` 中加入 `<script src="/assets/ai.js" defer></script>`，并部署；如使用 API，还需设置密钥与限流。
- AI 源码与文章索引保留，不删除现有能力。

## V0.2.12 · PK 交互图解

- `public/assets/pk-interactive.js`：只加载在 PK 文章内的本地 SVG 交互图，无外部依赖或数据上报。
- 浓度–时间图：点选 Cmax/Tmax、AUClst、AUCinf、Lambda_z、t½，显示不同强调状态与解释。
- AUC 积分图：切换线性梯形法 / 对数梯形法；对相同两个采样点分别计算示意面积 3.750 与 3.607 ng·h/mL。
- 图为模拟数据（非项目数据）；手机上图表可横向滑动。原有 AI 入口继续隐藏且接口暂停。

## V0.2.12：PARAMCD 对照与点击式图解

- 参数表新增 PARAMCD（参考）列，按 SDTM PKPARMCD 控制术语 C85839 匹配；ADPP PARAMCD 最终以项目 Spec 为准。
- AUCinf、MRTinf、CL 和 CL/F 按观测/预测、给药途径等展示多个候选代码，附可展开解释。
- PK 浓度–时间图：点击参数按钮，切换 Cmax/Tmax、AUClst、AUCinf、Lambda_z 和 t½ 图解。
- AUC 梯形法图：点击「线性梯形」/「对数梯形」按钮查看面积差异；不再支持拖动。
- 图解数据均为示意，不可代替项目 PK 分析输出。AI 继续隐藏并停用。

## V0.2.12：适应症与面试准备

- 新增 `/indication-interview/`，按“概念区分→为什么不是每个项目都有患者适应症→5种项目背景→Protocol复盘→面试话术→自测”组织。
- 例子是通用、匿名的学习示意，不泄露具体申办方与保密研究内容。
- 首页文章数更新到 2，静态知识索引和 sitemap 同步更新。原 AI 入口继续隐藏。

## V0.2.12：临床试验设计

- 依据 ICH E8(R1)、E9、E10、FDA 和 ClinicalTrials.gov 的公开权威说明，区分研究结构、随机化、盲法、对照、比较目标及研究阶段。
- 新增 5 状态点击式路径图：平行、交叉、单臂、序贯、析因；无拖动、无外部依赖。
- 从 SAD/MAD 队列执行、随机双盲逻辑、TA/TE/TV/SE 到 ADaM/TFL 的工作影响，配合面试示范回答与六道自测题。
- 更新首页为 3 篇文章、公开知识索引与 sitemap；AI 仍然隐藏并停用。

## V0.2.12：统计学与临床药理学基础

- 分成两篇交叉链接的独立文章；统计学重在数据分析推断与 TFL，药理学重在给药、药代、药效与安全性科学逻辑。
- 统计学篇：11 个章节，描述统计、P 值与 CI、ANCOVA、MMRM、KM/Cox、分析集、缺失数据、Estimand、多重性与面试题。
- 药理学篇：12 个章节，ADME、PK/PD、稳态蓄积、食物影响、DDI、BA/BE、NCA/PopPK、QTc、ADA/NAb、数据流与面试题。
- 继续沿用极简文章排版、可折叠目录和回到顶部；不恢复 AI，不引入外部脚本。
- 首页共 5 篇，knowledge-index、sitemap 与版本号同步更新。参考监管指南主要来自 ICH/EMA/FDA。


## V0.2.12：SAS 实战问题笔记

- 首页新增第 6 篇：`/sas-notes/`。使用现有文章排版，无复杂框架或新后端。
- NOTE 001（2026-11-20）：PICTURE 百分比格式拼接多余空格，实测采用 `CATX(' ',COUNT,PCT_FORMATTED)`；保留格式生成的括号内部空格。
- 教程包括 `PROC FORMAT` 的 `VALUE` / `PICTURE` / `INVALUE`、`PUT` / `INPUT`、字符串函数比较和可以直接运行的检查代码。
- 后续维护：在 `public/sas-notes/index.html` 的 `SAS_NOTES_BEGIN/END` 之间按 002、003…追加问题条目，更新页内目录、`public/knowledge-index.json` 关键词及相关版本。GitHub Commit 历史保存每次变更。
- 站点为公开静态内容，**不能将未脱敏的临床试验数据、申办方文件或患者信息放入笔记**。
- 当前没有网页端账号编辑器；新增笔记通过 GitHub 修改和 Cloudflare Pages 自动构建部署。

### V0.2.12 · 字符拼接专题补充

- 同一节比较 `CAT`、`CATS`、`CATX`，以空格可视化示例和可运行 SAS DATA step 测试说明。
- 增补 SAS 官方 CAT family 资料链接，说明 `CATX` 适合 TFL n (%)，而 `CATS` 会去掉分隔空格。


## V0.2.12：极简编号笔记 + Agent Skill

- /sas-notes/ 全面精简为 01 TFL n (%) 空格、02 PROC FORMAT、03 INPUT/PUT、04 CAT/CATS/CATX；正文和目录编号一一对应。
- 保留有复用价值的结论、关键代码、风险边界；移除冗余背景与长测试。
- 新增项目级 Skill：`.agents/skills/sp-sas-field-notes/SKILL.md`；根目录 `AGENTS.md` 指定维护者先读取该 Skill。
- 每次追加笔记请沿用原有编号，不重排既有条目，且检查公开数据是否脱敏。
- GitHub 提交和 Cloudflare 实际发布需要分别验证。项目级 Skill 不等于 ChatGPT 全局技能安装。

## V0.2.12：SAS 实战笔记目录收起与首页置顶

- `/sas-notes/` 目录改为原生 `<details>/<summary>` 折叠结构，默认收起；内部 01–04 条目与锚点保留。
- `public/index.html` 中 SAS 实战笔记固定置顶，显示为第一篇；其余文章顺延。
- 同步更新项目级 Skill 规定：以后保持此目录可折叠，SAS 笔记首页置顶。

## V0.2.13：SAS 函数速查扩充

- 保持 `/sas-notes/` 折叠目录与首页置顶，更新原编号 **04**（不新增零散文章）。
- 将 CAT / CATT / CATS / CATX、TRANWRD、COMPRESS、SCAN、STRIP、UPCASE、LOWCASE、PROPCASE、TRIM、NMISS、CMISS 等整理成 **8 类、42 项**功能对照，每项只给短示例和一句说明，常用函数加粗。
- `NMISS` 只用于数值，`CMISS` 可同时统计字符、数值缺失；强调 `COMPRESS(...,,'kd')` 会删除小数点/负号。
- 更新 `knowledge-index.json` 关键词，并在项目级 Skill 中固定“紧凑分组表格 + 高频加粗”的规则。

## V0.3.0：速查笔记 + 系统专题双层知识库

- 继续维护 `/sas-notes/`，新加 05 Unicode/上下标，06 PROC REPORT 跨列分组标题，07 PRXMATCH/PRXCHANGE，08 ODS RTF 标题分页；编号 01–08 与折叠目录同步。
- 新增 `/sas-learning/` 与五个独立页面 `/sas-learning/sql/`、`/freq/`、`/statistics/`、`/power/`、`/graphics/`。每页包含基础、TFL 实战、进阶与 QC，使用公开示例或虚构数据。
- 首页 SAS 实战笔记仍在第一位，系统专题位于第二位；静态索引及 sitemap 同步更新。
- `docs/sas-learning-roadmap.md` 记录历史实际话题、尚未验证的空白和后续路线。
- `.agents/skills/sp-sas-field-notes/SKILL.md` 更新为双层内容规范。所有新代码属于文档示例，不能声称在用户 SAS 环境已运行。

## V0.3.1：PK 浓度统计量与 RTF 排版的解释性教程

- `/sas-learning/pk-concentration/`：完整覆盖 N、n、n of BLQ、Mean、SD、CV%、GeoMean、GeoSD、GeoCV%、Median、Min、Max；定义、公式、算例、SAS 原尺度+对数尺度计算与 BLQ/NC/QC。将浓度汇总与 PK 参数汇总区分，明确 Tmax 的项目特例。
- `/sas-learning/report-rtf/`：将 COLUMN 跨列组标题、ODS TAGSETS.RTF、STYLE(HEADER/COLUMN)、DEFINE CELLWIDTH、RTF `~R` 原生控制字拆开详细说明，附演示代码和分页/文件关闭 QC。
- `/sas-notes/`：新增编号 09、10 作为速查入口，并为原编号 06 加入深度教程交叉链接。目录保持折叠与连续编号。
- 原有 `/sas-learning/statistics/`、`/pk-parameters/` 增加 PK 浓度统计量专题链接。系统专题入口扩充为 7 项。
- Skill 约束更新：统计概念、公式、来源与适用条件须解释充分，不能为追求简洁而牺牲可理解性。
- 代码均为教学示例，未在实际 SAS/Word 环境执行；BLQ 规则、N/n、GeoSD 标签、NC/NA 显示需要以项目 Shell、SAP、Spec 为准。

## V0.3.2：PC 文字对比度与代码复制

- `public/assets/style.css`：仅在桌面宽度 ≥701px 时适度提高正文、描述、表格、代码文本的灰度对比，恢复默认 WebKit 字体平滑，缓解 PC 渲染偏淡；手机端排版与正文色彩原则上保持原样。
- `public/assets/code-copy.js`：为静态页面中所有 `<pre><code>` 自动加独立“复制”按钮，复制 `code.textContent` 以保留缩进、换行及被 HTML 转义的特殊符号；优先 Clipboard API，权限不足时回退到选择复制，含复制成功/失败反馈。
- 全部 15 个主页面统一引入共享脚本和 `style.css?v=0.3.2` 防缓存，后续新增文章自动使用同一套代码块交互。
- 无第三方 JavaScript 依赖，无数据上报、无账号、无新后端。
- 生产站点显示仍需在 Cloudflare 完成部署后使用电脑和手机实际检查。

## V0.3.3：代码 Copy 按钮按需显示

- 将所有代码块右上角按钮从“复制”改为 `Copy`，成功时显示 `Copied`，失败时显示 `Failed`。
- 支持鼠标悬停代码框显示；非悬停时按钮默认透明并不接收鼠标，减少视觉干扰。
- 键盘 Tab 聚焦按钮时同样显示；触屏设备没有 hover 操作，始终显示以保证可用性；打印时隐藏按钮。
- 更新全站 `style.css?v=0.3.3` 与 `code-copy.js?v=0.3.3` 防缓存；没有修改 SAS 代码正文。

## V0.3.4：知识结构与代码布局

- Copy 按钮不再占用代码块顶部 41px 的空行：恢复接近原有 12px 内边距，按钮绝对定位于右上角，PC 端 hover/focus 显示，触屏保持可点。
- SAS 实战笔记 06 合并 PROC REPORT 的 COLUMN 组标题、STYLE 排版、RTF 控制与 QC；删除重复编号 10，仍保留旧 `#note-10` 指向 06，实际笔记为 01–09。
- `/sas-learning/report-rtf/` 从专题索引移除，改为轻量跳转到 `/sas-notes/#note-06`，避免旧链接失效。
- SQL、FREQ、统计过程、POWER、绘图专题不再采用“基础/实战/进阶”栏目，而由真实疑问串起解释与代码；PK 浓度专题也改成提问式标题。
- 更新项目级 Skill：从现象出发，自然推理到解决方案；内容长度由解释是否充分决定，避免形式化章节。
- 更新站点索引、站点地图和全站样式版本 V0.3.4；实际浏览器效果与 Cloudflare 发布仍需生产检查。

## V0.3.5：桌面正文可读性

- 用户实际 PC 截图表明，仅调深 #777/#888 等颜色，仍不足以解决衬线宋体类字体小字笔画偏细的问题。
- 仅在宽度 ≥701px 的桌面端，正文与表格改为系统无衬线字体（macOS PingFang SC、Windows Microsoft YaHei 等），同时把正文、说明和表格文字调到更深的灰黑色。
- 文章标题保留原有衬线气质并增强字重；表格中文从约 13px 提升到 14px，辅助说明提升到 12px。
- CSS 加载链接刷新为 `style.css?v=0.3.5`，防止浏览器继续使用旧缓存；手机端继续使用已有字体样式。
- 修改不涉及正文、SAS 示例、目录和代码复制功能。

## V0.3.6：首页字重与灰度回调

- 根据 PC 首页截图，把文章目录标题从约 600 字重、过深的近黑，调为 500 字重与柔和深灰 `#394852`，字号微调为 17px。
- 首页说明文字用中性灰 `#5f6b75`，页首介绍改 `#46525b`，保留可读对比。
- 限定在桌面首页 `.knowledge-main` 范围内，不影响阅读页的正文深灰、SAS 代码和手机端样式。
- 全站 CSS 查询参数升级到 `style.css?v=0.3.6`，以便看到新资源；仍需在真实浏览器检查最终视觉效果。

## V0.3.7：恢复 V0.3.1 原版视觉

- 从历史提交 `f788461e640a58b1971b0ed45c6e758a2cb48316` 恢复 V0.3.1 的完整基础 CSS（字体、颜色、标题字重、首页样式），撤销 0.3.2、0.3.5、0.3.6 的全局/桌面字体加深与无衬线覆盖。
- 保留后续功能：紧凑、悬浮的 `Copy` 按钮（PC hover/focus 显示，触屏仍可点击），保留 SAS 知识库新增内容和链接。
- 页面通过 `style.css?v=0.3.7` 刷新样式缓存；站点版本号为 V0.3.7，而视觉基准是 V0.3.1，并非整体功能回滚。
- 以后除非用户明确提出，不再统一调深字号/字重或替换原有衬线字体；视觉偏好优先于未经实际浏览器验证的“理论对比度最优”。
