/* BlueSparrow Labs — Core JS (no dependencies) */
(function(){
  'use strict';

  // === Contact form provider configuration ===
  // Options: 'web3forms' | 'emailjs' | 'both_random'
  const CONTACT_PROVIDER_MODE = 'both_random';
  const WEB3FORMS_ACCESS_KEY = '5739fac0-a63f-4b46-b377-930b1b1ceafe';
  const EMAILJS_PUBLIC_KEY = 'MJcONX-webQAjulkW';
  const EMAILJS_SERVICE_ID = 'service_dqvqsnd';
  const EMAILJS_TEMPLATE_ID = 'template_a5i2vxn';

  const qs = (s, ctx=document) => ctx.querySelector(s);
  const qsa = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

  const header = qs('.site-header');
  const nav = qs('#site-nav');
  const toggle = qs('.nav-toggle');
  const links = qsa('.nav-link');
  const yearEl = qs('#year');
  if(yearEl){ yearEl.textContent = String(new Date().getFullYear()); }

  // Sticky header background on scroll + dynamic glass/blur
  const ease = (t) => t*t*(3 - 2*t); // smoothstep
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const onScroll = () => {
    if(!header) return;
    const maxAt = 240; // px
    const y = clamp(window.scrollY / maxAt, 0, 1);
    const k = ease(y);
    const glass = 0.08 + (0.02 * k); // 0.08 → 0.10 (subtle)
    const blur = 6 + (6 * k);        // 6px → 12px
    header.style.setProperty('--header-glass', String(glass.toFixed(3)));
    header.style.setProperty('--header-blur', blur.toFixed(1) + 'px');
    const scrolled = window.scrollY > 8;
    header.classList.toggle('is-scrolled', scrolled);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile nav toggle with outside click
  const closeNav = () => {
    if(!nav) return;
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded','false');
    document.removeEventListener('click', outsideHandler);
    document.removeEventListener('keydown', escHandler);
  };
  const openNav = () => {
    if(!nav) return;
    nav.classList.add('is-open');
    toggle?.setAttribute('aria-expanded','true');
    setTimeout(()=>{
      document.addEventListener('click', outsideHandler);
      document.addEventListener('keydown', escHandler);
    },0);
  };
  const outsideHandler = (e) => {
    if(!nav || !toggle) return;
    const within = nav.contains(e.target) || toggle.contains(e.target);
    if(!within) closeNav();
  };
  const escHandler = (e) => { if(e.key === 'Escape') closeNav(); };
  toggle?.addEventListener('click', (e)=>{
    e.stopPropagation();
    nav?.classList.contains('is-open') ? closeNav() : openNav();
  });

  // Smooth scroll with header offset
  const headerOffset = () => header ? header.getBoundingClientRect().height - 1 : 0;
  const smoothScrollToId = (id) => {
    const el = qs(id);
    if(!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({top, behavior:'smooth'});
  };
  links.forEach(link => {
    link.addEventListener('click', (e)=>{
      const href = link.getAttribute('href');
      if(href && href.startsWith('#')){
        e.preventDefault();
        smoothScrollToId(href);
        closeNav();
      }
    });
  });

  // Active section highlighting
  const sections = qsa('main > section');
  if('IntersectionObserver' in window && sections.length){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const id = '#' + entry.target.id;
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
        }
      })
    },{rootMargin: '-40% 0px -50% 0px', threshold: 0});
    sections.forEach(s => observer.observe(s));
  }

  // Modal system
  const modals = qsa('.modal');
  const openModal = (modal) => {
    modal.setAttribute('aria-hidden','false');
    const focusable = modal.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    (focusable)?.focus();
    document.addEventListener('keydown', trapHandler);
  };
  const closeModal = (modal) => {
    modal.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', trapHandler);
  };
  const trapHandler = (e) => {
    if(e.key !== 'Tab') return;
    const m = modals.find(m => m.getAttribute('aria-hidden') === 'false');
    if(!m) return;
    const focusables = qsa('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])', m)
      .filter(el => !el.hasAttribute('disabled'));
    if(!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
  };
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-modal-target]');
    if(btn){
      const sel = btn.getAttribute('data-modal-target');
      const modal = sel ? qs(sel) : null;
      if(modal) openModal(modal);
    }
    if(e.target.matches('[data-close]')){
      const modal = e.target.closest('.modal');
      if(modal) closeModal(modal);
    }
  });

  // Initialize EmailJS if configured and available
  const maybeInitEmailJS = () => {
    try {
      if(typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY){
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }
    } catch(_) { /* noop */ }
  };
  maybeInitEmailJS();

  // Contact form: validation + provider selection + submit
  const form = qs('.contact-form');
  const status = qs('.form-status');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  const chooseProvider = () => {
    const hasWeb3Forms = Boolean(WEB3FORMS_ACCESS_KEY);
    const hasEmailJS = Boolean(EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && typeof emailjs !== 'undefined');
    if(CONTACT_PROVIDER_MODE === 'web3forms') return hasWeb3Forms ? 'web3forms' : null;
    if(CONTACT_PROVIDER_MODE === 'emailjs') return hasEmailJS ? 'emailjs' : null;
    // both_random
    if(hasWeb3Forms && hasEmailJS){
      return Math.random() < 0.5 ? 'web3forms' : 'emailjs';
    }
    if(hasWeb3Forms) return 'web3forms';
    if(hasEmailJS) return 'emailjs';
    return null;
  };

  const setStatus = (message, color='') => {
    if(!status) return;
    status.textContent = message;
    status.style.color = color;
  };

  const toggleSubmitting = (isSubmitting) => {
    if(submitBtn){
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? 'Sending…' : 'Send Message';
    }
  };

  const sendViaWeb3Forms = async (data) => {
    const payload = Object.fromEntries(data.entries());
    payload.access_key = WEB3FORMS_ACCESS_KEY;
    // Recommended fields
    payload.from_name = payload.name;
    payload.from_email = payload.email;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if(json.success){
        return { ok: true };
      }
      return { ok: false, error: json.message || 'Web3Forms error' };
    } catch(err){
      return { ok: false, error: 'Network error (Web3Forms)' };
    }
  };

  const sendViaEmailJS = async (data) => {
    const templateParams = Object.fromEntries(data.entries());
    try {
      const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      if(result && (result.status === 200 || result.text === 'OK')){
        return { ok: true };
      }
      return { ok: false, error: 'EmailJS error' };
    } catch(err){
      return { ok: false, error: 'Network error (EmailJS)' };
    }
  };

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const required = ['name','email','subject','message'];
    const invalid = required.filter(n => !String(data.get(n)||'').trim());
    if(invalid.length){
      setStatus('Please fill in all required fields.', '#ff9b9b');
      return;
    }
    const provider = chooseProvider();
    if(!provider){
      setStatus('Contact providers are not configured yet.', '#ff9b9b');
      return;
    }
    toggleSubmitting(true);
    setStatus('Sending…');
    let result;
    if(provider === 'web3forms') result = await sendViaWeb3Forms(data);
    else result = await sendViaEmailJS(data);
    toggleSubmitting(false);
    if(result.ok){
      setStatus('Thanks! Your message was sent successfully.');
      form.reset();
    } else {
      setStatus(result.error || 'Something went wrong. Please try again later.', '#ff9b9b');
    }
  });
})();


