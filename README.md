# SP · Clinical Statistical Programming

极简临床统计编程知识库与工具导航。当前版本：**V0.1.2**。

## 当前内容

- Tools 独立页面：`/tools/`，提供 XPT Viewer / CT Mapping 入口
- Knowledge 独立页面：`/knowledge/`，目前收录「常用 PK 参数」
- 顶部 Tools / Knowledge 是跨页面导航，不是首页双栏或锚点跳转
- 根路径 `/` 默认进入 Knowledge
- 文章目录：置于正文上方、可展开或折叠；滚动后显示回到顶部按钮
- 字体：本机 Serif 字体栈，兼顾中文与英文

**设计原则**：只发布已经完成、能解决真实问题的内容。没有登录、后台、数据库、框架依赖或跟踪脚本。

## Cloudflare Pages 部署

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 选择 GitHub 仓库 `dengweizhang/sp`。
3. 配置：
   - Framework preset: **None**
   - Production branch: **main**
   - Build command: **留空**
   - Build output directory: **public**
   - Root directory: **默认仓库根目录**
4. 部署成功后在 Pages 项目 **Custom domains** 添加 `sp.769967.xyz`，按界面提示确认 DNS。

## 本地查看

```bash
cd public
python3 -m http.server 8000
```

浏览 `http://localhost:8000`（自动跳转 Knowledge）。工具路径 `/tools/`，文章路径 `/pk-parameters/`。

## 修改内容

- 默认入口：`public/index.html`（跳转至 Knowledge）
- 工具页面：`public/tools/index.html`
- 笔记列表：`public/knowledge/index.html`
- 第一篇文章：`public/pk-parameters/index.html`
- 全站样式：`public/assets/style.css`

新增文章时，在 `public/` 下创建新文件夹和 `index.html`，再把链接加入 `public/knowledge/index.html`。等文章多到维护困难时再考虑 Markdown + 静态生成器。

## 内容边界

笔记并非临床研究分析计划或适用全部研究的统一判定标准。公开发布前请确认不存在客户、申办方或受试者保密信息。
