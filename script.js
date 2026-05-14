// ========== FUNCIÓN PARA ENVIAR CORREO ==========
async function sendEmail(formData) {
    const formSubmitUrl = 'https://formsubmit.co/ajax/infocarmastertunning@gmail.com';
    
    const submitData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        _captcha: 'false',
        _template: 'table',
        _subject: `Nuevo mensaje de contacto - CarMaster: ${formData.subject}`
    };
    
    try {
        const response = await fetch(formSubmitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(submitData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            return { success: true, message: 'Mensaje enviado exitosamente' };
        } else {
            throw new Error('Error al enviar');
        }
    } catch (error) {
        console.error('Error con FormSubmit:', error);
        const mailtoLink = `mailto:infocarmastertunning@gmail.com?subject=${encodeURIComponent(`Contacto CarMaster: ${formData.subject}`)}&body=${encodeURIComponent(
            `Nombre: ${formData.name}\n` +
            `Email: ${formData.email}\n` +
            `Asunto: ${formData.subject}\n\n` +
            `Mensaje:\n${formData.message}\n\n` +
            `---\nEste mensaje fue enviado desde el formulario de contacto de CarMaster Tuning.`
        )}`;
        window.location.href = mailtoLink;
        return { success: true, message: 'Se abrirá tu cliente de correo', isMailto: true };
    }
}

// ========== ELEMENTOS DEL DOM ==========
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartShipping = document.getElementById('cart-shipping');
const cartTotalPrice = document.getElementById('cart-total-price');
const emptyCart = document.getElementById('empty-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const carsGrid = document.getElementById('cars-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.main-menu li[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');
const inicioTab = document.getElementById('inicio-tab');
const verCatalogoBtn = document.getElementById('ver-catalogo-btn');
const saberMasBtn = document.getElementById('saber-mas-btn');
const contactForm = document.getElementById('contact-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResultsInfo = document.getElementById('search-results-info');
const noResults = document.getElementById('no-results');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const authButtons = document.getElementById('auth-buttons');
const authTabs = document.querySelectorAll('.auth-tab');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const userInfoContainer = document.getElementById('user-info-container');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const profileTabItem = document.getElementById('profile-tab-item');
const menuToggle = document.getElementById('menu-toggle');
const mainMenu = document.getElementById('main-menu');
const menuIcon = menuToggle.querySelector('i');
const shippingSectionCart = document.getElementById('shipping-section-cart');
const shippingOptionsDiv = document.getElementById('shipping-options');

// ========== VARIABLES DE ESTADO ==========
let cart = [];
let currentFilter = 'all';
let currentSearchTerm = '';
let currentUser = null;
let editingAddressId = null;
let currentProductId = null;
let selectedShipping = null;
let currentSlide = 0;
let totalSlides = 5;
let autoSlideInterval;

// Opciones de envío
const shippingMethods = [
    { id: 'standard', name: 'Envío Estándar', description: 'Entrega en 5-7 días hábiles', price: 99, days: '5-7' },
    { id: 'express', name: 'Envío Express', description: 'Entrega en 2-3 días hábiles', price: 199, days: '2-3' },
    { id: 'priority', name: 'Envío Prioritario', description: 'Entrega en 24 horas', price: 399, days: '1' }
];

// Estructura de datos del perfil
let userProfile = {
    personal: { name: '', email: '', phone: '' },
    banking: { cardNumber: '', cardholder: '', expiryDate: '', cvv: '' },
    addresses: []
};

// Lista de autopartes tuning
const cars = [
    { id: 1, name: "Rines BBS LM 18\"", price: 1299, category: "ruedas", image: "https://i.ebayimg.com/images/g/cVAAAeSwNPhpdv7P/s-l1600.webp", description: "Rines de aleación estilo racing, acabado plata. Mejoran el aspecto y rendimiento de tu vehículo.", features: { material: "Aleación de aluminio", medida: "18 pulgadas", compatible: "Universal 5x114.3", peso: "9.5 kg" } },
    { id: 2, name: "Escape Deportivo Inox", price: 849, category: "escape", image: "https://m.media-amazon.com/images/I/51wAtn9UKrL._AC_SX522_.jpg", description: "Sistema de escape free flow, sonido agresivo y más potencia. Fabricado en acero inoxidable.", features: { material: "Acero inoxidable", tipo: "Free Flow", potencia: "+15 HP", sonido: "Deportivo" } },
    { id: 3, name: "Coilovers Ajustables", price: 1599, category: "suspension", image: "https://i.ebayimg.com/images/g/0tAAAOSww3NnsvOr/s-l1600.webp", description: "Suspensión deportiva regulable en altura y dureza. Ideal para mejorar el manejo.", features: { material: "Acero de alta resistencia", ajuste: "32 niveles", bajada: "40-80 mm", uso: "Rally/Street" } },
    { id: 4, name: "Kit Carrocería Aero V2", price: 2499, category: "carroceria", image: "https://i.ebayimg.com/images/g/9VQAAOSwsORhchMm/s-l1600.webp", description: "Parachoques delantero, trasero y skirts laterales. Diseño agresivo y aerodinámico.", features: { material: "Poliuretano de alta calidad", incluye: "4 piezas", pintable: "Sí", instalación: "Profesional recomendada" } },
    { id: 5, name: "Faros LED Matrix", price: 599, category: "iluminacion", image: "https://i.ebayimg.com/images/g/xwcAAeSweBRn~zsf/s-l1600.webp", description: "Faros full LED con luz diurna tipo DRL. Iluminación superior y estilo moderno.", features: { tipo: "Matrix LED", potencia: "60W", vida: "50000 horas", temperatura: "6500K" } },
    { id: 6, name: "Neumáticos Performance", price: 899, category: "ruedas", image: "https://m.media-amazon.com/images/I/71jLotFyGyL._AC_SX522_.jpg", description: "Neumáticos de alto agarre para máximo rendimiento en seco y mojado.", features: { medida: "225/40R18", indice: "92Y", uso: "Deportivo", garantia: "50000 km" } }
];

// ========== FUNCIONES DEL CARRUSEL ==========
function initCarousel() {
    const slidesContainer = document.getElementById('carousel-slides');
    const dotsContainer = document.getElementById('carousel-dots');
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    updateCarousel();
    startAutoSlide();
    
    document.getElementById('carousel-prev').addEventListener('click', prevSlide);
    document.getElementById('carousel-next').addEventListener('click', nextSlide);
    
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
    
    document.querySelectorAll('.carousel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = btn.getAttribute('data-category');
            if (category) {
                switchTab('autos');
                setTimeout(() => {
                    const filterBtn = Array.from(filterBtns).find(b => b.getAttribute('data-filter') === category);
                    if (filterBtn) filterBtn.click();
                }, 100);
            }
        });
    });
}

function updateCarousel() {
    const slidesContainer = document.getElementById('carousel-slides');
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); }
function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateCarousel(); }
function goToSlide(index) { currentSlide = index; updateCarousel(); }
function startAutoSlide() { if (autoSlideInterval) clearInterval(autoSlideInterval); autoSlideInterval = setInterval(nextSlide, 5000); }
function stopAutoSlide() { if (autoSlideInterval) clearInterval(autoSlideInterval); }

// ========== FUNCIONES DE ALMACENAMIENTO LOCAL ==========
function saveCartToLocalStorage() { localStorage.setItem('carMasterCart', JSON.stringify(cart)); }
function loadCartFromLocalStorage() { const savedCart = localStorage.getItem('carMasterCart'); if (savedCart) { cart = JSON.parse(savedCart); updateCart(); } }
function saveUsersToLocalStorage(users) { localStorage.setItem('carMasterUsers', JSON.stringify(users)); }
function loadUsersFromLocalStorage() { const savedUsers = localStorage.getItem('carMasterUsers'); return savedUsers ? JSON.parse(savedUsers) : []; }
function saveCurrentUserToLocalStorage(user) { localStorage.setItem('carMasterCurrentUser', JSON.stringify(user)); }
function loadCurrentUserFromLocalStorage() { const savedUser = localStorage.getItem('carMasterCurrentUser'); return savedUser ? JSON.parse(savedUser) : null; }
function saveSelectedShipping() { if (selectedShipping) localStorage.setItem('carMasterSelectedShipping', JSON.stringify(selectedShipping)); }
function loadSelectedShipping() { const saved = localStorage.getItem('carMasterSelectedShipping'); if (saved) { selectedShipping = JSON.parse(saved); } }

function saveUserProfileToLocalStorage() {
    if (currentUser) {
        const allProfiles = JSON.parse(localStorage.getItem('carMasterProfiles') || '{}');
        allProfiles[currentUser.id] = userProfile;
        localStorage.setItem('carMasterProfiles', JSON.stringify(allProfiles));
    }
}

function loadUserProfileFromLocalStorage() {
    if (currentUser) {
        const allProfiles = JSON.parse(localStorage.getItem('carMasterProfiles') || '{}');
        if (allProfiles[currentUser.id]) {
            userProfile = allProfiles[currentUser.id];
        } else {
            userProfile = {
                personal: { name: currentUser.name, email: currentUser.email, phone: '' },
                banking: { cardNumber: '', cardholder: '', expiryDate: '', cvv: '' },
                addresses: []
            };
        }
        updateProfileUI();
    }
}

// ========== FUNCIONES DEL PERFIL ==========
function updateProfileUI() {
    if (!currentUser) return;
    document.getElementById('profile-avatar').textContent = userProfile.personal.name.charAt(0).toUpperCase();
    document.getElementById('profile-name').textContent = userProfile.personal.name;
    document.getElementById('profile-email').textContent = userProfile.personal.email;
    document.getElementById('display-name').textContent = userProfile.personal.name || '-';
    document.getElementById('display-email').textContent = userProfile.personal.email || '-';
    document.getElementById('display-phone').textContent = userProfile.personal.phone || '-';
    
    if (userProfile.banking.cardNumber) {
        const maskedCard = '**** **** **** ' + userProfile.banking.cardNumber.slice(-4);
        document.getElementById('display-card').textContent = maskedCard;
        document.getElementById('display-cardholder').textContent = userProfile.banking.cardholder || '-';
        document.getElementById('display-expiry').textContent = userProfile.banking.expiryDate || '-';
    } else {
        document.getElementById('display-card').textContent = '-';
        document.getElementById('display-cardholder').textContent = '-';
        document.getElementById('display-expiry').textContent = '-';
    }
    loadAddresses();
}

function editPersonalInfo() {
    document.getElementById('personal-info-display').style.display = 'none';
    document.getElementById('personal-info-form').classList.add('active');
    document.getElementById('edit-name').value = userProfile.personal.name;
    document.getElementById('edit-phone').value = userProfile.personal.phone;
}

function cancelEditPersonal() {
    document.getElementById('personal-info-display').style.display = 'block';
    document.getElementById('personal-info-form').classList.remove('active');
}

function savePersonalInfo() {
    userProfile.personal.name = document.getElementById('edit-name').value;
    userProfile.personal.phone = document.getElementById('edit-phone').value;
    if (currentUser) {
        currentUser.name = userProfile.personal.name;
        saveCurrentUserToLocalStorage(currentUser);
        const users = loadUsersFromLocalStorage();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) users[userIndex].name = userProfile.personal.name;
        saveUsersToLocalStorage(users);
    }
    saveUserProfileToLocalStorage();
    updateProfileUI();
    updateAuthUI();
    cancelEditPersonal();
    alert('Información personal actualizada');
}

function editBankingInfo() {
    document.getElementById('banking-info-display').style.display = 'none';
    document.getElementById('banking-info-form').classList.add('active');
    document.getElementById('edit-card').value = userProfile.banking.cardNumber;
    document.getElementById('edit-cardholder').value = userProfile.banking.cardholder;
    document.getElementById('edit-expiry').value = userProfile.banking.expiryDate;
    document.getElementById('edit-cvv').value = userProfile.banking.cvv;
}

function cancelEditBanking() {
    document.getElementById('banking-info-display').style.display = 'block';
    document.getElementById('banking-info-form').classList.remove('active');
}

function saveBankingInfo() {
    userProfile.banking.cardNumber = document.getElementById('edit-card').value.replace(/\s/g, '');
    userProfile.banking.cardholder = document.getElementById('edit-cardholder').value;
    userProfile.banking.expiryDate = document.getElementById('edit-expiry').value;
    userProfile.banking.cvv = document.getElementById('edit-cvv').value;
    saveUserProfileToLocalStorage();
    updateProfileUI();
    cancelEditBanking();
    alert('Información bancaria actualizada');
}

function loadAddresses() {
    const container = document.getElementById('addresses-list');
    container.innerHTML = '';
    if (userProfile.addresses.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;">No tienes direcciones guardadas</p>';
        return;
    }
    userProfile.addresses.forEach((addr, index) => {
        const addressDiv = document.createElement('div');
        addressDiv.className = 'address-card' + (addr.isPrimary ? ' primary' : '');
        addressDiv.innerHTML = `
            <div class="address-header">
                <strong>${addr.street}, ${addr.colony}</strong>
                ${addr.isPrimary ? '<span class="address-badge">Principal</span>' : ''}
            </div>
            <div>${addr.city}, ${addr.state}</div>
            <div>CP: ${addr.zip} - ${addr.country}</div>
            <div class="address-actions">
                ${!addr.isPrimary ? `<button class="set-primary" onclick="setPrimaryAddress(${index})"><i class="fas fa-check-circle"></i> Establecer como principal</button>` : ''}
                <button onclick="editAddress(${index})"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-address" onclick="deleteAddress(${index})"><i class="fas fa-trash"></i> Eliminar</button>
            </div>
        `;
        container.appendChild(addressDiv);
    });
}

function showAddAddressModal() { editingAddressId = null; document.getElementById('address-modal-title').textContent = 'Agregar dirección'; document.getElementById('address-form').reset(); document.getElementById('address-primary').checked = false; document.getElementById('address-modal').style.display = 'flex'; }
function closeAddressModal() { document.getElementById('address-modal').style.display = 'none'; }
function editAddress(index) { editingAddressId = index; const addr = userProfile.addresses[index]; document.getElementById('address-modal-title').textContent = 'Editar dirección'; document.getElementById('address-street').value = addr.street; document.getElementById('address-colony').value = addr.colony; document.getElementById('address-city').value = addr.city; document.getElementById('address-state').value = addr.state; document.getElementById('address-zip').value = addr.zip; document.getElementById('address-country').value = addr.country; document.getElementById('address-primary').checked = addr.isPrimary || false; document.getElementById('address-modal').style.display = 'flex'; }
function deleteAddress(index) { if (confirm('¿Eliminar esta dirección?')) { userProfile.addresses.splice(index, 1); saveUserProfileToLocalStorage(); loadAddresses(); } }
function setPrimaryAddress(index) { userProfile.addresses.forEach((addr, i) => addr.isPrimary = (i === index)); saveUserProfileToLocalStorage(); loadAddresses(); }

// Event listener para el formulario de dirección
document.getElementById('address-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newAddress = {
        street: document.getElementById('address-street').value,
        colony: document.getElementById('address-colony').value,
        city: document.getElementById('address-city').value,
        state: document.getElementById('address-state').value,
        zip: document.getElementById('address-zip').value,
        country: document.getElementById('address-country').value,
        isPrimary: document.getElementById('address-primary').checked
    };
    if (newAddress.isPrimary) userProfile.addresses.forEach(addr => addr.isPrimary = false);
    if (editingAddressId !== null) userProfile.addresses[editingAddressId] = newAddress;
    else userProfile.addresses.push(newAddress);
    saveUserProfileToLocalStorage();
    closeAddressModal();
    loadAddresses();
});

// Exponer funciones globalmente
window.editPersonalInfo = editPersonalInfo;
window.savePersonalInfo = savePersonalInfo;
window.cancelEditPersonal = cancelEditPersonal;
window.editBankingInfo = editBankingInfo;
window.saveBankingInfo = saveBankingInfo;
window.cancelEditBanking = cancelEditBanking;
window.showAddAddressModal = showAddAddressModal;
window.closeAddressModal = closeAddressModal;
window.editAddress = editAddress;
window.deleteAddress = deleteAddress;
window.setPrimaryAddress = setPrimaryAddress;

// ========== FUNCIONES DE AUTENTICACIÓN ==========
function updateAuthUI() {
    if (currentUser) {
        authButtons.style.display = 'none';
        userInfoContainer.style.display = 'block';
        profileTabItem.style.display = 'block';
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
    } else {
        authButtons.style.display = 'block';
        userInfoContainer.style.display = 'none';
        profileTabItem.style.display = 'none';
    }
}

function switchAuthTab(tabName) {
    authTabs.forEach(tab => tab.classList.remove('active'));
    loginSection.classList.remove('active');
    registerSection.classList.remove('active');
    document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
    if (tabName === 'login') loginSection.classList.add('active');
    else registerSection.classList.add('active');
}

function registerUser(name, email, password) {
    const users = loadUsersFromLocalStorage();
    if (users.find(user => user.email === email)) return { success: false, message: 'Ya existe un usuario con este email' };
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    saveUsersToLocalStorage(users);
    return { success: true, message: 'Usuario registrado exitosamente' };
}

function loginUser(email, password) {
    const users = loadUsersFromLocalStorage();
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) return { success: false, message: 'Email o contraseña incorrectos' };
    currentUser = { id: user.id, name: user.name, email: user.email };
    saveCurrentUserToLocalStorage(currentUser);
    loadUserProfileFromLocalStorage();
    updateAuthUI();
    return { success: true, message: 'Inicio de sesión exitoso' };
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('carMasterCurrentUser');
    userProfile = { personal: { name: '', email: '', phone: '' }, banking: { cardNumber: '', cardholder: '', expiryDate: '', cvv: '' }, addresses: [] };
    updateAuthUI();
    switchTab('inicio');
}

// ========== FUNCIONES DE NAVEGACIÓN ==========
function switchTab(tabName) {
    tabContents.forEach(tab => tab.classList.remove('active'));
    menuItems.forEach(item => item.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    const menuItem = document.querySelector(`.main-menu li[data-tab="${tabName}"]`);
    if (menuItem) menuItem.classList.add('active');
    if (tabName === 'autos') loadCars();
    if (tabName === 'perfil' && currentUser) updateProfileUI();
    if (window.innerWidth <= 768) closeMobileMenu();
}

function showProductPage(productId) {
    const product = cars.find(c => c.id == productId);
    if (!product) return;
    currentProductId = productId;
    const productContainer = document.getElementById('product-page');
    productContainer.innerHTML = `
        <div class="product-grid">
            <div class="product-gallery">
                <img src="${product.image}" alt="${product.name}" class="product-main-image">
            </div>
            <div class="product-info">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h1 class="product-title">${product.name}</h1>
                <div class="product-price">$${product.price.toLocaleString()}</div>
                <p class="product-description">${product.description}</p>
                <div class="product-specs">
                    <h3>Especificaciones técnicas</h3>
                    ${Object.entries(product.features).map(([key, value]) => `
                        <div class="spec-row">
                            <div class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</div>
                            <div class="spec-value">${value}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="quantity-selector">
                    <label>Cantidad:</label>
                    <input type="number" id="product-quantity" class="quantity-input" value="1" min="1" max="10">
                </div>
                <button class="add-to-cart-product" onclick="addProductToCart(${product.id}, '${product.name}', ${product.price})">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
                <a class="back-to-catalog" onclick="switchTab('autos')">
                    <i class="fas fa-arrow-left"></i> Volver al catálogo
                </a>
            </div>
        </div>
    `;
    switchTab('producto');
}

function addProductToCart(id, name, price) {
    const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
    const existingItem = cart.find(item => item.id === id.toString());
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: id.toString(), name, price, quantity });
    }
    updateCart();
    saveCartToLocalStorage();
    alert(`Se agregaron ${quantity} unidad(es) de ${name} al carrito`);
}

function closeMobileMenu() {
    mainMenu.classList.remove('active');
    menuIcon.classList.remove('fa-times');
    menuIcon.classList.add('fa-bars');
    mainMenu.style.maxHeight = '0';
    setTimeout(() => { if (!mainMenu.classList.contains('active')) mainMenu.style.display = 'none'; }, 300);
}

function toggleMobileMenu() {
    if (mainMenu.classList.contains('active')) closeMobileMenu();
    else { mainMenu.classList.add('active'); menuIcon.classList.remove('fa-bars'); menuIcon.classList.add('fa-times'); mainMenu.style.display = 'block'; mainMenu.style.maxHeight = mainMenu.scrollHeight + 'px'; }
}

function getCategoryName(category) {
    const categories = { ruedas: 'Llantas & Rines', escape: 'Sistemas Escape', suspension: 'Suspensión', carroceria: 'Kit Carrocería', iluminacion: 'Iluminación LED' };
    return categories[category] || category;
}

function getCartSubtotal() { return cart.reduce((total, item) => total + (item.price * item.quantity), 0); }
function getShippingPrice() { return selectedShipping ? selectedShipping.price : 0; }
function getCartTotal() { return getCartSubtotal() + getShippingPrice(); }

function renderShippingOptions() {
    if (!shippingOptionsDiv) return;
    shippingOptionsDiv.innerHTML = '';
    shippingMethods.forEach(method => {
        const optionDiv = document.createElement('div');
        optionDiv.className = `shipping-option ${selectedShipping && selectedShipping.id === method.id ? 'selected' : ''}`;
        optionDiv.innerHTML = `
            <input type="radio" name="shipping" value="${method.id}" ${selectedShipping && selectedShipping.id === method.id ? 'checked' : ''}>
            <div class="shipping-option-info">
                <div class="shipping-name">${method.name}</div>
                <div class="shipping-desc">${method.description}</div>
            </div>
            <div class="shipping-price">$${method.price.toLocaleString()}</div>
        `;
        optionDiv.addEventListener('click', () => {
            const radio = optionDiv.querySelector('input');
            radio.checked = true;
            selectedShipping = method;
            saveSelectedShipping();
            updateCart();
        });
        shippingOptionsDiv.appendChild(optionDiv);
    });
}

function updateCart() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        shippingSectionCart.style.display = 'none';
        cartSubtotal.textContent = '$0';
        cartShipping.textContent = '$0';
        cartTotalPrice.textContent = '$0';
    } else {
        emptyCart.style.display = 'none';
        shippingSectionCart.style.display = 'block';
        renderShippingOptions();
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-image"><i class="fas fa-car"></i></div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">$${item.price.toLocaleString()}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        document.querySelectorAll('.decrease').forEach(btn => btn.addEventListener('click', () => decreaseQuantity(btn.getAttribute('data-id'))));
        document.querySelectorAll('.increase').forEach(btn => btn.addEventListener('click', () => increaseQuantity(btn.getAttribute('data-id'))));
        document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-id'))));
    }
    
    const subtotal = getCartSubtotal();
    const shipping = getShippingPrice();
    const total = subtotal + shipping;
    
    cartSubtotal.textContent = `$${subtotal.toLocaleString()}`;
    cartShipping.textContent = `$${shipping.toLocaleString()}`;
    cartTotalPrice.textContent = `$${total.toLocaleString()}`;
}

function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) { if (item.quantity > 1) item.quantity -= 1; else removeFromCart(id); updateCart(); saveCartToLocalStorage(); }
}
function increaseQuantity(id) { const item = cart.find(item => item.id === id); if (item) { item.quantity += 1; updateCart(); saveCartToLocalStorage(); } }
function removeFromCart(id) { cart = cart.filter(item => item.id !== id); updateCart(); saveCartToLocalStorage(); }

function loadCars(filter = currentFilter, searchTerm = currentSearchTerm) {
    carsGrid.innerHTML = '';
    noResults.style.display = 'none';
    let filteredCars = filter === 'all' ? cars : cars.filter(car => car.category === filter);
    if (searchTerm) filteredCars = filteredCars.filter(car => car.name.toLowerCase().includes(searchTerm) || car.description.toLowerCase().includes(searchTerm));
    if (searchTerm) searchResultsInfo.textContent = filteredCars.length === 0 ? `No se encontraron autopartes para "${searchTerm}"` : `Se encontraron ${filteredCars.length} autopartes para "${searchTerm}"`;
    else searchResultsInfo.textContent = '';
    if (filteredCars.length === 0 && searchTerm) noResults.style.display = 'block';
    filteredCars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <div class="car-image"><img src="${car.image}" alt="${car.name}" loading="lazy"><div class="car-badge">${getCategoryName(car.category)}</div></div>
            <div class="car-details">
                <h3 class="car-name">${car.name}</h3>
                <p class="car-description">${car.description.substring(0, 80)}...</p>
                <div class="car-features"><div class="car-feature"><i class="fas fa-microchip"></i><span>${car.features.material || car.features.tipo || car.features.medida || 'Premium'}</span></div></div>
                <p class="car-price">$${car.price.toLocaleString()}</p>
                <button class="add-to-cart" data-id="${car.id}" data-name="${car.name}" data-price="${car.price}">Agregar al Carrito</button>
            </div>
        `;
        carCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart')) {
                showProductPage(car.id);
            }
        });
        carsGrid.appendChild(carCard);
    });
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = button.getAttribute('data-id'), name = button.getAttribute('data-name'), price = parseFloat(button.getAttribute('data-price'));
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) existingItem.quantity += 1;
            else cart.push({ id, name, price, quantity: 1 });
            updateCart();
            saveCartToLocalStorage();
            button.textContent = '¡Agregado!';
            setTimeout(() => button.textContent = 'Agregar al Carrito', 1500);
        });
    });
}

function performSearch() { currentSearchTerm = searchInput.value.trim().toLowerCase(); loadCars(currentFilter, currentSearchTerm); }

// ========== EVENT LISTENERS ==========
// Formulario de contacto
contactForm.addEventListener('submit', async (e) => { 
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        alert('Por favor, completa todos los campos');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Por favor, ingresa un correo electrónico válido');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    try {
        const result = await sendEmail(formData);
        
        if (result.success) {
            if (result.isMailto) {
                alert('Se abrirá tu cliente de correo para completar el envío');
            } else {
                alert('¡Gracias por tu mensaje! Te contactaremos a la brevedad.');
            }
            contactForm.reset();
        } else {
            alert('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Por favor, intenta más tarde.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Navegación
menuItems.forEach(item => item.addEventListener('click', () => switchTab(item.getAttribute('data-tab'))));
inicioTab.addEventListener('click', () => switchTab('inicio'));
verCatalogoBtn.addEventListener('click', (e) => { e.preventDefault(); switchTab('autos'); });
saberMasBtn.addEventListener('click', () => switchTab('nosotros'));
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') performSearch(); });
filterBtns.forEach(btn => btn.addEventListener('click', () => { filterBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentFilter = btn.getAttribute('data-filter'); loadCars(currentFilter, currentSearchTerm); }));

// Carrito
cartIcon.addEventListener('click', () => { cartModal.style.display = 'block'; overlay.style.display = 'block'; document.body.style.overflow = 'hidden'; });
closeCart.addEventListener('click', () => { cartModal.style.display = 'none'; overlay.style.display = 'none'; document.body.style.overflow = 'auto'; });
overlay.addEventListener('click', () => { cartModal.style.display = 'none'; overlay.style.display = 'none'; document.body.style.overflow = 'auto'; });

// Autenticación
authButtons.addEventListener('click', () => { authModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; });
closeAuth.addEventListener('click', () => { authModal.style.display = 'none'; document.body.style.overflow = 'auto'; });
authModal.addEventListener('click', (e) => { if (e.target === authModal) { authModal.style.display = 'none'; document.body.style.overflow = 'auto'; } });
authTabs.forEach(tab => tab.addEventListener('click', () => switchAuthTab(tab.getAttribute('data-tab'))));
showRegister.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('register'); });
showLogin.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('login'); });

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value, email = document.getElementById('register-email').value, password = document.getElementById('register-password').value, confirmPassword = document.getElementById('register-confirm-password').value;
    if (password !== confirmPassword) alert('Las contraseñas no coinciden');
    else if (password.length < 6) alert('La contraseña debe tener al menos 6 caracteres');
    else { const result = registerUser(name, email, password); alert(result.message); if (result.success) { registerForm.reset(); switchAuthTab('login'); } }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value, password = document.getElementById('login-password').value;
    const result = loginUser(email, password);
    alert(result.message);
    if (result.success) { loginForm.reset(); authModal.style.display = 'none'; document.body.style.overflow = 'auto'; }
});

logoutBtn.addEventListener('click', logoutUser);

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        if (!currentUser) alert('Por favor, inicia sesión para completar la compra');
        else if (!userProfile.banking.cardNumber) alert('Por favor, agrega tu información bancaria en Mi Perfil');
        else if (userProfile.addresses.length === 0) alert('Por favor, agrega una dirección de envío en Mi Perfil');
        else if (!selectedShipping) alert('Por favor, selecciona un método de envío');
        else {
            const primaryAddress = userProfile.addresses.find(a => a.isPrimary) || userProfile.addresses[0];
            alert(`¡Gracias por tu compra!\n\nSubtotal: $${getCartSubtotal().toLocaleString()}\nEnvío (${selectedShipping.name}): $${selectedShipping.price.toLocaleString()}\nTotal: $${getCartTotal().toLocaleString()}\n\nMétodo de pago: Tarjeta terminada en ${userProfile.banking.cardNumber.slice(-4)}\nDirección de envío: ${primaryAddress.street}, ${primaryAddress.colony}, ${primaryAddress.city}, ${primaryAddress.state}, CP ${primaryAddress.zip}\nTiempo de entrega: ${selectedShipping.days} días hábiles`);
            cart = []; selectedShipping = null; localStorage.removeItem('carMasterSelectedShipping'); updateCart(); saveCartToLocalStorage(); cartModal.style.display = 'none'; overlay.style.display = 'none'; document.body.style.overflow = 'auto';
        }
    }
});

// Footer links
document.querySelectorAll('.footer-links a[data-tab]').forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); switchTab(link.getAttribute('data-tab')); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
document.querySelector('.newsletter-form').addEventListener('submit', (e) => { e.preventDefault(); alert(`¡Gracias por suscribirte con el correo: ${e.target.querySelector('input[type="email"]').value}!`); e.target.reset(); });

// Profile tabs
document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.profile-section-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.getAttribute('data-profile-tab')}-section`).classList.add('active');
    });
});

// Menú móvil
menuToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMobileMenu(); });
document.addEventListener('click', (e) => { if (window.innerWidth <= 768 && mainMenu.classList.contains('active') && !mainMenu.contains(e.target) && !menuToggle.contains(e.target)) closeMobileMenu(); });
document.querySelectorAll('.main-menu li[data-tab], .main-menu a').forEach(item => item.addEventListener('click', () => { if (window.innerWidth <= 768 && mainMenu.classList.contains('active')) closeMobileMenu(); }));
window.addEventListener('resize', () => { if (window.innerWidth > 768) { mainMenu.style.display = ''; mainMenu.classList.remove('active'); mainMenu.style.maxHeight = ''; menuIcon.classList.remove('fa-times'); menuIcon.classList.add('fa-bars'); } else if (!mainMenu.classList.contains('active')) { mainMenu.style.display = 'none'; mainMenu.style.maxHeight = '0'; } else { mainMenu.style.display = 'block'; mainMenu.style.maxHeight = mainMenu.scrollHeight + 'px'; } });

// ========== INICIALIZACIÓN ==========
function init() {
    loadCartFromLocalStorage();
    loadCars();
    currentUser = loadCurrentUserFromLocalStorage();
    if (currentUser) loadUserProfileFromLocalStorage();
    loadSelectedShipping();
    updateAuthUI();
    initCarousel();
    if (window.innerWidth <= 768) { mainMenu.style.display = 'none'; mainMenu.style.maxHeight = '0'; }
}

init();

// Firebase (opcional - si decides usarlo más adelante)
try {
    if (typeof firebase !== 'undefined') {
        console.log('Firebase disponible para integración futura');
    }
} catch(e) {
    console.log('Firebase no configurado');
}