(() => {
  // Chroma leaves plain commands, sub-commands and flags uncolored in shell blocks.
  // This adds Nord colors to those plain-text parts only; Chroma's own tokens are untouched.
  const blocks = document.querySelectorAll(
    'code[data-lang="bash"], code[data-lang="sh"], code[data-lang="shell"], code[data-lang="zsh"]'
  );
  if (!blocks.length) return;

  const TOKEN = /\s+|&&|\|\||[|;&]|\$\(|[()]|\S+?(?=&&|\|\||[|;()]|\s|$)/g;
  const PREFIX = new Set(["sudo", "env", "time", "nohup", "exec", "xargs", "command"]);

  const wrap = (cls, text) => {
    const span = document.createElement("span");
    span.className = cls;
    span.textContent = text;
    return span;
  };

  // Command output is often pasted into shell blocks; never color it as a command.
  const looksLikeOutput = (line) => {
    const text = line.textContent.trim();
    return /\S {2,}\S/.test(text) || /^total \d+$/.test(text) || /^[-dlcbps][-rwxsStT]{9}\b/.test(text);
  };
  const looksLikeCommand = (word) =>
    /^[a-z0-9_.\/~+@-][a-z0-9_.\/+@:-]*$/.test(word) &&
    word.length > 1 &&
    !word.startsWith("-") &&
    !/-(?=[a-z0-9]*\d)(?=[a-z0-9]*[a-z])[a-z0-9]{5,}$/.test(word);

  const classify = (word, state) => {
    if (state.cmd) {
      if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) return null;
      if (!looksLikeCommand(word)) {
        state.cmd = false;
        return null;
      }
      state.cmd = PREFIX.has(word);
      state.sub = !state.cmd;
      return "sh-cmd";
    }
    if (word.startsWith("-")) return "sh-flag";
    if (state.sub && /^[a-z][\w-]*$/.test(word)) {
      state.sub = false;
      return "sh-sub";
    }
    state.sub = false;
    if (/^(https?:\/\/|~?\/|\.{1,2}\/)/.test(word)) return "sh-path";
    if (/^\d+$/.test(word)) return "sh-num";
    return null;
  };

  const processText = (node, state) => {
    const text = node.nodeValue;
    const out = document.createDocumentFragment();
    let changed = false;

    for (const part of text.match(TOKEN) || []) {
      if (/^\s+$/.test(part)) {
        out.append(part);
      } else if (/^(&&|\|\||[|;&]|\$\()$/.test(part)) {
        state.cmd = true;
        state.sub = false;
        out.append(part);
      } else if (/^[()]$/.test(part)) {
        out.append(part);
      } else {
        const cls = classify(part, state);
        if (cls) {
          out.append(wrap(cls, part));
          changed = true;
        } else {
          out.append(part);
        }
      }
    }
    if (changed) node.replaceWith(out);
  };

  blocks.forEach((code) => {
    let continued = false;
    code.querySelectorAll(":scope > .line").forEach((line) => {
      const state = { cmd: !continued && !looksLikeOutput(line), sub: false };
      [...line.querySelectorAll(":scope > .cl")].forEach((cl) => {
        [...cl.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            processText(node, state);
          } else if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim()) {
            // A Chroma-colored token counts as the command or an argument.
            state.cmd = false;
            state.sub = false;
          }
        });
      });
      continued = /\\\s*$/.test(line.textContent);
    });
  });
})();
