/* SP AI: a small accessible drawer; chat is kept in memory for this tab only. */
(() => {
  const root = document.createElement("div");
  root.id = "sp-ai-root";
  root.innerHTML = '<button class="ai-launcher" type="button" aria-label="打开 SP AI" aria-expanded="false" aria-controls="sp-ai-panel">AI</button>'
    + '<section class="ai-panel" id="sp-ai-panel" role="dialog" aria-label="SP AI 助手" hidden>'
    + '<div class="ai-head"><div><strong>SP AI</strong><span>DeepSeek · 本站资料优先</span></div><button type="button" class="ai-close" aria-label="关闭">×</button></div>'
    + '<div class="ai-messages" aria-live="polite"><p class="ai-hint">提问 PK、CDISC 或统计编程问题。<br>AI 可能使用联网资料；请勿输入项目敏感数据。</p></div>'
    + '<form class="ai-form"><textarea name="question" aria-label="提问" placeholder="输入问题…" rows="2" maxlength="2000" required></textarea>'
    + '<div class="ai-form-footer"><span class="ai-status" role="status"></span><button type="submit" class="ai-send">发送 ↗</button></div>'
    + '<label class="ai-code" hidden>访问口令<input type="password" autocomplete="off" placeholder="由站点管理员提供"></label>'
    + '</form></section>';
  document.body.appendChild(root);

  const launcher = root.querySelector(".ai-launcher");
  const panel = root.querySelector(".ai-panel");
  const close = root.querySelector(".ai-close");
  const messagesBox = root.querySelector(".ai-messages");
  const form = root.querySelector(".ai-form");
  const input = form.querySelector("textarea");
  const sendButton = form.querySelector(".ai-send");
  const status = form.querySelector(".ai-status");
  const codeBox = form.querySelector(".ai-code");
  const codeInput = codeBox.querySelector("input");
  let busy = false;
  let messages = [];
  let checked = false;

  function show(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "关闭 SP AI" : "打开 SP AI");
    if (open) {
      input.focus();
      if (!checked) {
        checked = true;
        fetch("/api/chat", {headers:{"Accept":"application/json"}, cache:"no-store"})
          .then(r => r.json())
          .then(d => { if (!d.ready) status.textContent = "尚未配置 AI 服务"; })
          .catch(() => { status.textContent = "服务暂不可用"; });
      }
    } else launcher.focus();
  }
  launcher.addEventListener("click", () => show(panel.hidden));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) show(false);
  });

  function appendMessage(role, content, sources) {
    const hint = messagesBox.querySelector(".ai-hint");
    if (hint) hint.remove();
    const bubble = document.createElement("div");
    bubble.className = "ai-message ai-" + role;
    const text = document.createElement("div");
    text.className = "ai-message-text";
    text.textContent = content;
    bubble.appendChild(text);
    if (role === "assistant" && Array.isArray(sources) && sources.length) {
      const refs = document.createElement("div");
      refs.className = "ai-sources";
      const label = document.createElement("span");
      label.textContent = "参考：";
      refs.appendChild(label);
      for (const source of sources.slice(0, 8)) {
        const raw = String(source.url || "");
        let uri;
        try { uri = new URL(raw, location.origin); } catch { continue; }
        if (!["http:","https:"].includes(uri.protocol)) continue;
        const link = document.createElement("a");
        link.href = uri.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = String(source.title || uri.hostname).slice(0, 65);
        refs.appendChild(link);
      }
      bubble.appendChild(refs);
    }
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    const question = input.value.trim();
    if (!question) return;
    busy = true;
    sendButton.disabled = true;
    input.disabled = true;
    status.textContent = "正在回答…";
    appendMessage("user", question);
    messages.push({role:"user",content:question});
    input.value = "";
    const outgoing = messages.slice(-9);
    try {
      const headers = {"Content-Type":"application/json"};
      if (!codeBox.hidden && codeInput.value.trim()) headers["X-SP-AI-Code"] = codeInput.value.trim();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 65000);
      let response;
      try {
        response = await fetch("/api/chat", {
          method:"POST",
          headers,
          body: JSON.stringify({messages:outgoing}),
          signal: controller.signal
        });
      } finally { clearTimeout(timer); }
      const data = await response.json();
      if (!response.ok) {
        if (data.codeRequired) codeBox.hidden = false;
        throw new Error(data.error || "暂时无法回答。");
      }
      appendMessage("assistant", data.answer, data.sources);
      messages.push({role:"assistant",content:data.answer.slice(0,2000)});
      status.textContent = "";
    } catch (err) {
      messages.pop();
      appendMessage("system", err.name === "AbortError" ? "请求时间过长，请稍后重试。" : (err.message || "请求失败。"));
      status.textContent = "请求未完成";
    } finally {
      busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
})();
