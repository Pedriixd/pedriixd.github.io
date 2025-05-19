// Datos de la galería (en un proyecto real, estos vendrían de una base de datos o API)
const galleryImages = [
    'https://via.placeholder.com/150?text=Sticker1',
    'https://via.placeholder.com/150?text=Sticker2',
    'https://via.placeholder.com/150?text=Sticker3',
    'https://via.placeholder.com/150?text=Sticker4',
    'https://via.placeholder.com/150?text=Sticker5',
    'https://via.placeholder.com/150?text=Sticker6',
    // Nota: Aquí se podrían agregar más imágenes del Google Drive
    // Para una implementación real, se necesitaría un método para cargar imágenes 
    // desde Google Drive usando su API o una lista de URLs directas
];

// Configuración de tamaños y precios
const sizeConfig = {
    small: { 
        width: 320, 
        height: 420, 
        maxStickers5cm: 5, 
        maxStickers7cm: 3, 
        label: '12×16 cm',
        price: 1000
    },
    medium: { 
        width: 380, 
        height: 570, 
        maxStickers5cm: 9, 
        maxStickers7cm: 6, 
        label: '14×21 cm',
        price: 1500
    },
    large: { 
        width: 560, 
        height: 720, 
        maxStickers5cm: 19, 
        maxStickers7cm: 12, 
        label: '21×27 cm',
        price: 3000
    }
};

// Variables globales
let currentSize = 'small';
let currentStickerSize = '5cm'; // Por defecto 5cm
let stickers = [];
let selectedSticker = null;
let isDragging = false;
let offsetX, offsetY;
let stickerCounter = 0;

// Elementos DOM
const canvas = document.getElementById('sticker-canvas');
const uploadInput = document.getElementById('upload-input');
const galleryContainer = document.querySelector('.gallery');
const sizeButtons = document.querySelectorAll('.size-btn');
const stickerSizeButtons = document.querySelectorAll('.sticker-size-btn');
const currentCountEl = document.getElementById('current-count');
const maxCountEl = document.getElementById('max-count');
const clearBtn = document.getElementById('clear-btn');
const shareBtn = document.getElementById('share-btn');
const instagramBtn = document.getElementById('instagram-btn');
const currentPriceEl = document.getElementById('current-price');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const startEditingBtn = document.getElementById('start-editing');

// Aplicar tema de colores verde agua y blanco
function applyThemeColors() {
    // Agregar estilos directamente a la página
    const style = document.createElement('style');
    style.textContent = `
        body {
            background-color: #e8f8f5; /* Verde agua muy claro */
            color: #1a5952; /* Verde oscuro para texto */
        }
        .header, .footer {
            background-color: #5dbeae; /* Verde agua */
            color: white;
        }
        .btn, button {
            background-color: #5dbeae; /* Verde agua */
            color: white;
            border: none;
            transition: all 0.3s ease;
        }
        .btn:hover, button:hover {
            background-color: #48a798; /* Verde agua un poco más oscuro */
        }
        .btn.active, button.active {
            background-color: #3d8f85; /* Verde agua más oscuro para botones activos */
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
        #sticker-canvas {
            background-color: white;
            border: 2px solid #5dbeae; /* Borde verde agua */
        }
        .panel {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(93, 190, 174, 0.1);
        }
        .price-tag {
            background-color: #5dbeae;
            color: white;
            padding: 5px 10px;
            border-radius: 12px;
            font-weight: bold;
        }
        .sticker-size-btn.active {
            background-color: #3d8f85;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar la aplicación
function init() {
    applyThemeColors();
    loadGallery();
    updateStickersCount();
    updateMaxStickersCount();
    updateCurrentPrice();
    setupEventListeners();
    
    // Mostrar tutorial solo la primera vez (en un proyecto real usaríamos localStorage)
    // localStorage.getItem('tutorialShown') === null ? showTutorial() : hideTutorial();
    showTutorial(); // Por ahora siempre mostramos el tutorial
}

// Cargar imágenes de la galería
function loadGallery() {
    galleryImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gallery-img';
        img.addEventListener('click', () => addStickerFromGallery(src));
        galleryContainer.appendChild(img);
    });
}

// Configurar eventos
function setupEventListeners() {
    // Eventos de tamaño
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => changeCanvasSize(btn.getAttribute('data-size')));
    });

    // Eventos de tamaño de sticker
    stickerSizeButtons.forEach(btn => {
        btn.addEventListener('click', () => changeStickerSize(btn.getAttribute('data-sticker-size')));
    });

    // Eventos de carga de imágenes
    uploadInput.addEventListener('change', handleImageUpload);

    // Eventos de botones de acción
    clearBtn.addEventListener('click', clearCanvas);
    shareBtn.addEventListener('click', shareDesignWhatsApp);
    if (instagramBtn) {
        instagramBtn.addEventListener('click', shareDesignInstagram);
    }

    // Eventos de tutorial
    startEditingBtn.addEventListener('click', hideTutorial);

    // Eventos del canvas para interacción con stickers
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    // Eventos táctiles para dispositivos móviles
    canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
    document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
    document.addEventListener('touchend', handleDocumentTouchEnd);
}

// Cambiar tamaño del canvas
function changeCanvasSize(size) {
    if (!sizeConfig[size]) return;
    
    currentSize = size;
    
    // Actualizar clase del canvas
    canvas.className = '';
    canvas.classList.add(size);
    
    // Actualizar botones
    sizeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-size') === size) {
            btn.classList.add('active');
        }
    });
    
    // Ajustar posición de los stickers existentes al nuevo tamaño
    repositionStickers();
    
    // Actualizar contadores y precio
    updateMaxStickersCount();
    updateCurrentPrice();
    
    // Ocultar mensaje si hay stickers
    updateCanvasMessage();
}

// Cambiar tamaño de los stickers
function changeStickerSize(size) {
    if (size !== '5cm' && size !== '7cm') return;
    
    currentStickerSize = size;
    
    // Actualizar botones
    stickerSizeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-sticker-size') === size) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar contador máximo de stickers
    updateMaxStickersCount();
}

// Actualizar precio actual
function updateCurrentPrice() {
    if (currentPriceEl) {
        currentPriceEl.textContent = `$${sizeConfig[currentSize].price}`;
    }
}

// Reposicionar stickers al cambiar tamaño
function repositionStickers() {
    const stickersElements = document.querySelectorAll('.sticker');
    stickersElements.forEach(sticker => {
        const rect = sticker.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        let left = parseFloat(sticker.style.left) || 0;
        let top = parseFloat(sticker.style.top) || 0;
        
        // Asegurar que no se salga del canvas
        left = Math.min(Math.max(0, left), canvasRect.width - rect.width);
        top = Math.min(Math.max(0, top), canvasRect.height - rect.height);
        
        sticker.style.left = left + 'px';
        sticker.style.top = top + 'px';
    });
}

// Manejar carga de imágenes
function handleImageUpload(e) {
    const files = e.target.files;
    
    // Verificar si se pueden añadir más stickers
    if (stickers.length >= getMaxStickersForCurrentSize()) {
        alert(`Has alcanzado el límite de ${getMaxStickersForCurrentSize()} stickers para este tamaño y tipo de sticker`);
        return;
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            addNewSticker(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    // Limpiar input para permitir subir la misma imagen
    uploadInput.value = '';
}

// Obtener máximo de stickers según tamaño y tipo de sticker actual
function getMaxStickersForCurrentSize() {
    const sizeInfo = sizeConfig[currentSize];
    return currentStickerSize === '5cm' ? sizeInfo.maxStickers5cm : sizeInfo.maxStickers7cm;
}

// Añadir sticker desde la galería
function addStickerFromGallery(src) {
    // Verificar si se pueden añadir más stickers
    if (stickers.length >= getMaxStickersForCurrentSize()) {
        alert(`Has alcanzado el límite de ${getMaxStickersForCurrentSize()} stickers para este tamaño y tipo de sticker`);
        return;
    }
    
    addNewSticker(src);
}

// Añadir nuevo sticker
function addNewSticker(src) {
    const id = 'sticker-' + (stickerCounter++);
    
    // Crear elemento sticker
    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    sticker.classList.add(currentStickerSize); // Añadir clase según tamaño
    sticker.id = id;
    
    // Posición aleatoria dentro del canvas
    const canvasRect = canvas.getBoundingClientRect();
    const left = Math.random() * (canvasRect.width - 100);
    const top = Math.random() * (canvasRect.height - 100);
    
    sticker.style.left = left + 'px';
    sticker.style.top = top + 'px';
    
    // Crear imagen
    const img = document.createElement('img');
    img.src = src;
    sticker.appendChild(img);
    
    // Añadir controles
    const controls = document.createElement('div');
    controls.className = 'controls';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'control-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', () => removeSticker(id));
    controls.appendChild(deleteBtn);
    
    sticker.appendChild(controls);
    
    // Añadir al canvas
    canvas.appendChild(sticker);
    
    // Guardar referencia
    stickers.push({
        id,
        element: sticker,
        size: currentStickerSize
    });
    
    // Actualizar contadores y mensaje
    updateStickersCount();
    updateCanvasMessage();
    
    // Seleccionar el nuevo sticker
    selectSticker(sticker);
}

// Remover sticker
function removeSticker(id) {
    const stickerElement = document.getElementById(id);
    if (stickerElement) {
        canvas.removeChild(stickerElement);
        stickers = stickers.filter(s => s.id !== id);
        updateStickersCount();
        updateCanvasMessage();
        
        // Si el que se elimina estaba seleccionado
        if (selectedSticker && selectedSticker.id === id) {
            selectedSticker = null;
        }
    }
}

// Seleccionar sticker
function selectSticker(element) {
    // Deseleccionar el anterior
    if (selectedSticker) {
        selectedSticker.element.classList.remove('selected');
    }
    
    // Seleccionar el nuevo
    if (element) {
        element.classList.add('selected');
        // Traer al frente
        canvas.appendChild(element);
        
        selectedSticker = stickers.find(s => s.id === element.id);
    } else {
        selectedSticker = null;
    }
}

// Actualizar contador de stickers
function updateStickersCount() {
    currentCountEl.textContent = stickers.length;
}

// Actualizar contador máximo según tamaño
function updateMaxStickersCount() {
    maxCountEl.textContent = getMaxStickersForCurrentSize();
}

// Actualizar mensaje del canvas
function updateCanvasMessage() {
    const message = document.querySelector('.canvas-message');
    if (stickers.length > 0) {
        message.style.display = 'none';
    } else {
        message.style.display = 'flex';
    }
}

// Limpiar canvas
function clearCanvas() {
    if (stickers.length === 0) return;
    
    if (confirm('¿Estás seguro de querer eliminar todos los stickers?')) {
        stickers.forEach(sticker => {
            if (sticker.element.parentNode === canvas) {
                canvas.removeChild(sticker.element);
            }
        });
        
        stickers = [];
        selectedSticker = null;
        updateStickersCount();
        updateCanvasMessage();
    }
}

// Compartir diseño por WhatsApp
function shareDesignWhatsApp() {
    if (stickers.length === 0) {
        alert('Añade algunos stickers antes de compartir');
        return;
    }
    
    // En un proyecto real, aquí iría código para generar una imagen del canvas
    // y exportar a PowerPoint, pero vamos a simplificarlo para la demo
    
    const size = sizeConfig[currentSize].label;
    const price = sizeConfig[currentSize].price;
    const stickerSize = currentStickerSize;
    const stickerCount = stickers.length;
    
    // Mensaje para enviar
    const message = encodeURIComponent(`Hola! Quiero hacer un pedido de una plancha de stickers de ${size} con ${stickerCount} stickers de ${stickerSize}. El precio es $${price}.`);
    
    // Redirigir a WhatsApp con el número especificado
    window.open(`https://wa.me/543755298440?text=${message}`);
}

// Compartir/Redirigir a Instagram
function shareDesignInstagram() {
    window.open('https://www.instagram.com/pedriixd.alvez?igsh=MWxyYnY2d2ZjY3k5dw==');
}

// Mostrar tutorial
function showTutorial() {
    tutorialOverlay.style.display = 'flex';
}

// Ocultar tutorial
function hideTutorial() {
    tutorialOverlay.style.display = 'none';
    // En un proyecto real:
    // localStorage.setItem('tutorialShown', 'true');
}

// Manejo de eventos de ratón
function handleCanvasMouseDown(e) {
    const target = e.target.closest('.sticker');
    
    if (target) {
        e.preventDefault();
        
        // Seleccionar sticker
        selectSticker(target);
        
        // Iniciar arrastre
        isDragging = true;
        
        const rect = target.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    } else {
        // Clic en área vacía, deseleccionar
        selectSticker(null);
    }
}

function handleDocumentMouseMove(e) {
    if (!isDragging || !selectedSticker) return;
    
    e.preventDefault();
    moveSelectedSticker(e.clientX, e.clientY);
}

function handleDocumentMouseUp() {
    isDragging = false;
}

// Manejo de eventos táctiles
function handleCanvasTouchStart(e) {
    const target = e.target.closest('.sticker');
    
    if (target) {
        e.preventDefault(); // Prevenir scroll
        
        // Seleccionar sticker
        selectSticker(target);
        
        // Iniciar arrastre
        isDragging = true;
        
        const touch = e.touches[0];
        const rect = target.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
    }
}

function handleDocumentTouchMove(e) {
    if (!isDragging || !selectedSticker) return;
    
    e.preventDefault(); // Prevenir scroll durante el arrastre
    
    const touch = e.touches[0];
    moveSelectedSticker(touch.clientX, touch.clientY);
}

function handleDocumentTouchEnd() {
    isDragging = false;
}

// Mover el sticker seleccionado
function moveSelectedSticker(clientX, clientY) {
    const element = selectedSticker.element;
    const canvasRect = canvas.getBoundingClientRect();
    const stickerRect = element.getBoundingClientRect();
    
    // Calcular nueva posición relativa al canvas
    let left = clientX - canvasRect.left - offsetX;
    let top = clientY - canvasRect.top - offsetY;
    
    // Restringir al área del canvas
    left = Math.max(0, Math.min(left, canvasRect.width - stickerRect.width));
    top = Math.max(0, Math.min(top, canvasRect.height - stickerRect.height));
    
    // Aplicar nueva posición
    element.style.left = left + 'px';
    element.style.top = top + 'px';
}

// Iniciar aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);
