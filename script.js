"use strict";

/* ============ Utilidades ============ */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } }
};
const prefersReduced = () =>
  document.body.classList.contains("reduce-motion") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("#year").textContent = new Date().getFullYear();

/* ============ Corazones decorativos y ráfagas ============ */
const SYMBOLS = ["♡", "✿", "✦", "❀", "☁", "♥"];
const floaters = $("#floaters");
function spawnFloater() {
  if (prefersReduced() || document.hidden) return;
  const el = document.createElement("span");
  el.className = "floater";
  el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  el.style.left = Math.random() * 100 + "vw";
  el.style.fontSize = 14 + Math.random() * 26 + "px";
  el.style.color = ["#f4a9c7", "#d9c8f7", "#cdebdd", "#ffd9c4"][Math.floor(Math.random() * 4)];
  el.style.animationDuration = 14 + Math.random() * 14 + "s";
  floaters.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}
setInterval(spawnFloater, 2600);
for (let i = 0; i < 4; i++) setTimeout(spawnFloater, i * 400);

function heartBurst(x, y, n = 10) {
  if (prefersReduced()) return;
  for (let i = 0; i < n; i++) {
    const h = document.createElement("span");
    h.className = "heart-burst";
    h.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.color = ["#e57fa5", "#b9a2e8", "#7fcfae", "#f5a57c"][i % 4];
    const ang = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 90;
    h.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    h.style.setProperty("--dy", Math.sin(ang) * dist - 30 + "px");
    document.body.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }
}
function burstFrom(el) {
  const r = el.getBoundingClientRect();
  heartBurst(r.left + r.width / 2, r.top + r.height / 2);
}

/* ============ Menú móvil y enlace activo ============ */
const navToggle = $("#nav-toggle"), menu = $("#menu");
navToggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
$$("#menu a").forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));
if ("IntersectionObserver" in window) {
  const links = $$("#menu a");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main section[id]").forEach(s => io.observe(s));
}

/* ============ Modal de crisis ============ */
const crisis = $("#crisis-modal");
$("#open-crisis").addEventListener("click", () => crisis.showModal());
crisis.addEventListener("click", e => { if (e.target === crisis) crisis.close(); });
$$(".close-modal").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));

/* ============ Accesibilidad ============ */
let fontScale = store.get("fontScale", 100);
const applyFont = () => document.documentElement.style.setProperty("--fs", fontScale + "%");
applyFont();
$("#font-plus").addEventListener("click", () => { fontScale = Math.min(150, fontScale + 10); applyFont(); store.set("fontScale", fontScale); });
$("#font-minus").addEventListener("click", () => { fontScale = Math.max(80, fontScale - 10); applyFont(); store.set("fontScale", fontScale); });

function bindToggle(sel, cls, key) {
  const btn = $(sel);
  const set = on => { document.body.classList.toggle(cls, on); btn.setAttribute("aria-pressed", String(on)); store.set(key, on); };
  set(store.get(key, false));
  btn.addEventListener("click", () => set(!document.body.classList.contains(cls)));
}
bindToggle("#contrast-toggle", "hc", "hc");
bindToggle("#motion-toggle", "reduce-motion", "reduceMotion");

/* Lectura por voz */
const readBtn = $("#read-toggle");
const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
let reading = false;
function speak(text) {
  if (!synth || !text) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-CO"; u.rate = 0.95;
  synth.speak(u);
}
if (!synth) { readBtn.disabled = true; readBtn.title = "Tu navegador no admite lectura por voz"; }
readBtn.addEventListener("click", () => {
  reading = !reading;
  readBtn.setAttribute("aria-pressed", String(reading));
  if (reading) speak("Lectura por voz activada. Toca un texto o selecciónalo para escucharlo.");
  else if (synth) synth.cancel();
});
document.addEventListener("click", e => {
  if (!reading) return;
  const sel = window.getSelection().toString().trim();
  if (sel) { speak(sel); return; }
  const t = e.target.closest("p, h1, h2, h3, li, summary, button, label");
  if (t) speak(t.innerText);
});
window.addEventListener("beforeunload", () => synth && synth.cancel());

/* ============ ¿Qué necesito ahora? (orientación) ============ */
const triage = $("#triage");
const LINES_SHORT = `
  <div class="answers">
    <a class="btn btn-emergency" href="tel:123">🚨 Llamar al 123</a>
    <a class="btn btn-primary" href="tel:192">💗 Llamar al 192, opción 4</a>
  </div>`;
const triageTree = {
  q1: { q: "¿Ahora mismo hay peligro inmediato para ti o para otra persona? (una herida, un intento en curso, una sobredosis, un arma a la mano)", yes: "r_urgent", no: "q2" },
  q2: { q: "¿Estás teniendo pensamientos de quitarte la vida o de hacerte daño?", yes: "r_suicide", no: "q3" },
  q3: { q: "¿Sientes ansiedad muy fuerte, pánico, llanto o sensación de desbordarte?", yes: "r_calm", no: "q4" },
  q4: { q: "¿Quieres acompañar a alguien que está pasando por un momento difícil?", yes: "r_helper", no: "r_explore" },
  r_urgent: { urgent: true, title: "Pide ayuda ahora mismo", body: "Llama al 123. Si puedes, no te quedes sola o solo y aleja con calma lo que pueda hacer daño. Si estás acompañando a alguien en esta situación, no lo dejes solo hasta que llegue ayuda.", extra: LINES_SHORT },
  r_suicide: { urgent: true, title: "Gracias por decirlo. No tienes que sostener esto sola o solo.", body: "Habla hoy con alguien: llama a la línea 192, opción 4 (salud mental), a la 106 si estás en Bogotá, Medellín o Cali, o al 123 si sientes que no puedes mantenerte a salvo. Avisa también a una persona de confianza y procura alejar objetos con los que podrías hacerte daño. Tu plan de seguridad puede ayudarte.", extra: LINES_SHORT + `<p><button class="btn btn-secondary" data-goto="plan">🛡️ Abrir mi plan de seguridad</button></p>` },
  r_calm: { title: "Vamos a bajar la intensidad, paso a paso", body: "Empieza por la respiración guiada o por el anclaje 5-4-3-2-1. Si la sensación no baja o empeora, llama a la línea 192, opción 4.", extra: `<div class="answers"><button class="btn btn-primary" data-goto="respirar">🌬️ Respirar</button><button class="btn btn-secondary" data-goto="anclaje">🌿 Anclaje</button></div>` },
  r_helper: { title: "Gracias por estar al lado de alguien", body: "Te dejamos una guía práctica con qué hacer, qué decir y qué evitar.", extra: `<a class="btn btn-primary" href="#acompanar">🤝 Ir a la guía para acompañar</a>` },
  r_explore: { title: "Qué bueno que te tomes un momento", body: "Puedes explorar las herramientas de autocuidado cuando quieras, incluso para practicarlas con calma.", extra: `<a class="btn btn-primary" href="#para-mi">💗 Ver herramientas</a>` }
};
let triageStep = 1;
function renderTriage(key) {
  const n = triageTree[key];
  if (n.q) {
    triage.innerHTML = `
      <p class="step-count">Pregunta ${key.slice(1)} de 4</p>
      <p class="q">${esc(n.q)}</p>
      <div class="answers">
        <button class="btn btn-primary" data-ans="yes">Sí</button>
        <button class="btn btn-secondary" data-ans="no">No</button>
      </div>`;
    $$("[data-ans]", triage).forEach(b => b.addEventListener("click", () => renderTriage(n[b.dataset.ans])));
  } else {
    triage.innerHTML = `
      <div class="result ${n.urgent ? "urgent" : ""}">
        <h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>
      </div>
      ${n.extra || ""}
      <p><button class="btn btn-link" id="triage-reset">↺ Volver a empezar</button></p>`;
    $("#triage-reset").addEventListener("click", () => renderTriage("q1"));
    $$("[data-goto]", triage).forEach(b => b.addEventListener("click", () => gotoTab(b.dataset.goto, true)));
  }
}
renderTriage("q1");

/* ============ Pestañas ============ */
const tabs = $$('[role="tab"]');
function selectTab(tab, focus = false) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const p = $("#" + t.getAttribute("aria-controls"));
    p.hidden = !on;
    if (on) { p.classList.remove("pulse-in"); void p.offsetWidth; p.classList.add("pulse-in"); }
  });
  if (focus) tab.focus();
}
function gotoTab(name, scroll) {
  const tab = $("#tab-" + name);
  if (!tab) return;
  selectTab(tab);
  if (scroll) $("#para-mi").scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") selectTab(tabs[(i + 1) % tabs.length], true);
    if (e.key === "ArrowLeft") selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
  });
});

/* ============ Estado de ánimo -> sugerencia ============ */
const moods = {
  panico: { msg: "Lo que sientes es intenso, pero el cuerpo puede aprender a bajar la alarma. Empieza por respirar despacio y luego prueba el anclaje.", tab: "respirar", label: "🌬️ Ir a respirar" },
  duelo: { msg: "La tristeza y el duelo merecen tiempo y compañía. Puedes leer una frase de contención y, si lo necesitas, hablar con alguien de confianza o llamar al 192, opción 4.", tab: "frases", label: "🌸 Leer una frase" },
  rabia: { msg: "La rabia también es una señal. Antes de actuar, suelta la tensión del cuerpo y date unos minutos de pausa.", tab: "cuerpo", label: "🧘 Soltar el cuerpo" },
  vacio: { msg: "Cuando todo se siente vacío o pesado, lo pequeño cuenta: ancla tu atención en el presente y luego escribe a alguien cercano.", tab: "anclaje", label: "🌿 Hacer el anclaje" },
  solo: { msg: "Sentir soledad duele. Prepara tu plan con personas de confianza y considera avisarle hoy a alguien cómo te sientes.", tab: "plan", label: "🛡️ Abrir mi plan" }
};
const moodBtns = $$(".mood-btn"), moodResult = $("#mood-result");
moodBtns.forEach(b => b.addEventListener("click", () => {
  moodBtns.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  const m = moods[b.dataset.mood];
  moodResult.hidden = false;
  moodResult.innerHTML = `<p>${esc(m.msg)}</p><button class="btn btn-primary" id="mood-go">${esc(m.label)}</button>`;
  $("#mood-go").addEventListener("click", () => { gotoTab(m.tab); $(".tabs").scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "center" }); });
}));

/* ============ Respiración guiada ============ */
const circle = $("#breath-circle"), word = $("#breath-word"), btext = $("#breath-text");
const bcount = $("#breath-count"), bstart = $("#breath-start");
let pattern = "446", breathing = false, breathTimer = null, cycles = 0;
const PATTERNS = {
  "446": [["inhale", "Inhala", "Inhala suavemente por la nariz…", 4000], ["hold", "Sostén", "Sostén el aire con calma…", 4000], ["exhale", "Exhala", "Suelta el aire despacio por la boca…", 6000]],
  "46": [["inhale", "Inhala", "Inhala suavemente por la nariz…", 4000], ["exhale", "Exhala", "Suelta el aire despacio por la boca…", 6000]]
};
$$(".chip[data-pattern]").forEach(c => c.addEventListener("click", () => {
  pattern = c.dataset.pattern;
  $$(".chip[data-pattern]").forEach(x => { x.classList.toggle("active", x === c); x.setAttribute("aria-pressed", String(x === c)); });
  if (breathing) stopBreathing(false);
}));
function runBreath(i = 0) {
  if (!breathing) return;
  const seq = PATTERNS[pattern], [cls, w, t, ms] = seq[i % seq.length];
  circle.className = "breath-circle " + cls;
  word.textContent = w; btext.textContent = t;
  if (i % seq.length === seq.length - 1) {
    breathTimer = setTimeout(() => {
      cycles++; bcount.textContent = cycles;
      if (cycles === 5) { burstFrom(circle); btext.textContent = "Muy bien. Notaste tu respiración. ¿Cómo está tu cuerpo ahora?"; }
      runBreath(i + 1);
    }, ms);
  } else breathTimer = setTimeout(() => runBreath(i + 1), ms);
}
function stopBreathing(msg = true) {
  breathing = false; clearTimeout(breathTimer);
  circle.className = "breath-circle"; word.textContent = "Listo";
  bstart.textContent = "▶ Iniciar";
  if (msg) btext.textContent = "Puedes volver cuando lo necesites.";
}
bstart.addEventListener("click", () => {
  if (breathing) { stopBreathing(); return; }
  breathing = true; cycles = 0; bcount.textContent = 0;
  bstart.textContent = "■ Detener";
  runBreath(0);
});
tabs.forEach(t => t.addEventListener("click", () => { if (breathing && t.id !== "tab-respirar") stopBreathing(); }));

/* ============ Anclaje 5-4-3-2-1 ============ */
const groundingSteps = [
  { n: 5, icon: "👀", title: "5 cosas que puedes VER", hint: "Mira a tu alrededor: un color, una luz, un objeto, algo pequeño." },
  { n: 4, icon: "✋", title: "4 cosas que puedes TOCAR", hint: "La ropa, la silla, el suelo bajo tus pies, tus propias manos." },
  { n: 3, icon: "👂", title: "3 cosas que puedes ESCUCHAR", hint: "Lo más cercano, lo lejano, tu propia respiración." },
  { n: 2, icon: "👃", title: "2 cosas que puedes OLER", hint: "Si no percibes nada, recuerda un olor que te dé calma." },
  { n: 1, icon: "👅", title: "1 cosa que puedes SABOREAR", hint: "Un sorbo de agua, o el sabor que tengas en la boca." }
];
function stepper(root, steps, opts) {
  let i = 0, count = 0, timer = null;
  function clear() { clearInterval(timer); }
  function render() {
    clear();
    if (i >= steps.length) {
      root.innerHTML = `<div class="stepper"><div class="step-card"><div class="big">🌷</div><h4>${esc(opts.doneTitle)}</h4><p>${esc(opts.doneText)}</p></div><button class="btn btn-primary" id="st-restart">↺ Repetir</button></div>`;
      $("#st-restart", root).addEventListener("click", () => { i = 0; count = 0; render(); });
      burstFrom($(".big", root));
      return;
    }
    const s = steps[i];
    const total = opts.counter ? s.n : 0;
    root.innerHTML = `
      <div class="stepper">
        <p class="small">Paso ${i + 1} de ${steps.length}</p>
        <div class="step-card">
          <div class="big">${s.icon}</div>
          <h4>${esc(s.title)}</h4>
          <p>${esc(s.hint)}</p>
          ${opts.counter ? `<div class="dots" aria-hidden="true">${Array.from({ length: total }, () => '<span class="dot"></span>').join("")}</div>
          <button class="btn btn-secondary" id="st-plus" aria-label="Encontré una">+ Encontré una</button>
          <span class="counter" id="st-count" aria-live="polite">0 de ${total}</span>` : `
          <div class="progress" aria-hidden="true"><div id="st-bar"></div></div>
          <p class="counter" id="st-time" aria-live="polite"></p>`}
        </div>
        <div class="controls">
          <button class="btn btn-link" id="st-prev" ${i === 0 ? "disabled" : ""}>← Anterior</button>
          <button class="btn btn-primary" id="st-next">${i === steps.length - 1 ? "Terminar" : "Siguiente →"}</button>
        </div>
      </div>`;
    $("#st-prev", root).addEventListener("click", () => { i--; count = 0; render(); });
    $("#st-next", root).addEventListener("click", () => { i++; count = 0; render(); });
    if (opts.counter) {
      count = 0;
      $("#st-plus", root).addEventListener("click", () => {
        if (count < total) { $$(".dot", root)[count].classList.add("on"); count++; $("#st-count", root).textContent = `${count} de ${total}`; }
        if (count === total) burstFrom($("#st-plus", root));
      });
    } else {
      let t = s.secs; const bar = $("#st-bar", root), label = $("#st-time", root);
      label.textContent = `${t} s`;
      timer = setInterval(() => {
        t--; bar.style.width = ((s.secs - t) / s.secs * 100) + "%";
        label.textContent = t > 0 ? `${t} s` : "¡Listo! Pasa al siguiente cuando quieras.";
        if (t <= 0) clear();
      }, 1000);
    }
  }
  render();
  return { stop: clear };
}
stepper($("#grounding"), groundingSteps, { counter: true, doneTitle: "Bien hecho, estás aquí", doneText: "Volviste al presente usando tus sentidos. Si todavía te sientes muy alterada o alterado, repítelo o llama al 192, opción 4." });

/* ============ Relajación muscular ============ */
const relaxSteps = [
  { icon: "✊", title: "Manos y brazos", hint: "Cierra los puños con suavidad unos 5 segundos y suéltalos. Nota la diferencia.", secs: 10 },
  { icon: "🤷", title: "Hombros", hint: "Súbelos hacia las orejas, sostén 5 segundos y déjalos caer despacio.", secs: 10 },
  { icon: "😌", title: "Cara y mandíbula", hint: "Frunce suavemente la frente y los ojos; luego suelta y deja la mandíbula floja.", secs: 10 },
  { icon: "🫁", title: "Pecho y abdomen", hint: "Inhala profundo, sostén 3 segundos y suelta el aire con un suspiro largo.", secs: 10 },
  { icon: "🦶", title: "Piernas y pies", hint: "Presiona los pies contra el suelo unos 5 segundos y suelta. Siente su peso.", secs: 10 }
];
let relaxCtl = stepper($("#relax"), relaxSteps, { counter: false, doneTitle: "Tu cuerpo te lo agradece", doneText: "Quédate unos segundos notando cómo se siente ahora. Puedes repetirlo cuando lo necesites." });
tabs.forEach(t => t.addEventListener("click", () => { if (t.id !== "tab-cuerpo") relaxCtl.stop(); }));

/* ============ Frases de contención ============ */
const phrases = [
  "Lo que sientes es válido, aunque sea muy difícil.",
  "No tienes que resolver todo hoy. Solo este momento.",
  "Esta sensación es intensa, pero no es permanente.",
  "Pedir ayuda no es debilidad: es cuidarte.",
  "Estás haciendo lo mejor que puedes con lo que tienes ahora.",
  "Respira. Un paso pequeño también es un paso.",
  "No mereces atravesar esto en soledad.",
  "Puedes parar, descansar y volver a empezar.",
  "Tu dolor importa, y tú también.",
  "Ya has sobrevivido a días difíciles. Aquí sigues."
];
let lastPhrase = -1;
$("#phrase-card").addEventListener("click", e => {
  let n; do { n = Math.floor(Math.random() * phrases.length); } while (n === lastPhrase);
  lastPhrase = n;
  $("#phrase-text").textContent = phrases[n];
  burstFrom(e.currentTarget);
  if (reading) speak(phrases[n]);
});

/* ============ Plan de seguridad ============ */
const planForm = $("#plan-form"), planMsg = $("#plan-msg");
const saved = store.get("plan", null);
if (saved) Object.entries(saved).forEach(([k, v]) => { if (planForm.elements[k]) planForm.elements[k].value = v; });
planForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(planForm).entries());
  store.set("plan", data);
  planMsg.textContent = "✔ Guardado solo en este dispositivo.";
  burstFrom($("button[type=submit]", planForm));
});
$("#plan-clear").addEventListener("click", () => {
  store.del("plan"); planForm.reset();
  planMsg.textContent = "Tu plan fue borrado de este dispositivo.";
});

/* ============ Impresión / PDF ============ */
function printNode(node) {
  node.classList.add("print-target");
  document.body.classList.add("printing");
  const done = () => {
    document.body.classList.remove("printing");
    node.classList.remove("print-target");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}
$("#helper-print").addEventListener("click", () => {
  $$("#acompanar details").forEach(d => d.open = true);
  printNode($("#acompanar"));
});
$("#plan-print").addEventListener("click", () => {
  const d = Object.fromEntries(new FormData(planForm).entries());
  const rows = [
    ["Señales de que me estoy sintiendo peor", d.senales], ["Cosas que me ayudan a calmarme", d.calma],
    ["Personas de confianza", d.personas], ["Lugar donde me siento segura o seguro", d.lugar],
    ["Razones para cuidarme", d.razones], ["Cómo dejaré mi entorno más seguro", d.entorno]
  ];
  const box = document.createElement("section");
  box.className = "section";
  box.innerHTML = `<div class="container"><h2>Mi plan de seguridad · Vínculos</h2>
    ${rows.map(([t, v]) => `<h3>${esc(t)}</h3><p>${esc(v || "—").replace(/\n/g, "<br>")}</p>`).join("")}
    <p><strong>Emergencias:</strong> 123 · <strong>Salud mental:</strong> 192, opción 4 · <strong>Escucha:</strong> 106 (Bogotá, Medellín, Cali)</p></div>`;
  box.style.display = "none";
  document.body.appendChild(box);
  box.style.display = "block";
  printNode(box);
  setTimeout(() => box.remove(), 1500);
});

/* ============ Guía para acompañar ============ */
const steps = [
  "<strong>Mantén la calma y acércate.</strong> Tu presencia tranquila ya ayuda. Habla en voz baja y sin prisa.",
  "<strong>Pregunta con claridad y sin juicio.</strong> Por ejemplo: «¿Estás pensando en hacerte daño o en quitarte la vida?».",
  "<strong>Escucha.</strong> Deja que cuente a su ritmo, sin interrumpir ni minimizar lo que siente.",
  "<strong>Reduce los riesgos.</strong> Con calma, aleja objetos peligrosos o medicamentos y evita que se quede sola o solo.",
  "<strong>Conecta con ayuda.</strong> Llama al 123 si hay peligro inmediato, o a la línea 192, opción 4, para orientación.",
  "<strong>Cuídate también.</strong> Acompañar cansa: apóyate en otra persona y descansa cuando puedas."
];
const checklist = $("#helper-checklist");
const doneStore = store.get("helperChecks", []);
steps.forEach((s, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="checkbox" ${doneStore.includes(i) ? "checked" : ""}><span>${s}</span></label>`;
  checklist.appendChild(li);
});
function updateProgress() {
  const checks = $$("input", checklist), n = checks.filter(c => c.checked).length;
  $("#helper-progress").style.width = (n / steps.length * 100) + "%";
  $("#helper-progress-text").textContent = `${n} de ${steps.length} pasos`;
  store.set("helperChecks", checks.map((c, i) => c.checked ? i : -1).filter(i => i >= 0));
  return n;
}
checklist.addEventListener("change", e => {
  if (updateProgress() === steps.length) burstFrom(e.target);
});
updateProgress();

const cards = [
  { front: "Escucha sin apuro", back: "«Estoy aquí. Cuéntame lo que quieras, te escucho.»", avoid: false },
  { front: "Valida lo que siente", back: "«Tiene sentido que te sientas así. Gracias por contármelo.»", avoid: false },
  { front: "Evita minimizar", back: "Mejor no decir «no es para tanto» ni «échale ganas». Hacen sentir que no se le comprende.", avoid: true },
  { front: "Evita juzgar o prometer secreto", back: "No culpes ni prometas guardar un secreto si hay riesgo para su vida: la seguridad va primero.", avoid: true }
];
$("#flip-grid").innerHTML = cards.map(c => `
  <button class="flip" aria-pressed="false" aria-label="Tarjeta: ${esc(c.front)}. Toca para ver más.">
    <div class="flip-inner">
      <div class="flip-face flip-front">${c.avoid ? "🚫" : "💬"} ${esc(c.front)}</div>
      <div class="flip-face flip-back ${c.avoid ? "avoid" : ""}">${esc(c.back)}</div>
    </div>
  </button>`).join("");
$$(".flip").forEach(f => f.addEventListener("click", () => f.setAttribute("aria-pressed", String(f.getAttribute("aria-pressed") !== "true"))));

const sayList = [
  "Gracias por confiar en mí para contármelo.",
  "No estás sola o solo; voy a estar contigo.",
  "¿Estás pensando en quitarte la vida?",
  "Quiero ayudarte a conseguir apoyo. ¿Llamamos juntas o juntos a la línea 192?",
  "No sé exactamente qué decir, pero me importas y aquí estoy."
];
$("#say-list").innerHTML = sayList.map((t, i) => `<div class="say"><span>«${esc(t)}»</span><button data-i="${i}" aria-label="Copiar frase">Copiar</button></div>`).join("");
$$("#say-list button").forEach(b => b.addEventListener("click", async () => {
  const t = sayList[b.dataset.i];
  try { await navigator.clipboard.writeText(t); b.textContent = "¡Copiada!"; } catch { b.textContent = "Selecciónala"; }
  setTimeout(() => b.textContent = "Copiar", 1500);
}));

/* ============ Líneas de ayuda de Colombia ============ */
const lines = [
  { num: "123", tel: "123", name: "Línea de emergencias", desc: "Emergencias y urgencias, incluidas las de salud mental. Úsala si hay peligro inmediato.", main: true },
  { num: "192", tel: "192", name: "Línea 192, opción 4", desc: "Orientación en salud mental del Ministerio de Salud, a nivel nacional. Marca 192 y elige la opción 4.", main: true },
  { num: "106", tel: "106", name: "Línea 106 · Escucha y apoyo emocional", desc: "Apoyo psicológico en momentos de crisis, disponible en Bogotá, Medellín y Cali. Confirma el servicio en tu ciudad." },
  { num: "141", tel: "141", name: "Línea 141 · ICBF", desc: "Protección de niñas, niños y adolescentes ante violencia o vulneración de derechos." },
  { num: "155", tel: "155", name: "Línea 155", desc: "Orientación a mujeres víctimas de violencia." }
];
$("#line-grid").innerHTML = lines.map(l => `
  <article class="line-card ${l.main ? "main" : ""}">
    <span class="num">${esc(l.num)}</span>
    <h3>${esc(l.name)}</h3>
    <p class="small">${esc(l.desc)}</p>
    <div class="actions">
      <a class="btn btn-primary" href="tel:${esc(l.tel)}">📞 Llamar</a>
      <button class="btn btn-secondary" data-copy="${esc(l.num)}">Copiar número</button>
    </div>
  </article>`).join("");
$$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "¡Copiado!"; } catch { b.textContent = b.dataset.copy; }
  setTimeout(() => b.textContent = "Copiar número", 1500);
}));
