# SP · Clinical Statistical Programming

**V0.2.0** — 极简 SP 统计编程知识库、顶部 XPT/CT 快捷链接、右下角 SP AI。

## 页面与文件

- `/`：文章索引（不展示搜索框或大幅介绍）
- `/pk-parameters/`：常用 PK 参数文章
- `public/assets/ai.js`：右下角 AI 面板（全站可用）
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
- 当前只有「常用 PK 参数」一篇文章已经入库；增加文章时更新 `public/knowledge-index.json`。
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
