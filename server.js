/**
 * Website Converter — একক ফাইল অ্যাপ (Node.js 18+, কোনো npm প্যাকেজ লাগে না)
 *
 * চালানো:   node server.js
 * ব্রাউজার:  http://localhost:3000
 *
 * GitHub-এ ডিপ্লয়: এই ফাইলটি রিপোতে রাখুন (server.js) এবং Render / Railway /
 * Fly.io / Cyclic-এ Start Command দিন:  node server.js
 */

import http from "node:http";

const PORT = process.env.PORT || 3000;

/* ------------------------------ HTML পেজ (UI) ------------------------------ */
const PAGE = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Website Converter — URL থেকে HTML কোড</title>
<meta name="description" content="যেকোনো ওয়েবসাইটের URL দিয়ে সম্পূর্ণ HTML সোর্স কোড দেখুন, কপি করুন ও ডাউনলোড করুন।" />
<meta property="og:title" content="Website Converter — URL থেকে HTML কোড" />
<meta property="og:description" content="URL দিয়ে যেকোনো সাইটের HTML সোর্স কোড দেখুন, কপি ও ডাউনলোড করুন।" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<style>
  :root{--bg:#0b0f14;--fg:#e6edf3;--muted:#8b98a5;--card:#111823;--border:#1f2937;--pri:#3b82f6;--pri-fg:#fff;--err:#f87171}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Bengali",sans-serif}
  .wrap{max-width:900px;margin:0 auto;padding:56px 16px}
  .badge{display:inline-block;border:1px solid var(--border);color:var(--muted);border-radius:999px;padding:4px 12px;font-size:12px}
  h1{font-size:40px;margin:18px 0 8px;letter-spacing:-.02em}
  header{text-align:center}
  p.sub{color:var(--muted);font-size:15px;margin:0 auto;max-width:560px}
  form{display:flex;gap:10px;margin-top:28px;flex-wrap:wrap}
  input{flex:1 1 240px;height:48px;padding:0 14px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:15px}
  button{height:48px;padding:0 20px;border-radius:10px;border:0;background:var(--pri);color:var(--pri-fg);font-size:15px;cursor:pointer}
  button:disabled{opacity:.6;cursor:default}
  .err{margin-top:16px;border:1px solid rgba(248,113,113,.4);background:rgba(248,113,113,.1);color:var(--err);padding:12px 14px;border-radius:10px;font-size:14px}
  section{margin-top:28px;border:1px solid var(--border);border-radius:12px;background:var(--card);display:none}
  .bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;border-bottom:1px solid var(--border);padding:10px 14px;font-size:12px;color:var(--muted)}
  .chip{background:#1b2532;color:var(--fg);padding:3px 8px;border-radius:6px;font-weight:600}
  .bar .act{margin-left:auto;display:flex;gap:8px}
  .bar .act button{height:32px;padding:0 12px;font-size:13px;background:#1b2532;color:var(--fg)}
  pre{margin:0;max-height:60vh;overflow:auto;padding:16px;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="badge">Real fetch • no CORS limits</span>
    <h1>Website Converter</h1>
    <p class="sub">যেকোনো ওয়েবসাইটের লিংক দিন — সার্ভার থেকে আসল HTML কোড এনে দেখাবে। কপি বা ডাউনলোড করতে পারবেন।</p>
  </header>

  <form id="f">
    <input id="url" placeholder="example.com অথবা https://example.com" aria-label="Website URL" />
    <button id="go" type="submit">HTML দেখাও</button>
  </form>

  <div id="err" class="err" style="display:none"></div>

  <section id="out">
    <div class="bar">
      <span class="chip" id="status"></span>
      <span id="furl"></span>
      <span id="size"></span>
      <span id="title"></span>
      <div class="act">
        <button id="copy" type="button">কপি</button>
        <button id="dl" type="button">ডাউনলোড</button>
      </div>
    </div>
    <pre><code id="code"></code></pre>
  </section>
</div>

<script>
const $ = (id) => document.getElementById(id);
let data = null;
const fmt = (n) => n < 1024 ? n + " B" : n < 1048576 ? (n/1024).toFixed(1) + " KB" : (n/1048576).toFixed(2) + " MB";

$("f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = $("url").value.trim();
  if (!url) return;
  $("err").style.display = "none";
  $("out").style.display = "none";
  $("go").disabled = true; $("go").textContent = "লোড হচ্ছে...";
  try {
    const res = await fetch("/api/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "লোড করা যায়নি");
    data = json;
    $("status").textContent = json.status;
    $("furl").textContent = json.url;
    $("size").textContent = fmt(json.bytes);
    $("title").textContent = json.title ? '“' + json.title + '”' : "";
    $("code").textContent = json.html;
    $("out").style.display = "block";
  } catch (e) {
    $("err").textContent = e.message;
    $("err").style.display = "block";
  } finally {
    $("go").disabled = false; $("go").textContent = "HTML দেখাও";
  }
});

$("copy").addEventListener("click", async () => {
  if (!data) return;
  await navigator.clipboard.writeText(data.html);
  $("copy").textContent = "কপি হয়েছে ✓";
  setTimeout(() => ($("copy").textContent = "কপি"), 2000);
});

$("dl").addEventListener("click", () => {
  if (!data) return;
  const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  try { a.download = new URL(data.url).hostname + ".html"; } catch { a.download = "page.html"; }
  a.click();
  URL.revokeObjectURL(href);
});
</script>
</body>
</html>`;

/* --------------------------- সার্ভার-সাইড ফেচ লজিক --------------------------- */
async function fetchHtml(input) {
  let raw = String(input || "").trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;

  let target;
  try {
    target = new URL(raw);
  } catch {
    throw new Error("সঠিক URL দিন (যেমন: example.com)");
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("শুধু http/https সাপোর্টেড");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(target.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return {
      url: res.url || target.toString(),
      status: res.status,
      contentType: res.headers.get("content-type") || "unknown",
      bytes: Buffer.byteLength(html, "utf8"),
      title: m && m[1] ? m[1].trim().slice(0, 200) : null,
      html,
    };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    throw new Error(
      /abort/i.test(msg) ? "সময় শেষ (timeout) — সাইটটি সাড়া দেয়নি" : "লোড করা যায়নি: " + msg
    );
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------------- সার্ভার --------------------------------- */
const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(PAGE);
  }

  if (req.method === "POST" && req.url === "/api/fetch") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", async () => {
      try {
        const { url } = JSON.parse(body || "{}");
        const data = await fetchHtml(url);
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(PORT, () => console.log("Website Converter → http://localhost:" + PORT));
