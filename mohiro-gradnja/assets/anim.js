// MOHIRO gradnja: 3D preloader, 3D pozadina u hero sekciji i animacije pri skrolovanju.
// Ako se biblioteke ne učitaju ili korisnik ne želi animacije, sajt radi kao i pre.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

// Linije MOHIRO znaka (koordinate iz logotipa)
const SEGS = [
  [75, 730, 75, 70], [75, 70, 290, 70], [290, 70, 290, 325], [290, 325, 520, 535], [520, 535, 735, 325],
  [290, 325, 520, 70], [520, 70, 735, 70], [735, 70, 735, 730], [520, 0, 520, 780], [302, 180, 735, 180]
];
const BEAMS = SEGS.map(([x1, y1, x2, y2]) => {
  const dx = (x2 - x1) / 100, dy = -(y2 - y1) / 100;
  const a = Math.atan2(dy, dx);
  const straight = Math.abs(Math.sin(a)) < 1e-3 || Math.abs(Math.cos(a)) < 1e-3;
  return { len: Math.hypot(dx, dy), cx: ((x1 + x2) / 2 - 405) / 100, cy: -((y1 + y2) / 2 - 390) / 100, a, straight };
});

function beamGeometry(b, t) {
  return new THREE.BoxGeometry(b.len + (b.straight ? t : t * 0.35), t, t);
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}

function splitWords(el) {
  const out = [];
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const w = document.createElement('span'); w.className = 'mh-word';
          const i = document.createElement('span'); i.textContent = p;
          w.appendChild(i); frag.appendChild(w); out.push(i);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return out;
}

/* ---------------- Preloader ---------------- */
function runPreloader(gl) {
  return new Promise(resolve => {
    const pre = document.getElementById('preloader');
    if (!pre || pre.classList.contains('fade-out')) { if (pre) pre.remove(); resolve(); return; }

    let resolved = false, finished = false, cleanup = () => {};
    const go = () => { if (!resolved) { resolved = true; resolve(); } };
    const finish = () => {
      if (finished) return; finished = true;
      cleanup(); document.body.style.overflow = ''; pre.remove(); go();
    };
    setTimeout(() => { if (!finished) gsap.to(pre, { opacity: 0, duration: .4, onComplete: finish }); go(); }, 8000);

    document.body.style.overflow = 'hidden';
    const txt = document.createElement('div');
    txt.className = 'mh-pre-text';
    txt.innerHTML = '<b>MOHIRO</b><small>GRADNJA</small><span class="mh-pre-line"></span><i>ČVRST TEMELJ. TRAJNO DELO.</i>';
    pre.appendChild(txt);
    const line = txt.querySelector('.mh-pre-line');
    gsap.set([txt.querySelector('b'), txt.querySelector('small'), txt.querySelector('i')], { opacity: 0, y: 18 });
    gsap.set(line, { scaleX: 0 });
    gsap.set(pre, { clipPath: 'circle(150% at 50% 42%)' });

    const tl = gsap.timeline();
    let T = 0.6; // trenutak kad počinje tekst

    if (gl) {
      const canvas = document.createElement('canvas');
      canvas.id = 'mh-canvas';
      pre.prepend(canvas);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
      const lookY = { v: 0 };
      const resize = () => {
        const w = pre.clientWidth, h = pre.clientHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
        const dH = (7.8 / 0.4) / (2 * tan);
        const dW = (6.6 / 0.62) / (2 * tan) / cam.aspect;
        const d = Math.max(dH, dW);
        const viewH = 2 * d * tan;
        lookY.v = -0.09 * viewH;
        cam.position.set(0, lookY.v, d);
        cam.userData.baseZ = d;
        cam.updateProjectionMatrix();
      };
      resize();
      addEventListener('resize', resize);

      const mat = new THREE.MeshStandardMaterial({ color: 0xc7a663, metalness: 1, roughness: 0.28, envMapIntensity: 1.2 });
      const group = new THREE.Group();
      scene.add(group);
      const key = new THREE.DirectionalLight(0xfff0d0, 2.2);
      key.position.set(-8, 6, 10);
      const fill = new THREE.DirectionalLight(0xffe6b8, 1.1);
      fill.position.set(3, -6, 9);
      scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.35));

      const t = 0.26, r = () => gsap.utils.random(-1, 1);
      BEAMS.forEach((b, i) => {
        const m = new THREE.Mesh(beamGeometry(b, t), mat);
        m.position.set(b.cx, b.cy, 0);
        m.rotation.z = b.a;
        group.add(m);
        const at = 0.15 + i * 0.075;
        tl.from(m.position, { x: b.cx + r() * 10, y: b.cy + r() * 8, z: gsap.utils.random(-18, 9), duration: 1.3, ease: 'expo.out' }, at);
        tl.from(m.rotation, { x: r() * Math.PI, y: r() * Math.PI, z: b.a + r() * Math.PI, duration: 1.3, ease: 'expo.out' }, at);
        tl.from(m.scale, { x: 0.02, duration: 1, ease: 'power3.out' }, at);
      });

      group.rotation.set(0.35, -1.0, 0);
      tl.to(group.rotation, { x: 0, y: 0.16, duration: 2.6, ease: 'power3.out' }, 0.1);
      tl.fromTo(key.position, { x: -9 }, { x: 9, duration: 2.8, ease: 'sine.inOut' }, 0.2);
      T = 1.35;

      // izlaz: kamera ulazi u znak, a sajt se otkriva oko njega
      tl.to(group.rotation, { y: 0.7, x: -0.12, duration: 1.15, ease: 'power2.in' }, 3.0);
      tl.to(cam.position, { z: () => cam.userData.baseZ * 0.12, duration: 1.15, ease: 'power3.in' }, 3.0);

      const render = () => { cam.lookAt(0, lookY.v, 0); renderer.render(scene, cam); };
      gsap.ticker.add(render);
      cleanup = () => {
        gsap.ticker.remove(render);
        removeEventListener('resize', resize);
        group.traverse(o => o.geometry && o.geometry.dispose());
        mat.dispose(); envTex.dispose(); pmrem.dispose(); renderer.dispose();
      };
    }

    const parts = [txt.querySelector('b'), txt.querySelector('small'), txt.querySelector('i')];
    tl.to(parts, { opacity: 1, y: 0, duration: .8, stagger: .09, ease: 'power3.out' }, T);
    tl.to(line, { scaleX: 1, duration: 1, ease: 'power3.inOut' }, T + 0.1);
    const exitAt = gl ? 3.0 : 2.0;
    tl.to(txt, { opacity: 0, y: -24, duration: .5, ease: 'power2.in' }, exitAt);
    tl.to(pre, { clipPath: 'circle(0% at 50% 42%)', duration: 1.05, ease: 'power3.inOut' }, exitAt + 0.15);
    tl.call(go, null, exitAt + 0.3);
    tl.call(finish, null, exitAt + 1.25);
  });
}

/* ---------------- Hero ---------------- */
let heroWords = [];
function prepareHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const h1 = hero.querySelector('h1');
  if (h1) heroWords = splitWords(h1);
  gsap.set(heroWords, { yPercent: 115, rotateX: -55 });
  gsap.set(hero.querySelectorAll('.eyebrow, .hero-grid > div:first-child > p, .hero-actions > *, .hero-note span'), { opacity: 0, y: 30 });
  gsap.set(hero.querySelector('.hero-visual'), { opacity: 0, rotateY: -32, rotateX: 10, z: -220, scale: .86, transformPerspective: 1400, transformOrigin: '30% 50%' });
}

function heroIntro() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to(hero.querySelector('.eyebrow'), { opacity: 1, y: 0, duration: .8 }, 0)
    .to(heroWords, { yPercent: 0, rotateX: 0, duration: 1.1, stagger: .045 }, 0.05)
    .to(hero.querySelector('.hero-grid > div:first-child > p'), { opacity: 1, y: 0, duration: .9 }, 0.45)
    .to(hero.querySelectorAll('.hero-actions > *'), { opacity: 1, y: 0, duration: .8, stagger: .1 }, 0.6)
    .to(hero.querySelectorAll('.hero-note span'), { opacity: 1, y: 0, duration: .7, stagger: .08 }, 0.75)
    .to(hero.querySelector('.hero-visual'), { opacity: 1, rotateY: 0, rotateX: 0, z: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, 0.15);
}

function heroBackground() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'mh-hero-bg';
  hero.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const mobile = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  cam.position.set(0, 0, 22);
  const mat = new THREE.LineBasicMaterial({ color: 0x8c6d31, transparent: true, opacity: mobile ? 0.16 : 0.2 });
  const group = new THREE.Group();
  BEAMS.forEach(b => {
    const geo = new THREE.EdgesGeometry(beamGeometry(b, 0.34));
    const l = new THREE.LineSegments(geo, mat);
    l.position.set(b.cx, b.cy, 0);
    l.rotation.z = b.a;
    group.add(l);
  });
  // druga, dublja kopija za utisak prostora
  const back = group.clone();
  back.position.z = -3.2;
  back.traverse(o => { if (o.material) o.material = mat.clone(); });
  back.traverse(o => { if (o.material) o.material.opacity = mobile ? 0.06 : 0.08; });
  const holder = new THREE.Group();
  holder.add(group, back);
  scene.add(holder);

  const place = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const viewH = 2 * cam.position.z * tan, viewW = viewH * cam.aspect;
    const s = (viewH * (mobile ? 0.62 : 0.95)) / 7.8;
    holder.scale.setScalar(s);
    holder.position.x = mobile ? 0 : -viewW * 0.1;
    holder.position.y = mobile ? viewH * 0.12 : 0;
  };
  place();
  addEventListener('resize', place);

  const target = { x: 0, y: 0 };
  if (finePointer) addEventListener('pointermove', e => {
    target.x = (e.clientX / innerWidth - 0.5);
    target.y = (e.clientY / innerHeight - 0.5);
  });

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);
  const t0 = performance.now();
  const tick = () => {
    if (!visible || document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    holder.rotation.y += ((Math.sin(t * 0.25) * 0.45 + target.x * 0.5) - holder.rotation.y) * 0.04;
    holder.rotation.x += ((Math.cos(t * 0.2) * 0.12 + target.y * 0.25) - holder.rotation.x) * 0.04;
    renderer.render(scene, cam);
  };
  gsap.ticker.add(tick);
  gsap.to(canvas, { opacity: 1, duration: 2, ease: 'power2.out', delay: .4 });
  if (ST) gsap.to(holder.position, { z: -6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------------- Skrolovanje ---------------- */
function setupScroll() {
  if (!ST) return;
  const heroRev = new Set(document.querySelectorAll('.hero .reveal'));

  document.querySelectorAll('.section-title').forEach(h => {
    if (h.closest('.hero')) return;
    const words = splitWords(h);
    gsap.from(words, { yPercent: 115, rotateX: -60, duration: 1.05, ease: 'power4.out', stagger: .04,
      scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  document.querySelectorAll('.reveal').forEach(el => {
    if (heroRev.has(el) || el.matches('.card, .service')) return;
    gsap.from(el, { y: 70, opacity: 0, rotateX: -12, transformOrigin: '50% 0%', transformPerspective: 1100,
      duration: 1.15, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  gsap.set('.service, .card', { opacity: 0, y: 90, rotateX: -18, rotateY: 6, transformPerspective: 1200, transformOrigin: '50% 0%' });
  ST.batch('.service, .card', {
    start: 'top 92%', once: true,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, rotateX: 0, rotateY: 0, duration: 1.15, ease: 'power3.out', stagger: .12 })
  });

  document.querySelectorAll('.card-img img, .card-img video').forEach(m => {
    gsap.fromTo(m, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: 'none',
      scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  const about = document.querySelector('.about-img');
  if (about) {
    gsap.fromTo(about, { clipPath: 'inset(16% 16% 16% 16% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.5, ease: 'power3.out',
      scrollTrigger: { trigger: about, start: 'top 85%' } });
    const img = about.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: about, start: 'top 85%' } });
  }

  gsap.from('.step', { x: -50, opacity: 0, duration: .9, ease: 'power3.out', stagger: .12,
    scrollTrigger: { trigger: '.steps', start: 'top 85%' } });

  const form = document.querySelector('.form-card');
  if (form) gsap.from(form, { rotateY: 16, rotateX: 6, transformPerspective: 1400, transformOrigin: '0% 50%', duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: form, start: 'top 85%' } });

  addEventListener('load', () => ST.refresh());
}

/* ---------------- Naginjanje ---------------- */
function setupTilt() {
  if (!finePointer) return;
  const tilt = (el, max, lift) => {
    el.classList.add('mh-tilt');
    const glare = document.createElement('span');
    glare.className = 'mh-glare';
    el.appendChild(glare);
    gsap.set(el, { transformPerspective: 1000 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
    const z = gsap.quickTo(el, 'z', { duration: .6, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 2 * max); rx(-(py - 0.5) * 2 * max); z(lift);
      el.style.setProperty('--gx', (px * 100) + '%');
      el.style.setProperty('--gy', (py * 100) + '%');
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); z(0); });
  };
  document.querySelectorAll('.hero-visual').forEach(el => tilt(el, 7, 0));
  document.querySelectorAll('.card').forEach(el => tilt(el, 5, 24));
  document.querySelectorAll('.service').forEach(el => tilt(el, 6, 24));
}

/* ---------------- Start ---------------- */
if (!reduce && gsap) {
  root.classList.add('mh-anim');
  if (ST) gsap.registerPlugin(ST);
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  const gl = hasWebGL();
  prepareHero();
  setupScroll();
  setupTilt();
  runPreloader(gl).then(() => {
    heroIntro();
    if (gl) { try { heroBackground(); } catch (e) { /* bez 3D pozadine */ } }
  });
}
