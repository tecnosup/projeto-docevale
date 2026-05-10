/* ═══════════════════════════════════════════════════════════════
   Doce Vale — Animation choreography
   Scroll-driven reveals, parallax, exploding object, tag entries
═══════════════════════════════════════════════════════════════ */

/* ─── 0. Auto-crop transparent PNG via Canvas ──────────────── */
function autoCropImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let top = canvas.height, bottom = 0, left = canvas.width, right = 0;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 10) {
        if (y < top)    top    = y;
        if (y > bottom) bottom = y;
        if (x < left)   left   = x;
        if (x > right)  right  = x;
      }
    }
  }
  const pad = 8;
  top    = Math.max(0, top - pad);
  bottom = Math.min(canvas.height - 1, bottom + pad);
  left   = Math.max(0, left - pad);
  right  = Math.min(canvas.width - 1, right + pad);
  const w = right - left;
  const h = bottom - top;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  out.getContext('2d').drawImage(canvas, left, top, w, h, 0, 0, w, h);
  img.src = out.toDataURL('image/png');
}

function maybeCropHeroImages() {
  if (window.innerWidth > 900) return;
  document.querySelectorAll('.hc-slide img').forEach(img => {
    if (img.complete && img.naturalWidth) { autoCropImage(img); }
    else img.addEventListener('load', () => autoCropImage(img), { once: true });
  });
}
/* ─── WhatsApp ─────────────────────────────────────────────── */
const WA = "5512981710055";
const MSG = {
  "default":       "Olá! Quero fazer um pedido de brownies 🍫",
  "doce-de-leite": "Olá! Quero pedir o Brownie de Doce de Leite 🍫 Tem disponível?",
  "leite-ninho":   "Olá! Quero pedir o Brownie de Leite Ninho 🍫 Está disponível essa semana?",
  "nutella":       "Olá! Quero pedir o Brownie de Nutella 🍫 Está disponível essa semana?",
  "kitkat":        "Olá! Quero pedir o Brownie de KitKat 🍫 Está disponível essa semana?",
  "pote":          "Olá! Quero pedir o Brownie de Pote 🍫 Tem disponível?",
};

function openWhatsApp(sabor = "default") {
  const msg = MSG[sabor] || MSG["default"];
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`);
}
window.openWhatsApp = openWhatsApp;

/* ─── 1. Reveal on scroll (IntersectionObserver) ──────────── */
const revealObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('is-in');
      // staggered children
      const kids = e.target.querySelectorAll('[data-stagger]');
      kids.forEach((k, i) => {
        k.style.transitionDelay = `${i * 90}ms`;
        k.classList.add('is-in');
      });
      revealObserver.unobserve(e.target);
    }
  }
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ─── 2. Word-by-word reveal for manifesto ────────────────── */
function splitWords(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = '1';
  const html = el.innerHTML;
  // Split text nodes only, preserve <strong>/<em>
  const walk = (node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach(p => {
        if (/\s+/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        if (!p) return;
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = p;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1) {
      // Don't descend if it's already a .word
      if (node.classList && node.classList.contains('word')) return;
      Array.from(node.childNodes).forEach(walk);
      // Also wrap text inside <strong>/<em> as a single word? — keep as block to preserve styles
    }
  };
  walk(el);
}

document.querySelectorAll('[data-reveal-words]').forEach(splitWords);

const wordObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const words = e.target.querySelectorAll('.word');
    words.forEach((w, i) => {
      w.style.transitionDelay = `${i * 35}ms`;
      w.classList.add('is-in');
    });
    wordObserver.unobserve(e.target);
  }
}, { threshold: 0.3 });
document.querySelectorAll('[data-reveal-words]').forEach(el => wordObserver.observe(el));

/* ─── 3. Hero parallax + brownie scroll-driven ────────────── */
const heroBrownie = document.querySelector('.hero-brownie-desktop');
const heroSection = document.querySelector('.hero');
const heroCopy    = document.querySelector('.hero-copy');
const heroTags    = document.querySelectorAll('.hero-tag');

/* ─── 4. Exploding object (produto section) ───────────────── */
const produtoEl      = document.getElementById('produto');
const produtoBrownie = document.getElementById('produtoBrownie');
const etags          = document.querySelectorAll('.etag');

// Tags start near the center brownie and drift OUTWARD a small amount,
// finishing well inside the viewport edges. They appear early and stay visible
// for the full sticky scroll — never fly off-screen.
const tagTargets = {
  size:  { x: -10, y: -10, delay: 0    },
  fill:  { x:  10, y: -10, delay: 0.08 },
  thick: { x: -10, y:  10, delay: 0.04 },
  made:  { x:  10, y:  10, delay: 0.12 },
};

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ─── 5. Topbar shrink on scroll ──────────────────────────── */
const topbar = document.querySelector('.topbar');

/* ─── 6. Smooth follow / scroll handler ───────────────────── */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const scrollY = window.scrollY;

    // Topbar
    if (topbar) topbar.classList.toggle('is-scrolled', scrollY > 30);

    // Hero parallax
    if (heroBrownie && heroSection) {
      const h = heroSection.offsetHeight;
      const p = clamp(scrollY / h, 0, 1);
      const dy = -p * 80;
      const sc = 1 - p * 0.06;
      const rot = p * 4;
      heroBrownie.style.setProperty('--scroll-y', `${dy}px`);
      heroBrownie.style.setProperty('--scroll-s', sc);
      heroBrownie.style.setProperty('--scroll-r', `${rot}deg`);

      // Copy fades up + away as scroll increases
      if (heroCopy) {
        heroCopy.style.opacity = 1 - p * 0.4;
        heroCopy.style.transform = `translateY(${-p * 30}px)`;
      }
      // Tags drift
      heroTags.forEach((t, i) => {
        const dir = i === 0 ? -1 : 1;
        t.style.transform = `translate(${dir * p * 30}px, ${-p * 20}px)`;
      });
    }

    // Exploding object
    if (produtoEl) {
      const rect    = produtoEl.getBoundingClientRect();
      const total   = produtoEl.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const raw     = clamp(scrolled / total, 0, 1);
      const p       = easeOut(raw);

      const isMobile = window.innerWidth < 900;

      if (produtoBrownie) {
        const sc = 1 + clamp(p * 2, 0, 1) * 0.85;
        const rot = -clamp(p * 2, 0, 1) * 4;
        produtoBrownie.style.transform = `scale(${sc}) rotate(${rot}deg)`;
      }

      // Tags: drift menor no mobile para não sair da tela
      const tagTargetsMobile = {
        size:  { x: -6, y: -8, delay: 0    },
        fill:  { x:  6, y: -8, delay: 0.08 },
        thick: { x: -6, y:  8, delay: 0.04 },
        made:  { x:  6, y:  8, delay: 0.12 },
      };
      const targets = isMobile ? tagTargetsMobile : tagTargets;

      etags.forEach(tag => {
        const id  = tag.dataset.id;
        const tgt = targets[id];
        if (!tgt) return;
        const localP = easeOut(clamp((p - tgt.delay) / 0.45, 0, 1));
        const x = lerp(0, tgt.x, localP);
        const y = lerp(0, tgt.y, localP);
        tag.style.transform = `translate(${x}vw, ${y}vh)`;
        tag.style.opacity   = clamp(localP * 1.6, 0, 1);
        const line = tag.querySelector('.etag-line');
        if (line) line.style.width = `${localP * 3}rem`;
      });
    }
  });
  ticking = false;
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ─── 7. Sabor card pointer-follow glow ───────────────────── */
document.querySelectorAll('.sabor').forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});

/* ─── 8. Magnetic CTA buttons ─────────────────────────────── */
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
  });
  btn.addEventListener('pointerleave', () => {
    btn.style.transform = '';
  });
});

/* ─── 9. Counter animation (CTA-final stats) ──────────────── */
const counterObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    const target = parseFloat(el.dataset.counter);
    const dur = 1400;
    const t0 = performance.now();
    const startVal = 0;
    const isFloat = String(target).includes('.');
    const tick = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = startVal + (target - startVal) * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  }
}, { threshold: 0.5 });
document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* ─── 10. Marquee for "produto" decorative band ───────────── */
// (CSS-only marquee — nothing here)

/* ─── 11. Hero carousel ───────────────────────────────────── */
function initHeroCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  const track    = document.querySelector('.hero-carousel-track');
  const slides   = Array.from(document.querySelectorAll('.hc-slide'));
  const dots     = Array.from(document.querySelectorAll('.hc-dot'));
  const w1       = document.querySelector('.hero-headline .w1');
  const w2       = document.querySelector('.hero-headline .w2');
  const ctaBtn   = document.querySelector('.hero-actions .btn-wa.lg');
  if (!carousel || !track || !slides.length) return;

  const N = slides.length;
  let current = 0;
  let startX = 0, startY = 0, dragging = false, dragDx = 0;

  // slideWidth em px reais do carousel
  function sw() { return carousel.getBoundingClientRect().width; }

  function setPos(extraPx, animated) {
    // cada slide ocupa sw() px; track tem width = N * sw()
    // posição base = -current * sw(); extraPx = offset do drag
    const base = -current * sw();
    track.style.transition = animated ? 'transform .45s cubic-bezier(.4,0,.2,1)' : 'none';
    track.style.transform  = `translateX(${base + extraPx}px)`;
  }

  function goTo(idx) {
    current = ((idx % N) + N) % N;
    setPos(0, true);
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    const slide = slides[current];
    const headline = slide.dataset.headline || '';
    const sub      = slide.dataset.sub      || '';
    const wa       = slide.dataset.wa       || 'default';

    if (w1) {
      const out = 'opacity .22s ease, transform .22s ease';
      const inn = 'opacity .38s ease, transform .38s ease';
      w1.style.transition = out;
      w2.style.transition = out;
      w1.style.opacity = '0';
      w2.style.opacity = '0';
      w1.style.transform = 'translateY(-10px)';
      w2.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        w1.textContent = headline;
        w2.innerHTML = sub.replace('&amp;', '<span class="ampersand">&amp;</span>');
        w1.style.transition = inn;
        w2.style.transition = inn;
        w1.style.opacity = '1';
        w2.style.opacity = '1';
        w1.style.transform = 'translateY(0)';
        w2.style.transform = 'translateY(0)';
      }, 230);
    }
    if (ctaBtn) ctaBtn.onclick = () => openWhatsApp(wa);
  }

  // Touch
  carousel.addEventListener('touchstart', e => {
    startX   = e.touches[0].clientX;
    startY   = e.touches[0].clientY;
    dragging = true;
    dragDx   = 0;
    setPos(0, false);
  }, { passive: true });

  carousel.addEventListener('touchmove', e => {
    if (!dragging) return;
    dragDx = e.touches[0].clientX - startX;
    setPos(dragDx, false);
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    if (!dragging) return;
    dragging = false;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dragDx) < Math.abs(dy) || Math.abs(dragDx) < 40) {
      setPos(0, true);
      return;
    }
    goTo(dragDx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  // Mouse drag (desktop)
  let mouseActive = false;
  carousel.addEventListener('mousedown', e => {
    if (e.target.closest('.hc-arrow')) return;
    mouseActive = true;
    startX  = e.clientX;
    dragDx  = 0;
    carousel.classList.add('is-dragging');
    setPos(0, false);
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!mouseActive) return;
    dragDx = e.clientX - startX;
    setPos(dragDx, false);
  });

  document.addEventListener('mouseup', () => {
    if (!mouseActive) return;
    mouseActive = false;
    carousel.classList.remove('is-dragging');
    if (Math.abs(dragDx) > 40) {
      goTo(dragDx < 0 ? current + 1 : current - 1);
    } else {
      setPos(0, true);
    }
    dragDx = 0;
  });

  // Setas
  const prevBtn = carousel.querySelector('.hc-arrow-prev');
  const nextBtn = carousel.querySelector('.hc-arrow-next');
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  if (window.innerWidth <= 900) maybeCropHeroImages();

  goTo(0);
}

initHeroCarousel();

/* ─── 11. Page entered ────────────────────────────────────── */
document.body.classList.add('page-ready');
