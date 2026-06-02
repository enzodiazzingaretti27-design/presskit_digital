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
   I18N — Translations & Language Switcher
   ============================================================ */
(function i18n() {

  const translations = {
    en: {
      'nav.bio':        'Bio',
      'nav.rider':      'Rider',
      'nav.live':       'Live',
      'nav.contact':    'Contact',
      'hero.tag':       'Mendoza · Argentina',
      'hero.subtitle':  'Techno · Industrial · Dark Electronics',
      'hero.desc':      'From the depths of the underground. Raw energy, relentless machines, zero compromise.',
      'hero.cta1':      'Listen Now',
      'hero.cta2':      'Book KEXXY',
      'hero.stat1':     'Shows',
      'hero.stat2':     'Countries',
      'hero.stat3':     'Streams',
      'bio.label':      'Biography',
      'bio.title':      'The Sound of Concrete & Steel.',
      'bio.p1':         "KEXXY emerged from Mendoza's underground rave circuit — a raw, unfiltered force built on the philosophy that the floor is the only judge, and the bass is the only truth.",
      'bio.p2':         "Blending hardcore techno, industrial noise, and dark electronics, KEXXY's sets are renowned for their relentless intensity and visceral precision. No compromise. No filters. Pure machine logic translated into physical force.",
      'bio.p3':         "From underground warehouse raves in Cuyo to international festival stages, KEXXY has cemented a reputation as one of the most uncompromising acts in South America's underground electronics scene. A relentless touring schedule across Argentina and beyond has built a devoted following through nothing but raw energy and a zero-compromise approach to sound.",
      'bio.quote':      "The machine doesn't lie. The machine doesn't perform. The machine simply is.",
      'bio.cite':       '— Resident Advisor, 2023',
      'rider.title':    'Artist Specifications',
      'rider.subtitle': 'Everything a promoter or booker needs to know.',
      'live.label':     'Live Performance',
      'live.status':    'Available for booking',
      'live.stat1':     'Live Shows',
      'live.stat2':     'Countries',
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
      'nav.rider':      'Rider',
      'nav.live':       'En Vivo',
      'nav.contact':    'Contacto',
      'hero.tag':       'Mendoza · Argentina',
      'hero.subtitle':  'Techno · Industrial · Electrónica Oscura',
      'hero.desc':      'Desde las profundidades del underground. Energía bruta, máquinas implacables, cero concesiones.',
      'hero.cta1':      'Escuchar',
      'hero.cta2':      'Contratar KEXXY',
      'hero.stat1':     'Shows',
      'hero.stat2':     'Países',
      'hero.stat3':     'Streams',
      'bio.label':      'Biografía',
      'bio.title':      'El Sonido del Cemento y el Acero.',
      'bio.p1':         'KEXXY surgió del circuito underground de raves de Mendoza — una fuerza cruda e indomable construida sobre la filosofía de que el piso es el único juez, y el bajo es la única verdad.',
      'bio.p2':         'Fusionando techno hardcore, ruido industrial y electrónica oscura, los sets de KEXXY son reconocidos por su intensidad implacable y precisión visceral. Sin concesiones. Sin filtros. Lógica de máquina pura traducida en fuerza física.',
      'bio.p3':         'Desde raves en warehouses en Cuyo hasta escenarios internacionales, KEXXY ha consolidado su reputación como uno de los artistas más radicales de la escena electrónica underground de Sudamérica. Una agenda de giras sin descanso por Argentina y el exterior construyó una base de seguidores fieles a pura energía y sin compromisos.',
      'bio.quote':      'La máquina no miente. La máquina no actúa. La máquina simplemente es.',
      'bio.cite':       '— Resident Advisor, 2023',
      'rider.title':    'Especificaciones del Artista',
      'rider.subtitle': 'Todo lo que un promotor o booker necesita saber.',
      'live.label':     'En Vivo',
      'live.status':    'Disponible para contratación',
      'live.stat1':     'Shows en Vivo',
      'live.stat2':     'Países',
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
      'nav.rider':      'Rider',
      'nav.live':       'Ao Vivo',
      'nav.contact':    'Contato',
      'hero.tag':       'Mendoza · Argentina',
      'hero.subtitle':  'Techno · Industrial · Eletrônica Sombria',
      'hero.desc':      'Das profundezas do underground. Energia bruta, máquinas implacáveis, zero concessões.',
      'hero.cta1':      'Ouvir Agora',
      'hero.cta2':      'Contratar KEXXY',
      'hero.stat1':     'Shows',
      'hero.stat2':     'Países',
      'hero.stat3':     'Streams',
      'bio.label':      'Biografia',
      'bio.title':      'O Som do Concreto e do Aço.',
      'bio.p1':         'KEXXY emergiu do circuito underground de raves de Mendoza — uma força crua e sem filtros construída sobre a filosofia de que o piso de dança é o único juiz, e o grave é a única verdade.',
      'bio.p2':         'Misturando techno hardcore, ruído industrial e eletrônica sombria, os sets de KEXXY são reconhecidos pela intensidade implacável e precisão visceral. Sem concessões. Sem filtros. Lógica de máquina pura traduzida em força física.',
      'bio.p3':         'De raves em galpões no Cuyo até palcos internacionais, KEXXY consolidou sua reputação como um dos artistas mais radicais da cena eletrônica underground da América do Sul. Uma agenda de turnês sem descanso pela Argentina e além construiu uma base de seguidores fiéis através de energia bruta e uma abordagem sem compromissos ao som.',
      'bio.quote':      'A máquina não mente. A máquina não performa. A máquina simplesmente é.',
      'bio.cite':       '— Resident Advisor, 2023',
      'rider.title':    'Especificações do Artista',
      'rider.subtitle': 'Tudo que um promotor ou booker precisa saber.',
      'live.label':     'Ao Vivo',
      'live.status':    'Disponível para contratação',
      'live.stat1':     'Shows ao Vivo',
      'live.stat2':     'Países',
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
