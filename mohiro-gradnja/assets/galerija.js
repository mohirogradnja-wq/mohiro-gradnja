/* MOHIRO gradnja: filteri galerije i uvećanje slika */
(function () {
  const grid = document.getElementById('galerija');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.card')];
  const chips = [...document.querySelectorAll('.gal-chip')];
  const moreWrap = document.querySelector('.gal-more-wrap');
  const moreBtn = document.getElementById('galMore');
  let filter = 'sve', expanded = false;

  function show(els) {
    if (window.gsap) gsap.set(els, { opacity: 1, y: 0, rotateX: 0, rotateY: 0 });
    els.forEach(el => el.classList.add('visible'));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function apply() {
    const shown = [];
    cards.forEach(c => {
      const ok = filter === 'sve' ? (expanded || !c.classList.contains('is-more')) : c.dataset.cat === filter;
      c.hidden = !ok;
      if (ok) shown.push(c);
    });
    moreWrap.hidden = filter !== 'sve' || expanded;
    return shown;
  }
  chips.forEach(ch => ch.addEventListener('click', () => {
    filter = ch.dataset.filter;
    chips.forEach(x => { const a = x === ch; x.classList.toggle('is-active', a); x.setAttribute('aria-pressed', a); });
    show(apply());
  }));
  moreBtn.addEventListener('click', () => { expanded = true; show(apply()); });
  apply();

  /* Uvećanje */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Uvećana fotografija');
  lb.innerHTML = '<button type="button" class="lb-btn lb-close" aria-label="Zatvori">&times;</button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="Prethodna">&#8249;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-btn lb-next" aria-label="Sledeća">&#8250;</button>';
  document.body.appendChild(lb);
  const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
  let list = [], idx = 0, lastFocus = null;

  function render() {
    const c = list[idx], src = c.querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    cap.innerHTML = '';
    cap.append(c.querySelector('h3').textContent);
    const n = document.createElement('span');
    n.textContent = (idx + 1) + ' / ' + list.length;
    cap.append(n);
  }
  function open(card) {
    list = cards.filter(c => !c.hidden && c.querySelector('.gal-open'));
    idx = Math.max(0, list.indexOf(card));
    lastFocus = document.activeElement;
    render();
    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  const step = d => { idx = (idx + d + list.length) % list.length; render(); };

  grid.addEventListener('click', e => {
    const b = e.target.closest('.gal-open');
    if (b) open(b.closest('.card'));
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
