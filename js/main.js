// ============================================
// LORY Landing Page — Main Script
// i18n engine, accordion, scroll, form
// ============================================

(function () {
  'use strict';

  // ==================== i18n Engine ====================
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'fr', 'ar'];

  function getSavedLang() {
    try {
      const saved = localStorage.getItem('lory_lang');
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    } catch (_) {}
    const navLang = (navigator.language || navigator.languages?.[0] || '').slice(0, 2);
    if (navLang === 'ar') return 'ar';
    if (navLang === 'fr') return 'fr';
    return 'en';
  }

  let currentLang = getSavedLang();

  function applyLanguage(lang) {
    if (!LORY_I18N[lang]) return;
    currentLang = lang;
    try { localStorage.setItem('lory_lang', lang); } catch (_) {}

    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = LORY_I18N[lang][key];
      if (t !== undefined) el.innerHTML = t;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const t = LORY_I18N[lang][key];
      if (t !== undefined) el.setAttribute('placeholder', t);
    });

    const metaMap = {
      meta_title: 'title', meta_desc: 'description',
      og_title: 'og:title', og_desc: 'og:description',
      tw_title: 'twitter:title', tw_desc: 'twitter:description',
    };
    Object.entries(metaMap).forEach(([key, attr]) => {
      const text = LORY_I18N[lang][key];
      if (!text) return;
      if (key === 'meta_title') { document.title = text; return; }
      const meta = document.querySelector(`meta[property="${attr}"], meta[name="${attr}"]`);
      if (meta) meta.setAttribute('content', text);
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn) {
      const lang = btn.getAttribute('data-lang');
      if (lang && lang !== currentLang) applyLanguage(lang);
    }
  });

  applyLanguage(currentLang);

  // ==================== Accordion ====================
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  // ==================== Navbar Scroll ====================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ==================== Phone Rotate on Scroll ====================
  const phone = document.querySelector('.phone-mockup');
  if (phone && window.innerWidth > 1024) {
    window.addEventListener('scroll', () => {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      const heroH = hero.offsetHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / (heroH * 0.6), 1);
      const angle = 8 - progress * 8;
      const tiltX = 4 - progress * 3;
      const dir = document.documentElement.dir === 'rtl' ? 1 : -1;
      phone.style.transform = `perspective(1200px) rotateY(${dir * angle}deg) rotateX(${tiltX}deg)`;
    });
  }

  // ==================== Smooth Scroll ====================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==================== Scroll Reveal ====================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ==================== Philosophy Card Tilt ====================
  document.querySelectorAll('.philosophy-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ==================== City Pills ====================
  document.querySelectorAll('.city-pill').forEach(pill => {
    pill.addEventListener('click', () => pill.classList.toggle('active'));
  });

  // ==================== Waitlist Form ====================
  const form = document.getElementById('waitlist-form');
  const success = document.getElementById('waitlist-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const name = document.getElementById('name').value.trim();
      const consent = document.getElementById('consent').checked;

      if (!email) { shakeElement(form.querySelector('.form-row')); return; }
      if (!consent) {
        const row = form.querySelector('.consent-row');
        row.style.color = '#F75C03';
        setTimeout(() => { row.style.color = ''; }, 2000);
        return;
      }

      const activeCities = [...document.querySelectorAll('.city-pill.active')].map(p => p.textContent.trim());
      const btn = form.querySelector('.btn-submit');
      const sendingText = LORY_I18N[currentLang]?.waitlist_sending || 'Sending...';
      btn.innerHTML = sendingText;
      btn.disabled = true;

      try {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('name', name || '(not provided)');
        params.append('cities', activeCities.join(', '));
        params.append('source', 'lory-landing-page');
        await fetch('https://script.google.com/macros/s/AKfycbxv7w6ElnC1LEW-7XAJj_RZE4OoaDBW7_O_R5sajNXivI50BgyNvdRYs4W1HjLz-Qi4/exec', {
          method: 'POST', body: params,
        });

        createConfetti();
        form.style.display = 'none';
        success.classList.add('show');
      } catch (err) {
        console.error('Form submit error:', err);
        btn.innerHTML = LORY_I18N[currentLang]?.waitlist_btn || 'Get Early Access <span class="arrow">→</span>';
        btn.disabled = false;
      }
    });
  }

  // ==================== Share ====================
  const shareBtn = document.querySelector('.btn-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const text = LORY_I18N[currentLang]?.share_text || 'Meet Lory — your AI travel buddy that works offline 🦜 Join the waitlist:';
      const url = window.location.href;
      if (navigator.share) { navigator.share({ title: 'LORY — AI Travel Guide', text, url }).catch(() => {}); }
      else { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400'); }
    });
  }

  // ==================== Confetti ====================
  function createConfetti() {
    const colors = ['#F1C40F', '#F75C03', '#3066BE', '#18FF6D', '#D90368', '#758BFD'];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const s = Math.random() * 8 + 4;
      el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}%;width:${s}px;height:${s*0.6}px;background:${color};border-radius:2px;z-index:9999;pointer-events:none;animation:confettiFall ${Math.random()*2+1.5}s ease-out ${Math.random()*0.8}s forwards;transform:rotate(${Math.random()*720-360}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }

  function shakeElement(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.animation = ''; }, 500);
  }

})();
