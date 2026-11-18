# SP · Clinical Statistical Programming

**V0.2.8** — 极简 SP 统计编程知识库、顶部 XPT/CT 快捷链接，AI 暂时隐藏。

## 页面与文件

- `/`：文章索引（不展示搜索框或大幅介绍）
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

## V0.2.8：暂时隐藏 AI

- 首页与 PK 文章都已移除 `/assets/ai.js` 引用，右下角不显示入口。
- 服务端 `functions/api/chat.js` 中 `AI_ENABLED = false`，避免直接访问 API 产生 DeepSeek 消耗。
- 恢复时：将 `AI_ENABLED` 改为 `true`，在需要显示的页面 `<head>` 中加入 `<script src="/assets/ai.js" defer></script>`，并部署；如使用 API，还需设置密钥与限流。
- AI 源码与文章索引保留，不删除现有能力。

## V0.2.8 · PK 交互图解

- `public/assets/pk-interactive.js`：只加载在 PK 文章内的本地 SVG 交互图，无外部依赖或数据上报。
- 浓度–时间图：点选 Cmax/Tmax、AUClst、AUCinf、Lambda_z、t½，显示不同强调状态与解释。
- AUC 积分图：切换线性梯形法 / 对数梯形法；对相同两个采样点分别计算示意面积 3.750 与 3.607 ng·h/mL。
- 图为模拟数据（非项目数据）；手机上图表可横向滑动。原有 AI 入口继续隐藏且接口暂停。

## V0.2.8：PARAMCD 对照与点击式图解

- 参数表新增 PARAMCD（参考）列，按 SDTM PKPARMCD 控制术语 C85839 匹配；ADPP PARAMCD 最终以项目 Spec 为准。
- AUCinf、MRTinf、CL 和 CL/F 按观测/预测、给药途径等展示多个候选代码，附可展开解释。
- PK 浓度–时间图：点击参数按钮，切换 Cmax/Tmax、AUClst、AUCinf、Lambda_z 和 t½ 图解。
- AUC 梯形法图：点击「线性梯形」/「对数梯形」按钮查看面积差异；不再支持拖动。
- 图解数据均为示意，不可代替项目 PK 分析输出。AI 继续隐藏并停用。

## V0.2.8：适应症与面试准备

- 新增 `/indication-interview/`，按“概念区分→为什么不是每个项目都有患者适应症→5种项目背景→Protocol复盘→面试话术→自测”组织。
- 例子是通用、匿名的学习示意，不泄露具体申办方与保密研究内容。
- 首页文章数更新到 2，静态知识索引和 sitemap 同步更新。原 AI 入口继续隐藏。

## V0.2.8：临床试验设计

- 依据 ICH E8(R1)、E9、E10、FDA 和 ClinicalTrials.gov 的公开权威说明，区分研究结构、随机化、盲法、对照、比较目标及研究阶段。
- 新增 5 状态点击式路径图：平行、交叉、单臂、序贯、析因；无拖动、无外部依赖。
- 从 SAD/MAD 队列执行、随机双盲逻辑、TA/TE/TV/SE 到 ADaM/TFL 的工作影响，配合面试示范回答与六道自测题。
- 更新首页为 3 篇文章、公开知识索引与 sitemap；AI 仍然隐藏并停用。

## V0.2.8：统计学与临床药理学基础

- 分成两篇交叉链接的独立文章；统计学重在数据分析推断与 TFL，药理学重在给药、药代、药效与安全性科学逻辑。
- 统计学篇：11 个章节，描述统计、P 值与 CI、ANCOVA、MMRM、KM/Cox、分析集、缺失数据、Estimand、多重性与面试题。
- 药理学篇：12 个章节，ADME、PK/PD、稳态蓄积、食物影响、DDI、BA/BE、NCA/PopPK、QTc、ADA/NAb、数据流与面试题。
- 继续沿用极简文章排版、可折叠目录和回到顶部；不恢复 AI，不引入外部脚本。
- 首页共 5 篇，knowledge-index、sitemap 与版本号同步更新。参考监管指南主要来自 ICH/EMA/FDA。
