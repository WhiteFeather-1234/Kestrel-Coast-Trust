/* Kestrel Coast Trust (imaginary company) - shared site engine.
   Content lives in DEFAULTS below. The admin dashboard saves edits in this browser (localStorage). */
const DEFAULTS = {
  settings: { name: "Kestrel Coast Trust", tagline: "Protecting our coastline, one community at a time.", email: "hello@kestrelcoast.example", phone: "+234 800 000 0000", address: "12 Marina Road, Lagos", color: "#0e5a6b", password: "admin123",
    social: "Facebook|#\nX|#\nInstagram|#" },
  nav: [["index.html","Home"],["about.html","About"],["what-we-do.html","What We Do"],["blog.html","Blog"],["events.html","Events"],["gallery.html","Gallery"],["downloads.html","Downloads"],["contact.html","Contact"]],
  pages: {
    about: { title: "About Us", body: "<p>Kestrel Coast Trust is an independent charity founded in 2012 to restore shorelines and teach coastal communities how to look after them.</p><h2>Our mission</h2><p>To protect coastal habitats and the people who depend on them through restoration, education and local partnerships.</p><h2>Our vision</h2><p>A coastline where healthy ecosystems and thriving communities support each other.</p><h2>Our values</h2><p>Local leadership, open reporting, and long-term commitment.</p>" },
    "what-we-do": { title: "What We Do", body: "<h2>Shoreline restoration</h2><p>Mangrove planting and dune repair led by trained local crews.</p><h2>Schools programme</h2><p>Hands-on environmental lessons for primary and secondary schools.</p><h2>Community grants</h2><p>Small grants for resident-led clean-up and monitoring projects.</p>" },
    privacy: { title: "Privacy Policy", body: "<p>Replace this text with your organisation's privacy policy.</p>" },
    terms: { title: "Terms of Use", body: "<p>Replace this text with your organisation's terms of use.</p>" }
  },
  posts: [
    { id: 1, title: "Annual report 2025 is out", date: "2026-10-02", image: "", body: "Our 2025 report covers 14,000 mangrove seedlings planted and 38 schools reached.\nRead the full report on the Downloads page." },
    { id: 2, title: "New grants open for community groups", date: "2026-09-18", image: "", body: "Applications for our next round of community grants are now open until 30 November." },
    { id: 3, title: "Welcome to our new website", date: "2026-09-01", image: "", body: "News, events, photos and resources now live in one place." }
  ],
  events: [
    { id: 1, title: "Mangrove planting day", date: "2026-11-21", location: "Lekki Conservation Area", image: "", desc: "Join our crews for a morning of planting. Tools and refreshments provided." },
    { id: 2, title: "Annual supporters' evening", date: "2026-12-05", location: "Eko Hall, Victoria Island", image: "", desc: "An evening of talks, thanks and photos from the year." },
    { id: 3, title: "Beach clean-up", date: "2026-09-12", location: "Elegushi Beach", image: "", desc: "120 volunteers collected over 600 kg of waste." }
  ],
  gallery: [
    { id: 1, src: "", caption: "Add your photos in the admin dashboard" },
    { id: 2, src: "", caption: "Planting day" },
    { id: 3, src: "", caption: "School visit" }
  ],
  downloads: [
    { id: 1, title: "Annual report 2025", desc: "PDF, 2.4 MB", url: "files/annual-report-2025.pdf" },
    { id: 2, title: "Community grant application form", desc: "PDF, 120 KB", url: "files/grant-form.pdf" }
  ]
};
const DB = {
  get(k) { try { const v = localStorage.getItem("kct_" + k); return v ? JSON.parse(v) : DEFAULTS[k]; } catch (e) { return DEFAULTS[k]; } },
  set(k, v) { localStorage.setItem("kct_" + k, JSON.stringify(v)); }
};
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
const img = (s, c) => s ? `<img src="${esc(s)}" alt="${esc(c)}" loading="lazy">` : `<div class="ph" role="img" aria-label="${esc(c)}"></div>`;
const paras = t => esc(t).split(/\n+/).map(p => `<p>${p}</p>`).join("");
const W = h => `<div class="wrap">${h}</div>`;
const byDate = (a, b) => b.date.localeCompare(a.date);
const today = new Date().toISOString().slice(0, 10);
const app = () => document.getElementById("app");

const postCard = p => `<article class="card">${img(p.image, p.title)}<div class="cb"><small>${fmt(p.date)}</small><h3>${esc(p.title)}</h3><p>${esc(p.body).slice(0, 120)}…</p><a href="blog.html#p${p.id}">Read more</a></div></article>`;
const eventRow = (e, past) => { const d = new Date(e.date); return `<article class="ev ${past ? "past" : ""}"><div class="dt">${d.getDate()}<br><small>${d.toLocaleString("en-GB", { month: "short" })}</small></div><div><h3>${esc(e.title)}</h3><small>${fmt(e.date)} · ${esc(e.location)}</small>${paras(e.desc)}</div>${e.image ? img(e.image, e.title) : ""}</article>`; };

const R = {
  home() {
    const s = DB.get("settings"), posts = DB.get("posts").sort(byDate).slice(0, 3), ev = DB.get("events").filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    app().innerHTML = `<section class="hero"><div><h1>${esc(s.tagline)}</h1><p>${esc(s.name)} restores shorelines, teaches coastal communities and funds local projects.</p><a class="btn" href="what-we-do.html">See our work</a><a class="btn alt" href="contact.html">Get in touch</a></div></section>` +
      W(`<h2>Latest updates</h2><div class="grid">${posts.map(postCard).join("")}</div><p><a href="blog.html">All news</a></p><h2>Upcoming events</h2>${ev.map(e => eventRow(e)).join("") || "<p>No events scheduled yet.</p>"}`);
  },
  page() {
    const slug = document.body.dataset.slug || new URLSearchParams(location.search).get("p"), p = DB.get("pages")[slug];
    app().innerHTML = W(p ? `<div class="prose"><h1>${esc(p.title)}</h1>${p.body}</div>` : "<h1>Page not found</h1><p>Check the address or return home.</p>");
    if (p) document.title = p.title;
  },
  blog() { app().innerHTML = W(`<h1>Blog and news</h1>` + DB.get("posts").sort(byDate).map(p => `<article id="p${p.id}" class="prose">${p.image ? img(p.image, p.title) : ""}<small>${fmt(p.date)}</small><h2>${esc(p.title)}</h2>${paras(p.body)}</article>`).join("")); },
  events() {
    const e = DB.get("events");
    app().innerHTML = W(`<h1>Events</h1><h2>Upcoming</h2>${e.filter(x => x.date >= today).sort((a, b) => a.date.localeCompare(b.date)).map(x => eventRow(x)).join("") || "<p>No upcoming events.</p>"}<h2>Past events</h2>${e.filter(x => x.date < today).sort(byDate).map(x => eventRow(x, 1)).join("") || "<p>None yet.</p>"}`);
  },
  gallery() {
    const g = DB.get("gallery"); let i = 0, t;
    app().innerHTML = W(`<h1>Gallery</h1><div class="car"><div class="slides">${g.map(x => `<figure>${img(x.src, x.caption)}<figcaption>${esc(x.caption)}</figcaption></figure>`).join("")}</div><button class="pv" aria-label="Previous photo">‹</button><button class="nx" aria-label="Next photo">›</button></div><div class="thumbs">${g.map((x, n) => `<button data-n="${n}" aria-label="Show ${esc(x.caption)}">${img(x.src, x.caption)}</button>`).join("")}</div>`);
    const s = app().querySelector(".slides"), go = n => { i = (n + g.length) % g.length; s.style.transform = `translateX(-${i * 100}%)`; }, auto = () => { clearInterval(t); t = setInterval(() => go(i + 1), 5000); };
    app().querySelector(".pv").onclick = () => { go(i - 1); auto(); };
    app().querySelector(".nx").onclick = () => { go(i + 1); auto(); };
    app().querySelectorAll(".thumbs button").forEach(b => b.onclick = () => { go(+b.dataset.n); auto(); });
    if (g.length > 1 && !matchMedia("(prefers-reduced-motion:reduce)").matches) auto();
  },
  downloads() { app().innerHTML = W(`<h1>Downloads</h1>` + (DB.get("downloads").map(d => `<div class="dl"><div><strong>${esc(d.title)}</strong><br><small>${esc(d.desc)}</small></div><a class="btn" href="${esc(d.url)}" download>Download</a></div>`).join("") || "<p>No files yet.</p>")); },
  contact() {
    const s = DB.get("settings");
    app().innerHTML = W(`<h1>Contact us</h1><div class="two"><div><p>${esc(s.address)}<br><a href="mailto:${esc(s.email)}">${esc(s.email)}</a><br>${esc(s.phone)}</p><p>${socials(s)}</p></div><form class="form" id="cf"><label>Name<input name="n" required></label><label>Email<input type="email" name="e" required></label><label>Message<textarea name="m" rows="5" required></textarea></label><button class="btn">Send enquiry</button><p class="note">This opens your email app with the message ready to send. Connect a form service later to send directly.</p></form></div>`);
    document.getElementById("cf").onsubmit = ev => { ev.preventDefault(); const f = new FormData(ev.target); location.href = `mailto:${s.email}?subject=${encodeURIComponent("Website enquiry from " + f.get("n"))}&body=${encodeURIComponent(f.get("m") + "\n\n" + f.get("n") + " <" + f.get("e") + ">")}`; };
  }
};
const socials = s => String(s.social || "").split("\n").filter(Boolean).map(l => { const [n, u] = l.split("|"); return `<a href="${esc(u)}" rel="noopener">${esc(n)}</a>`; }).join(" · ");

document.addEventListener("DOMContentLoaded", () => {
  const s = DB.get("settings"), nav = DB.get("nav"), here = location.pathname.split("/").pop() || "index.html";
  document.documentElement.style.setProperty("--c", s.color);
  document.title = `${document.title} | ${s.name}`;
  document.getElementById("hd").innerHTML = `<div class="bar"><a class="logo" href="index.html">${esc(s.name)}</a><button id="tg" aria-expanded="false" aria-controls="nv">Menu</button><nav class="m" id="nv" aria-label="Main">${nav.map(([h, l]) => `<a href="${esc(h)}" class="${h === here ? "on" : ""}">${esc(l)}</a>`).join("")}</nav></div>`;
  const tg = document.getElementById("tg"); tg.onclick = () => tg.setAttribute("aria-expanded", document.getElementById("nv").classList.toggle("open"));
  document.getElementById("ft").innerHTML = `<div class="fi"><div><strong>${esc(s.name)}</strong><br>${esc(s.tagline)}</div><div>${esc(s.address)}<br>${esc(s.email)}<br>${esc(s.phone)}</div><div>${socials(s)}<br><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="admin.html">Admin</a></div></div>`;
  const r = R[document.body.dataset.page]; if (r) r();
});
