/* SP · one-click copy for existing <pre><code> blocks; no external dependency. */
(() => {
  'use strict';

  function fallbackCopy(value) {
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    field.style.top = '0';
    document.body.appendChild(field);
    field.focus();
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('Copy command unavailable');
  }

  function attachCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      const code = Array.from(pre.children).find(child => child.tagName === 'CODE');
      if (!code || pre.parentNode.classList.contains('code-copy-wrap')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-copy-wrap';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy-button';
      button.textContent = 'Copy';
      button.title = 'Copy SAS code';
      button.setAttribute('aria-label', 'Copy this code snippet');
      button.setAttribute('aria-live', 'polite');
      wrapper.appendChild(button);

      let feedbackTimer;
      button.addEventListener('click', async () => {
        // Use the <code> content, not <pre> (which now has a button).
        // textContent decodes HTML entities and keeps code indentation.
        const value = code.textContent.replace(/^\r?\n/, '').replace(/\r?\n$/, '');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
          } else {
            fallbackCopy(value);
          }
          button.textContent = 'Copied';
          button.classList.add('is-copied');
          button.classList.remove('is-error');
        } catch (error) {
          // Some browsers deny clipboard access. Try the legacy path.
          try {
            fallbackCopy(value);
            button.textContent = 'Copied';
            button.classList.add('is-copied');
            button.classList.remove('is-error');
          } catch (ignored) {
            button.textContent = 'Failed';
            button.classList.remove('is-copied');
            button.classList.add('is-error');
          }
        }
        window.clearTimeout(feedbackTimer);
        feedbackTimer = window.setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('is-copied', 'is-error');
        }, 1600);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachCopyButtons, { once: true });
  } else {
    attachCopyButtons();
  }
})();
