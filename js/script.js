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
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('ready')));

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

  // fundo: grade de pontos com uma varredura que "aprova" os pontos por onde passa
  const cv = document.getElementById('grid'), ctx = cv.getContext('2d');
  let W, H, dpr, pts = [], sweep = 0;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = []; const gap = 28;
    for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) pts.push({ x, y, lit: 0 });
  }
  function frame() {
    const rule = css('--rule'), pass = css('--pass');
    ctx.clearRect(0, 0, W, H);
    sweep += 1.4; if (sweep > W + 200) sweep = -200;
    for (const p of pts) {
      const d = Math.abs(p.x - sweep);
      if (d < 18 && Math.random() < .5) p.lit = 1;
      p.lit *= 0.985;
      const edge = Math.min(p.y / H, 1);
      ctx.globalAlpha = (0.45 + p.lit * 0.35) * (1 - edge * 0.5);
      ctx.fillStyle = p.lit > .05 ? pass : rule;
      const r = 1 + p.lit * 0.9;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }
  size(); frame();
  addEventListener('resize', size);

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
