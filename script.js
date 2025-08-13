// app.js
// ===============================
// LIENZO A4 SIN LÍMITES DE STICKERS
// - Subir múltiples imágenes (PNG/JPG/WebP, etc.)
// - Mover, rotar, escalar
// - Borrar (doble clic o botón "Borrar seleccionado")
// - Reiniciar todo
// - Exportar a PPTX en tamaño A4
// ===============================

// Referencias a elementos del DOM
const stageFrame = document.getElementById('stageFrame');
const fileInput   = document.getElementById('fileInput');
const btnBorrar   = document.getElementById('btnBorrarSel');
const btnRein1    = document.getElementById('btnReiniciar');
const btnRein2    = document.getElementById('btnReiniciar2');
const btnExp1     = document.getElementById('btnExportar');
const btnExp2     = document.getElementById('btnExportar2');

// Crear Stage con tamaño inicial (se ajusta responsivo enseguida)
let stage = new Konva.Stage({ container: 'container', width: stageFrame.clientWidth, height: stageFrame.clientHeight });
let layer = new Konva.Layer();
stage.add(layer);

// Fondo blanco (la “hoja” A4 dentro del canvas)
let bg = new Konva.Rect({ x: 0, y: 0, width: stage.width(), height: stage.height(), fill: 'white', listening: false });
bg.setAttr('isBackground', true);
layer.add(bg);

// Transformer único (aparece al seleccionar)
const tr = new Konva.Transformer({
  rotateEnabled: true,
  keepRatio: true,
  enabledAnchors: ['top-left','top-right','bottom-left','bottom-right'],
  anchorSize: 10,
  borderStroke: '#10b981' // verde
});
layer.add(tr);

// Deselect al tocar el fondo
stage.on('mousedown touchstart', (e) => {
  if (e.target === stage || e.target.getAttr('isBackground')) {
    tr.nodes([]);
    layer.batchDraw();
  }
});

// -----------------------
// Responsivo (A4 visual)
// -----------------------
function resizeStageToFrame() {
  const w = stageFrame.clientWidth;
  const h = stageFrame.clientHeight;
  stage.size({ width: w, height: h });
  bg.size({ width: w, height: h });
  layer.batchDraw();
}
window.addEventListener('resize', resizeStageToFrame);
resizeStageToFrame();

// -----------------------
// Subida de imágenes
// -----------------------
fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    await addFileAsSticker(file);
  }
  // Permitir volver a elegir la misma imagen después
  fileInput.value = '';
});

// Agregar imagen como sticker
function addFileAsSticker(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Escala inicial: que entre cómoda en el lienzo
        const maxW = stage.width() * 0.5;
        const maxH = stage.height() * 0.5;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;

        const konvaImg = new Konva.Image({
          image: img,
          x: (stage.width() - w) / 2,
          y: (stage.height() - h) / 2,
          width: w,
          height: h,
          draggable: true
        });
        konvaImg.setAttr('isSticker', true);

        // Selección
        konvaImg.on('mousedown touchstart', () => {
          tr.nodes([konvaImg]);
          layer.draw();
        });

        // Mantener dentro de la hoja (opcional)
        konvaImg.on('dragend transformend', () => {
          const padding = 2;
          let { x, y } = konvaImg.position();
          const w2 = konvaImg.width() * konvaImg.scaleX();
          const h2 = konvaImg.height() * konvaImg.scaleY();
          x = Math.max(padding, Math.min(x, stage.width() - w2 - padding));
          y = Math.max(padding, Math.min(y, stage.height() - h2 - padding));
          konvaImg.position({ x, y });
          layer.batchDraw();
        });

        // Doble clic para borrar el sticker
        konvaImg.on('dblclick dbltap', () => {
          if (tr.nodes().includes(konvaImg)) tr.nodes([]);
          konvaImg.destroy();
          layer.batchDraw();
        });

        layer.add(konvaImg);
        layer.draw();
        resolve();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// -----------------------
// Borrar seleccionado
// -----------------------
function deleteSelected() {
  const nodes = tr.nodes();
  if (!nodes.length) return;
  nodes.forEach(n => n.destroy());
  tr.nodes([]);
  layer.batchDraw();
}
btnBorrar.addEventListener('click', deleteSelected);

// Tecla Supr/Backspace (escritorio)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // Evitar borrar texto del navegador si estás en un input
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (!['INPUT','TEXTAREA'].includes(tag)) {
      deleteSelected();
      e.preventDefault();
    }
  }
});

// -----------------------
// Reiniciar lienzo
// -----------------------
function resetCanvas() {
  layer.getChildren((n) => n.getAttr('isSticker')).forEach((n) => n.destroy());
  tr.nodes([]);
  layer.batchDraw();
}
btnRein1?.addEventListener('click', resetCanvas);
btnRein2?.addEventListener('click', resetCanvas);

// -----------------------
// Exportar PPTX (A4)
// -----------------------
async function exportPPTX() {
  // Imagen del stage: aumentar pixelRatio para buena calidad
  const dataURL = stage.toDataURL({ pixelRatio: 3 });

  // Tamaño A4 en pulgadas (21 x 29.7 cm)
  const W_IN = 8.27;
  const H_IN = 11.69;

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'A4', width: W_IN, height: H_IN });
  pptx.layout = 'A4';

  const slide = pptx.addSlide();
  slide.addImage({ data: dataURL, x: 0, y: 0, w: W_IN, h: H_IN });

  const fileName = `Plancha_A4_${new Date().toISOString().slice(0,10)}.pptx`;
  await pptx.writeFile({ fileName });
  // Luego, usá el botón de WhatsApp para abrir el chat y adjuntá el archivo manualmente.
}
btnExp1?.addEventListener('click', exportPPTX);
btnExp2?.addEventListener('click', exportPPTX);
