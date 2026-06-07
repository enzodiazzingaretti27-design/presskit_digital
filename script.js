/* ============================================================
   DATES — auto mark past shows
   ============================================================ */
(function initDates() {
  const MONTH_MAP = {
    enero:0, ene:0, febrero:1, feb:1, marzo:2, mar:2,
    abril:3, abr:3, mayo:4, junio:5, jun:5,
    julio:6, jul:6, agosto:7, ago:7, septiembre:8, sep:8,
    octubre:9, oct:9, noviembre:10, nov:10, diciembre:11, dic:11
  };

  function parseDate(raw) {
    const text = String(raw).trim().toLowerCase();
    const m = text.match(/^(\d{1,2})\s+([a-záéíóúüñ]+)\s+(\d{4})$/i);
    if (!m) return null;
    const day = Number(m[1]);
    const month = MONTH_MAP[m[2].normalize('NFD').replace(/[\u0300-\u036f]/g,'')];
    const year = Number(m[3]);
    if (month === undefined) return null;
    return new Date(year, month, day, 12, 0, 0);
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  document.querySelectorAll('.dates__row').forEach(row => {
    const raw = row.dataset.date;
    const parsed = parseDate(raw);
    const statusEl = row.querySelector('.dates__status');
    if (parsed && parsed.getTime() < today.getTime()) {
      row.classList.add('dates__row--past');
      if (statusEl) {
        statusEl.textContent = 'Past';
        statusEl.classList.remove('dates__status--upcoming');
        statusEl.classList.add('dates__status--past');
      }
    }
  });
})();

/* ============================================================
   PARALLAX
   ============================================================ */
const heroBg = document.getElementById('heroBg');

let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const factor  = 0.35;
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrollY * factor}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }
});

/* ============================================================
   PARTICLES
   ============================================================ */
(function initParticles() {
  const canvas  = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  let W, H, particles;

  const CONFIG = {
    count:      60,
    minSize:    0.5,
    maxSize:    2,
    minSpeed:   0.08,
    maxSpeed:   0.35,
    minOpacity: 0.03,
    maxOpacity: 0.18,
    colors:     ['#c8c8c8', '#aaaaaa', '#888888', '#ffffff'],
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    return {
      x:       rand(0, W),
      y:       rand(0, H),
      size:    rand(CONFIG.minSize, CONFIG.maxSize),
      speedX:  rand(-CONFIG.maxSpeed, CONFIG.maxSpeed),
      speedY:  rand(-CONFIG.maxSpeed, -CONFIG.minSpeed),
      opacity: rand(CONFIG.minOpacity, CONFIG.maxOpacity),
      color:   CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
      pulse:   rand(0, Math.PI * 2),
      pulseSpeed: rand(0.005, 0.02),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < -10)        p.y = H + 10;
      if (p.x < -10)        p.x = W + 10;
      if (p.x > W + 10)     p.x = -10;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  draw();
})();

/* ============================================================
   SCROLL INDICATOR — smooth scroll on click
   ============================================================ */
const scrollIndicator = document.getElementById('scrollIndicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  });
}

/* ============================================================
   SUBTLE MOUSE PARALLAX on hero content
   ============================================================ */
(function mouseParallax() {
  const content = document.querySelector('.hero__content');
  if (!content) return;

  let mouseX = 0, mouseY = 0;
  let curX   = 0, curY   = 0;
  const strength = 8;

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * strength;
    mouseY = (e.clientY / window.innerHeight - 0.5) * strength;
  });

  function animate() {
    curX += (mouseX - curX) * 0.06;
    curY += (mouseY - curY) * 0.06;
    content.style.transform = `translate(${curX * 0.4}px, ${curY * 0.4}px)`;
    requestAnimationFrame(animate);
  }

  animate();
})();

/* ============================================================
   BIO — SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function bioReveal() {
  const revealEls = document.querySelectorAll('.reveal-left, .reveal-right');
  const borderLines = document.querySelectorAll('.bio__border-line--animated');

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in-view'));
    borderLines.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const borderObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        borderObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  revealEls.forEach(el => observer.observe(el));
  borderLines.forEach(el => borderObserver.observe(el));
})();

/* ============================================================
   BIO — IMAGE PARALLAX on scroll
   ============================================================ */
(function bioParallax() {
  const bioImg = document.querySelector('.bio__img');
  if (!bioImg) return;

  let bioTicking = false;

  function updateBioParallax() {
    const section = document.getElementById('bio');
    if (!section) return;

    const rect     = section.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset   = (progress - 0.5) * 60;

    bioImg.style.transform = `translateY(${offset}px) scale(1.08)`;
    bioTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!bioTicking) {
      requestAnimationFrame(updateBioParallax);
      bioTicking = true;
    }
  });

  updateBioParallax();
})();

/* ============================================================
   RIDER — SCROLL REVEAL for reveal-up elements
   ============================================================ */
(function riderReveal() {
  const upEls = document.querySelectorAll('.reveal-up');
  if (!upEls.length) return;

  if (!('IntersectionObserver' in window)) {
    upEls.forEach(el => el.classList.add('in-view'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  upEls.forEach(el => obs.observe(el));
})();

/* ============================================================
   RIDER — WAVEFORM bar generator
   ============================================================ */
(function buildWaveform() {
  const container = document.getElementById('waveBars');
  if (!container) return;

  const count = 48;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const bar = document.createElement('div');
    bar.className = 'rcard__wave-bar';
    const h = Math.random() * 80 + 20;
    const dur = (Math.random() * 0.8 + 0.7).toFixed(2);
    const del = (Math.random() * 1.2).toFixed(2);
    bar.style.cssText = `height:${h}%;--dur:${dur}s;--del:${del}s`;
    fragment.appendChild(bar);
  }

  container.appendChild(fragment);
})();

/* ============================================================
   RIDER — background subtle parallax
   ============================================================ */
(function riderParallax() {
  const riderBg = document.getElementById('riderBg');
  if (!riderBg) return;

  let rTicking = false;

  function update() {
    const section = document.getElementById('rider');
    if (!section) return;
    const rect     = section.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset   = (progress - 0.5) * 50;
    riderBg.style.transform = `translateY(${offset}px)`;
    rTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!rTicking) {
      requestAnimationFrame(update);
      rTicking = true;
    }
  });

  update();
})();

/* ============================================================
   LIVE — background parallax
   ============================================================ */
(function liveParallax() {
  const liveBg  = document.getElementById('liveBg');
  const liveImg = document.querySelector('.live__img');
  if (!liveBg) return;

  let lTicking = false;

  function update() {
    const section = document.getElementById('live');
    if (!section) return;
    const rect     = section.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset   = (progress - 0.5) * 60;

    liveBg.style.transform = `translateY(${offset}px)`;

    if (liveImg) {
      liveImg.style.transform = `translateY(${offset * 0.3}px) scale(1.05)`;
    }

    lTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!lTicking) {
      requestAnimationFrame(update);
      lTicking = true;
    }
  });

  update();
})();

/* ============================================================
   MOBILE NAV — toggle on logo click
   ============================================================ */
(function mobileNav() {
  const toggle = document.getElementById('menuToggle');
  const nav    = document.getElementById('mobileNav');
  const close  = document.getElementById('menuClose');
  if (!toggle || !nav) return;

  function openNav() {
    nav.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openNav);
  toggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openNav(); });
  close.addEventListener('click', closeNav);

  nav.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });
})();

/* ============================================================
   I18N — Translations & Language Switcher
   ============================================================ */
(function i18n() {

  const translations = {
    en: {
      'nav.bio':        'Bio',
      'nav.dates':      'Dates',
      'nav.rider':      'Rider',
      'nav.live':       'Live',
      'nav.contact':    'Contact',
      'dates.label':    'Upcoming Shows',
      'hero.tag':       'Mendoza · Argentina',
      'hero.subtitle':  'Techno · Schranz · Industrial',
      'hero.desc':      'Underground DJ from Argentina. Raw sound, fast mixing, dense layers.',
      'hero.cta1':      'Listen Now',
      'hero.cta2':      'Book KEXXY',
      'hero.stat1':     'Years of Experience',
      'hero.stat2':     'Cities',
      'bio.label':      'Biography',
      'bio.title':      'Biography.',
      'bio.p1':         "KEXXY is a DJ and producer from Mendoza, Argentina. Born out of the pandemic in 2020, the project began as a personal exploration of electronic music alongside friends — a creative outlet that quickly evolved into a serious commitment to the underground.",
      'bio.p2':         "His sound is defined by fast blending, heavy layering, and crushing textures — a relentless forward momentum that draws from Techno, Industrial, Schranz, Hardgroove and Raw. On the decks, KEXXY builds dense, physical sets that prioritize energy and precision over comfort.",
      'bio.p3':         "Over 6 years, KEXXY has shared the booth with key figures of the Argentine underground scene including Dist. Raptis, Shodnan Ref, Uma Scheffer, and West Code — performing across Mendoza and Buenos Aires at some of the region's most respected clubs and events.",
      'bio.quote':      "Heavy layers, fast blends, zero filters.",
      'bio.cite':       '— KEXXY',
      'rider.title':    'Artist Specifications',
      'rider.subtitle': 'Everything a promoter or booker needs to know.',
      'live.label':     'Live Performance',
      'live.status':    'Available for booking',
      'live.stat1':     'Live Shows',
      'live.stat2':     'Cities',
      'live.stat3':     'Longest Set',
      'live.stat4':     'Avg Capacity',
      'live.ctaLabel':  'Ready to book?',
      'live.ctaSub':    'Contact management for availability and fees.',
      'live.ctaBtn':    'Book a Show',
      'contact.label':       'Contact & Booking',
      'contact.subtitle':    'For bookings, press inquiries, and collaborations — reach out directly or use the form below.',
      'contact.fieldName':   'Name',
      'contact.fieldEmail':  'Email',
      'contact.fieldSubject':'Inquiry Type',
      'contact.fieldMsg':    'Message',
      'contact.fieldVenue':  'Venue / Event (optional)',
      'contact.optDefault':  'Select inquiry type',
      'contact.optBooking':  'Booking Request',
      'contact.optPress':    'Press / Media',
      'contact.optCollab':   'Collaboration',
      'contact.optOther':    'Other',
      'contact.placeholderName': 'Your name',
      'contact.placeholderVenue':'Venue name, city, date',
      'contact.placeholderMsg':  'Tell us about the event, expected attendance, lineup context...',
      'contact.formNote':    'We typically respond within 48 hours.',
      'contact.send':        'Send Message',
      'footer.copy':         '© 2024 KEXXY. All rights reserved. Unauthorized use prohibited.',
    },
    es: {
      'nav.bio':        'Bio',
      'nav.dates':      'Fechas',
      'nav.rider':      'Rider',
      'nav.live':       'En Vivo',
      'nav.contact':    'Contacto',
      'dates.label':    'Próximas Fechas',
      'hero.tag':       'Mendoza · Argentina',
      'hero.subtitle':  'Techno · Schranz · Industrial',
      'hero.desc':      'DJ underground de Argentina. Sonido crudo, mezclas rápidas, capas densas.',
      'hero.cta1':      'Escuchar',
      'hero.cta2':      'Contratar KEXXY',
      'hero.stat1':     'Años de experiencia',
      'hero.stat2':     'Ciudades',
      'bio.label':      'Biografía',
      'bio.title':      'Biografía.',
      'bio.p1':         'KEXXY es un DJ y productor de Mendoza, Argentina. Nacido durante la pandemia en 2020, el proyecto comenzó como una exploración personal de la música electrónica junto a amigos — un espacio creativo que rápidamente se convirtió en un compromiso serio con el underground.',
      'bio.p2':         'Su sonido se define por mezclas rápidas, layering denso y texturas pesadas — un impulso implacable que toma del Techno, Industrial, Schranz, Hardgroove y Raw. En las bandejas, KEXXY construye sets físicos e intensos que priorizan la energía y la precisión por encima de todo.',
      'bio.p3':         'En más de 6 años de trayectoria, KEXXY ha compartido cabina con referentes del underground argentino como Dist. Raptis, Shodnan Ref, Uma Scheffer y West Code — presentando sus sets en Mendoza y Buenos Aires en algunos de los clubes y eventos más destacados de la región.',
      'bio.quote':      'Mezclas rápidas, layers pesados, cero filtros.',
      'bio.cite':       '— KEXXY',
      'rider.title':    'Especificaciones del Artista',
      'rider.subtitle': 'Todo lo que un promotor o booker necesita saber.',
      'live.label':     'En Vivo',
      'live.status':    'Disponible para contratación',
      'live.stat1':     'Shows en Vivo',
      'live.stat2':     'Ciudades',
      'live.stat3':     'Set más largo',
      'live.stat4':     'Cap. Promedio',
      'live.ctaLabel':  '¿Listo para contratar?',
      'live.ctaSub':    'Contactá al management para disponibilidad y tarifas.',
      'live.ctaBtn':    'Contratar Show',
      'contact.label':       'Contacto y Contratación',
      'contact.subtitle':    'Para contrataciones, consultas de prensa y colaboraciones — escribinos directo o usá el formulario.',
      'contact.fieldName':   'Nombre',
      'contact.fieldEmail':  'Email',
      'contact.fieldSubject':'Tipo de consulta',
      'contact.fieldMsg':    'Mensaje',
      'contact.fieldVenue':  'Venue / Evento (opcional)',
      'contact.optDefault':  'Seleccioná el tipo de consulta',
      'contact.optBooking':  'Solicitud de contratación',
      'contact.optPress':    'Prensa / Medios',
      'contact.optCollab':   'Colaboración',
      'contact.optOther':    'Otro',
      'contact.placeholderName': 'Tu nombre',
      'contact.placeholderVenue':'Nombre del venue, ciudad, fecha',
      'contact.placeholderMsg':  'Contanos sobre el evento, capacidad estimada, contexto del lineup...',
      'contact.formNote':    'Respondemos en un máximo de 48 horas.',
      'contact.send':        'Enviar Mensaje',
      'footer.copy':         '© 2024 KEXXY. Todos los derechos reservados.',
    },
    pt: {
      'nav.bio':        'Bio',
      'nav.dates':      'Datas',
      'nav.rider':      'Rider',
      'nav.live':       'Ao Vivo',
      'nav.contact':    'Contato',
      'dates.label':    'Próximas Datas',
      'hero.tag':       'Mendoza · Argentina',
      'hero.subtitle':  'Techno · Schranz · Industrial',
      'hero.desc':      'DJ underground da Argentina. Som cru, mixagens rápidas, camadas densas.',
      'hero.cta1':      'Ouvir Agora',
      'hero.cta2':      'Contratar KEXXY',
      'hero.stat1':     'Anos de experiência',
      'hero.stat2':     'Cidades',
      'bio.label':      'Biografia',
      'bio.title':      'Biografia.',
      'bio.p1':         'KEXXY é um DJ e produtor de Mendoza, Argentina. Nascido durante a pandemia em 2020, o projeto começou como uma exploração pessoal da música eletrônica com amigos — um espaço criativo que rapidamente se tornou um compromisso sério com o underground.',
      'bio.p2':         'Seu som é definido por mixagens rápidas, layering denso e texturas pesadas — um impulso implacable que bebe do Techno, Industrial, Schranz, Hardgroove e Raw. Nas pick-ups, KEXXY constrói sets físicos e intensos que priorizam energia e precisão acima de tudo.',
      'bio.p3':         'Em mais de 6 anos de trajetória, KEXXY já dividiu a cabine com referências do underground argentino como Dist. Raptis, Shodnan Ref, Uma Scheffer e West Code — se apresentando em Mendoza e Buenos Aires nos clubes e eventos mais respeitados da região.',
      'bio.quote':      'Mixagens rápidas, layers pesados, zero filtros.',
      'bio.cite':       '— KEXXY',
      'rider.title':    'Especificações do Artista',
      'rider.subtitle': 'Tudo que um promotor ou booker precisa saber.',
      'live.label':     'Ao Vivo',
      'live.status':    'Disponível para contratação',
      'live.stat1':     'Shows ao Vivo',
      'live.stat2':     'Cidades',
      'live.stat3':     'Maior Set',
      'live.stat4':     'Cap. Média',
      'live.ctaLabel':  'Pronto para contratar?',
      'live.ctaSub':    'Entre em contato com o management para disponibilidade e cachês.',
      'live.ctaBtn':    'Contratar Show',
      'contact.label':       'Contato e Contratação',
      'contact.subtitle':    'Para contratações, assessoria de imprensa e colaborações — fale diretamente ou use o formulário.',
      'contact.fieldName':   'Nome',
      'contact.fieldEmail':  'E-mail',
      'contact.fieldSubject':'Tipo de consulta',
      'contact.fieldMsg':    'Mensagem',
      'contact.fieldVenue':  'Venue / Evento (opcional)',
      'contact.optDefault':  'Selecione o tipo de consulta',
      'contact.optBooking':  'Solicitação de contratação',
      'contact.optPress':    'Imprensa / Mídia',
      'contact.optCollab':   'Colaboração',
      'contact.optOther':    'Outro',
      'contact.placeholderName': 'Seu nome',
      'contact.placeholderVenue':'Nome do venue, cidade, data',
      'contact.placeholderMsg':  'Conte-nos sobre o evento, capacidade esperada, contexto do lineup...',
      'contact.formNote':    'Respondemos em até 48 horas.',
      'contact.send':        'Enviar Mensagem',
      'footer.copy':         '© 2024 KEXXY. Todos os direitos reservados.',
    }
  };

  function applyLang(lang) {
    const t = translations[lang] || translations['en'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('kexxy-lang', lang);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
  });

  const saved = localStorage.getItem('kexxy-lang') || 'es';
  applyLang(saved);

})();

/* ============================================================
   CONTACT — image parallax
   ============================================================ */
(function contactParallax() {
  const wrap = document.getElementById('contactImgWrap');
  if (!wrap) return;

  let cTicking = false;

  function update() {
    const section = document.getElementById('contact');
    if (!section) return;
    const rect     = section.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset   = (progress - 0.5) * 50;
    wrap.style.transform = `translateY(${offset}px)`;
    cTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!cTicking) {
      requestAnimationFrame(update);
      cTicking = true;
    }
  });

  update();
})();
