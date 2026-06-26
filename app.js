/* ─────────────────────────────────────────────────
   NF Burgers — app.js
   ───────────────────────────────────────────────── */

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
let selectedDelivery = null;
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
const addressGroup    = document.getElementById("address-group");
const addressInput    = document.getElementById("address-input");
const customerNameInput = document.getElementById("customer-name-input");
const checkoutError   = document.getElementById("checkout-error");
const burgerNotesInput = document.getElementById("burger-notes-input");
const itemNotesInput   = document.getElementById("item-notes-input");

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

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-qty">${item.qty}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price * item.qty)}</p>
        ${item.notes ? `<p class="cart-item-notes">"${escapeHTML(item.notes)}"</p>` : ""}
      </div>
      <button class="remove-btn" data-key="${encodeURIComponent(item.key)}">×</button>
    </div>
  `).join("");

  cartItemsEl.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeItem(decodeURIComponent(btn.dataset.key));
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
  // Cerramos el carrito visualmente sin tocar el historial:
  // el checkout reutiliza el mismo estado que ya empujamos
  // al abrir el carrito. Si acá llamáramos a closeCart() (que
  // hace history.back()) y enseguida abriéramos el checkout
  // (que hace pushHistoryState()), el history.back() es async
  // y en mobile el popstate llega después de abrir el checkout,
  // cerrándolo al instante.
  cartModal.classList.remove("open");
  document.body.style.overflow = "";

  selectedPayment = null;
  selectedDelivery = null;
  customerNameInput.value = "";
  addressInput.value = "";
  addressGroup.style.display = "none";
  checkoutError.style.display = "none";

  document.querySelectorAll("#payment-group .pill").forEach(p => p.classList.remove("selected"));
  document.querySelectorAll("#delivery-group .pill").forEach(p => p.classList.remove("selected"));

  checkoutSheet.classList.add("open");
  overlay.classList.add("show");
  pushHistoryState(); // no-op si ya había un estado empujado por el carrito
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

document.querySelectorAll("#delivery-group .pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#delivery-group .pill").forEach(p => p.classList.remove("selected"));
    pill.classList.add("selected");
    selectedDelivery = pill.dataset.value;
    addressGroup.style.display = selectedDelivery === "Delivery" ? "block" : "none";
    checkoutError.style.display = "none";
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
  if (!selectedDelivery) {
    checkoutError.textContent = "Elegí si es Takeaway o Delivery.";
    checkoutError.style.display = "block";
    return;
  }
  if (selectedDelivery === "Delivery" && addressInput.value.trim() === "") {
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
  msg += `%0A🛍️ Entrega: ${selectedDelivery}`;
  if (selectedDelivery === "Delivery") {
    msg += `%0A📍 Dirección: ${encodeURIComponent(addressInput.value.trim())}`;
  }

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
