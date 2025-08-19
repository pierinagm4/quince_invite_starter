// ===== Countdown =====
document.addEventListener("DOMContentLoaded", function () {
  const countdownEl = document.getElementById("countdown");
  const start = new Date(EVENT_DATE);
  const end   = new Date(END_DATE);
  let countdownInterval;

  function updateCountdown() {
    // Validaciones
    if (isNaN(start) || isNaN(end)) {
      console.warn("EVENT_DATE o END_DATE inválidos. Revisa el formato/definición.");
      return;
    }

    const now = new Date();

    // 1) Evento finalizado
    if (now >= end) {
      countdownEl.innerHTML = "<h3 class='script'>¡El evento ha finalizado!</h3>";
      clearInterval(countdownInterval);
      return; // dejamos el intervalo corriendo por si quieres cambiar algo, pero ya no actualiza números
    }

    // 2) Evento en curso
    if (now >= start) {
      countdownEl.innerHTML = "<h3 class='script'>¡El evento ha comenzado!</h3>";
      return;
    }

    // 3) Faltando para que empiece
    const diff = start - now; // siempre positivo aquí
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months  = Math.floor(days / 30);
    // (Opcional: años, si quieres mostrar)
    // const years = Math.floor(months / 12);

    // Escribe los valores (puedes añadir .padStart(2,'0') si quieres 2 dígitos)
    document.querySelector("#cd-seconds").textContent = seconds;
    document.querySelector("#cd-minutes").textContent = minutes;
    document.querySelector("#cd-hours").textContent   = hours;
    document.querySelector("#cd-days").textContent    = days % 30;
    document.querySelector("#cd-months").textContent  = months % 12;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
});
// ===== Gallery =====
function initGallery(){
  const container = document.getElementById('gallery');
  const imgs = Array.from(container.querySelectorAll('.gallery-img'));
  const prev = container.querySelector('.prev');
  const next = container.querySelector('.next');
  const dotsWrap = container.querySelector('.dots');
  const AUTO_MS = 4000;            // 🔑 velocidad (6s)
  let idx = 0, timer;

  // (lo demás igual)
  imgs.forEach((_, i)=>{
    const b = document.createElement('button');
    b.addEventListener('click', ()=>show(i));
    dotsWrap.appendChild(b);
  });

  function show(i){
    idx = (i+imgs.length)%imgs.length;
    imgs.forEach(img=>img.classList.remove('active'));
    imgs[idx].classList.add('active');
    Array.from(dotsWrap.children).forEach((d,k)=>d.classList.toggle('active', k===idx));
  }

  prev.addEventListener('click', ()=>show(idx-1));
  next.addEventListener('click', ()=>show(idx+1));

  // usar la constante
  timer = setInterval(()=>show(idx+1), AUTO_MS);
  container.addEventListener('mouseenter', ()=>clearInterval(timer));
  container.addEventListener('mouseleave', ()=>timer = setInterval(()=>show(idx+1), AUTO_MS));

  show(0);
}

// ===== Links =====
function initLinks(){
  const btnCer = document.getElementById('btn-ceremony');
  const btnW = document.getElementById('btn-whatsapp');
  const btnE = document.getElementById('btn-email');

   if (typeof CEREMONY_MAPS !== 'undefined' && btnCer) {
    btnCer.href = CEREMONY_MAPS;
    btnCer.target = '_blank';
    btnCer.rel = 'noopener noreferrer';
  }

  if(typeof WHATSAPP_NUMBER!=='undefined'){
     // Datos del evento para el mensaje
    const start = new Date(EVENT_DATE);
    const fecha = isNaN(start)
      ? ''
      : start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const hora = isNaN(start)
      ? ''
      : start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Tomamos el nombre desde el hero (o usa uno genérico)
    const homenajeada = document.querySelector('.hero-title')?.textContent.trim() || 'la quinceañera';

    // Mensaje prellenado (con saltos de línea)
    const msg = [
      `Hola, soy [Tu nombre].`,
      `Confirmo mi asistencia a los quince de ${homenajeada}${fecha ? ` el ${fecha}` : ''}${hora ? ` a las ${hora}` : ''}.`,
      `Acompañantes: [0/1/2]`,
      `Restricciones alimentarias: [Ninguna]`,
      `¡Gracias!`
    ].join('\n');

    btnW.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    btnW.target = '_blank';
    btnW.rel = 'noopener noreferrer';
  }
  if(typeof EMAIL_TO!=='undefined'){
    const subject = encodeURIComponent('Confirmación de asistencia - Quince años');
    const body = encodeURIComponent('Hola, confirmo mi asistencia. Nombre(s): ');
    btnE.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  }
}

// Copiar al portapapeles con feedback "¡Copiado!"
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;

  const text = (btn.dataset.copy || '').trim();
  if (!text) return;

  btn.disabled = true;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback para contextos no seguros
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.inset = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch (err) {
    console.warn('No se pudo copiar:', err);
    btn.textContent = 'Error';
  } finally {
    setTimeout(() => {
      btn.disabled = false;
    }, 1200);
  }
});

// Copiar al portapapeles con icono + tooltip de feedback
document.addEventListener('DOMContentLoaded', () => {
  if (window.bootstrap) {
    new bootstrap.Tooltip(document.body, { selector: '[data-bs-toggle="tooltip"]' });
  }
});

// ===== Copiar con icono y reinicio al hacer clic fuera o en otro botón =====
let activeCopyBtn = null;

function resetCopyVisual(btn) {
  if (!btn) return;

  // Cancelar auto-restore pendiente
  if (btn.dataset.restoreTimeout) {
    clearTimeout(Number(btn.dataset.restoreTimeout));
    delete btn.dataset.restoreTimeout;
  }

  // Quitar lock
  btn.dataset.locked = "0";

  // Restaurar icono y tooltip
  const icon = btn.querySelector('i');
  const origIcon = btn.dataset.originalIcon || 'bi bi-clipboard';
  const origTitle = btn.dataset.originalTitle || 'Copiar';

  if (icon) icon.className = origIcon;

  if (window.bootstrap) {
    const tip = bootstrap.Tooltip.getOrCreateInstance(btn);
    tip.setContent({ '.tooltip-inner': origTitle });
    tip.hide();
  } else {
    btn.setAttribute('title', origTitle);
  }

  if (activeCopyBtn === btn) activeCopyBtn = null;
}

// Clic global: si se hace clic fuera de un .copy-btn, restaurar el activo
document.addEventListener('click', (e) => {
  if (!activeCopyBtn) return;
  const clickedCopyBtn = e.target.closest('.copy-btn');
  if (!clickedCopyBtn) {
    resetCopyVisual(activeCopyBtn);
  }
});

// Copiar + feedback visual (sin deshabilitar el botón)
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;

  // Si había otro botón activo, restáuralo primero
  if (activeCopyBtn && activeCopyBtn !== btn) resetCopyVisual(activeCopyBtn);

  // Throttle: ignorar si está "locked"
  if (btn.dataset.locked === "1") return;
  btn.dataset.locked = "1";

  // Guardar originales una vez
  const icon = btn.querySelector('i');
  if (!btn.dataset.originalIcon) {
    btn.dataset.originalIcon = icon ? icon.className : 'bi bi-clipboard';
  }
  const currentTitle =
    btn.getAttribute('title') ||
    btn.getAttribute('data-bs-title') ||
    btn.getAttribute('data-bs-original-title') ||
    'Copiar';
  if (!btn.dataset.originalTitle) btn.dataset.originalTitle = currentTitle;

  const text = (btn.dataset.copy || '').trim();
  if (!text) { btn.dataset.locked = "0"; return; }

  const tip = window.bootstrap ? bootstrap.Tooltip.getOrCreateInstance(btn) : null;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.inset = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // Feedback: check + "¡Copiado!"
    if (icon) icon.className = 'bi bi-check2';
    if (tip) {
      tip.setContent({ '.tooltip-inner': '¡Copiado!' });
      tip.show();
    } else {
      btn.setAttribute('title', '¡Copiado!');
    }

    activeCopyBtn = btn;

    // Auto-restaurar por si el usuario no hace nada más
    const t = setTimeout(() => resetCopyVisual(btn), 1200);
    btn.dataset.restoreTimeout = String(t);

  } catch (err) {
    console.warn('No se pudo copiar:', err);
    if (icon) icon.className = 'bi bi-x-lg';
    if (tip) {
      tip.setContent({ '.tooltip-inner': 'Error al copiar' });
      tip.show();
    } else {
      btn.setAttribute('title', 'Error al copiar');
    }
    const t = setTimeout(() => resetCopyVisual(btn), 900);
    btn.dataset.restoreTimeout = String(t);
  }
});

// Cuando un botón de copiar pierde el foco, restaurar su icono/tooltip
document.addEventListener('focusout', (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  resetCopyVisual(btn);
});



// Boot
document.addEventListener('DOMContentLoaded', ()=>{
  initGallery();
  initLinks();

  // Inicia pétalos sobre el contenedor del hero
  if (window.jQuery && $.fn && $.fn.sakura) {
    $('body').sakura(); // inicia
  }

  // Si por alguna razón no se insertó nada, reintenta 1s después
  setTimeout(()=>{
    if (!document.querySelector('.sakura')) {
      try { $('body').sakura(); } catch(e){ console.warn(e); }
    }
  }, 1000);
});


document.addEventListener('DOMContentLoaded', () => {
  // Tooltips delegados (funciona para todos los elementos con data-bs-toggle="tooltip")
  if (window.bootstrap) {
    new bootstrap.Tooltip(document.body, { selector: '[data-bs-toggle="tooltip"]' });
  }
});