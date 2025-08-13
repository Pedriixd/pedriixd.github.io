// app.js
// ===============================
// CONFIGURACIÓN DEL LIENZO KONVA
// ===============================

// Escala para que el A4 (210 x 297 mm) se vea en pantalla en píxeles
// 1 mm ≈ 3.78 px en pantalla
const anchoA4px = 210 * 3.78;
const altoA4px = 297 * 3.78;

// Crear el escenario Konva
const stage = new Konva.Stage({
    container: 'container',
    width: anchoA4px,
    height: altoA4px
});

// Capa principal
const layer = new Konva.Layer();
stage.add(layer);

// =====================================
// FUNCIONALIDAD: SUBIR Y AGREGAR IMAGEN
// =====================================
const fileInput = document.getElementById('fileInput');
const btnSubir = document.getElementById('btnSubir');

btnSubir.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
            const konvaImg = new Konva.Image({
                image: img,
                x: stage.width() / 2 - img.width / 4,
                y: stage.height() / 2 - img.height / 4,
                width: img.width / 2,
                height: img.height / 2,
                draggable: true
            });

            // Habilitar transformaciones (mover, escalar, rotar)
            konvaImg.on('click', () => {
                layer.find('Transformer').destroy();
                const tr = new Konva.Transformer({
                    nodes: [konvaImg],
                    rotateEnabled: true,
                    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                });
                layer.add(tr);
                layer.draw();
            });

            // Doble click para borrar
            konvaImg.on('dblclick', () => {
                konvaImg.destroy();
                layer.find('Transformer').destroy();
                layer.draw();
            });

            layer.add(konvaImg);
            layer.draw();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);

    // Reset input para permitir subir la misma imagen otra vez
    fileInput.value = '';
});

// ====================================
// BOTÓN REINICIAR: VACIAR LA PLANCHA
// ====================================
document.getElementById('btnReiniciar').addEventListener('click', () => {
    layer.destroyChildren();
    layer.draw();
});

// ================================
// BOTÓN EXPORTAR: GENERAR .PPTX
// ================================
document.getElementById('btnExportar').addEventListener('click', () => {
    const dataURL = stage.toDataURL({ pixelRatio: 3 });

    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    // Tamaño A4 en pulgadas (21 cm x 29.7 cm)
    slide.addImage({
        data: dataURL,
        x: 0,
        y: 0,
        w: 8.27,
        h: 11.69
    });

    pptx.writeFile({ fileName: 'plancha_stickers_A4.pptx' });
});

// ========================================
// CLIC FUERA DE OBJETO → QUITAR TRANSFORMER
// ========================================
stage.on('click', (e) => {
    if (e.target === stage) {
        layer.find('Transformer').destroy();
        layer.draw();
    }
});
