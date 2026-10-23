
/* =========================================
   SEKOLMART - FITUR MARKETPLACE SEKOLAH
========================================= */

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

let products = readStorage("sekolmartProducts", null);

if (!Array.isArray(products)) {
  products = [
    {
      id: 1, name: "Buku Paket IPA Kelas 9", category: "Buku",
      price: 15000, seller: "Alya", whatsapp: "",
      condition: "Baik", description: "Contoh barang SekolMart.",
      icon: "📚", image: ""
    },
    {
      id: 2, name: "Buku Matematika", category: "Buku",
      price: 12000, seller: "Raka", whatsapp: "",
      condition: "Baik", description: "Contoh barang SekolMart.",
      icon: "📖", image: ""
    },
    {
      id: 3, name: "Seragam Pramuka", category: "Seragam",
      price: 35000, seller: "Nabila", whatsapp: "",
      condition: "Baik", description: "Contoh barang SekolMart.",
      icon: "👕", image: ""
    },
    {
      id: 4, name: "Seragam Batik Sekolah", category: "Seragam",
      price: 30000, seller: "Dina", whatsapp: "",
      condition: "Cukup baik", description: "Contoh barang SekolMart.",
      icon: "👔", image: ""
    },
    {
      id: 5, name: "Tas Sekolah", category: "Tas",
      price: 40000, seller: "Putri", whatsapp: "",
      condition: "Baik", description: "Contoh barang SekolMart.",
      icon: "🎒", image: ""
    },
    {
      id: 6, name: "Sepatu Sekolah", category: "Sepatu",
      price: 50000, seller: "Rani", whatsapp: "",
      condition: "Cukup baik", description: "Contoh barang SekolMart.",
      icon: "👟", image: ""
    }
  ];
  saveProducts();
}

let cart = readStorage("sekolmartCart", []);
if (!Array.isArray(cart)) cart = [];

let activeCategory = "Semua";

function saveProducts() {
  try {
    localStorage.setItem("sekolmartProducts", JSON.stringify(products));
  } catch (error) {
    alert("Penyimpanan penuh. Coba gunakan foto yang lebih kecil.");
  }
}

function saveCart() {
  try {
    localStorage.setItem("sekolmartCart", JSON.stringify(cart));
  } catch (error) {
    alert("Keranjang gagal disimpan.");
  }
}

function formatRupiah(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function getIcon(category) {
  const icons = {
    "Buku": "📚",
    "Tas": "🎒",
    "Seragam": "👕",
    "Sepatu": "👟",
    "Alat Tulis": "✏️"
  };
  return icons[category] || "📦";
}

function getConditionScore(condition) {
  const scores = {
    "Sangat baik": 95,
    "Baik": 80,
    "Cukup baik": 65
  };
  return scores[condition] || 0;
}

/* MENAMPILKAN KARTU PRODUK */

function displayProducts(data = products) {
  const list = document.getElementById("productList");
  if (!list) return;

  const result = document.getElementById("productResult");
  if (result) {
    result.textContent = `${data.length} barang ditemukan`;
  }

  if (data.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔎</div>
        <h3>Barang belum ditemukan</h3>
        <p>Coba kata kunci atau kategori lainnya.</p>
      </div>`;
    return;
  }

  list.innerHTML = data.map(product => {
    const id = Number(product.id);
    const picture = product.image
      ? `<img src="${product.image}" alt="${escapeHTML(product.name)}">`
      : escapeHTML(product.icon || getIcon(product.category));

    const score = getConditionScore(product.condition);

    return `
      <article class="product-card">
        <div class="product-image">${picture}</div>

        <div class="product-body">
          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <div class="product-name">
            ${escapeHTML(product.name)}
          </div>

          <p class="product-seller">
            👤 Penjual: ${escapeHTML(product.seller)}
          </p>

          <p class="product-seller">
            Kondisi: ${escapeHTML(product.condition || "Belum diisi")}
          </p>

          <p class="product-seller">
            ⭐ Skor Kondisi: ${score ? score + "/100" : "Belum dinilai"}
          </p>

          <div class="product-price">
            Rp${formatRupiah(product.price)}
            <small class="negotiable">Harga bisa dinegosiasikan</small>
          </div>

          ${product.description
            ? `<p class="product-seller">${escapeHTML(product.description)}</p>`
            : ""}

          <div class="product-actions">
            <button class="buy-button" type="button"
              onclick="buyNow(${id})">
              Beli Sekarang
            </button>

            <button class="add-cart" type="button"
              onclick="addToCart(${id})">
              🛒 Keranjang
            </button>

            <button class="add-cart" type="button"
              onclick="showSeller(${id})">
              ☎ Penjual
            </button>

            <button class="delete-product" type="button"
              onclick="deleteProduct(${id})">
              🗑️ Hapus Barang
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

/* PENCARIAN */

function searchProduct() {
  const query = (
    document.getElementById("searchInput")?.value || ""
  ).toLowerCase().trim();

  const filtered = products.filter(product => {
    const text = [
      product.name,
      product.category,
      product.seller
    ].join(" ").toLowerCase();

    const matchesText = text.includes(query);
    const matchesCategory =
      activeCategory === "Semua" ||
      product.category === activeCategory;

    return matchesText && matchesCategory;
  });

  displayProducts(filtered);
}

/* FILTER KATEGORI */

function filterProduct(category, button) {
  activeCategory = category || "Semua";

  document.querySelectorAll(".category-card").forEach(card => {
    card.classList.remove("active");
  });

  if (button) button.classList.add("active");

  searchProduct();

  document.getElementById("produk")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* NOMOR WHATSAPP */

function normalizeWhatsApp(number) {
  let phone = String(number || "").replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = "62" + phone.slice(1);
  } else if (phone.startsWith("8")) {
    phone = "62" + phone;
  }

  return phone;
}

function showSeller(id) {
  const product = products.find(item => Number(item.id) === Number(id));
  if (!product) return;

  if (!product.whatsapp) {
    alert(
      `Nama penjual: ${product.seller}\n` +
      "Nomor WhatsApp belum tersedia untuk barang contoh ini."
    );
    return;
  }

  alert(
    `Nama penjual: ${product.seller}\n` +
    `Nomor WhatsApp: ${product.whatsapp}\n` +
    `Barang: ${product.name}`
  );
}

function buyNow(id) {
  const product = products.find(item => Number(item.id) === Number(id));
  if (!product) return showToast("Barang tidak ditemukan.");

  if (!product.whatsapp) {
    alert(
      `Nama penjual: ${product.seller}\n` +
      "Nomor WhatsApp belum tersedia untuk barang contoh ini.\n\n" +
      "Barang contoh ini belum bisa dihubungi. Tambahkan barang " +
      "dengan nomor WhatsApp yang benar untuk mencoba fitur ini."
    );
    return;
  }

  const phone = normalizeWhatsApp(product.whatsapp);

  if (phone.length < 10 || phone.length > 15) {
    alert("Nomor WhatsApp penjual tampaknya tidak valid.");
    return;
  }

  const message =
    `Halo ${product.seller}, saya tertarik membeli ` +
    `${product.name} dari SekolMart. ` +
    `Harga yang tertera Rp${formatRupiah(product.price)}. ` +
    "Apakah barangnya masih tersedia? " +
    "Saya ingin membicarakan harga dan cara serah terima.";

  const confirmed = confirm(
    `Nama penjual: ${product.seller}\n` +
    `Nomor WhatsApp: ${product.whatsapp}\n` +
    `Barang: ${product.name}\n` +
    `Harga penawaran: Rp${formatRupiah(product.price)} ` +
    "(bisa dinegosiasikan)\n\n" +
    "Buka WhatsApp untuk menghubungi penjual?"
  );

  if (confirmed) {
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener"
    );
  }
}

/* KERANJANG */

function addToCart(id) {
  const product = products.find(item => Number(item.id) === Number(id));
  if (!product) return showToast("Barang tidak ditemukan.");

  const existing = cart.find(item => Number(item.id) === Number(id));
  if (existing) {
    return showToast("Barang sudah ada di keranjang.");
  }

  cart.push({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    seller: product.seller
  });

  saveCart();
  updateCartCount();
  showToast("Barang berhasil dimasukkan ke keranjang.");
}

function updateCartCount() {
  const count = document.getElementById("cartCount");
  if (count) count.textContent = cart.length;
}

function openCart() {
  const modal = document.getElementById("cartModal");
  const items = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");

  if (!modal || !items) return;

  if (cart.length === 0) {
    showToast("Keranjangmu masih kosong.");
    return;
  }

  let total = 0;

  items.innerHTML = cart.map((item, index) => {
    total += Number(item.price || 0);

    const product = products.find(
      p => Number(p.id) === Number(item.id)
    );

    const phone = product?.whatsapp
      ? normalizeWhatsApp(product.whatsapp)
      : "";

    const contactButton = phone
      ? `<button class="add-cart" type="button"
          onclick="buyNow(${Number(item.id)})">
          Hubungi
        </button>`
      : "";

    return `
      <div class="cart-row">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>Rp${formatRupiah(item.price)}</small>
          <small>Penjual: ${escapeHTML(item.seller || "-")}</small>
        </div>
        <div>
          ${contactButton}
          <button class="remove-cart" type="button"
            onclick="removeFromCart(${index})">
            Hapus
          </button>
        </div>
      </div>`;
  }).join("");

  if (totalElement) {
    totalElement.textContent = "Rp" + formatRupiah(total);
  }

  modal.classList.add("show");
}

function closeCart() {
  document.getElementById("cartModal")?.classList.remove("show");
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;

  cart.splice(index, 1);
  saveCart();
  updateCartCount();

  if (cart.length === 0) {
    closeCart();
    showToast("Keranjang sudah kosong.");
  } else {
    openCart();
  }
}

function checkout() {
  if (!cart.length) {
    closeCart();
    return showToast("Keranjangmu masih kosong.");
  }

  alert(
    "Pilih tombol Hubungi pada barang untuk mengontak penjual.\n\n" +
    "Harga akhir dan cara serah terima disepakati langsung " +
    "melalui WhatsApp."
  );
}

/* HAPUS BARANG DARI DAFTAR */

function deleteProduct(id) {
  const product = products.find(item => Number(item.id) === Number(id));
  if (!product) return;

  const confirmed = confirm(
    `Yakin ingin menghapus "${product.name}" dari daftar barang?`
  );

  if (!confirmed) return;

  products = products.filter(
    item => Number(item.id) !== Number(id)
  );

  cart = cart.filter(
    item => Number(item.id) !== Number(id)
  );

  saveProducts();
  saveCart();
  searchProduct();
  updateCartCount();

  showToast("Barang berhasil dihapus.");
}

/* PREVIEW FOTO BARANG */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const imageInput = document.getElementById("productImage");
  const preview = document.getElementById("imagePreview");

  if (imageInput && preview) {
    imageInput.addEventListener("change", () => {
      const file = imageInput.files?.[0];

      preview.innerHTML = "";
      preview.hidden = true;

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Pilih file gambar, ya.");
        imageInput.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2 MB.");
        imageInput.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const img = document.createElement("img");
        img.src = String(reader.result || "");
        img.alt = "Pratinjau foto barang";

        preview.appendChild(img);
        preview.hidden = false;
      };

      reader.readAsDataURL(file);
    });
  }

  /* FORM TAMBAH BARANG */

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const name = document.getElementById("productName").value.trim();
      const category = document.getElementById("productCategory").value;
      const price = Number(document.getElementById("productPrice").value);
      const seller = document.getElementById("productSeller").value.trim();
      const whatsapp = document.getElementById("productWhatsapp").value.trim();
      const condition = document.getElementById("productCondition").value;
      const description = document.getElementById("productDescription").value.trim();
      const file = imageInput?.files?.[0];

      if (
        !name || !category || !seller || !whatsapp ||
        !condition || !Number.isFinite(price) || price < 0
      ) {
        alert("Periksa kembali informasi barang.");
        return;
      }

      if (!/^[+0-9\s()-]{9,20}$/.test(whatsapp)) {
        alert("Nomor WhatsApp belum sesuai. Contoh: 081234567890.");
        return;
      }

      if (!file || !file.type.startsWith("image/")) {
        alert("Pilih foto barang terlebih dahulu.");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2 MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const product = {
          id: Date.now(),
          name,
          category,
          price,
          seller,
          whatsapp,
          condition,
          description,
          icon: getIcon(category),
          image: String(reader.result || "")
        };

        products.unshift(product);
        saveProducts();

        form.reset();

        if (preview) {
          preview.innerHTML = "";
          preview.hidden = true;
        }

        activeCategory = "Semua";

        document.querySelectorAll(".category-card").forEach(card => {
          card.classList.remove("active");
        });

        document.querySelector(".category-card")?.classList.add("active");

        document.getElementById("searchInput").value = "";

        searchProduct();
        updateCartCount();

        showToast("Barang berhasil ditambahkan!");

        document.getElementById("produk")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      };

      reader.onerror = () => {
        alert("Foto gagal dibaca. Coba pilih foto lain.");
      };

      reader.readAsDataURL(file);
    });
  }

  displayProducts(products);
  updateCartCount();
});

/* Tutup keranjang saat klik area gelap */
document.getElementById("cartModal")?.addEventListener("click", event => {
  if (event.target.id === "cartModal") closeCart();
});

