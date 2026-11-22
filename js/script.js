// Marca que o JS está ativo (as animações só acontecem com JS)
document.documentElement.classList.add('js');

// Ano atual no rodapé
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// Borda na barra superior depois de rolar a página
const topbar = document.querySelector('.topbar');
const onScroll = () => topbar && topbar.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// "Executa" o painel de testes do topo quando ele aparece na tela
const run = document.querySelector('.run');
if (run) {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run.classList.add('is-running');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(run);
  } else {
    run.classList.add('is-running');
  }
}

// Abas (artefatos de QA e etapas do teste de API): clique, setas do teclado e botões anterior/próxima
document.querySelectorAll('[data-tabs], [data-api]').forEach((box) => {
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    if (box.hasAttribute('data-api')) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
    });
  });
  box.querySelectorAll('.api-prev, .api-next').forEach((btn) => btn.addEventListener('click', () => {
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = tabs[i + (btn.classList.contains('api-next') ? 1 : -1)];
    if (!next) return;
    select(next);
    document.getElementById(next.getAttribute('aria-controls')).focus({ preventScroll: true });
  }));
});


// Tela principal: entrada, execução de testes, contadores e fundo animado
(function () {
  const root = document.documentElement;
  const hero = document.querySelector('.hero-v2');
  if (!hero) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = () => hero.classList.add('ready');
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(go, 120); // garante a entrada mesmo com a aba em segundo plano

  // contadores dos atalhos
  const counters = [...document.querySelectorAll('.ql .n')];
  function countUp() {
    counters.forEach((el) => {
      const end = +el.dataset.count;
      if (reduce) { el.textContent = end; return; }
      const t0 = performance.now(), dur = 1200;
      el.textContent = '0';
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 1100);
    });
  }
  countUp();

  // execução de testes: digita o comando, mostra o progresso e passa caso a caso
  const typed = document.getElementById('typed'), caret = document.getElementById('caret');
  const prog = document.getElementById('prog'), desc = document.getElementById('desc');
  const cases = [...document.querySelectorAll('#cases li')], summary = document.getElementById('summary');
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function runSpec() {
    timers.forEach(clearTimeout); timers = [];
    const cmd = ' bundle exec rspec';
    if (reduce) {
      typed.textContent = cmd; prog.textContent = '......'; desc.style.opacity = 1;
      cases.forEach((c) => c.classList.add('on')); summary.classList.add('on'); caret.style.display = 'none'; return;
    }
    typed.textContent = ''; prog.textContent = ''; desc.style.opacity = 0; caret.style.display = '';
    cases.forEach((c) => c.classList.remove('on')); summary.classList.remove('on');
    let t = 600;
    [...cmd].forEach((ch, i) => later(() => { typed.textContent += ch; }, t + i * 55));
    t += cmd.length * 55 + 350;
    later(() => { caret.style.display = 'none'; }, t);
    for (let i = 0; i < cases.length; i++) later(() => { prog.textContent += '.'; }, t + 120 + i * 140);
    t += 120 + cases.length * 140 + 200;
    later(() => { desc.style.transition = 'opacity .4s'; desc.style.opacity = 1; }, t);
    cases.forEach((c, i) => later(() => c.classList.add('on'), t + 250 + i * 260));
    later(() => summary.classList.add('on'), t + 250 + cases.length * 260 + 200);
  }
  document.getElementById('replay').addEventListener('click', runSpec);
  runSpec();

  // inclinação leve do terminal e brilho que segue o mouse
  const run = document.getElementById('run');
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--mx', (x * 100) + '%'); hero.style.setProperty('--my', (y * 100) + '%');
      run.style.setProperty('--ry', ((x - .5) * -10) + 'deg'); run.style.setProperty('--rx', ((y - .5) * 6) + 'deg');
    });
  }

  // Fundo: milhares de pássaros em murmuração que cruzam a tela de ponta a ponta e, no meio,
  // formam um casal em pé de mãos dadas com um salsicha e um bulldog
  (function murmuration() {
    const cv = document.getElementById('grid');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    let W = 0, H = 0, dpr = 1, birds = [], t = 0, last = 0, pts = [];

    // ---- cena num quadro de 600 x 300, em partes que se movem separadas ----
    const PART = { BODY: 0, D_TAIL: 1, B_TAIL: 2, HANDS: 3, D_HEAD: 4, B_HEAD: 5 };
    const PIVOT = { 1: [62, 252], 2: [514, 238], 3: [292, 92], 4: [176, 248], 5: [440, 236] };
    function sample(draw, part, step) {
      const c = document.createElement('canvas'); c.width = 600; c.height = 300;
      const g = c.getContext('2d'); g.fillStyle = g.strokeStyle = '#000'; g.lineCap = g.lineJoin = 'round'; draw(g);
      const d = g.getImageData(0, 0, 600, 300).data, out = [];
      for (let y = 0; y < 300; y += step) for (let x = 0; x < 600; x += step) {
        if (d[(y * 600 + x) * 4 + 3] > 128) out.push({ x: x + (Math.random() - .5) * step, y: y + (Math.random() - .5) * step, part });
      }
      return out;
    }
    const line = (g, w, ...p) => { g.lineWidth = w; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
    const ell = (g, x, y, rx, ry, r = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); g.fill(); };

    function scene(step) {
      const people = (g) => {
        // ele: cabeça, tronco, braço solto, pernas
        ell(g, 256, 48, 16, 19);
        g.beginPath(); g.moveTo(226, 78); g.lineTo(286, 78); g.lineTo(280, 164); g.lineTo(232, 164); g.closePath(); g.fill();
        line(g, 12, 248, 66, 262, 66);                 // pescoço
        line(g, 13, 230, 84, 222, 128, 224, 166);      // braço esquerdo, solto
        line(g, 17, 245, 160, 243, 284);               // pernas
        line(g, 17, 268, 160, 271, 284);
        line(g, 10, 236, 288, 254, 288); line(g, 10, 266, 288, 284, 288);
        // ela: cabeça com cabelo longo, vestido, pernas
        ell(g, 334, 60, 14, 17);
        g.beginPath(); g.moveTo(320, 52); g.bezierCurveTo(318, 34, 350, 34, 349, 54); g.bezierCurveTo(352, 80, 350, 98, 344, 104); g.lineTo(322, 100); g.closePath(); g.fill();
        line(g, 10, 334, 76, 334, 88);
        g.beginPath(); g.moveTo(316, 88); g.lineTo(352, 88); g.lineTo(348, 140); g.lineTo(372, 226); g.lineTo(298, 226); g.lineTo(320, 140); g.closePath(); g.fill();
        line(g, 11, 351, 96, 360, 140, 360, 180);      // braço direito, solto
        line(g, 9, 325, 224, 324, 284); line(g, 9, 345, 224, 347, 284);
        line(g, 8, 316, 288, 330, 288); line(g, 8, 343, 288, 356, 288);
      };
      const hands = (g) => {                           // os dois braços de mãos dadas
        line(g, 13, 282, 86, 292, 128, 300, 160);
        line(g, 11, 318, 94, 310, 130, 302, 160);
        ell(g, 301, 164, 9, 8);
      };
      const dachshund = (g) => {                       // salsicha olhando para o casal
        ell(g, 116, 258, 64, 15);
        ell(g, 64, 256, 14, 12);                       // traseiro
        [[70, 266], [88, 268], [146, 268], [164, 266]].forEach(([x, y]) => line(g, 8, x, y, x + 1, 287));
        line(g, 6, 66, 289, 74, 289); line(g, 6, 84, 289, 92, 289); line(g, 6, 143, 289, 151, 289); line(g, 6, 161, 289, 169, 289);
        line(g, 12, 166, 252, 180, 240);               // pescoço
      };
      const dHead = (g) => {
        ell(g, 188, 236, 14, 11);
        g.beginPath(); g.moveTo(194, 230); g.lineTo(222, 240); g.lineTo(220, 246); g.lineTo(190, 246); g.closePath(); g.fill(); // focinho longo
        g.beginPath(); g.moveTo(180, 230); g.bezierCurveTo(170, 236, 170, 252, 178, 258); g.lineTo(186, 240); g.fill();      // orelha caída
      };
      const dTail = (g) => line(g, 5, 54, 252, 40, 240, 30, 226);
      const bulldog = (g) => {                         // bulldog, robusto, virado para o casal
        ell(g, 478, 252, 42, 26);
        ell(g, 452, 246, 26, 28);                      // peito largo
        line(g, 14, 444, 268, 440, 286); line(g, 14, 462, 270, 462, 286);
        line(g, 13, 496, 268, 498, 286); line(g, 13, 510, 266, 514, 286);
        line(g, 8, 432, 289, 448, 289); line(g, 8, 455, 289, 470, 289); line(g, 8, 491, 289, 505, 289); line(g, 8, 508, 289, 522, 289);
      };
      const bHead = (g) => {
        ell(g, 432, 226, 24, 21);
        ell(g, 414, 236, 14, 12);                      // focinho achatado e bochechas
        ell(g, 432, 244, 18, 9);
        g.beginPath(); g.moveTo(416, 210); g.lineTo(408, 196); g.lineTo(424, 206); g.fill();   // orelhas pequenas
        g.beginPath(); g.moveTo(442, 206); g.lineTo(454, 194); g.lineTo(452, 212); g.fill();
      };
      const bTail = (g) => line(g, 7, 516, 238, 526, 232);
      return [
        ...sample(people, PART.BODY, step), ...sample(hands, PART.HANDS, step),
        ...sample(dachshund, PART.BODY, step), ...sample(dHead, PART.D_HEAD, step), ...sample(dTail, PART.D_TAIL, Math.max(3, step - 2)),
        ...sample(bulldog, PART.BODY, step), ...sample(bHead, PART.B_HEAD, step), ...sample(bTail, PART.B_TAIL, Math.max(3, step - 2)),
      ];
    }

    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 640 ? 1500 : W < 1100 ? 2200 : 2800;
      if (birds.length !== n) {
        pts = scene(W < 640 ? 5 : 4);
        birds = [];
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
          birds.push({ x: -200 + Math.cos(a) * r * 140, y: H * .35 + Math.sin(a) * r * 70, vx: 0, vy: 0, ca: a, cr: r,
            p: pts[(i * 7919) % pts.length], delay: Math.random(), flap: Math.random() * 6.28, fs: 9 + Math.random() * 5, sz: 1.6 + Math.random() * 1.4 });
        }
      }
    }

    // ---- roteiro de 22 s ----
    // 0–6 s o bando cruza da esquerda até a direita · 6–8.5 s volta ao meio · 8.5–11.5 s forma a cena
    // 11.5–18 s casal e cães parados · 18–20 s se desfaz · 20–22 s sai pela esquerda para recomeçar
    const CYCLE = 22, HOLD = 14;
    const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    const CELL = 16; let grid = new Map();
    const key = (cx, cy) => cx * 73856093 ^ cy * 19349663;

    function frame(now) {
      const dt = Math.min((now - (last || now)) / 1000, .04); last = now;
      if (!reduce) t += dt;
      const c = t % CYCLE;
      const L = Math.min(1300, W * .82, H * 1.7), sc = L / 600;
      const cx = W * .5 + Math.sin(c * .35) * W * .008, cy = H * .47 + Math.sin(c * .5) * 4;
      const form = smooth(8.5, 11.5, c) * (1 - smooth(18, 20, c));

      // a nuvem: entra pela esquerda, cruza até a direita, volta ao meio; no fim sai pela esquerda
      const cross = smooth(0, 6, c), toMid = smooth(6, 8.5, c), out = smooth(20, 22, c);
      let cloudX = -W * .1 + (W * 1.08) * cross;
      cloudX += (cx - cloudX) * toMid;
      if (c >= 18) cloudX = cx + (-W * .25 - cx) * out;
      const cloudY = H * (.3 + .1 * Math.sin(c * .6)) + (cy - H * .35) * toMid * (1 - out);
      const stretch = c < 8.5 ? 1.6 - toMid * .6 : 1;          // bando mais comprido em voo
      const spread = c > 18 ? 1 + smooth(18, 20.5, c) * 1.6 - out * 1.3 : 1;

      grid = new Map();
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i], k = key(Math.floor(b.x / CELL), Math.floor(b.y / CELL));
        let arr = grid.get(k); if (!arr) grid.set(k, arr = []); arr.push(i);
      }
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = css('--bird') || '#0f1418'; ctx.lineWidth = 1; ctx.lineCap = 'round';
      ctx.beginPath();

      for (const b of birds) {
        const p = b.p; let px = p.x, py = p.y;
        if (p.part !== PART.BODY) {
          const [ox, oy] = PIVOT[p.part];
          const a = p.part === PART.D_TAIL ? Math.sin(t * 9) * .45
            : p.part === PART.B_TAIL ? Math.sin(t * 12) * .5
            : p.part === PART.HANDS ? Math.sin(t * 1.4) * .06
            : p.part === PART.D_HEAD ? Math.sin(t * .9) * .08 - .04
            : Math.sin(t * .7 + 1) * .07;
          const dx = px - ox, dy = py - oy, ca = Math.cos(a), sa = Math.sin(a);
          px = ox + dx * ca - dy * sa; py = oy + dx * sa + dy * ca;
        }
        py += Math.sin(t * 1.6 + px * .01) * 1.2;
        const wx = cx + (px - 300) * sc, wy = cy + (py - 160) * sc;

        const ang = b.ca + t * .25, rr = b.cr * (150 + 40 * Math.sin(t * .8 + b.ca * 3)) * spread;
        const fx = cloudX + Math.cos(ang) * rr * 1.6 * stretch + Math.sin(t * .6 + b.cr * 5) * 30;
        const fy = cloudY + Math.sin(ang) * rr * .65 + Math.cos(t * .7 + b.ca) * 20;
        const m = Math.max(0, Math.min(1, (form - b.delay * .4) / .6));
        const tx = fx + (wx - fx) * m, ty = fy + (wy - fy) * m;

        let sx = 0, sy = 0, ax = 0, ay = 0, n = 0;
        const gx = Math.floor(b.x / CELL), gy = Math.floor(b.y / CELL);
        for (let ix = -1; ix <= 1; ix++) for (let iy = -1; iy <= 1; iy++) {
          const arr = grid.get(key(gx + ix, gy + iy)); if (!arr) continue;
          for (let j = 0; j < arr.length && n < 10; j++) {
            const o = birds[arr[j]]; if (o === b) continue;
            const dx = b.x - o.x, dy = b.y - o.y, d2 = dx * dx + dy * dy;
            if (d2 < 30 && d2 > 0) { sx += dx / d2; sy += dy / d2; }
            ax += o.vx; ay += o.vy; n++;
          }
        }
        if (n) { ax /= n; ay /= n; }
        const turb = (Math.sin(b.y * .013 + t * 1.3) + Math.cos(b.x * .011 - t)) * (28 - m * 22);
        const kT = 1.4 + m * 6;
        b.vx += ((tx - b.x) * kT + sx * 90 + (ax - b.vx) * .9 + turb - b.vx * 1.9) * dt;
        b.vy += ((ty - b.y) * kT + sy * 90 + (ay - b.vy) * .9 - turb * .6 - b.vy * 1.9) * dt;
        const sp = Math.hypot(b.vx, b.vy); if (sp > 620) { b.vx *= 620 / sp; b.vy *= 620 / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (reduce) { b.x = tx; b.y = ty; }

        b.flap += dt * b.fs;
        const h = Math.atan2(b.vy, b.vx || .001), ch = Math.cos(h), sh = Math.sin(h);
        const f = Math.sin(b.flap), s2 = b.sz * (1 - m * .25), wingY = -s2 * .9 * f, wingX = -s2 * .35;
        const tip = (x, y) => [b.x + (x * ch - y * sh), b.y + (x * sh + y * ch) + wingY];
        const [l1, l2] = tip(wingX, -s2 * 1.6), [r1, r2] = tip(wingX, s2 * 1.6);
        ctx.moveTo(l1, l2); ctx.lineTo(b.x, b.y); ctx.lineTo(r1, r2);
        ctx.moveTo(b.x - ch * s2 * .8, b.y - sh * s2 * .8); ctx.lineTo(b.x + ch * s2 * .6, b.y + sh * s2 * .6);
      }
      ctx.globalAlpha = .6; ctx.stroke(); ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    size();
    if (reduce) t = HOLD; // sem movimento: a cena parada no meio
    requestAnimationFrame(frame);
    addEventListener('resize', size);
  })();

})();

// Tema: escuro por padrão, com botão para alternar (a escolha fica salva neste navegador)
(function () {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'light');
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('tema', next); } catch (e) {}
    const f = document.querySelector('.embed-card iframe');
    try { f && f.contentDocument && f.contentDocument.documentElement.setAttribute('data-theme', next); } catch (e) {}
    sync();
  });
  sync();
})();

/* ---------- navegação por telas: a inicial fica fixa e o menu abre cada seção ---------- */
(function () {
  var root = document.documentElement;
  var views = ['experiencia', 'projetos', 'como-testo', 'contato'];
  var inner = { ia: 'como-testo', artefatos: 'como-testo', metricas: 'como-testo', api: 'como-testo' };
  root.classList.add('spa');
  function show(id, sub) {
    var home = views.indexOf(id) < 0;
    root.setAttribute('data-view', home ? 'home' : id);
    views.forEach(function (v) {
      var el = document.getElementById(v);
      if (el) el.hidden = v !== id;
    });
    var nav = document.querySelectorAll('.nav-links a[href^="#"]');
    for (var i = 0; i < nav.length; i++) {
      var on = nav[i].getAttribute('href') === '#' + id;
      if (on) nav[i].setAttribute('aria-current', 'page'); else nav[i].removeAttribute('aria-current');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (id === 'como-testo') setSub(sub || curSub);
    fit();
    enter(id);
  }
  var subs = ['ia', 'artefatos', 'metricas', 'api'], curSub = 'ia';
  function setSub(s) {
    if (subs.indexOf(s) < 0) s = 'ia';
    curSub = s;
    root.setAttribute('data-sub', s);
    subs.forEach(function (k) { var b = document.getElementById(k); if (b) b.classList.toggle('is-sub', k === s); });
    var j = document.querySelectorAll('.how-jump a');
    for (var i = 0; i < j.length; i++) {
      if (j[i].getAttribute('href') === '#' + s) j[i].setAttribute('aria-current', 'true'); else j[i].removeAttribute('aria-current');
    }
  }
  var items = '.pager, .section-head, .how-jump, .how-block.is-sub, .exp-grid > *, .timeline > li, .pc-grid > *, .sub-head, .rl-group, .ct-main > *, .ct-card, .ct-status';
  function enter(id) {
    var sec = document.getElementById(id);
    if (!sec || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var els = sec.querySelectorAll(items);
    for (var i = 0; i < els.length; i++) { els[i].classList.remove('vin'); els[i].style.setProperty('--i', i); }
    void sec.offsetWidth;
    for (var k = 0; k < els.length; k++) els[k].classList.add('vin');
  }
  /* botões Anterior / Próximo no fim de cada tela */
  var order = [['experiencia', 'Experiência'], ['projetos', 'Projetos'], ['como-testo', 'Como testo'], ['contato', 'Contato']];
  order.forEach(function (o, i) {
    var sec = document.getElementById(o[0]);
    if (!sec) return;
    var prev = i > 0 ? order[i - 1] : ['topo', 'Início'];
    var next = order[i + 1];
    var d = document.createElement('div');
    d.className = 'pager';
    d.innerHTML = '<a class="pg-prev" href="#' + prev[0] + '">↑ voltar: ' + prev[1].toLowerCase() + '</a>' +
      '<a class="pg-next" href="#' + (next ? next[0] : 'topo') + '"><span aria-hidden="true"></span>' +
      (next ? 'próximo: ' + next[1].toLowerCase() : 'voltar ao início') + '</a>';
    sec.appendChild(d);
  });
  /* rolar para baixo na tela inicial abre a primeira seção */
  var wheelLock = 0, seq = ['topo', 'experiencia', 'projetos', 'como-testo', 'contato'];
  function step(dir) {
    if (Date.now() - wheelLock < 900) return;
    var v = root.getAttribute('data-view'); v = v === 'home' ? 'topo' : v;
    if (v !== 'topo' && !root.classList.contains('app')) return;   // no celular a tela rola normalmente
    var i = seq.indexOf(v) + dir;
    if (i < 0 || i >= seq.length) return;
    wheelLock = Date.now();
    location.hash = '#' + seq[i];
  }
  function canScroll(el) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return true;
    }
    return false;
  }
  window.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) < 20 || canScroll(e.target)) return;
    step(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });
  window.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.closest && t.closest('[role="tablist"], [data-api]'))) return;
    if (e.key === 'PageDown' || (e.key === 'ArrowDown' && root.getAttribute('data-view') === 'home')) step(1);
    if (e.key === 'PageUp') step(-1);
  });
  /* encaixa cada tela na altura da janela, sem barra de rolagem */
  var mq = window.matchMedia('(min-width: 921px) and (min-height: 520px)');
  function fit() {
    var v = root.getAttribute('data-view');
    root.classList.toggle('app', mq.matches);
    var wraps = document.querySelectorAll('.spa main > section > .wrap, .hero-v2-main');
    for (var i = 0; i < wraps.length; i++) wraps[i].style.zoom = '';
    if (!mq.matches || v === 'home') return;
    var sec = document.getElementById(v), w = sec && sec.querySelector(':scope > .wrap');
    if (!w) return;
    var avail = window.innerHeight - 64 - 84, need = w.scrollHeight;
    var z = Math.max(0.55, Math.min(1, avail / need));
    if (z < 1) w.style.zoom = z.toFixed(3);
  }
  window.addEventListener('resize', fit);
  mq.addEventListener && mq.addEventListener('change', fit);
  document.addEventListener('click', function () { setTimeout(fit, 0); });
  function route() {
    var h = decodeURIComponent((location.hash || '').slice(1));
    if (inner[h]) return show(inner[h], h);
    show(views.indexOf(h) >= 0 ? h : 'topo');
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href').slice(1);
    if (h === location.hash.slice(1) && (views.indexOf(h) >= 0 || inner[h] || h === 'topo')) { e.preventDefault(); route(); }
  });
  route();
})();
