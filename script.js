document.addEventListener('DOMContentLoaded', function() {
  // Initialize application
  initApp();
});

function initApp() {
  // Setup navigation
  setupNavigation();
  
  // Setup customization section
  setupCustomization();
  
  // Setup gallery section
  setupGallery();
  
  // Setup preview modal
  setupPreviewModal();
  
  // Load stickers from local storage (if any)
  loadSavedDesign();
}

// Navigation functionality
function setupNavigation() {
  const sections = {
    'welcome': document.getElementById('welcome-section'),
    'customize': document.getElementById('customize-section'),
    'gallery': document.getElementById('gallery-section'),
    'pricing': document.getElementById('pricing-section')
  };
  
  const navButtons = [
    // Desktop nav
    { id: 'btn-customize', section: 'customize' },
    { id: 'btn-gallery', section: 'gallery' },
    { id: 'btn-pricing', section: 'pricing' },
    // Mobile nav
    { id: 'btn-customize-mobile', section: 'customize' },
    { id: 'btn-gallery-mobile', section: 'gallery' },
    { id: 'btn-pricing-mobile', section: 'pricing' },
    // Welcome page buttons
    { id: 'welcome-customize-btn', section: 'customize' },
    { id: 'welcome-gallery-btn', section: 'gallery' },
    { id: 'welcome-pricing-btn', section: 'pricing' }
  ];
  
  // Add event listeners to all nav buttons
  navButtons.forEach(button => {
    const element = document.getElementById(button.id);
    if (element) {
      element.addEventListener('click', () => showSection(button.section));
    }
  });
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });
  
  // Function to show a specific section
  function showSection(sectionName) {
    // Hide all sections
    Object.values(sections).forEach(section => {
      section.classList.remove('active');
    });
    
    // Show selected section
    sections[sectionName].classList.add('active');
    
    // Update nav button styling
    const allNavButtons = document.querySelectorAll('.btn-nav');
    allNavButtons.forEach(btn => btn.classList.remove('active'));
    
    document.querySelectorAll(`#btn-${sectionName}, #btn-${sectionName}-mobile`).forEach(btn => {
      if (btn) btn.classList.add('active');
    });
    
    // Close mobile menu
    mobileMenu.classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Pricing buttons to customization
  const selectSizeBtns = document.querySelectorAll('.select-size-btn');
  selectSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showSection('customize');
      
      // Select the corresponding size after a short delay
      setTimeout(() => {
        const sizeId = btn.getAttribute('data-size');
        const sizeCard = document.getElementById(`size-${sizeId}`);
        if (sizeCard) {
          sizeCard.click();
        }
      }, 300);
    });
  });
}

// Customization section functionality
function setupCustomization() {
  // State variables
  let selectedSize = null;
  let selectedStickerSize = '5'; // Default is 5cm
  let stickerCount = 0;
  let maxStickers = 0;
  
  // Elements
  const sizeCards = document.querySelectorAll('.size-card');
  const canvasContainer = document.getElementById('canvas-container');
  const canvasWrapper = document.getElementById('canvas-container-wrapper');
  const canvasActions = document.getElementById('canvas-actions');
  const stickerCountElement = document.getElementById('sticker-count').querySelector('span');
  const maxStickersElement = document.getElementById('max-stickers');
  const stickerSizeBtns = document.querySelectorAll('.btn-sticker-size');
  const clearCanvasBtn = document.getElementById('clear-canvas');
  const uploadStickerInput = document.getElementById('upload-sticker');
  const btnPreview = document.getElementById('btn-preview');
  const btnDownload = document.getElementById('btn-download');
  const btnWhatsapp = document.getElementById('btn-whatsapp');
  
  // Size card selection
  sizeCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected class from all cards
      sizeCards.forEach(c => c.classList.remove('selected'));
      
      // Add selected class to clicked card
      card.classList.add('selected');
      selectedSize = card.id;
      
      // Show canvas and actions
      canvasWrapper.classList.remove('hidden');
      canvasActions.classList.remove('hidden');
      
      // Update max stickers based on selected size and sticker size
      updateMaxStickers();
      
      // Load stickers
      loadStickers();
      
      // Save selection to local storage
      saveDesignState();
    });
  });
  
  // Sticker size selection
  stickerSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stickerSizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStickerSize = btn.getAttribute('data-size');
      
      // Update max stickers based on new size
      updateMaxStickers();
      
      // Update sticker selector
      loadStickers();
      
      // Save selection to local storage
      saveDesignState();
    });
  });
  
  // Clear canvas
  clearCanvasBtn.addEventListener('click', () => {
    // Remove all stickers from canvas
    while (canvasContainer.firstChild) {
      canvasContainer.removeChild(canvasContainer.firstChild);
    }
    
    // Reset sticker count
    stickerCount = 0;
    stickerCountElement.textContent = '0';
    
    // Save to local storage
    saveDesignState();
  });
  
  // Upload custom sticker
  uploadStickerInput.addEventListener('change', handleStickerUpload);
  
  // Preview button
  btnPreview.addEventListener('click', showPreview);
  
  // Download button
  btnDownload.addEventListener('click', exportToPowerPoint);
  
  // WhatsApp button (update with canvas snapshot)
  btnWhatsapp.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Capture canvas as image
    html2canvas(canvasContainer).then(canvas => {
      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');
      
      // Save to local storage for use in WhatsApp
      localStorage.setItem('stickerSheetImage', imageData);
      
      // Open WhatsApp with message
      const whatsappUrl = `https://wa.me/543755298440?text=Hola,%20acá%20está%20mi%20diseño%20de%20plancha%20personalizada.`;
      window.open(whatsappUrl, '_blank');
    });
  });
  
  // Update max stickers based on selected size and sticker size
  function updateMaxStickers() {
    if (!selectedSize) return;
    
    const sizeCard = document.querySelector(`#${selectedSize}`);
    if (!sizeCard) return;
    
    // Get max stickers attribute based on selected sticker size
    maxStickers = parseInt(sizeCard.getAttribute(`data-max-stickers-${selectedStickerSize}cm`), 10) || 0;
    maxStickersElement.textContent = maxStickers;
  }
  
  // Load stickers into selector
  function loadStickers() {
    const stickerSelector = document.getElementById('sticker-selector');
    stickerSelector.innerHTML = '';
    
    // Default sticker images based on categories
    const stickerImages = {
      'mates': [
        'https://pixabay.com/get/g78c1318b643e4d0f5d811c93668e542453be672960615dfcac95031f3cfb9e981a6e4efabae6ade659ba1f47ccb6756478d37edd698f408e6d484e63ad44a1b5_1280.jpg',
        'https://pixabay.com/get/gebda78397584c7bcce640c6cecbffbd1d971ee7d79ab15bd1e3e303c5a0cfa0dee3e3f80bebffd5991dcc57d6543cbeee7485902b9e42348c306e4788849f3d2_1280.jpg',
        'https://pixabay.com/get/gcd090a2b109251b5b77e053cbce51290fa8adb7206e4f295576add1e56eb61c74fd9dacfc7c60941ab5e3c530be428240abf584955ba6da67e57db1bba6c6c0e_1280.jpg',
        'https://pixabay.com/get/g6d88f335c58bb2a179d5d3300deb48f854fed89332a9300e7c8d769c5da08f31fdf2a8fbc9c2ddd0ec45f25dca636aa2d9520105043fad8949ee6b8ad2a9157b_1280.jpg'
      ],
      'computadoras': [
        'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
        'https://images.unsplash.com/photo-1542393545-10f5cde2c810?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
        'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
        'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300'
      ],
      'personajes': [
        'https://images.unsplash.com/photo-1608889175123-8ee362201f81?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
        'https://images.unsplash.com/photo-1535241749838-299277b6305f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
        'https://pixabay.com/get/g4d0de0b1dd4c84f27fa6134e89a91ec889d47e1f69051a74f94f5d9c7c5a580a2dfe4583e3fe85a095702f7d2e64e7da1d3de41ecb4a59bc84e44ab9f3b07e72_1280.jpg',
        'https://pixabay.com/get/g7d45b00626c3bd25f1c2ef3b28145cdb14e2a3bca7c6de4c15e78c2bdf5f9f9b2fb5f96bd731eadbd5842fd0aae4cd3f9fdc3b2b51f3f4f54dafd2c9e65eb5a3_1280.jpg'
      ]
    };
    
    // Add stickers from all categories
    Object.values(stickerImages).forEach(category => {
      category.forEach(imgSrc => {
        createStickerItem(stickerSelector, imgSrc);
      });
    });
    
    // Add custom stickers from local storage
    const customStickers = JSON.parse(localStorage.getItem('customStickers') || '[]');
    customStickers.forEach(stickerData => {
      createStickerItem(stickerSelector, stickerData);
    });
  }
  
  // Create sticker item in selector
  function createStickerItem(selectorContainer, imgSrc) {
    const stickerItem = document.createElement('div');
    stickerItem.className = 'sticker-item';
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = 'Sticker';
    stickerItem.appendChild(img);
    
    // Click to add sticker to canvas
    stickerItem.addEventListener('click', () => {
      addStickerToCanvas(imgSrc);
    });
    
    selectorContainer.appendChild(stickerItem);
  }
  
  // Add sticker to canvas
  function addStickerToCanvas(imgSrc) {
    if (stickerCount >= maxStickers) {
      alert(`Has alcanzado el límite máximo de ${maxStickers} stickers para este tamaño.`);
      return;
    }
    
    // Create sticker element
    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    
    // Set size based on selected sticker size
    const size = selectedStickerSize === '5' ? 70 : 98; // 5cm = 70px, 7cm = 98px
    sticker.style.width = `${size}px`;
    sticker.style.height = `${size}px`;
    
    // Set random position within canvas
    const maxX = canvasContainer.clientWidth - size;
    const maxY = canvasContainer.clientHeight - size;
    const posX = Math.max(0, Math.floor(Math.random() * maxX));
    const posY = Math.max(0, Math.floor(Math.random() * maxY));
    
    sticker.style.left = `${posX}px`;
    sticker.style.top = `${posY}px`;
    
    // Create image
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '4px';
    sticker.appendChild(img);
    
    // Make sticker draggable
    makeElementDraggable(sticker);
    
    // Add to canvas
    canvasContainer.appendChild(sticker);
    stickerCount++;
    stickerCountElement.textContent = stickerCount;
    
    // Save to local storage
    saveDesignState();
  }
  
  // Handle sticker upload
  function handleStickerUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgSrc = e.target.result;
      
      // Add to custom stickers
      const customStickers = JSON.parse(localStorage.getItem('customStickers') || '[]');
      customStickers.push(imgSrc);
      localStorage.setItem('customStickers', JSON.stringify(customStickers));
      
      // Add to canvas and selector
      addStickerToCanvas(imgSrc);
      createStickerItem(document.getElementById('sticker-selector'), imgSrc);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  }
  
  // Make an element draggable
  function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.addEventListener('mousedown', dragMouseDown);
    element.addEventListener('touchstart', dragTouchStart, { passive: false });
    
    function dragMouseDown(e) {
      e.preventDefault();
      
      // Get mouse position
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Add dragging class
      element.classList.add('sticker-dragging');
      
      // Move to front
      canvasContainer.appendChild(element);
      
      // Add event listeners
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }
    
    function dragTouchStart(e) {
      e.preventDefault();
      
      // Get touch position
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      // Add dragging class
      element.classList.add('sticker-dragging');
      
      // Move to front
      canvasContainer.appendChild(element);
      
      // Add event listeners
      document.addEventListener('touchend', closeDragElement);
      document.addEventListener('touchcancel', closeDragElement);
      document.addEventListener('touchmove', elementTouchDrag, { passive: false });
    }
    
    function elementDrag(e) {
      e.preventDefault();
      
      // Calculate new position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Set element's new position, ensuring it stays within the canvas
      const newTop = Math.max(0, Math.min(element.offsetTop - pos2, canvasContainer.clientHeight - element.offsetHeight));
      const newLeft = Math.max(0, Math.min(element.offsetLeft - pos1, canvasContainer.clientWidth - element.offsetWidth));
      
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }
    
    function elementTouchDrag(e) {
      e.preventDefault();
      
      // Calculate new position
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      // Set element's new position, ensuring it stays within the canvas
      const newTop = Math.max(0, Math.min(element.offsetTop - pos2, canvasContainer.clientHeight - element.offsetHeight));
      const newLeft = Math.max(0, Math.min(element.offsetLeft - pos1, canvasContainer.clientWidth - element.offsetWidth));
      
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }
    
    function closeDragElement() {
      // Remove event listeners
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('touchend', closeDragElement);
      document.removeEventListener('touchcancel', closeDragElement);
      document.removeEventListener('touchmove', elementTouchDrag);
      
      // Remove dragging class
      element.classList.remove('sticker-dragging');
      
      // Save the state
      saveDesignState();
    }
  }
  
  // Show preview modal
  function showPreview() {
    if (!selectedSize) {
      alert('Por favor, selecciona un tamaño de plancha primero.');
      return;
    }
    
    const previewModal = document.getElementById('preview-modal');
    const previewContainer = document.getElementById('preview-container');
    const previewSize = document.getElementById('preview-size');
    const previewStickerCount = document.getElementById('preview-sticker-count');
    const previewPrice = document.getElementById('preview-price');
    
    // Clear previous preview
    previewContainer.innerHTML = '';
    
    // Clone canvas content to preview
    const stickers = canvasContainer.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
      const clone = sticker.cloneNode(true);
      previewContainer.appendChild(clone);
    });
    
    // Update preview details
    updatePreviewDetails();
    
    // Show modal
    previewModal.classList.add('active');
  }
  
  // Update preview details
  function updatePreviewDetails() {
    const selectedSizeCard = document.querySelector('.size-card.selected');
    if (!selectedSizeCard) return;
    
    const sizeName = selectedSizeCard.querySelector('h4').textContent;
    const price = selectedSizeCard.getAttribute('data-price');
    
    document.getElementById('preview-size').textContent = sizeName;
    document.getElementById('preview-sticker-count').textContent = stickerCount;
    document.getElementById('preview-price').textContent = `$${price}`;
    
    // Update WhatsApp link with details
    const whatsappLink = document.getElementById('preview-whatsapp');
    const message = `Hola, acá está mi diseño de plancha personalizada.%0A%0ATamaño: ${sizeName}%0ACantidad de stickers: ${stickerCount}%0APrecio: $${price}`;
    whatsappLink.href = `https://wa.me/543755298440?text=${message}`;
  }
  
  // Export to PowerPoint
  function exportToPowerPoint() {
    if (!selectedSize) {
      alert('Por favor, selecciona un tamaño de plancha primero.');
      return;
    }
    
    // Create new PowerPoint
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    
    // Get size information
    const selectedSizeCard = document.querySelector('.size-card.selected');
    const sizeText = selectedSizeCard.querySelector('h4').textContent;
    const price = selectedSizeCard.getAttribute('data-price');
    
    // Add title
    slide.addText('Diseño de Plancha de Stickers PEDRIIXD', {
      x: 0.5,
      y: 0.5,
      fontSize: 24,
      bold: true,
      color: '4ECDC4'
    });
    
    // Add details
    slide.addText([
      { text: `Tamaño: ${sizeText}`, options: { breakLine: true } },
      { text: `Cantidad de stickers: ${stickerCount}`, options: { breakLine: true } },
      { text: `Precio: $${price}`, options: { breakLine: true } }
    ], {
      x: 0.5,
      y: 1.2,
      fontSize: 14
    });
    
    // Capture canvas as image
    html2canvas(canvasContainer).then(canvas => {
      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');
      
      // Add canvas image to slide
      slide.addImage({
        data: imageData,
        x: 1,
        y: 2,
        w: 8,
        h: 4
      });
      
      // Add footer
      slide.addText('www.pedriixd.github.io', {
        x: 0.5,
        y: 6.5,
        fontSize: 10,
        color: '666666'
      });
      
      // Save the PowerPoint
      pptx.writeFile({ fileName: 'PEDRIIXD-Stickers.pptx' });
    });
  }
  
  // Save design state to local storage
  function saveDesignState() {
    if (!selectedSize) return;
    
    const designState = {
      selectedSize,
      selectedStickerSize,
      stickers: []
    };
    
    // Save sticker information
    const stickers = canvasContainer.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
      const img = sticker.querySelector('img');
      designState.stickers.push({
        src: img.src,
        top: sticker.style.top,
        left: sticker.style.left,
        width: sticker.style.width,
        height: sticker.style.height
      });
    });
    
    localStorage.setItem('currentDesign', JSON.stringify(designState));
  }
}

// Gallery Section functionality
function setupGallery() {
  const galleryContainer = document.querySelector('.sticker-gallery');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const uploadGalleryInput = document.getElementById('upload-gallery-sticker');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  let currentCategory = 'all';
  let page = 1;
  
  // Category filter
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentCategory = btn.getAttribute('data-category');
      page = 1;
      
      // Reset gallery and load stickers for selected category
      galleryContainer.innerHTML = '';
      loadStickers(currentCategory);
    });
  });
  
  // Upload gallery sticker
  uploadGalleryInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgSrc = e.target.result;
      
      // Add to custom stickers
      const customStickers = JSON.parse(localStorage.getItem('customStickers') || '[]');
      customStickers.push(imgSrc);
      localStorage.setItem('customStickers', JSON.stringify(customStickers));
      
      // Add to gallery
      addStickerToGallery(imgSrc, 'Mi sticker', 'custom');
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  });
  
  // Load more button
  loadMoreBtn.addEventListener('click', () => {
    page++;
    loadStickers(currentCategory);
  });
  
  // Initial load
  loadStickers();
  
  // Load stickers function
  function loadStickers(category = 'all') {
    // Default sticker images based on categories
    const stickerImages = {
      'mates': [
        { src: 'https://pixabay.com/get/g78c1318b643e4d0f5d811c93668e542453be672960615dfcac95031f3cfb9e981a6e4efabae6ade659ba1f47ccb6756478d37edd698f408e6d484e63ad44a1b5_1280.jpg', title: 'Mate Tradicional' },
        { src: 'https://pixabay.com/get/gebda78397584c7bcce640c6cecbffbd1d971ee7d79ab15bd1e3e303c5a0cfa0dee3e3f80bebffd5991dcc57d6543cbeee7485902b9e42348c306e4788849f3d2_1280.jpg', title: 'Mate con Bombilla' },
        { src: 'https://pixabay.com/get/gcd090a2b109251b5b77e053cbce51290fa8adb7206e4f295576add1e56eb61c74fd9dacfc7c60941ab5e3c530be428240abf584955ba6da67e57db1bba6c6c0e_1280.jpg', title: 'Set de Mate' },
        { src: 'https://pixabay.com/get/g6d88f335c58bb2a179d5d3300deb48f854fed89332a9300e7c8d769c5da08f31fdf2a8fbc9c2ddd0ec45f25dca636aa2d9520105043fad8949ee6b8ad2a9157b_1280.jpg', title: 'Mate Argentino' }
      ],
      'computadoras': [
        { src: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300', title: 'Computadora 1' },
        { src: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300', title: 'Código' },
        { src: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300', title: 'Laptop' },
        { src: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300', title: 'Teclado' }
      ],
      'personajes': [
        { src: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300', title: 'Personaje 1' },
        { src: 'https://images.unsplash.com/photo-1535241749838-299277b6305f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300', title: 'Personaje 2' },
        { src: 'https://pixabay.com/get/g4d0de0b1dd4c84f27fa6134e89a91ec889d47e1f69051a74f94f5d9c7c5a580a2dfe4583e3fe85a095702f7d2e64e7da1d3de41ecb4a59bc84e44ab9f3b07e72_1280.jpg', title: 'Personaje 3' },
        { src: 'https://pixabay.com/get/g7d45b00626c3bd25f1c2ef3b28145cdb14e2a3bca7c6de4c15e78c2bdf5f9f9b2fb5f96bd731eadbd5842fd0aae4cd3f9fdc3b2b51f3f4f54dafd2c9e65eb5a3_1280.jpg', title: 'Personaje 4' }
      ]
    };
    
    let stickersToShow = [];
    
    if (category === 'all') {
      // Combine all categories
      Object.values(stickerImages).forEach(categoryStickers => {
        stickersToShow = stickersToShow.concat(categoryStickers);
      });
    } else if (stickerImages[category]) {
      stickersToShow = stickerImages[category];
    }
    
    // Add custom stickers
    if (category === 'all' || category === 'custom') {
      const customStickers = JSON.parse(localStorage.getItem('customStickers') || '[]');
      const customStickerObjects = customStickers.map(src => ({ src, title: 'Mi sticker', category: 'custom' }));
      stickersToShow = stickersToShow.concat(customStickerObjects);
    }
    
    // Pagination - show 8 stickers per page
    const itemsPerPage = 8;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedStickers = stickersToShow.slice(start, end);
    
    // Show or hide load more button
    if (end >= stickersToShow.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
    
    // Add stickers to gallery
    paginatedStickers.forEach(sticker => {
      addStickerToGallery(sticker.src, sticker.title, category);
    });
  }
  
  // Add sticker to gallery
  function addStickerToGallery(src, title, category) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-category', category);
    
    const img = document.createElement('img');
    img.className = 'gallery-item-img';
    img.src = src;
    img.alt = title;
    
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    
    const titleEl = document.createElement('h5');
    titleEl.className = 'gallery-item-title';
    titleEl.textContent = title;
    
    const sizeEl = document.createElement('p');
    sizeEl.className = 'gallery-item-size';
    sizeEl.textContent = 'Disponible: 5cm, 7cm';
    
    info.appendChild(titleEl);
    info.appendChild(sizeEl);
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(info);
    
    // Click to add to canvas
    galleryItem.addEventListener('click', () => {
      addStickerFromGallery(src);
    });
    
    galleryContainer.appendChild(galleryItem);
  }
  
  // Add sticker from gallery to canvas
  function addStickerFromGallery(imgSrc) {
    const customizeBtn = document.getElementById('btn-customize');
    customizeBtn.click(); // Go to customize section
    
    // Short delay to ensure customize section is loaded
    setTimeout(() => {
      // Find selected size or select default size if none selected
      const selectedSize = document.querySelector('.size-card.selected');
      if (!selectedSize) {
        document.getElementById('size-medium').click(); // Select medium size by default
      }
      
      // Add the sticker to canvas
      const canvasContainer = document.getElementById('canvas-container');
      
      // Check if we need to add sticker or show error
      const stickerCountElement = document.getElementById('sticker-count').querySelector('span');
      const maxStickersElement = document.getElementById('max-stickers');
      
      const currentCount = parseInt(stickerCountElement.textContent, 10);
      const maxCount = parseInt(maxStickersElement.textContent, 10);
      
      if (currentCount >= maxCount) {
        alert(`Has alcanzado el límite máximo de ${maxCount} stickers para este tamaño.`);
        return;
      }
      
      // Get selected sticker size
      const selectedStickerSize = document.querySelector('.btn-sticker-size.active').getAttribute('data-size');
      const size = selectedStickerSize === '5' ? 70 : 98; // 5cm = 70px, 7cm = 98px
      
      // Create sticker element
      const sticker = document.createElement('div');
      sticker.className = 'sticker';
      sticker.style.width = `${size}px`;
      sticker.style.height = `${size}px`;
      
      // Random position
      const maxX = canvasContainer.clientWidth - size;
      const maxY = canvasContainer.clientHeight - size;
      const posX = Math.max(0, Math.floor(Math.random() * maxX));
      const posY = Math.max(0, Math.floor(Math.random() * maxY));
      
      sticker.style.left = `${posX}px`;
      sticker.style.top = `${posY}px`;
      
      // Create image
      const img = document.createElement('img');
      img.src = imgSrc;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '4px';
      sticker.appendChild(img);
      
      // Make sticker draggable
      makeElementDraggable(sticker);
      
      // Add to canvas
      canvasContainer.appendChild(sticker);
      
      // Update count
      stickerCountElement.textContent = currentCount + 1;
      
      // Save state
      saveDesignState();
    }, 300);
  }
  
  // Make element draggable
  function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.addEventListener('mousedown', dragMouseDown);
    element.addEventListener('touchstart', dragTouchStart, { passive: false });
    
    function dragMouseDown(e) {
      e.preventDefault();
      
      // Get mouse position
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Add dragging class
      element.classList.add('sticker-dragging');
      
      // Move to front
      element.parentNode.appendChild(element);
      
      // Add event listeners
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }
    
    function dragTouchStart(e) {
      e.preventDefault();
      
      // Get touch position
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      // Add dragging class
      element.classList.add('sticker-dragging');
      
      // Move to front
      element.parentNode.appendChild(element);
      
      // Add event listeners
      document.addEventListener('touchend', closeDragElement);
      document.addEventListener('touchcancel', closeDragElement);
      document.addEventListener('touchmove', elementTouchDrag, { passive: false });
    }
    
    function elementDrag(e) {
      e.preventDefault();
      
      // Calculate new position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Set element's new position, ensuring it stays within the canvas
      const newTop = Math.max(0, Math.min(element.offsetTop - pos2, element.parentNode.clientHeight - element.offsetHeight));
      const newLeft = Math.max(0, Math.min(element.offsetLeft - pos1, element.parentNode.clientWidth - element.offsetWidth));
      
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }
    
    function elementTouchDrag(e) {
      e.preventDefault();
      
      // Calculate new position
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      // Set element's new position, ensuring it stays within the canvas
      const newTop = Math.max(0, Math.min(element.offsetTop - pos2, element.parentNode.clientHeight - element.offsetHeight));
      const newLeft = Math.max(0, Math.min(element.offsetLeft - pos1, element.parentNode.clientWidth - element.offsetWidth));
      
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }
    
    function closeDragElement() {
      // Remove event listeners
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('touchend', closeDragElement);
      document.removeEventListener('touchcancel', closeDragElement);
      document.removeEventListener('touchmove', elementTouchDrag);
      
      // Remove dragging class
      element.classList.remove('sticker-dragging');
      
      // Save state
      saveDesignState();
    }
  }
  
  // Save design state
  function saveDesignState() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    const selectedSize = document.querySelector('.size-card.selected');
    if (!selectedSize) return;
    
    const designState = {
      selectedSize: selectedSize.id,
      selectedStickerSize: document.querySelector('.btn-sticker-size.active').getAttribute('data-size'),
      stickers: []
    };
    
    // Save sticker information
    const stickers = canvasContainer.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
      const img = sticker.querySelector('img');
      designState.stickers.push({
        src: img.src,
        top: sticker.style.top,
        left: sticker.style.left,
        width: sticker.style.width,
        height: sticker.style.height
      });
    });
    
    localStorage.setItem('currentDesign', JSON.stringify(designState));
  }
}

// Preview modal functionality
function setupPreviewModal() {
  const previewModal = document.getElementById('preview-modal');
  const closePreviewBtn = document.getElementById('close-preview');
  const editPreviewBtn = document.getElementById('preview-edit');
  const downloadPreviewBtn = document.getElementById('preview-download');
  
  // Close preview
  closePreviewBtn.addEventListener('click', () => {
    previewModal.classList.remove('active');
  });
  
  // Edit from preview (just close the modal)
  editPreviewBtn.addEventListener('click', () => {
    previewModal.classList.remove('active');
  });
  
  // Download from preview
  downloadPreviewBtn.addEventListener('click', () => {
    // Call the main export function
    exportToPowerPoint();
  });
  
  // Close modal when clicking outside
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      previewModal.classList.remove('active');
    }
  });
}

// Load saved design from local storage
function loadSavedDesign() {
  const savedDesign = localStorage.getItem('currentDesign');
  if (!savedDesign) return;
  
  try {
    const designState = JSON.parse(savedDesign);
    
    // Move to customize section
    document.getElementById('btn-customize').click();
    
    // Select the size
    setTimeout(() => {
      const sizeCard = document.getElementById(designState.selectedSize);
      if (sizeCard) {
        sizeCard.click();
        
        // Select sticker size
        const stickerSizeBtn = document.querySelector(`.btn-sticker-size[data-size="${designState.selectedStickerSize}"]`);
        if (stickerSizeBtn) {
          stickerSizeBtn.click();
        }
        
        // Load stickers
        const canvasContainer = document.getElementById('canvas-container');
        
        // Clear canvas first
        while (canvasContainer.firstChild) {
          canvasContainer.removeChild(canvasContainer.firstChild);
        }
        
        // Add stickers
        designState.stickers.forEach(sticker => {
          const stickerElement = document.createElement('div');
          stickerElement.className = 'sticker';
          stickerElement.style.top = sticker.top;
          stickerElement.style.left = sticker.left;
          stickerElement.style.width = sticker.width;
          stickerElement.style.height = sticker.height;
          
          const img = document.createElement('img');
          img.src = sticker.src;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '4px';
          
          stickerElement.appendChild(img);
          
          // Make draggable
          makeElementDraggable(stickerElement);
          
          canvasContainer.appendChild(stickerElement);
        });
        
        // Update sticker count
        const stickerCount = designState.stickers.length;
        document.getElementById('sticker-count').querySelector('span').textContent = stickerCount;
      }
    }, 300);
  } catch (error) {
    console.error('Error loading saved design:', error);
  }
  
  // Make element draggable
  function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.addEventListener('mousedown', dragMouseDown);
    element.addEventListener('touchstart', dragTouchStart, { passive: false });
    
    function dragMouseDown(e) {
      e.preventDefault();
      
      // Get mouse position
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Add dragging class
      element.classList.add('sticker-dragging');
      
      // Move to front
      element.parentNode.appendChild(element);
      
      // Add event listeners
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }
    
    function dragTouchStart(e) {
      e.preventDefault();
      
      // Get touch position
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      // Add dragging class
      element.classList.add('sticker-dragging');
      
      // Move to front
      element.parentNode.appendChild(element);
      
      // Add event listeners
      document.addEventListener('touchend', closeDragElement);
      document.addEventListener('touchcancel', closeDragElement);
      document.addEventListener('touchmove', elementTouchDrag, { passive: false });
    }
    
    function elementDrag(e) {
      e.preventDefault();
      
      // Calculate new position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Set element's new position, ensuring it stays within the canvas
      const newTop = Math.max(0, Math.min(element.offsetTop - pos2, element.parentNode.clientHeight - element.offsetHeight));
      const newLeft = Math.max(0, Math.min(element.offsetLeft - pos1, element.parentNode.clientWidth - element.offsetWidth));
      
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }
    
    function elementTouchDrag(e) {
      e.preventDefault();
      
      // Calculate new position
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      
      // Set element's new position, ensuring it stays within the canvas
      const newTop = Math.max(0, Math.min(element.offsetTop - pos2, element.parentNode.clientHeight - element.offsetHeight));
      const newLeft = Math.max(0, Math.min(element.offsetLeft - pos1, element.parentNode.clientWidth - element.offsetWidth));
      
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }
    
    function closeDragElement() {
      // Remove event listeners
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('touchend', closeDragElement);
      document.removeEventListener('touchcancel', closeDragElement);
      document.removeEventListener('touchmove', elementTouchDrag);
      
      // Remove dragging class
      element.classList.remove('sticker-dragging');
      
      // Save state
      saveDesignState();
    }
  }
  
  function saveDesignState() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    const selectedSize = document.querySelector('.size-card.selected');
    if (!selectedSize) return;
    
    const designState = {
      selectedSize: selectedSize.id,
      selectedStickerSize: document.querySelector('.btn-sticker-size.active').getAttribute('data-size'),
      stickers: []
    };
    
    // Save sticker information
    const stickers = canvasContainer.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
      const img = sticker.querySelector('img');
      designState.stickers.push({
        src: img.src,
        top: sticker.style.top,
        left: sticker.style.left,
        width: sticker.style.width,
        height: sticker.style.height
      });
    });
    
    localStorage.setItem('currentDesign', JSON.stringify(designState));
  }
}

// Helper function for PowerPoint export
function exportToPowerPoint() {
  const previewContainer = document.getElementById('preview-container');
  if (!previewContainer) return;
  
  // Create new PowerPoint
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  
  // Get size and price information
  const sizeText = document.getElementById('preview-size').textContent;
  const stickerCount = document.getElementById('preview-sticker-count').textContent;
  const price = document.getElementById('preview-price').textContent;
  
  // Add title
  slide.addText('Diseño de Plancha de Stickers PEDRIIXD', {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
    color: '4ECDC4'
  });
  
  // Add details
  slide.addText([
    { text: `Tamaño: ${sizeText}`, options: { breakLine: true } },
    { text: `Cantidad de stickers: ${stickerCount}`, options: { breakLine: true } },
    { text: `Precio: ${price}`, options: { breakLine: true } }
  ], {
    x: 0.5,
    y: 1.2,
    fontSize: 14
  });
  
  // Capture preview container as image
  html2canvas(previewContainer).then(canvas => {
    // Convert to data URL
    const imageData = canvas.toDataURL('image/png');
    
    // Add canvas image to slide
    slide.addImage({
      data: imageData,
      x: 1,
      y: 2,
      w: 8,
      h: 4
    });
    
    // Add footer
    slide.addText('www.pedriixd.github.io', {
      x: 0.5,
      y: 6.5,
      fontSize: 10,
      color: '666666'
    });
    
    // Save the PowerPoint
    pptx.writeFile({ fileName: 'PEDRIIXD-Stickers.pptx' });
  });
}