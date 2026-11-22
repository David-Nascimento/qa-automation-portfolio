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

  // Fundo: milhares de pássaros em murmuração que formam uma jubarte, atravessam a tela e se dispersam
  (function murmuration() {
    const cv = document.getElementById('grid');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    let W = 0, H = 0, dpr = 1, birds = [], t = 0, last = 0, pts = [];

    // ---- silhueta da jubarte (cabeça à direita), em partes que se movem separadas ----
    // Desenhada num quadro de 600 x 300; cada parte vira uma nuvem de pontos-alvo.
    const PART = { BODY: 0, FLUKE: 1, FIN_NEAR: 2, FIN_FAR: 3 };
    const PIVOT = { [PART.FLUKE]: [86, 150], [PART.FIN_NEAR]: [418, 190], [PART.FIN_FAR]: [440, 178] };
    function sample(draw, part, step) {
      const c = document.createElement('canvas'); c.width = 600; c.height = 300;
      const g = c.getContext('2d'); g.fillStyle = '#000'; draw(g);
      const d = g.getImageData(0, 0, 600, 300).data, out = [];
      for (let y = 0; y < 300; y += step) for (let x = 0; x < 600; x += step) {
        const jx = x + (Math.random() - .5) * step, jy = y + (Math.random() - .5) * step;
        if (d[(y * 600 + x) * 4 + 3] > 128) out.push({ x: jx, y: jy, part });
      }
      return out;
    }
    function humpback(step) {
      const body = (g) => {
        g.beginPath();
        g.moveTo(572, 156);                                            // rostro arredondado
        g.bezierCurveTo(574, 126, 530, 104, 440, 104);                 // cabeça larga e achatada
        g.bezierCurveTo(350, 102, 250, 112, 170, 134);                 // dorso longo
        g.bezierCurveTo(130, 144, 104, 148, 84, 150);                  // pedúnculo
        g.bezierCurveTo(104, 158, 140, 168, 210, 184);
        g.bezierCurveTo(300, 204, 420, 210, 500, 196);                 // ventre com pregas
        g.bezierCurveTo(552, 190, 576, 176, 572, 156);                 // mandíbula grande
        g.fill();
        g.beginPath(); g.moveTo(196, 126); g.quadraticCurveTo(188, 114, 176, 118); g.lineTo(182, 130); g.fill(); // corcova dorsal pequena, bem atrás
      };
      const fluke = (g) => {
        g.beginPath();
        g.moveTo(92, 146); g.bezierCurveTo(70, 128, 44, 96, 18, 86);    // lobo de cima
        g.bezierCurveTo(8, 84, 6, 92, 14, 98); g.bezierCurveTo(34, 112, 56, 136, 74, 150);
        g.bezierCurveTo(56, 164, 34, 188, 14, 202);                     // lobo de baixo
        g.bezierCurveTo(6, 208, 8, 216, 18, 214); g.bezierCurveTo(44, 204, 70, 172, 92, 154);
        g.fill();
      };
      const finNear = (g) => {                                         // nadadeira peitoral longa, com borda ondulada
        g.beginPath(); g.moveTo(432, 186);
        g.bezierCurveTo(400, 214, 350, 252, 300, 276); g.lineTo(288, 282);
        g.bezierCurveTo(300, 270, 312, 268, 318, 258); g.bezierCurveTo(326, 254, 332, 252, 340, 242);
        g.bezierCurveTo(352, 236, 362, 230, 372, 220); g.bezierCurveTo(390, 210, 404, 200, 410, 192);
        g.fill();
      };
      const finFar = (g) => {                                          // a outra nadadeira, um pouco atrás
        g.beginPath(); g.moveTo(452, 174);
        g.bezierCurveTo(430, 200, 400, 228, 368, 250); g.lineTo(360, 252);
        g.bezierCurveTo(380, 230, 410, 198, 430, 176); g.fill();
      };
      return [...sample(body, PART.BODY, step), ...sample(fluke, PART.FLUKE, step),
        ...sample(finNear, PART.FIN_NEAR, step), ...sample(finFar, PART.FIN_FAR, step)];
    }

    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 640 ? 900 : W < 1100 ? 1800 : 2600;
      if (birds.length !== n) {
        pts = humpback(W < 640 ? 7 : 5);
        birds = [];
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
          birds.push({
            x: W * .14 + Math.cos(a) * r * 140, y: H * .32 + Math.sin(a) * r * 70, vx: 0, vy: 0,
            ca: a, cr: r,                                    // lugar na nuvem solta
            p: pts[(i * 7919) % pts.length],                 // ponto da baleia
            jx: Math.random() - .5, jy: Math.random() - .5,
            delay: Math.random(), flap: Math.random() * 6.28, fs: 9 + Math.random() * 5,
            sz: 1.6 + Math.random() * 1.4,
          });
        }
      }
    }

    // ---- roteiro de 15 s + 4 s para o bando voltar ----
    // 0–3 s nuvem solta · 3–6 s forma a baleia · 6–12 s nada · 12–15 s se desfaz · 15–19 s o bando volta à esquerda
    const CYCLE = 19;
    const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

    // grade espacial para cada pássaro enxergar só os vizinhos próximos
    const CELL = 16; let grid = new Map();
    const key = (cx, cy) => cx * 73856093 ^ cy * 19349663;

    function frame(now) {
      const dt = Math.min((now - (last || now)) / 1000, .04); last = now;
      if (!reduce) t += dt;
      const c = t % CYCLE;
      const L = Math.min(620, W * .46);                       // comprimento da baleia
      const s = smooth(3, 15, c);                             // progresso da travessia
      const cx = W * (.16 + .7 * s) + Math.sin(c * .7) * W * .015;
      const cy = H * (.36 + .2 * s) + Math.sin(c * .9 + 1) * H * .035;   // desce devagar, com leves ondas
      const tilt = Math.cos(c * .9 + 1) * .05 + .06;
      const form = smooth(3, 6, c) * (1 - smooth(12, 15, c)); // 0 nuvem, 1 baleia
      const w = 1.25;                                         // ritmo do nado
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt), sc = L / 600;

      // nuvem: perto da baleia ao se desfazer; à esquerda quando o bando volta
      const back = smooth(15, 18.5, c);
      const cloudX = c < 6 ? W * .16 : c > 15 ? cx + (W * .14 - cx) * back : cx;
      const cloudY = c < 6 ? H * .34 : c > 15 ? cy + (H * .32 - cy) * back : cy;
      const spread = c > 12 ? 1 + smooth(12, 16, c) * 1.8 - back * 1.5 : 1;

      grid = new Map();
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i], k = key(Math.floor(b.x / CELL), Math.floor(b.y / CELL));
        let arr = grid.get(k); if (!arr) grid.set(k, arr = []); arr.push(i);
      }

      ctx.clearRect(0, 0, W, H);
      const dark = css('--bird') || '#0f1418';
      ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.lineCap = 'round';
      ctx.beginPath();

      for (const b of birds) {
        // alvo na baleia, com ondulação do corpo, nadadeiras e cauda
        const p = b.p;
        let px = p.x, py = p.y;
        const back01 = Math.max(0, (566 - px) / 480);
        py += Math.sin(t * w * 2 - back01 * 3.2) * 9 * back01 * back01;   // ondulação
        if (p.part !== PART.BODY) {
          const [ox, oy] = PIVOT[p.part];
          const a = p.part === PART.FLUKE ? Math.sin(t * w * 2 - 3.2) * .32
            : p.part === PART.FIN_NEAR ? Math.sin(t * w * 1.1) * .22 : Math.sin(t * w * 1.1 + .9) * .16;
          const dx = px - ox, dy = py - oy, ca = Math.cos(a), sa = Math.sin(a);
          px = ox + dx * ca - dy * sa; py = oy + dx * sa + dy * ca;
        }
        const lx = (px - 300) * sc, ly = (py - 150) * sc;
        const wx = cx + lx * cosT - ly * sinT, wy = cy + lx * sinT + ly * cosT;

        // alvo na nuvem: forma solta que respira e gira devagar
        const ang = b.ca + t * .25;
        const rr = b.cr * (150 + 40 * Math.sin(t * .8 + b.ca * 3)) * spread;
        const fx = cloudX + Math.cos(ang) * rr * 1.6 + Math.sin(t * .6 + b.cr * 5) * 30;
        const fy = cloudY + Math.sin(ang) * rr * .65 + Math.cos(t * .7 + b.ca) * 20;

        const m = Math.max(0, Math.min(1, (form - b.delay * .4) / .6));
        const tx = fx + (wx - fx) * m, ty = fy + (wy - fy) * m;

        // vizinhos: separação e alinhamento (o que dá o movimento de bando)
        let sx = 0, sy = 0, ax = 0, ay = 0, n = 0;
        const gx = Math.floor(b.x / CELL), gy = Math.floor(b.y / CELL);
        for (let ix = -1; ix <= 1; ix++) for (let iy = -1; iy <= 1; iy++) {
          const arr = grid.get(key(gx + ix, gy + iy)); if (!arr) continue;
          for (let j = 0; j < arr.length && n < 10; j++) {
            const o = birds[arr[j]]; if (o === b) continue;
            const dx = b.x - o.x, dy = b.y - o.y, d2 = dx * dx + dy * dy;
            if (d2 < 36 && d2 > 0) { sx += dx / d2; sy += dy / d2; }
            ax += o.vx; ay += o.vy; n++;
          }
        }
        if (n) { ax /= n; ay /= n; }
        const turb = (Math.sin(b.y * .013 + t * 1.3) + Math.cos(b.x * .011 - t)) * (28 - m * 18); // turbulência
        const kT = 1.4 + m * 4.2;
        b.vx += ((tx - b.x) * kT + sx * 120 + (ax - b.vx) * .9 + turb - b.vx * 1.6) * dt;
        b.vy += ((ty - b.y) * kT + sy * 120 + (ay - b.vy) * .9 - turb * .6 - b.vy * 1.6) * dt;
        const sp = Math.hypot(b.vx, b.vy), max = 520;
        if (sp > max) { b.vx *= max / sp; b.vy *= max / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt;

        // pássaro: corpo pequeno e duas asas que batem
        b.flap += dt * b.fs;
        const h = Math.atan2(b.vy, b.vx || .001), ch = Math.cos(h), sh = Math.sin(h);
        const f = Math.sin(b.flap), s2 = b.sz;
        const wingY = -s2 * .9 * f, wingX = -s2 * .35;
        // pontas das asas (perpendiculares ao voo), com o "V" mudando conforme a batida
        const lxw = wingX, lyw = -s2 * 1.6, rxw = wingX, ryw = s2 * 1.6;
        const tip = (x, y) => [b.x + (x * ch - y * sh) + wingY * -sh * 0, b.y + (x * sh + y * ch) + wingY];
        const [l1, l2] = tip(lxw, lyw), [r1, r2] = tip(rxw, ryw);
        ctx.moveTo(l1, l2); ctx.lineTo(b.x, b.y); ctx.lineTo(r1, r2);
        ctx.moveTo(b.x - ch * s2 * .8, b.y - sh * s2 * .8); ctx.lineTo(b.x + ch * s2 * .6, b.y + sh * s2 * .6);
      }
      ctx.globalAlpha = .6;
      ctx.stroke();
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    size();
    if (reduce) t = 9; // sem movimento: a baleia parada no meio da travessia
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
    if (sub) {
      var t = document.getElementById(sub);
      if (t) t.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }
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
