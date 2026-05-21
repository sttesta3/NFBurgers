/* ─────────────────────────────────────────────────
   NF Burgers — app.js
   ───────────────────────────────────────────────── */

const categories = [
  {
    name: "Burgers",
    items: [
      { name: "Classic Burger",  description: "Doble carne, cheddar y salsa",       price: 8500 },
      { name: "Cheese Bacon",    description: "Cheddar, bacon crispy y pickles",      price: 9500 },
    ]
  },
  {
    name: "Fries",
    items: [
      { name: "Classic Fries",  description: "Papas fritas",        price: 4000 },
      { name: "Cheddar Fries",  description: "Cheddar y panceta",   price: 5500 },
    ]
  },
  {
    name: "Drinks",
    items: [
      { name: "Coca Cola", description: "500ml", price: 2500 },
    ]
  }
];

/* ─── State ──────────────────────────────────────
   cart = [{ name, description, price, qty }, …]
   ─────────────────────────────────────────────── */
const cart = [];

/* ─── DOM refs ──────────────────────────────────── */
const menuEl      = document.getElementById("menu");
const cartModal   = document.getElementById("cart-modal");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const overlay     = document.getElementById("overlay");

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

  /* badge */
  cartCountEl.textContent = totalItems;
  if (totalItems > 0) {
    cartCountEl.classList.remove("hidden");
  } else {
    cartCountEl.classList.add("hidden");
  }

  /* total */
  cartTotalEl.textContent = totalPrice.toLocaleString("es-AR");

  /* items list */
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

/* ─── Open / close cart ───────────────────────── */
function openCart() {
  cartModal.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartModal.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

document.getElementById("cart-icon").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

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

  const phone = "5491100000000";
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
});

/* ─── Render menu ─────────────────────────────── */
function renderMenu() {
  categories.forEach((category, catIdx) => {
    const section = document.createElement("section");
    section.classList.add("category");

    section.innerHTML = `
      <button class="category-header" aria-expanded="false">
        <span class="category-name">${category.name}</span>
        <span class="category-chevron">+</span>
      </button>
      <div class="items">
        ${category.items.map((item, itemIdx) => `
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

    /* Toggle accordion */
    const header = section.querySelector(".category-header");
    const items  = section.querySelector(".items");

    header.addEventListener("click", () => {
      const isOpen = items.classList.toggle("active");
      header.classList.toggle("open", isOpen);
      header.setAttribute("aria-expanded", isOpen);
    });

    /* Add buttons */
    section.querySelectorAll(".add-btn").forEach((btn, idx) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        addItem(category.items[idx]);
      });
    });
  });
}

renderMenu();
