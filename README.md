# SP · Clinical Statistical Programming

一个极简临床统计编程知识库。当前版本：**V0.1.3**。

## 结构

- 首页 `/`：文章检索与笔记列表
- 顶部固定工具栏：直接打开 [XPT Viewer](https://xpt.769967.xyz) 与 [CT Mapping](https://ct.769967.xyz)
- 第一篇文章 `/pk-parameters/`：常用 PK 参数及 Lambda_z 注意事项
- 旧路径 `/tools/` 与 `/knowledge/`：跳转回首页，避免旧书签失效

搜索为**纯浏览器端关键词匹配**（文章标题、术语及关键词），没有服务端、数据收集或第三方脚本。新文章发布时，在 `public/index.html` 的 `article-list` 中添加新条目和 `data-search` 检索关键词。

## 部署 Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Pages → Connect to Git。
2. 选择仓库 `dengweizhang/sp`，生产分支 `main`。
3. Framework preset 选 **None**；Build command 留空；Build output directory 填 **public**。
4. 在 Custom domains 绑定 `sp.769967.xyz`。

## 本地预览

```bash
cd public
python3 -m http.server 8000
```

访问 `http://localhost:8000`。

## 文件

- `public/index.html`：主页及搜索
- `public/pk-parameters/index.html`：PK 文章
- `public/assets/style.css`：全站紧凑 Serif 排版
- `public/tools/index.html` 与 `public/knowledge/index.html`：旧链接兼容

**原则：只保留真实使用所需要的功能。** 不增加登录、后台、数据库、跟踪脚本。公开发表工作内容前请检查客户、申办方和受试者相关的保密边界。
