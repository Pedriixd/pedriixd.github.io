document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentSheetSize = 'small'; // Tamaño de plancha predeterminado: 12x16cm
    let currentStickerSize = '5cm'; // Tamaño de sticker predeterminado: 5cm
    let uploadedImages = []; // Almacena las imágenes subidas
    let stickersOnCanvas = []; // Almacena los stickers en el canvas
    
    // Dimensiones de las planchas en centímetros
    const sheetSizes = {
        'small': { width: 12, height: 16 },
        'medium': { width: 14, height: 21 },
        'large': { width: 21, height: 27 }
    };
    
    // Tamaños de stickers en centímetros
    const stickerSizes = {
        '5cm': 5,
        '7cm': 7
    };
    
    // Referencias a elementos DOM
    const canvas = document.getElementById('sticker-canvas');
    const sizeButtons = document.querySelectorAll('.size-btn');
    const stickerSizeButtons = document.querySelectorAll('.sticker-size-btn');
    const uploadInput = document.getElementById('upload-input');
    const gallery = document.querySelector('.gallery');
    const currentCountElement = document.getElementById('current-count');
    const maxCountElement = document.getElementById('max-count');
    const clearButton = document.getElementById('clear-btn');
    const shareButton = document.getElementById('share-btn');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const startEditingButton = document.getElementById('start-editing');
    
    // Inicializar elementos
    updateMaxStickerCount();
    
    // Event Listeners
    
    // Botones de tamaño de plancha
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Eliminar la clase 'active' de todos los botones
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir la clase 'active' al botón clicado
            this.classList.add('active');
            
            // Actualizar el tamaño actual
            currentSheetSize = this.getAttribute('data-size');
            
            // Actualizar la clase del canvas
            canvas.className = currentSheetSize;
            
            // Actualizar el contador máximo de stickers
            updateMaxStickerCount();
        });
    });
    
    // Botones de tamaño de sticker
    stickerSizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Eliminar la clase 'active' de todos los botones
            stickerSizeButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir la clase 'active' al botón clicado
            this.classList.add('active');
            
            // Actualizar el tamaño de sticker actual
            currentStickerSize = this.getAttribute('data-sticker-size');
            
            // Actualizar el contador máximo de stickers
            updateMaxStickerCount();
            
            // Ajustar el tamaño de los stickers existentes en el canvas
            updateStickersSize();
        });
    });
    
    // Subir imágenes
    uploadInput.addEventListener('change', function(e) {
        const files = e.target.files;
        
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imageUrl = e.target.result;
                        uploadedImages.push(imageUrl);
                        addImageToGallery(imageUrl);
                    };
                    
                    reader.readAsDataURL(file);
                }
            }
        }
    });
    
    // Botón de limpiar
    clearButton.addEventListener('click', function() {
        clearCanvas();
    });
    
    // Botón de compartir por WhatsApp
    shareButton.addEventListener('click', function() {
        // Aquí implementaríamos la lógica para compartir por WhatsApp
        // Por ahora, solo mostraremos un alerta
        alert('¡La plancha de stickers se enviará por WhatsApp! (Funcionalidad en desarrollo)');
    });
    
    // Botón de cerrar tutorial
    startEditingButton.addEventListener('click', function() {
        tutorialOverlay.style.display = 'none';
    });
    
    // Funciones
    
    // Función para actualizar el contador máximo de stickers
    function updateMaxStickerCount() {
        const sheetWidth = sheetSizes[currentSheetSize].width;
        const sheetHeight = sheetSizes[currentSheetSize].height;
        const stickerSize = stickerSizes[currentStickerSize];
        
        // Calcular cuántos stickers caben en cada fila y columna
        const stickersPerRow = Math.floor(sheetWidth / stickerSize);
        const stickersPerColumn = Math.floor(sheetHeight / stickerSize);
        
        // Calcular el total de stickers
        const maxStickers = stickersPerRow * stickersPerColumn;
        
        // Actualizar el contador en la UI
        maxCountElement.textContent = maxStickers;
        
        return maxStickers;
    }
    
    // Función para actualizar el tamaño de los stickers existentes
    function updateStickersSize() {
        const stickerElements = canvas.querySelectorAll('.sticker');
        const stickerSize = stickerSizes[currentStickerSize];
        
        stickerElements.forEach(sticker => {
            // Convertir el tamaño de píxeles a porcentaje relativo al tamaño del canvas
            const size = (stickerSize / sheetSizes[currentSheetSize].width) * 100;
            sticker.style.width = `${size}%`;
            sticker.style.height = `${size}%`;
        });
    }
    
    // Función para añadir una imagen a la galería
    function addImageToGallery(imageUrl) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        
        imgContainer.appendChild(img);
        gallery.appendChild(imgContainer);
        
        // Hacer que la imagen sea draggable
        imgContainer.draggable = true;
        imgContainer.addEventListener('dragstart', handleDragStart);
        
        // Permitir clic para añadir
        imgContainer.addEventListener('click', function() {
            addStickerToCanvas(imageUrl);
        });
    }
    
    // Función para manejar el inicio del arrastre
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.querySelector('img').src);
    }
    
    // Configurar el canvas para aceptar elementos arrastrados
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        const imageUrl = e.dataTransfer.getData('text/plain');
        
        if (imageUrl) {
            addStickerToCanvas(imageUrl, {
                x: (e.offsetX / canvas.offsetWidth) * 100,
                y: (e.offsetY / canvas.offsetHeight) * 100
            });
        }
    });
    
    // Función para añadir un sticker al canvas
    function addStickerToCanvas(imageUrl, position = null) {
        // Verificar si hay espacio para más stickers
        const maxStickers = updateMaxStickerCount();
        
        if (stickersOnCanvas.length >= maxStickers) {
            alert('No hay espacio para más stickers en esta plancha.');
            return;
        }
        
        const sticker = document.createElement('div');
        sticker.className = 'sticker';
        
        // Establecer el tamaño del sticker en función del tamaño seleccionado
        const stickerSize = stickerSizes[currentStickerSize];
        // Convertir el tamaño de centímetros a porcentaje relativo al tamaño del canvas
        const size = (stickerSize / sheetSizes[currentSheetSize].width) * 100;
        sticker.style.width = `${size}%`;
        sticker.style.height = `${size}%`;
        
        // Establecer la posición del sticker si se proporciona
        if (position) {
            sticker.style.left = `${position.x - (size/2)}%`;
            sticker.style.top = `${position.y - (size/2)}%`;
        } else {
            // Posición aleatoria dentro del canvas si no se proporciona una posición
            const xPos = Math.random() * (100 - size);
            const yPos = Math.random() * (100 - size);
            sticker.style.left = `${xPos}%`;
            sticker.style.top = `${yPos}%`;
        }
        
        // Añadir la imagen al sticker
        const img = document.createElement('img');
        img.src = imageUrl;
        sticker.appendChild(img);
        
        // Añadir botón de eliminar
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', function() {
            canvas.removeChild(sticker);
            stickersOnCanvas = stickersOnCanvas.filter(s => s !== sticker);
            updateStickerCount();
        });
        sticker.appendChild(deleteBtn);
        
        // Hacer el sticker draggable dentro del canvas
        makeStickeDraggable(sticker);
        
        // Añadir el sticker al canvas
        canvas.appendChild(sticker);
        stickersOnCanvas.push(sticker);
        
        // Actualizar el contador de stickers
        updateStickerCount();
        
        // Quitar el mensaje de canvas vacío si es el primer sticker
        if (stickersOnCanvas.length === 1) {
            const canvasMessage = canvas.querySelector('.canvas-message');
            if (canvasMessage) {
                canvas.removeChild(canvasMessage);
            }
        }
    }
    
    // Función para hacer un sticker arrastrable
    function makeStickeDraggable(sticker) {
        let isDragging = false;
        let offsetX, offsetY;
        
        // Cuando se presiona el mouse sobre el sticker
        sticker.addEventListener('mousedown', function(e) {
            if (e.target.closest('.delete-btn')) return; // No iniciar arrastre si se hace clic en el botón de eliminar
            
            isDragging = true;
            const rect = sticker.getBoundingClientRect();
            offsetX = (e.clientX - rect.left) / canvas.offsetWidth * 100;
            offsetY = (e.clientY - rect.top) / canvas.offsetHeight * 100;
            
            sticker.style.zIndex = '10'; // Traer al frente mientras se arrastra
        });
        
        // Cuando se mueve el mouse
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Calcular la nueva posición en porcentaje
            const canvasRect = canvas.getBoundingClientRect();
            let newX = ((e.clientX - canvasRect.left) / canvas.offsetWidth * 100) - offsetX;
            let newY = ((e.clientY - canvasRect.top) / canvas.offsetHeight * 100) - offsetY;
            
            // Limitar la posición dentro del canvas
            const stickerSize = parseFloat(sticker.style.width);
            newX = Math.max(0, Math.min(100 - stickerSize, newX));
            newY = Math.max(0, Math.min(100 - stickerSize, newY));
            
            sticker.style.left = `${newX}%`;
            sticker.style.top = `${newY}%`;
        });
        
        // Cuando se suelta el mouse
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                sticker.style.zIndex = '1';
            }
        });
    }
    
    // Función para actualizar el contador de stickers
    function updateStickerCount() {
        currentCountElement.textContent = stickersOnCanvas.length;
    }
    
    // Función para limpiar el canvas
    function clearCanvas() {
        if (stickersOnCanvas.length > 0) {
            if (confirm('¿Estás seguro de que quieres eliminar todos los stickers?')) {
                stickersOnCanvas.forEach(sticker => {
                    canvas.removeChild(sticker);
                });
                stickersOnCanvas = [];
                updateStickerCount();
                
                // Restaurar el mensaje de canvas vacío
                const canvasMessage = document.createElement('div');
                canvasMessage.className = 'canvas-message';
                canvasMessage.innerHTML = '<i class="fas fa-arrow-left"></i><p>Elige un tamaño y añade stickers</p>';
                canvas.appendChild(canvasMessage);
            }
        }
    }
});
