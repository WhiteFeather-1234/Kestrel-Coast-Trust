/* Admin dashboard. Demo only: the password check and storage run in the browser.
   For a live site, move login and saving to a server (see README.txt). */
(() => {
  const A = document.getElementById("app");
  const S = {
    posts: { label: "Blog / News", f: [["title"], ["date", "date"], ["image"], ["body", "textarea"]] },
    events: { label: "Events", f: [["title"], ["date", "date"], ["location"], ["image"], ["desc", "textarea"]] },
    gallery: { label: "Gallery", f: [["caption"], ["src"]] },
    downloads: { label: "Downloads", f: [["title"], ["desc"], ["url"]] }
  };
  let tab = "posts", edit = null;

  function form(fields, o, cb) {
    const w = document.createElement("form"); w.className = "form";
    w.innerHTML = fields.map(([n, t]) => `<label>${n}${t === "textarea" ? `<textarea name="${n}" rows="7">${esc(o[n])}</textarea>` : `<input name="${n}" type="${t || "text"}" value="${esc(o[n])}">`}${/^(image|src|url)$/.test(n) ? `<input type="file" data-f="${n}" aria-label="Upload file for ${n}">` : ""}</label>`).join("") + `<button class="btn">Save</button>`;
    w.onsubmit = e => { e.preventDefault(); cb(Object.fromEntries(new FormData(w))); };
    w.querySelectorAll("[data-f]").forEach(i => i.onchange = () => { const r = new FileReader(); r.onload = () => w.elements[i.dataset.f].value = r.result; r.readAsDataURL(i.files[0]); });
    return w;
  }

  function login() {
    A.innerHTML = `<div class="wrap"><h1>Admin login</h1><form class="form" id="lf" style="max-width:360px"><label>Password<input type="password" id="pw" required></label><button class="btn">Sign in</button><p class="note">Demo password: admin123. Change it under Settings.</p></form></div>`;
    document.getElementById("lf").onsubmit = e => { e.preventDefault(); if (document.getElementById("pw").value === DB.get("settings").password) { sessionStorage.setItem("adm", "1"); show(); } else alert("Wrong password."); };
  }

  function show() {
    const tabs = [...Object.keys(S), "pages", "settings"];
    A.innerHTML = `<div class="wrap"><h1>Dashboard</h1><div class="tabs">${tabs.map(t => `<button data-t="${t}" class="${t === tab ? "on" : ""}">${S[t] ? S[t].label : t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div><div id="pn"></div><hr><p class="note">Edits are saved in this browser. Use backup to move them to another computer.</p><button class="btn" id="ex">Export backup</button><button class="btn" id="im">Import backup</button><button class="btn" id="lo">Log out</button></div>`;
    A.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { tab = b.dataset.t; edit = null; show(); });
    document.getElementById("lo").onclick = () => { sessionStorage.removeItem("adm"); login(); };
    document.getElementById("ex").onclick = () => { const o = {}; Object.keys(DEFAULTS).forEach(k => o[k] = DB.get(k)); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(o)], { type: "application/json" })); a.download = "site-backup.json"; a.click(); };
    document.getElementById("im").onclick = () => { const i = document.createElement("input"); i.type = "file"; i.onchange = () => { const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); Object.keys(o).forEach(k => k in DEFAULTS && DB.set(k, o[k])); show(); } catch (e) { alert("That file is not a valid backup."); } }; r.readAsText(i.files[0]); }; i.click(); };
    S[tab] ? list() : tab === "pages" ? pages() : settings();
  }

  function list() {
    const pn = document.getElementById("pn"), s = S[tab], a = DB.get(tab);
    pn.innerHTML = `<button class="btn" id="add">New item</button>` + a.map((x, i) => `<div class="row"><span>${esc(x[s.f[0][0]] || "(untitled)")}</span><span><button data-e="${i}">Edit</button> <button data-d="${i}">Delete</button></span></div>`).join("");
    document.getElementById("add").onclick = () => { edit = -1; list(); };
    pn.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { edit = +b.dataset.e; list(); });
    pn.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { if (confirm("Delete this item?")) { a.splice(+b.dataset.d, 1); DB.set(tab, a); edit = null; list(); } });
    if (edit !== null) pn.appendChild(form(s.f, a[edit] || {}, v => { if (edit === -1) a.unshift({ id: Date.now(), ...v }); else a[edit] = { ...a[edit], ...v }; DB.set(tab, a); edit = null; list(); }));
  }

  function pages() {
    const pn = document.getElementById("pn"), p = DB.get("pages");
    pn.innerHTML = `<button class="btn" id="add">New page</button><p class="note">New pages open at page.html?p=their-name. Add them to the menu under Settings.</p>` + Object.keys(p).map(k => `<div class="row"><span>${esc(p[k].title)} <small>(${esc(k)})</small></span><span><button data-e="${esc(k)}">Edit</button> <button data-d="${esc(k)}">Delete</button></span></div>`).join("");
    document.getElementById("add").onclick = () => { const k = (prompt("Page name for the address (letters, numbers, hyphens):") || "").toLowerCase().replace(/[^a-z0-9-]/g, ""); if (k) { p[k] = p[k] || { title: k, body: "<p>New page.</p>" }; DB.set("pages", p); edit = k; pages(); } };
    pn.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { edit = b.dataset.e; pages(); });
    pn.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { if (confirm("Delete this page?")) { delete p[b.dataset.d]; DB.set("pages", p); edit = null; pages(); } });
    if (edit && p[edit]) pn.appendChild(form([["title"], ["body", "textarea"]], p[edit], v => { p[edit] = v; DB.set("pages", p); edit = null; pages(); }));
  }

  function settings() {
    const pn = document.getElementById("pn"), s = DB.get("settings"), nav = DB.get("nav").map(n => n.join("|")).join("\n");
    pn.appendChild(form([["name"], ["tagline"], ["email"], ["phone"], ["address"], ["color", "color"], ["password"], ["social", "textarea"], ["menu", "textarea"]], { ...s, menu: nav }, v => {
      DB.set("nav", v.menu.split("\n").filter(Boolean).map(l => l.split("|").map(x => x.trim()))); delete v.menu; DB.set("settings", v); alert("Settings saved."); show();
    }));
    pn.insertAdjacentHTML("afterbegin", `<p class="note">Social links and menu: one per line as Label|address (for example Facebook|https://facebook.com/yourpage).</p>`);
  }

  sessionStorage.getItem("adm") === "1" ? show() : login();
})();
