/* ─────────────────────────────────────────────────
   NF Burgers — app.js
   ───────────────────────────────────────────────── */

const INCLUYE_PAPAS = " Incluye papas fritas.";
const PRECIO_BEBIDA_CHICA = 2000;
const PRECIO_BEBIDA_GRANDE = 5000;

const sizeLabels = { simple: "Simple", doble: "Doble", triple: "Triple" };
const sizeMeta   = { simple: "x1 carne smasheada", doble: "x2 carne smasheada", triple: "x3 carne smasheada" };

/* ─── MENÚ ────────────────────────────────────────
   Categorías con acordeón, igual que antes.
   La categoría "Hamburguesas" usa type: "sizes":
   cada item tiene un objeto `sizes` (simple/doble/
   triple) en vez de un `price` único. Al tocarla se
   abre el panel para elegir el tamaño.
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
    items: [
      { name: "Papas fritas", description: "Papas fritas", price: 2000 },
    ]
  },
];

/* ─── State ──────────────────────────────────────
   cart = [{ name, price, qty }, …]
   ─────────────────────────────────────────────── */
const cart = [];
let activeBurger = null;
let selectedSize = null;

/* ─── DOM refs ──────────────────────────────────── */
const menuEl       = document.getElementById("menu");
const sizeSheet     = document.getElementById("size-sheet");
const cartModal     = document.getElementById("cart-modal");
const cartItemsEl   = document.getElementById("cart-items");
const cartCountEl   = document.getElementById("cart-count");
const cartTotalEl   = document.getElementById("cart-total");
const overlay       = document.getElementById("overlay");

/* ─── Helpers ─────────────────────────────────── */
function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR");
}

function findInCart(name) {
  return cart.find(i => i.name === name);
}

/* ─── Add to cart ─────────────────────────────── */
function addItem(item) {
  const existing = findInCart(item.name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCart();
  animateCartIcon();
}

/* ─── Remove one unit (or item) ──────────────────*/
function removeItem(name) {
  const idx = cart.findIndex(i => i.name === name);
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
      </div>
      <button class="remove-btn" onclick="removeItem('${item.name.replace(/'/g,"\\'")}')">×</button>
    </div>
  `).join("");
}

/* ─── Cart icon bounce ────────────────────────── */
function animateCartIcon() {
  cartCountEl.classList.remove("pop");
  void cartCountEl.offsetWidth; /* reflow to restart animation */
  cartCountEl.classList.add("pop");
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
        <div>
          <div class="size-name">${sizeLabels[key]}</div>
          <div class="size-meta">${sizeMeta[key]}</div>
        </div>
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

  sizeSheet.classList.add("open");
  overlay.classList.add("show");
  pushHistoryState();
}

function closeSizeSheet(fromPopState = false) {
  sizeSheet.classList.remove("open");
  if (!cartModal.classList.contains("open")) {
    overlay.classList.remove("show");
  }
  popHistoryState(fromPopState);
}

document.getElementById("add-with-size").addEventListener("click", () => {
  if (!selectedSize) return;
  addItem({
    name: `${activeBurger.name} (${sizeLabels[selectedSize]})`,
    price: activeBurger.sizes[selectedSize]
  });
  closeSizeSheet();
});

/* ─── Open / close cart ─────────────────────────
   En mobile, el botón/gesto "atrás" del navegador
   sale de la página entera si no hay un estado de
   historial que cerrar primero. Para evitar que el
   usuario quede "atrapado" en el carrito o en el
   panel de tamaño, agregamos un estado al historial
   al abrir cualquiera de los dos, y lo consumimos
   al cerrar.
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

function openCart() {
  cartModal.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
  pushHistoryState();
}

function closeCart(fromPopState = false) {
  cartModal.classList.remove("open");
  if (!sizeSheet.classList.contains("open")) {
    overlay.classList.remove("show");
  }
  document.body.style.overflow = "";
  popHistoryState(fromPopState);
}

document.getElementById("cart-icon").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", () => closeCart());

overlay.addEventListener("click", () => {
  if (sizeSheet.classList.contains("open")) closeSizeSheet();
  if (cartModal.classList.contains("open")) closeCart();
});

// Botón/gesto "atrás" del navegador (mobile) cierra el panel abierto
// en vez de salir de la página.
window.addEventListener("popstate", () => {
  if (sizeSheet.classList.contains("open")) {
    closeSizeSheet(true);
  } else if (cartModal.classList.contains("open")) {
    closeCart(true);
  }
});

/* ─── Send to WhatsApp ────────────────────────── */
document.getElementById("send-order").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("No hay productos en el pedido.");
    return;
  }

  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  let msg = "Hola! Quiero hacer este pedido 🍔%0A%0A";
  cart.forEach(item => {
    msg += `• ${item.qty}x ${item.name} — ${formatPrice(item.price * item.qty)}%0A`;
  });
  msg += `%0A*Total: ${formatPrice(totalPrice)}*`;

  const phone = "5491168461341";
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");

  closeCart();
});

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
              <span class="price-from">${formatPrice(item.sizes.simple)}</span>
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
      /* Tocar la hamburguesa abre el panel de tamaño */
      section.querySelectorAll(".item-burger").forEach((row, idx) => {
        row.addEventListener("click", (e) => {
          e.stopPropagation();
          openSizeSheet(category.items[idx]);
        });
      });
    } else {
      /* Botón "+" agrega directo, como antes */
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
