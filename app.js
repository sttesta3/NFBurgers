/* ─────────────────────────────────────────────────
   NF Burgers — app.js
   ───────────────────────────────────────────────── */

/* ─── MODO APERTURA ──────────────────────────────
   Cambiá a false para volver al menú normal.
   ─────────────────────────────────────────────── */

const INCLUYE_PAPAS = " Incluye papas fritas.";
const PRECIO_BEBIDA_CHICA = 2000;
const PRECIO_BEBIDA_GRANDE = 5000;

const sizeLabels = { simple: "Simple", doble: "Doble", triple: "Triple" };

/* ─── MENÚ ────────────────────────────────────────
   Categorías con acordeón. La categoría "Hamburguesas"
   usa type: "sizes": cada item tiene `sizes` (simple/
   doble/triple) en vez de `price`. Al tocarla se abre
   el panel para elegir el tamaño.
   ─────────────────────────────────────────────── */
const categories = [
  {
    name: "Hamburguesas",
    type: "sizes",
    items: [
      {
        name: "CheeseBurger",
        description: "Pan de papa, carne smasheada, cheddar." + INCLUYE_PAPAS,
        sizes: { simple: 12000, doble: 15000, triple: 18000 }
      },
      {
        name: "Cuartel",
        description: "Carne smasheada, cheddar, cebolla picada, ketchup, mostaza." + INCLUYE_PAPAS,
        sizes: { simple: 12500, doble: 15500, triple: null }
      },
      {
        name: "CheeseBacon",
        description: "Carne smasheada, cheddar, bacon, ketchup." + INCLUYE_PAPAS,
        sizes: { simple: 13000, doble: 16000, triple: 19000 }
      },
      {
        name: "Pepinium",
        description: "Carne smasheada, cheddar, pepinillos, lechuga, salsa mil islas." + INCLUYE_PAPAS,
        sizes: { simple: 13000, doble: 16000, triple: null }
      },
      {
        name: "Americana",
        description: "Carne smasheada, cheddar, lechuga, tomate, salsa NF." + INCLUYE_PAPAS,
        sizes: { simple: 13000, doble: 16000, triple: null }
      },
      {
        name: "Bacon Honey",
        description: "Carne smasheada, cheddar, bacon, miel, salsa BBQ." + INCLUYE_PAPAS,
        sizes: { simple: 14000, doble: 17000, triple: null }
      },
      {
        name: "Oklahoma",
        description: "Carne smasheada con cebolla, cheddar, bacon, salsa alioli." + INCLUYE_PAPAS,
        sizes: { simple: 16000, doble: 18000, triple: null }
      },
      {
        name: "Crispy Onion",
        description: "Carne smasheada, bacon, cebolla crispy, salsa BBQ." + INCLUYE_PAPAS,
        sizes: { simple: 16000, doble: 18000, triple: null }
      },
    ]
  },
  {
    name: "Bebidas chicas",
    items: [
      { name: "Coca-Cola Original 600ml", description: "600ml", price: PRECIO_BEBIDA_CHICA },
      { name: "Coca-Cola Cero 600ml", description: "600ml", price: PRECIO_BEBIDA_CHICA },
      { name: "Sprite Original 600ml", description: "600ml", price: PRECIO_BEBIDA_CHICA },
      { name: "Agua 500ml", description: "500ml", price: PRECIO_BEBIDA_CHICA },
    ]
  },
  {
    name: "Bebidas grandes",
    items: [
      { name: "Coca-Cola Original 2.25lts", description: "2.25lts", price: PRECIO_BEBIDA_GRANDE },
      { name: "Coca-Cola Cero 2.25lts", description: "2.25lts", price: PRECIO_BEBIDA_GRANDE },
      { name: "Sprite Original 2.25lts", description: "2.25lts", price: PRECIO_BEBIDA_GRANDE },
    ]
  },
  {
    name: "Adicionales",
    type: "notes",
    items: [
      { name: "Papas fritas", description: "Papas fritas", price: 2000 },
    ]
  },
];

/* ─── HORARIOS ──────────────────────────────────
   day: 0=Domingo … 6=Sábado (igual que Date.getDay()).
   close menor o igual a open implica que cierra al
   día siguiente (ej: Viernes 20:00 a 01:00hs).
   ─────────────────────────────────────────────── */
const schedule = [
  { day: 1, label: "Lunes",     open: null,    close: null },
  { day: 2, label: "Martes",    open: null,    close: null },
  { day: 3, label: "Miércoles", open: null,    close: null },
  { day: 4, label: "Jueves",    open: "20:00", close: "00:00" },
  { day: 5, label: "Viernes",   open: "20:00", close: "01:00" },
  { day: 6, label: "Sábado",    open: "20:00", close: "01:00" },
  { day: 0, label: "Domingo",   open: "20:00", close: "00:00" },
];

/* ─── DATOS DINÁMICOS (Google Sheets) ────────────
   Precios y horarios se actualizan desde dos pestañas
   de una misma Sheet, publicada como CSV vía el
   endpoint gviz (soporta CORS nativo, sin proxies).

   Seguridad:
   - Nunca se usa eval() ni se interpreta el CSV como código.
   - El menú (nombres/descripciones) sigue viviendo en este
     archivo; de la sheet solo se toman precios y horarios,
     matcheados por nombre / número de día.
   - Todo dato externo pasa por una whitelist estricta de
     formato (entero positivo / HH:MM) antes de usarse. Si
     no matchea, se descarta y se conserva el valor anterior
     (fallback seguro) — nunca se inserta texto libre de la
     sheet en innerHTML.
   - Fetch con timeout, límite de tamaño de respuesta, y
     caché local (localStorage) por si falla la red.
   ─────────────────────────────────────────────── */
const SHEET_ID = "1Sc_U_oIUehooxD2bbFeIwvGkRpneYt0E0aRJzG5e4IA";
/* Endpoint principal: el link real de "Publicar en la web"
   (Archivo > Compartir > Publicar en la web), formato
   /d/e/<token-de-publicación>/pub — es público sin login y
   responde con headers CORS. Cada pestaña tiene su propio gid
   dentro del mismo token de publicación. */
const PUB_TOKEN = "2PACX-1vTeaDZNl2ccLpP1zwZtfyTQjtI79NGuEnnymzD8Ua_F8kP06WFnil8dXwhy6Cl5Iszme-y1ZNU7w87F";
function pubCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/e/${PUB_TOKEN}/pub?gid=${gid}&single=true&output=csv`;
}
/* Endpoint de respaldo: gviz respeta permisos de "compartir"
   (no de "publicar"), así que solo funciona si la sheet está
   además compartida como "Cualquiera con el enlace". Si no,
   redirige a login y fetchCSV lo descarta igual que cualquier
   otro error de red. */
function gvizCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
}
const PRECIOS_CSV_URLS   = [pubCsvUrl(0), gvizCsvUrl(0)];
const HORARIOS_CSV_URLS  = [pubCsvUrl(1934947084), gvizCsvUrl(1934947084)];

const CACHE_KEY_PRECIOS  = "nf_precios_cache_v1";
const CACHE_KEY_HORARIOS = "nf_horarios_cache_v1";
const CSV_MAX_BYTES      = 200000; // límite defensivo
const FETCH_TIMEOUT_MS   = 6000;

function saveCache(key, rows) {
  try { localStorage.setItem(key, JSON.stringify({ rows, ts: Date.now() })); } catch (e) { /* localStorage puede fallar; no es crítico */ }
}

function loadCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.rows) ? parsed.rows : null;
  } catch (e) { return null; }
}

/* Parser CSV mínimo (comillas, comas, saltos de línea dentro
   de campos citados). Solo separa texto, no ejecuta nada. */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = "";
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = "";
    } else if (c === '\r') {
      // lo maneja el \n siguiente
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0].trim() === ""));
}

/* Normaliza encabezados: saca tildes, pasa a minúscula, y
   convierte espacios en guion bajo — así "Día", "Precio Simple"
   matchean igual que "dia", "precio_simple". */
function normalizeHeader(h) {
  return h
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
}

async function fetchOne(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store", redirect: "follow" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    // Nota: /pub redirige (307) legítimamente a *.googleusercontent.com
    // con el CSV real, así que no se puede validar por dominio final.
    // En cambio, se valida por content-type y por la forma del cuerpo
    // (si Google devuelve una página de login, viene como HTML).
    const contentType = res.headers.get("content-type") || "";
    if (contentType && !/text\/csv|text\/plain|application\/binary|application\/octet-stream/i.test(contentType)) {
      throw new Error("Content-Type inesperado: " + contentType);
    }
    let text = await res.text();
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // BOM UTF-8
    if (text.length > CSV_MAX_BYTES) throw new Error("Respuesta demasiado grande, se descarta por seguridad");
    // Si Google devuelve la página de login HTML en vez de CSV, no debe colarse como dato.
    if (/^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) throw new Error("Respuesta no es CSV (¿requiere login?)");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCSV(urls, cacheKey) {
  for (const url of urls) {
    try {
      const text = await fetchOne(url);
      const rows = parseCSV(text); // arrays crudos; cada caller decide cómo interpretarlos
      saveCache(cacheKey, rows);
      return rows;
    } catch (err) {
      console.warn("[NF] Falló", url, "->", err.message);
    }
  }
  console.warn("[NF] Ninguna URL funcionó, usando caché/fallback local para", cacheKey);
  return loadCache(cacheKey); // null si tampoco hay caché -> queda el hardcode del código
}

/* Entero positivo razonable. Cualquier otra cosa (texto,
   fórmulas, HTML) se descarta silenciosamente. */
function toValidPrice(str) {
  if (str === undefined || str === "") return null;
  const cleaned = String(str).replace(/[^\d]/g, "");
  if (cleaned === "") return null;
  const n = parseInt(cleaned, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 1000000) return null;
  return n;
}

/* Formato H:MM u HH:MM (0-23 : 00-59). La sheet real usa horas
   sin cero a la izquierda para la madrugada (ej. "0:00", "1:00"). */
function isValidTime(str) {
  return /^([0-9]|1\d|2[0-3]):[0-5]\d$/.test(str);
}

function normalizeName(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

/* La sheet de precios tiene DOS tablas apiladas:
   1) Fila de encabezados con nombres de constantes
      (PRECIO_BEBIDA_CHICA, PRECIO_BEBIDA_GRANDE, "Papas fritas")
      + una fila de valores debajo.
   2) Más abajo, una tabla de hamburguesas con encabezado
      NOMBRE,DESCRIPCION,SIMPLE,DOBLE,TRIPLE.
   Se buscan por contenido, no por posición fija, para tolerar
   alguna fila en blanco de más o de menos. */
function applyPricesFromSheet(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length < 2) return;

  // ── Tabla 1: constantes (bebidas / papas) ──
  const constHeaders = (rawRows[0] || []).map(h => (h || "").trim());
  const constValues  = (rawRows[1] || []);
  const constants = {}; // key normalizada (mayúsculas/trim) -> valor crudo
  constHeaders.forEach((h, i) => {
    if (h) constants[h.toUpperCase()] = (constValues[i] || "").trim();
  });

  const precioBebidaChica  = toValidPrice(constants["PRECIO_BEBIDA_CHICA"]);
  const precioBebidaGrande = toValidPrice(constants["PRECIO_BEBIDA_GRANDE"]);
  const precioPapas        = toValidPrice(constants["PAPAS FRITAS"]);

  let matched = 0;
  categories.forEach(cat => {
    if (cat.name === "Bebidas chicas" && precioBebidaChica !== null) {
      cat.items.forEach(item => { item.price = precioBebidaChica; matched++; });
    }
    if (cat.name === "Bebidas grandes" && precioBebidaGrande !== null) {
      cat.items.forEach(item => { item.price = precioBebidaGrande; matched++; });
    }
    if (cat.name === "Adicionales" && precioPapas !== null) {
      cat.items.forEach(item => {
        if (normalizeName(item.name) === "papas fritas") { item.price = precioPapas; matched++; }
      });
    }
  });

  // ── Tabla 2: hamburguesas (busca la fila que empieza con "NOMBRE") ──
  const burgerHeaderIdx = rawRows.findIndex((r, i) => i >= 2 && normalizeHeader(r[0] || "") === "nombre");
  const burgersByName = new Map();
  if (burgerHeaderIdx !== -1) {
    const headers = rawRows[burgerHeaderIdx].map(normalizeHeader);
    for (let i = burgerHeaderIdx + 1; i < rawRows.length; i++) {
      const r = rawRows[i];
      if (!r || !r.some(c => c && c.trim() !== "")) continue; // fila vacía
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
      const nombre = normalizeName(obj.nombre || "");
      if (nombre) burgersByName.set(nombre, obj);
    }
  }

  const unmatchedBurgers = [];
  categories.forEach(cat => {
    if (cat.type !== "sizes") return;
    cat.items.forEach(item => {
      const row = burgersByName.get(normalizeName(item.name));
      if (!row) { unmatchedBurgers.push(item.name); return; }
      matched++;
      // Acepta tanto "simple/doble/triple" como "precio_simple/..." como nombre de columna.
      const rawSimple = row.simple !== undefined ? row.simple : row.precio_simple;
      const rawDoble  = row.doble  !== undefined ? row.doble  : row.precio_doble;
      const rawTriple = row.triple !== undefined ? row.triple : row.precio_triple;
      const simple = toValidPrice(rawSimple);
      const doble  = toValidPrice(rawDoble);
      if (simple !== null) item.sizes.simple = simple;
      if (doble !== null) item.sizes.doble = doble;
      if (rawTriple !== undefined) {
        item.sizes.triple = toValidPrice(rawTriple); // vacío/inválido -> no disponible
      }
    });
  });

  console.log(`[NF] Precios aplicados: bebida chica=${precioBebidaChica}, bebida grande=${precioBebidaGrande}, papas=${precioPapas}, ${matched} campos actualizados en total.`);
  if (unmatchedBurgers.length) console.warn("[NF] Hamburguesas sin match en la sheet:", unmatchedBurgers);
}

/* Actualiza schedule[].open/close EN EL LUGAR. day/label nunca
   se tocan. Columnas esperadas: dia (0-6), apertura, cierre
   en HH:MM (ambas vacías = cerrado ese día). */
/* Actualiza schedule[].open/close EN EL LUGAR. day/label del
   código nunca se pisan con texto de la sheet (solo se usa
   "day" para encontrar la fila correcta); solo se actualizan
   las horas, ya validadas. Columnas esperadas: day, label,
   open, close (label es informativo, no se usa para matchear). */
function applyScheduleFromSheet(rawRows) {
  if (!Array.isArray(rawRows) || !rawRows.length) return;
  const rows = rowsToObjects(rawRows);
  let applied = 0;
  rows.forEach(r => {
    const dia = parseInt(r.day, 10);
    if (!Number.isInteger(dia) || dia < 0 || dia > 6) return;
    const entry = schedule.find(s => s.day === dia);
    if (!entry) return;

    const apertura = (r.open || "").trim();
    const cierre   = (r.close || "").trim();

    if (apertura === "" && cierre === "") {
      entry.open = null;
      entry.close = null;
      applied++;
    } else if (isValidTime(apertura) && isValidTime(cierre)) {
      entry.open = apertura;
      entry.close = cierre;
      applied++;
    }
    // formato inválido -> se conserva el horario anterior
  });
  console.log(`[NF] Horarios: ${applied} de ${rows.length} filas aplicadas.`);
}

async function loadDynamicData() {
  const [priceRows, scheduleRows] = await Promise.all([
    fetchCSV(PRECIOS_CSV_URLS, CACHE_KEY_PRECIOS),
    fetchCSV(HORARIOS_CSV_URLS, CACHE_KEY_HORARIOS),
  ]);
  console.log("[NF] Filas de precios parseadas (texto plano):", JSON.stringify(priceRows));
  console.log("[NF] Filas de horarios parseadas (texto plano):", JSON.stringify(scheduleRows));

  if (priceRows) applyPricesFromSheet(priceRows);
  if (scheduleRows) applyScheduleFromSheet(scheduleRows);
  console.log("[NF] categories luego de aplicar (texto plano):", JSON.stringify(categories));
  console.log("[NF] schedule luego de aplicar (texto plano):", JSON.stringify(schedule));

  if (priceRows || scheduleRows) {
    menuEl.innerHTML = "";
    renderMenu();
    updateStatusBadge();
    if (scheduleSheet.classList.contains("open")) renderSchedule();
  }
}

function parseHM(str) {
  const [h, m] = str.split(":").map(Number);
  return { h, m };
}

function formatCloseLabel(open, close) {
  const o = parseHM(open);
  const c = parseHM(close);
  return `${open} a ${close}hs`;
}

function isOpenNow(now = new Date()) {
  for (const offset of [0, -1]) {
    const base = new Date(now);
    base.setDate(base.getDate() + offset);
    const dayIndex = base.getDay();
    const entry = schedule.find(s => s.day === dayIndex);
    if (!entry || !entry.open) continue;

    const o = parseHM(entry.open);
    const c = parseHM(entry.close);

    const start = new Date(base);
    start.setHours(o.h, o.m, 0, 0);

    const end = new Date(base);
    end.setHours(c.h, c.m, 0, 0);
    if (c.h < o.h || (c.h === o.h && c.m <= o.m)) {
      end.setDate(end.getDate() + 1); // cierra al día siguiente
    }

    if (now >= start && now < end) return true;
  }
  return false;
}

/* ─── TURNOS DE ENTREGA ──────────────────────────
   El usuario elige primero el DÍA (Jue/Vie/Sáb/Dom).
   Los turnos se actualizan según el día elegido.
   Si el día elegido es HOY, los turnos ya pasados
   aparecen grisados y no son seleccionables.
   ─────────────────────────────────────────────── */
const DAY_SLOTS = {
  4: ["20-21","21-22","22-23","23-00"],          // Jueves
  5: ["20-21","21-22","22-23","23-00","00-01"],  // Viernes
  6: ["20-21","21-22","22-23","23-00","00-01"],  // Sábado
  0: ["20-21","21-22","22-23","23-00"],          // Domingo
};

const DAY_NAMES = { 4: "Jueves", 5: "Viernes", 6: "Sábado", 0: "Domingo" };

const SLOT_END_MINS = {
  "20-21": 21 * 60,
  "21-22": 22 * 60,
  "22-23": 23 * 60,
  "23-00": 24 * 60,
  "00-01": 25 * 60,
};

function isSlotPast(label) {
  // Solo grisa si el día elegido es hoy
  const todayDay = new Date().getDay();
  if (selectedDay !== todayDay) return false;

  const h   = new Date().getHours();
  const m   = new Date().getMinutes();
  const adj = h < 2 ? h * 60 + m + 24 * 60 : h * 60 + m;
  return adj >= SLOT_END_MINS[label];
}

function renderSlots() {
  const slots       = DAY_SLOTS[selectedDay] || [];
  const slotSection = document.getElementById("slot-section");

  slotSection.style.display = "";
  selectedSlot = null;

  slotGroup.innerHTML = slots.map(label => {
    const past = isSlotPast(label);
    return `<button type="button"
              class="slot-btn${past ? " past" : ""}"
              data-slot="${label}"
              ${past ? "disabled" : ""}>${label}hs</button>`;
  }).join("");

  slotGroup.querySelectorAll(".slot-btn:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => {
      slotGroup.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSlot = btn.dataset.slot;
      checkoutError.style.display = "none";
    });
  });
}

function updateStatusBadge() {
  const open = isOpenNow();
  const dot  = document.getElementById("status-dot");
  const text = document.getElementById("status-text");

  dot.classList.toggle("open", open);
  dot.classList.toggle("closed", !open);
  text.textContent = open ? "Abierto ahora" : "Cerrado ahora";

  const current = document.getElementById("schedule-current-status");
  if (current) {
    current.textContent = open
      ? "Estamos aceptando pedidos en este momento."
      : "En este momento no estamos aceptando pedidos.";
  }
}

function renderSchedule() {
  const listEl = document.getElementById("schedule-list");
  const todayIndex = new Date().getDay();

  listEl.innerHTML = schedule.map(entry => {
    const isToday = entry.day === todayIndex;
    const isClosed = !entry.open;
    return `
      <div class="schedule-row ${isToday ? "is-today" : ""} ${isClosed ? "is-closed" : ""}">
        <span class="day-name">${entry.label}${isToday ? " · hoy" : ""}</span>
        <span class="day-hours">${isClosed ? "Cerrado" : formatCloseLabel(entry.open, entry.close)}</span>
      </div>
    `;
  }).join("");
}

/* ─── State ──────────────────────────────────────
   cart = [{ name, price, qty }, …]
   ─────────────────────────────────────────────── */
const cart = [];
let activeBurger = null;
let activeNotesItem = null;
let selectedSize = null;
let selectedPayment = null;
let selectedSlot = null;     // turno de entrega elegido, ej "20-21"
let customerName = "";

/* ─── DOM refs ──────────────────────────────────── */
const menuEl         = document.getElementById("menu");
const sizeSheet       = document.getElementById("size-sheet");
const notesSheet      = document.getElementById("notes-sheet");
const scheduleSheet   = document.getElementById("schedule-sheet");
const checkoutSheet   = document.getElementById("checkout-sheet");
const cartModal       = document.getElementById("cart-modal");
const cartItemsEl     = document.getElementById("cart-items");
const cartCountEl     = document.getElementById("cart-count");
const cartTotalEl     = document.getElementById("cart-total");
const overlay         = document.getElementById("overlay");
const addressInput    = document.getElementById("address-input");
const customerNameInput = document.getElementById("customer-name-input");
const checkoutError   = document.getElementById("checkout-error");
const burgerNotesInput = document.getElementById("burger-notes-input");
const itemNotesInput   = document.getElementById("item-notes-input");
const slotGroup        = document.getElementById("slot-group");
const slotHint         = document.getElementById("slot-hint");

/* ─── Helpers ─────────────────────────────────── */
function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR");
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* Cada renglón del carrito se identifica por nombre + aclaración,
   así "CheeseBurger (Simple)" con notas distintas no se mezcla,
   pero la misma combinación suma cantidad en vez de duplicarse. */
function makeCartKey(name, notes) {
  return `${name}__${notes || ""}`;
}

function findInCart(key) {
  return cart.find(i => i.key === key);
}

/* ─── Add to cart ─────────────────────────────── */
function addItem(item) {
  const notes = (item.notes || "").trim();
  const key = makeCartKey(item.name, notes);
  const existing = findInCart(key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, name: item.name, price: item.price, notes, qty: 1 });
  }
  updateCart();
  animateCartIcon();
}

/* ─── Remove one unit (o el ítem entero) ─────────*/
function removeItem(key) {
  const idx = cart.findIndex(i => i.key === key);
  if (idx === -1) return;
  cart[idx].qty--;
  if (cart[idx].qty === 0) cart.splice(idx, 1);
  updateCart();
}

/* ─── Update cart UI ──────────────────────────── */
/* ─── DRINK UPSELL INLINE ────────────────────────
   Botón 🥤 en cada burger sin bebida. Al pulsarlo
   se expande un selector de 4 opciones dentro del
   carrito — sin sheets extra, sin solapamiento.
   Bebida grande (2.25lts) cubre 2 hamburguesas.
   ─────────────────────────────────────────────── */
const ALL_DRINK_NAMES = new Set(
  categories
    .filter(c => c.name.startsWith("Bebidas"))
    .flatMap(c => c.items.map(i => i.name))
);

const LARGE_DRINK_NAMES = new Set(
  (categories.find(c => c.name === "Bebidas grandes")?.items || []).map(i => i.name)
);

const INLINE_DRINKS = [
  { label: "Coca Cola", name: "Coca-Cola Original 600ml", price: PRECIO_BEBIDA_CHICA },
  { label: "Coca Zero", name: "Coca-Cola Cero 600ml",     price: PRECIO_BEBIDA_CHICA },
  { label: "Sprite",    name: "Sprite Original 600ml",    price: PRECIO_BEBIDA_CHICA },
  { label: "Agua",      name: "Agua 500ml",               price: PRECIO_BEBIDA_CHICA },
];

let drinkOpenKey = null;

function isBurger(name) {
  return !ALL_DRINK_NAMES.has(name) && !name.includes("Papas");
}

/* Bebida grande cubre 2 burgers, chica cubre 1 */
function drinkCoverage(name) {
  return LARGE_DRINK_NAMES.has(name) ? 2 : 1;
}

function updateCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  cartCountEl.textContent = totalItems;
  cartCountEl.classList.toggle("hidden", totalItems === 0);
  cartTotalEl.textContent = totalPrice.toLocaleString("es-AR");

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Todavía no agregaste nada.</p>';
    return;
  }

  /* ── Diccionario: cuántas unidades de cada burger necesitan bebida ──
     Las bebidas se asignan a los primeros burgers en orden.
     Ej: 4 burgers, 1 chica + 1 grande (cubre 3) → solo la última necesita.
  ── */
  let coverage = cart
    .filter(i => ALL_DRINK_NAMES.has(i.name))
    .reduce((s, i) => s + i.qty * drinkCoverage(i.name), 0);

  const needsDrink = {}; // key -> unidades sin bebida
  for (const item of cart) {
    if (!isBurger(item.name)) continue;
    const covered   = Math.min(coverage, item.qty);
    coverage       -= covered;
    const uncovered = item.qty - covered;
    if (uncovered > 0) needsDrink[item.key] = uncovered;
  }

  if (drinkOpenKey && !needsDrink[drinkOpenKey]) drinkOpenKey = null;

  cartItemsEl.innerHTML = cart.map(item => {
    const showDrinkBtn = !!needsDrink[item.key];
    const selectorOpen = showDrinkBtn && drinkOpenKey === item.key;

    return `
      <div class="cart-item-wrap${selectorOpen ? " cart-item-wrap--open" : ""}">
        <div class="cart-item">
          <div class="cart-item-qty">${item.qty}</div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price * item.qty)}</p>
            ${item.notes ? `<p class="cart-item-notes">"${escapeHTML(item.notes)}"</p>` : ""}
          </div>
          ${showDrinkBtn ? `
            <button class="cart-item-drink-btn${selectorOpen ? " active" : ""}"
                    data-key="${encodeURIComponent(item.key)}"
                    title="Agregar bebida">🥤</button>` : ""}
          <button class="remove-btn" data-key="${encodeURIComponent(item.key)}">×</button>
        </div>
        ${selectorOpen ? `
          <div class="inline-drink-row">
            ${INLINE_DRINKS.map(d => `
              <button class="inline-drink-btn"
                      data-name="${d.name}"
                      data-price="${d.price}">${d.label}<span>${formatPrice(d.price)}</span></button>
            `).join("")}
          </div>` : ""}
      </div>`;
  }).join("");

  cartItemsEl.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = decodeURIComponent(btn.dataset.key);
      if (drinkOpenKey === key) drinkOpenKey = null;
      removeItem(key);
    });
  });

  cartItemsEl.querySelectorAll(".cart-item-drink-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = decodeURIComponent(btn.dataset.key);
      drinkOpenKey = drinkOpenKey === key ? null : key;
      updateCart();
    });
  });

  cartItemsEl.querySelectorAll(".inline-drink-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addItem({ name: btn.dataset.name, price: parseInt(btn.dataset.price, 10), notes: "" });
      drinkOpenKey = null;
    });
  });
}

/* ─── Cart icon bounce ────────────────────────── */
function animateCartIcon() {
  cartCountEl.classList.remove("pop");
  void cartCountEl.offsetWidth; /* reflow to restart animation */
  cartCountEl.classList.add("pop");
}

/* ─── History helper (botón "atrás" en mobile) ───
   Cualquier panel (tamaño, horarios, checkout, carrito)
   agrega un estado al historial al abrir, y lo consume
   al cerrar, para que el botón/gesto "atrás" cierre el
   panel en vez de salir de la página.
   ─────────────────────────────────────────────── */
let historyPushed = false;

function pushHistoryState() {
  if (!historyPushed) {
    history.pushState({ panelOpen: true }, "");
    historyPushed = true;
  }
}

function popHistoryState(fromPopState) {
  if (historyPushed) {
    historyPushed = false;
    if (!fromPopState) {
      history.back();
    }
  }
}

function anyPanelOpen() {
  return sizeSheet.classList.contains("open") ||
         notesSheet.classList.contains("open") ||
         scheduleSheet.classList.contains("open") ||
         checkoutSheet.classList.contains("open") ||
         cartModal.classList.contains("open");
}

function hideOverlayIfNothingOpen() {
  if (!anyPanelOpen()) overlay.classList.remove("show");
}

/* ─── Size sheet ─────────────────────────────── */
function openSizeSheet(burger) {
  activeBurger = burger;
  selectedSize = null;

  document.getElementById("sheet-burger-name").textContent = activeBurger.name;
  document.getElementById("sheet-burger-desc").textContent = activeBurger.description;

  const optionsEl = document.getElementById("sheet-options");
  optionsEl.innerHTML = Object.entries(activeBurger.sizes)
    .filter(([, price]) => price !== null)
    .map(([key, price]) => `
      <div class="size-option" data-size="${key}">
        <div class="size-name">${sizeLabels[key]}</div>
        <div class="size-price">${formatPrice(price)}</div>
      </div>
    `).join("");

  optionsEl.querySelectorAll(".size-option").forEach(opt => {
    opt.addEventListener("click", () => {
      optionsEl.querySelectorAll(".size-option").forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      selectedSize = opt.dataset.size;
      const btn = document.getElementById("add-with-size");
      btn.disabled = false;
      btn.textContent = `Agregar ${sizeLabels[selectedSize]} — ${formatPrice(activeBurger.sizes[selectedSize])}`;
    });
  });

  const addBtn = document.getElementById("add-with-size");
  addBtn.disabled = true;
  addBtn.textContent = "Elegí un tamaño";

  burgerNotesInput.value = "";

  sizeSheet.classList.add("open");
  overlay.classList.add("show");
  pushHistoryState();
}

function closeSizeSheet(fromPopState = false) {
  sizeSheet.classList.remove("open");
  hideOverlayIfNothingOpen();
  popHistoryState(fromPopState);
}

document.getElementById("add-with-size").addEventListener("click", () => {
  if (!selectedSize) return;
  addItem({
    name: `${activeBurger.name} (${sizeLabels[selectedSize]})`,
    price: activeBurger.sizes[selectedSize],
    notes: burgerNotesInput.value
  });
  closeSizeSheet();
});

/* ─── Notes sheet (para items sin tamaño, ej. Papas fritas) ─── */
function openNotesSheet(item) {
  activeNotesItem = item;
  itemNotesInput.value = "";

  document.getElementById("notes-item-name").textContent = item.name;
  document.getElementById("notes-item-price").textContent = formatPrice(item.price);

  notesSheet.classList.add("open");
  overlay.classList.add("show");
  pushHistoryState();
}

function closeNotesSheet(fromPopState = false) {
  notesSheet.classList.remove("open");
  hideOverlayIfNothingOpen();
  popHistoryState(fromPopState);
}

document.getElementById("add-with-notes").addEventListener("click", () => {
  addItem({
    name: activeNotesItem.name,
    price: activeNotesItem.price,
    notes: itemNotesInput.value
  });
  closeNotesSheet();
});

/* ─── Schedule sheet ──────────────────────────── */
function openSchedule() {
  renderSchedule();
  updateStatusBadge();
  scheduleSheet.classList.add("open");
  overlay.classList.add("show");
  pushHistoryState();
}

function closeSchedule(fromPopState = false) {
  scheduleSheet.classList.remove("open");
  hideOverlayIfNothingOpen();
  popHistoryState(fromPopState);
}

document.getElementById("status-badge").addEventListener("click", openSchedule);
document.getElementById("close-schedule").addEventListener("click", () => closeSchedule());

/* ─── Cart ───────────────────────────────────── */
function openCart() {
  cartModal.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
  pushHistoryState();
}

function closeCart(fromPopState = false) {
  cartModal.classList.remove("open");
  hideOverlayIfNothingOpen();
  document.body.style.overflow = "";
  popHistoryState(fromPopState);
}

document.getElementById("cart-icon").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", () => closeCart());

/* ─── Checkout sheet (pago / entrega / dirección) ─
   Se abre al tocar "Enviar por WhatsApp" en el carrito,
   en vez de mandar el mensaje directo.
   ─────────────────────────────────────────────── */
function openCheckout() {
  cartModal.classList.remove("open");
  document.body.style.overflow = "";

  selectedPayment = null;
  selectedDay     = null;
  selectedSlot    = null;
  customerNameInput.value = "";
  addressInput.value = "";
  checkoutError.style.display = "none";

  document.querySelectorAll("#payment-group .pill").forEach(p => p.classList.remove("selected"));
  document.querySelectorAll("#day-group .pill").forEach(p => p.classList.remove("selected"));
  document.getElementById("slot-section").style.display = "none";
  slotGroup.innerHTML = "";

  checkoutSheet.classList.add("open");
  overlay.classList.add("show");
  // No llamamos a pushHistoryState: el checkout reutiliza el estado
  // del historial que ya empujó el carrito al abrirse.
}

function closeCheckout(fromPopState = false) {
  checkoutSheet.classList.remove("open");
  hideOverlayIfNothingOpen();
  popHistoryState(fromPopState);
}

document.getElementById("send-order").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("No hay productos en el pedido.");
    return;
  }
  openCheckout();
});

document.querySelectorAll("#payment-group .pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#payment-group .pill").forEach(p => p.classList.remove("selected"));
    pill.classList.add("selected");
    selectedPayment = pill.dataset.value;
    checkoutError.style.display = "none";
  });
});

// Selector de día: al elegir día muestra los turnos correctos
document.querySelectorAll("#day-group .pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#day-group .pill").forEach(p => p.classList.remove("selected"));
    pill.classList.add("selected");
    selectedDay  = parseInt(pill.dataset.day, 10);
    selectedSlot = null;
    checkoutError.style.display = "none";
    renderSlots();
  });
});

document.getElementById("confirm-checkout").addEventListener("click", () => {
  if (customerNameInput.value.trim() === "") {
    checkoutError.textContent = "Ingresá tu nombre.";
    checkoutError.style.display = "block";
    customerNameInput.focus();
    return;
  }
  if (!selectedPayment) {
    checkoutError.textContent = "Elegí un método de pago.";
    checkoutError.style.display = "block";
    return;
  }
  if (selectedDay === null) {
    checkoutError.textContent = "Elegí el día de entrega.";
    checkoutError.style.display = "block";
    return;
  }
  if (!selectedSlot) {
    checkoutError.textContent = "Elegí un turno de entrega.";
    checkoutError.style.display = "block";
    return;
  }
  if (addressInput.value.trim() === "") {
    checkoutError.textContent = "Ingresá la dirección de entrega.";
    checkoutError.style.display = "block";
    addressInput.focus();
    return;
  }

  sendOrderToWhatsApp();
  closeCheckout();
});

/* ─── Botón/gesto "atrás" del navegador (mobile) ─
   Cierra el panel que esté abierto en vez de salir
   de la página.
   ─────────────────────────────────────────────── */
window.addEventListener("popstate", () => {
  if (sizeSheet.classList.contains("open")) {
    closeSizeSheet(true);
  } else if (notesSheet.classList.contains("open")) {
    closeNotesSheet(true);
  } else if (scheduleSheet.classList.contains("open")) {
    closeSchedule(true);
  } else if (checkoutSheet.classList.contains("open")) {
    closeCheckout(true);
  } else if (cartModal.classList.contains("open")) {
    closeCart(true);
  }
});

overlay.addEventListener("click", () => {
  if (sizeSheet.classList.contains("open")) closeSizeSheet();
  else if (notesSheet.classList.contains("open")) closeNotesSheet();
  else if (scheduleSheet.classList.contains("open")) closeSchedule();
  else if (checkoutSheet.classList.contains("open")) closeCheckout();
  else if (cartModal.classList.contains("open")) closeCart();
});

/* ─── Send to WhatsApp ────────────────────────── */
function sendOrderToWhatsApp() {
  customerName = customerNameInput.value.trim();
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  let msg = "Hola! Quiero hacer este pedido 🍔%0A";
  msg += `*Nombre: ${customerName}*%0A%0A`;
  cart.forEach(item => {
    msg += `• ${item.qty}x ${item.name} — ${formatPrice(item.price * item.qty)}%0A`;
    if (item.notes) {
      msg += `   ↳ _${encodeURIComponent(item.notes)}_%0A`;
    }
  });
  msg += `%0A*Total: ${formatPrice(totalPrice)}*`;

  msg += `%0A%0A💳 Pago: ${selectedPayment}`;
  msg += `%0A📅 Día: ${DAY_NAMES[selectedDay]}`;
  msg += `%0A🕐 Turno: ${selectedSlot}hs`;
  msg += `%0A📍 Dirección: ${encodeURIComponent(addressInput.value.trim())}`;

  const phone = "5491168461341";
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");

  // Limpiar carrito después de enviar
  cart.length = 0;
  updateCart();
}

/* ─── Render menú (acordeón) ───────────────────
   Las categorías normales muestran precio + botón "+".
   La categoría type:"sizes" (Hamburguesas) muestra
   "desde $X" + chevron, y al tocar el item abre el
   panel de selección de tamaño.
   ─────────────────────────────────────────────── */
function renderMenu() {
  categories.forEach((category, catIdx) => {
    const section = document.createElement("section");
    section.classList.add("category");

    const isSizeCategory = category.type === "sizes";
    const isNotesCategory = category.type === "notes";
    const isClickRow = isSizeCategory || isNotesCategory;

    section.innerHTML = `
      <button class="category-header" aria-expanded="false">
        <span class="category-name">${category.name}</span>
        <span class="category-chevron">+</span>
      </button>
      <div class="items">
        ${category.items.map((item, itemIdx) => isSizeCategory ? `
          <div class="item item-burger" data-cat="${catIdx}" data-item="${itemIdx}">
            <div class="item-info">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
            </div>
            <div class="item-right">
              <span class="price-from">desde ${formatPrice(item.sizes.simple)}</span>
              <div class="burger-chevron">›</div>
            </div>
          </div>
        ` : isNotesCategory ? `
          <div class="item item-burger" data-cat="${catIdx}" data-item="${itemIdx}">
            <div class="item-info">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
            </div>
            <div class="item-right">
              <span class="price-from">${formatPrice(item.price)}</span>
              <div class="burger-chevron">›</div>
            </div>
          </div>
        ` : `
          <div class="item" data-cat="${catIdx}" data-item="${itemIdx}">
            <div class="item-info">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
            </div>
            <div class="item-right">
              <div class="price">${formatPrice(item.price)}</div>
              <button class="add-btn" aria-label="Agregar ${item.name}">+</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    menuEl.appendChild(section);

    const header = section.querySelector(".category-header");
    const items  = section.querySelector(".items");

    header.addEventListener("click", () => {
      const isOpen = items.classList.toggle("active");
      header.classList.toggle("open", isOpen);
      header.setAttribute("aria-expanded", isOpen);
    });

    if (isSizeCategory) {
      section.querySelectorAll(".item-burger").forEach((row, idx) => {
        row.addEventListener("click", (e) => {
          e.stopPropagation();
          openSizeSheet(category.items[idx]);
        });
      });
    } else if (isNotesCategory) {
      section.querySelectorAll(".item-burger").forEach((row, idx) => {
        row.addEventListener("click", (e) => {
          e.stopPropagation();
          openNotesSheet(category.items[idx]);
        });
      });
    } else {
      section.querySelectorAll(".add-btn").forEach((btn, idx) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          addItem(category.items[idx]);
        });
      });
    }
  });
}

renderMenu();
updateStatusBadge();
setInterval(updateStatusBadge, 60000); // refresca cada minuto

/* El sitio ya funciona con los valores por defecto de este
   archivo; si Sheets responde OK, precios y horarios se
   actualizan en vivo sin recargar la página. */
loadDynamicData();
setInterval(loadDynamicData, 5 * 60 * 1000); // vuelve a chequear cada 5 min
