/**
 * script.js
 * Main JavaScript logic for Ayam Beujeuk Seuhah E-Commerce
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. VARIABEL & STATE MANAGEMENT
    // ==========================================
    let cart = []; // State untuk menyimpan data produk di keranjang

    // DOM Elements - Navigation & Header
    const siteHeader = document.querySelector('.site-header');
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    // DOM Elements - Cart Elements
    const cartToggleBtn = document.querySelector('.cart-toggle-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToCartBtns = document.querySelectorAll('.btn-add-cart');

    // ==========================================
    // 2. UTILITY FUNCTIONS
    // ==========================================
    
    // Format angka ke Rupiah menggunakan Intl API modern
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0 
        }).format(number);
    };

    // ==========================================
    // 3. UI INTERACTIONS (NAV & HEADER)
    // ==========================================

    // Efek Sticky Header saat Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            siteHeader.style.background = 'rgba(255, 255, 255, 0.98)';
            siteHeader.style.boxShadow = 'var(--shadow-md)';
        } else {
            siteHeader.style.background = 'rgba(255, 255, 255, 0.9)';
            siteHeader.style.boxShadow = 'var(--shadow-sm)';
        }
    });

    // Toggle Mobile Menu (Hamburger)
    hamburgerBtn.addEventListener('click', () => {
        // Karena CSS memisahkan tampilan desktop, kita bisa menggunakan inline style atau class toggle
        // Untuk contoh sederhana, kita toggle style display
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = 'var(--header-height)';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = '#fff';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = 'var(--shadow-md)';
        }
    });

    // ==========================================
    // 4. CART LOGIC & FUNCTIONS
    // ==========================================

    // Toggle Cart Sidebar
    const toggleCart = () => {
        const isOpen = cartSidebar.classList.contains('open');
        if (isOpen) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            cartSidebar.setAttribute('aria-hidden', 'true');
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            cartSidebar.setAttribute('aria-hidden', 'false');
        }
    };

    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Fungsi Render (Menampilkan) Isi Keranjang
    const renderCart = () => {
        cartItemsContainer.innerHTML = ''; // Kosongkan kontainer
        let totalPrice = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: var(--clr-border);"></i>
                    <p style="margin-top: 1rem;">Keranjang Anda masih kosong</p>
                </div>
            `;
        } else {
            cart.forEach((item) => {
                totalPrice += item.price * item.quantity;
                totalItems += item.quantity;

                const cartItemElement = document.createElement('div');
                cartItemElement.style.display = 'flex';
                cartItemElement.style.gap = '1rem';
                cartItemElement.style.marginBottom = '1.5rem';
                cartItemElement.style.borderBottom = '1px solid var(--clr-border)';
                cartItemElement.style.paddingBottom = '1rem';

                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: var(--border-radius-sm);">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9rem; margin-bottom: 0.25rem;">${item.name}</h4>
                        <strong style="color: var(--clr-primary); font-size: 0.9rem;">${formatRupiah(item.price)}</strong>
                        
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
                            <button class="btn-qty-decrease" data-id="${item.id}" style="width: 25px; height: 25px; background: #f3f4f6; border-radius: 4px;">-</button>
                            <span style="font-size: 0.9rem; font-weight: 500;">${item.quantity}</span>
                            <button class="btn-qty-increase" data-id="${item.id}" style="width: 25px; height: 25px; background: #f3f4f6; border-radius: 4px;">+</button>
                        </div>
                    </div>
                    <button class="btn-remove-item" data-id="${item.id}" aria-label="Hapus produk" style="color: var(--clr-text-muted); padding: 0.5rem; align-self: flex-start;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        // Update Text Harga dan Badge
        cartTotalPrice.textContent = formatRupiah(totalPrice);
        cartBadgeCount.textContent = totalItems;

        // Pasang event listener untuk tombol +/- dan hapus yang baru dirender
        attachCartItemEvents();
    };

    // Fungsi Menambah ke Keranjang
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        renderCart();
        toggleCart(); // Buka keranjang otomatis saat barang ditambah
    };

    // Event Listener untuk semua tombol "Tambah" di halaman produk
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // DOM Traversal: Ambil gambar produk terdekat
            const card = this.closest('.product-card');
            const imgSrc = card.querySelector('.product-image').src;

            const productData = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseInt(this.dataset.price),
                image: imgSrc
            };

            addToCart(productData);
        });
    });

    // Fungsi attach event untuk item di dalam keranjang (Kuantitas & Hapus)
    const attachCartItemEvents = () => {
        // Decrease Qty
        document.querySelectorAll('.btn-qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const item = cart.find(item => item.id === id);
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    cart = cart.filter(item => item.id !== id);
                }
                renderCart();
            });
        });

        // Increase Qty
        document.querySelectorAll('.btn-qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const item = cart.find(item => item.id === id);
                item.quantity += 1;
                renderCart();
            });
        });

        // Remove Item
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Gunakan event.currentTarget agar klik ikon icon <i/> tetap menangkap dataset pada <button/>
                const id = e.currentTarget.dataset.id; 
                cart = cart.filter(item => item.id !== id);
                renderCart();
            });
        });
    };

    // ==========================================
    // 5. CHECKOUT VIA WHATSAPP API
    // ==========================================
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang Anda masih kosong. Silakan pilih menu terlebih dahulu!');
            return;
        }

        const nomorWhatsApp = "6282124135338"; // Nomor owner sesuai permintaan
        let pesanText = "*Halo Admin Ayam Beujeuk Seuhah!* 🌶️\nSaya ingin memesan menu berikut:\n\n";
        let totalHarga = 0;

        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            totalHarga += subtotal;
            pesanText += `${index + 1}. *${item.name}*\n`;
            pesanText += `   ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}\n\n`;
        });

        pesanText += `-----------------------------------\n`;
        pesanText += `*Total Pembayaran: ${formatRupiah(totalHarga)}*\n`;
        pesanText += `-----------------------------------\n\n`;
        pesanText += `Mohon info ongkos kirim dan metode pembayarannya. Terima kasih!`;

        // Encode pesan agar format spasi dan baris baru aman untuk URL
        const encodedPesan = encodeURIComponent(pesanText);
        
        // Buka tab baru menuju WhatsApp
        window.open(`https://wa.me/${nomorWhatsApp}?text=${encodedPesan}`, '_blank');
    });
});