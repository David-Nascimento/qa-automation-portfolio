// Modo embutido (dentro do portfólio): ?embed
if (new URLSearchParams(location.search).has('embed')) document.documentElement.classList.add('embed');

// Dashboard de qualidade: dados reais, contados nos repositórios públicos em 22/11/2026.
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

const GH = 'https://github.com/David-Nascimento/';

// Série trimestral reconstruída do histórico Git (cenários recontados em cada commit)
const tri = {"q": ["2021-T1", "2021-T2", "2021-T3", "2021-T4", "2022-T1", "2022-T2", "2022-T3", "2022-T4", "2023-T1", "2023-T2", "2023-T3", "2023-T4", "2024-T1", "2024-T2", "2024-T3", "2024-T4", "2025-T1", "2025-T2", "2025-T3", "2025-T4", "2026-T1", "2026-T2", "2026-T3", "2026-T4"], "cen": [0, 0, 12, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 29, 57, 57, 57, 104], "commits": [0, 17, 49, 8, 0, 0, 0, 5, 30, 1, 0, 9, 0, 0, 0, 0, 0, 143, 48, 50, 8, 0, 0, 8], "ativos": [0, 1, 1, 1, 0, 0, 0, 2, 3, 1, 0, 1, 0, 0, 0, 0, 0, 2, 2, 3, 2, 0, 0, 2], "ativosRepos": [[], ["cypress-enjoeat"], ["DesafioQA-NoesisBrasil"], ["Ruby_Appium_Android"], [], [], [], ["DesafioQA-NoesisBrasil", "Ruby_Appium_Android"], ["Ruby_Appium_Android", "cypress-enjoeat", "k6-performance"], ["Ruby_Appium_Android"], [], ["cypress-enjoeat"], [], [], [], [], [], ["QAXpert", "bdd-generationX"], ["Appium_failure_helper", "bdd-generationX"], ["Appium_failure_helper", "desafio-api-qa", "desafio-cypress-qa"], ["automacao-qa-playground", "cypress-enjoeat"], [], [], ["karate-api-framework", "ruby-e2e-framework"]]};


const projetos = [
  { nome: 'Ruby E2E Framework', repo: 'ruby-e2e-framework', ferramenta: 'Selenium + Cucumber', camadas: { Web: 6, API: 6, Acessibilidade: 4, 'Híbrido': 2 }, testes: 18, ci: 'GitHub Actions (manual)', docker: true, relatorio: 'Allure, Cucumber HTML', ultimo: '2026-11-19' },
  { nome: 'Karate API Framework', repo: 'karate-api-framework', ferramenta: 'Karate', camadas: { API: 29 }, testes: 29, ci: 'GitHub Actions, Jenkins', docker: true, relatorio: 'Karate HTML, JUnit XML', ultimo: '2026-11-22' },
  { nome: 'Automação QA Playground', repo: 'automacao-qa-playground', ferramenta: 'Capybara + Selenium', camadas: { Web: 28 }, testes: 28, ci: '', docker: false, relatorio: 'Allure', ultimo: '2026-01-30' },
  { nome: 'Cypress + Cucumber (Enjoeat)', repo: 'cypress-enjoeat', ferramenta: 'Cypress', camadas: { Web: 1 }, testes: 1, ci: '', docker: false, relatorio: 'Allure', ultimo: '2026-02-04' },
  { nome: 'Testes de API com Cypress', repo: 'desafio-api-qa', ferramenta: 'Cypress', camadas: { API: 8 }, testes: 8, ci: '', docker: false, relatorio: '', ultimo: '2025-11-04' },
  { nome: 'Login E2E com Cypress', repo: 'desafio-cypress-qa', ferramenta: 'Cypress', camadas: { Web: 3 }, testes: 3, ci: '', docker: false, relatorio: '', ultimo: '2025-11-04' },
  { nome: 'Appium Failure Helper', repo: 'Appium_failure_helper', ferramenta: 'Gem Ruby (Appium)', camadas: { Ferramenta: 3 }, testes: 3, tipo: 'unitários', ci: 'Jenkins', docker: false, relatorio: 'HTML próprio', ultimo: '2025-11-11' },
  { nome: 'Automação Mobile Android', repo: 'Ruby_Appium_Android', ferramenta: 'Appium + Cucumber', camadas: { Mobile: 5 }, testes: 5, ci: '', docker: false, relatorio: '', ultimo: '2023-05-04' },
  { nome: 'Robot Framework Web, API e Mobile', repo: 'DesafioQA-NoesisBrasil', ferramenta: 'Robot Framework', camadas: { Web: 3, API: 4, Mobile: 5 }, testes: 12, ci: 'GitLab CI', docker: true, relatorio: 'Robot log/report', ultimo: '2022-11-21' },
  { nome: 'Testes de performance', repo: 'k6-performance', ferramenta: 'k6', camadas: { Performance: 7 }, testes: 7, tipo: 'scripts', ci: 'GitHub Actions', docker: true, relatorio: 'InfluxDB + Grafana', ultimo: '2023-03-10' },
  { nome: 'BDD GenerationX', repo: 'bdd-generationX', ferramenta: 'Gem Ruby', camadas: { Ferramenta: 6 }, testes: 6, tipo: 'unitários', ci: 'GitHub Actions (versão)', docker: false, relatorio: '', ultimo: '2025-08-14' },
  { nome: 'QAXpert', repo: 'QAXpert', ferramenta: 'CLI Ruby + Gemini', camadas: { Ferramenta: 3 }, testes: 3, tipo: 'unitários', ci: '', docker: false, relatorio: '', ultimo: '2025-05-23' },
];

const camadasCen = [
  { nome: 'API', v: 47, cor: 'var(--c1)' },
  { nome: 'Web', v: 41, cor: 'var(--c2)' },
  { nome: 'Mobile', v: 10, cor: 'var(--c3)' },
  { nome: 'Acessibilidade', v: 4, cor: 'var(--c4)' },
  { nome: 'Híbrido', v: 2, cor: 'var(--c5)' },
];


const perfis = [
  { nome: 'regression', v: 20, nota: 'rake regression' },
  { nome: 'ci', v: 20, nota: 'pipeline, gera Allure' },
  { nome: 'ui', v: 14, nota: 'tudo que não é @api' },
  { nome: 'api', v: 6, nota: 'rake api, sem navegador' },
  { nome: 'smoke', v: 5, nota: 'rake smoke' },
  { nome: 'a11y', v: 4, nota: 'rake a11y, axe-core' },
];

const el = (tag, attrs = {}, text) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (k === 'style' ? n.setAttribute('style', v) : (n[k] = v)));
  if (text !== undefined) n.textContent = text;
  return n;
};
const svgEl = (tag, attrs) => {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
};

// ---------- donut: cenários por camada ----------
(function donut() {
  const svg = document.getElementById('donut');
  const legend = document.getElementById('legend');
  const total = camadasCen.reduce((s, c) => s + c.v, 0);
  const r = 46, C = 2 * Math.PI * r;
  let off = 0;
  const center = svgEl('text', { x: 60, y: 58, 'text-anchor': 'middle', class: 'donut-num' });
  center.textContent = total;
  const label = svgEl('text', { x: 60, y: 74, 'text-anchor': 'middle', class: 'donut-lbl' });
  label.textContent = 'cenários';
  const segs = camadasCen.map((c) => {
    const len = (c.v / total) * C;
    const s = svgEl('circle', {
      cx: 60, cy: 60, r, fill: 'none', 'stroke-width': 16, stroke: c.cor,
      'stroke-dasharray': `${Math.max(len - 1.2, 0.6)} ${C}`, 'stroke-dashoffset': -off, transform: 'rotate(-90 60 60)', class: 'seg',
    });
    off += len;
    svg.appendChild(s);
    return s;
  });
  svg.append(center, label);
  const show = (i) => {
    segs.forEach((s, j) => s.classList.toggle('dim', i !== null && i !== j));
    [...legend.children].forEach((li, j) => li.classList.toggle('dim', i !== null && i !== j));
    if (i === null) { center.textContent = total; label.textContent = 'cenários'; return; }
    center.textContent = camadasCen[i].v;
    label.textContent = camadasCen[i].nome;
  };
  camadasCen.forEach((c, i) => {
    const li = el('li', { tabIndex: 0 });
    li.append(el('span', { className: 'sw', style: `background:${c.cor}` }), el('span', {}, c.nome),
      el('b', {}, `${c.v}`), el('em', {}, `${Math.round((c.v / total) * 100)}%`));
    ['mouseenter', 'focus'].forEach((ev) => li.addEventListener(ev, () => show(i)));
    ['mouseleave', 'blur'].forEach((ev) => li.addEventListener(ev, () => show(null)));
    segs[i].addEventListener('mouseenter', () => show(i));
    segs[i].addEventListener('mouseleave', () => show(null));
    legend.appendChild(li);
  });
})();

// ---------- barras horizontais ----------
function hbars(id, rows, fmt) {
  const box = document.getElementById(id);
  const max = Math.max(...rows.map((r) => r.v));
  rows.forEach((r) => {
    const row = el('div', { className: 'hbar', title: fmt ? fmt(r) : `${r.nome}: ${r.v}` });
    const name = el('span', { className: 'hbar-name' }, r.nome);
    if (r.nota) name.append(el('small', {}, r.nota));
    const track = el('span', { className: 'hbar-track' });
    track.append(el('span', { className: 'hbar-fill', style: `--w:${(r.v / max) * 100}%` }));
    row.append(name, track, el('span', { className: 'hbar-val' }, `${r.v}`));
    box.appendChild(row);
  });
}
hbars('hbars', projetos.filter((p) => !p.tipo).map((p) => ({ nome: p.nome, v: p.testes })).sort((a, b) => b.v - a.v));
hbars('profiles', perfis, (r) => `perfil ${r.nome}: ${r.v} execuções`);

// ---------- tabela com filtro e ordenação ----------
(function table() {
  const tbody = document.querySelector('#table tbody');
  const count = document.getElementById('table-count');
  let filtro = 'all', chave = 'testes', asc = false;
  const fmtData = (d) => d.split('-').reverse().slice(0, 2).join('/') + '/' + d.slice(0, 4);
  const render = () => {
    const rows = projetos
      .filter((p) => filtro === 'all' || p.camadas[filtro])
      .sort((a, b) => {
        const x = a[chave], y = b[chave];
        const r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR');
        return asc ? r : -r;
      });
    tbody.replaceChildren(...rows.map((p) => {
      const tr = el('tr');
      const nome = el('td');
      const a = el('a', { href: GH + p.repo, target: '_blank', rel: 'noopener noreferrer' }, p.nome);
      nome.append(a);
      const cam = el('td');
      Object.entries(p.camadas).forEach(([k, v]) => cam.append(el('span', { className: 'tag' }, Object.keys(p.camadas).length > 1 ? `${k} ${v}` : k)));
      const testes = el('td', { className: 'num' }, `${p.testes}`);
      if (p.tipo) testes.append(el('small', {}, p.tipo));
      const ok = (v) => (v ? el('span', { className: 'yes' }, v === true ? 'Sim' : v) : el('span', { className: 'no' }, '—'));
      const ci = el('td'); ci.append(ok(p.ci));
      const dk = el('td'); dk.append(ok(p.docker));
      const rel = el('td'); rel.append(ok(p.relatorio));
      tr.append(nome, el('td', {}, p.ferramenta), cam, testes, ci, dk, rel, el('td', { className: 'date' }, fmtData(p.ultimo)));
      return tr;
    }));
    const soma = rows.reduce((s, p) => s + p.testes, 0);
    count.textContent = `${rows.length} ${rows.length === 1 ? 'projeto' : 'projetos'} · ${soma} testes`;
    document.querySelectorAll('#table th button').forEach((b) => {
      const th = b.parentElement;
      th.setAttribute('aria-sort', b.dataset.k === chave ? (asc ? 'ascending' : 'descending') : 'none');
    });
  };
  document.querySelectorAll('#chips .chip').forEach((c) => c.addEventListener('click', () => {
    filtro = c.dataset.f;
    document.querySelectorAll('#chips .chip').forEach((x) => x.setAttribute('aria-pressed', x === c));
    render();
  }));
  document.querySelectorAll('#table th button').forEach((b) => b.addEventListener('click', () => {
    if (chave === b.dataset.k) asc = !asc; else { chave = b.dataset.k; asc = b.dataset.k === 'nome' || b.dataset.k === 'ferramenta'; }
    render();
  }));
  render();
})();

// ---------- janela de tempo: linha + barras ----------
(function timeline() {
  const range = document.getElementById('tw-range');
  if (!range) return;
  const out = document.getElementById('tw-out');
  const tip = document.getElementById('tw-tip');
  const defTip = tip.textContent;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 520, H = 240, L = 40, R = 12, T = 14, B = 34;
  const lbl = (k) => k.replace('-T', ' T');
  const axis = (svg, max, ticks) => {
    for (let i = 0; i <= ticks; i++) {
      const v = Math.round((max / ticks) * i);
      const y = H - B - ((H - B - T) * i) / ticks;
      svg.append(svgEl('line', { x1: L, x2: W - R, y1: y, y2: y, class: 'grid' }));
      const t = svgEl('text', { x: L - 8, y: y + 4, 'text-anchor': 'end', class: 'tick' }); t.textContent = v; svg.append(t);
    }
  };
  const xlabels = (svg, keys, xOf) => {
    const byYear = keys.length > 8;
    keys.forEach((k, i) => {
      if (byYear && !k.endsWith('T1')) return;
      const t = svgEl('text', { x: xOf(i), y: H - B + 18, 'text-anchor': byYear ? 'start' : 'middle', class: 'tick' });
      t.textContent = byYear ? k.slice(0, 4) : lbl(k).replace(/^20/, '');
      svg.append(t);
    });
  };
  const nice = (m) => { const s = [8, 20, 40, 60, 80, 120, 160, 200, 240]; return s.find((x) => x >= m) || Math.ceil(m / 40) * 40; };
  const fmtD = (d, unit) => (d === 0 ? `sem variação ${unit}` : `${d > 0 ? '+' : ''}${d} ${unit}`);

  const render = () => {
    const n = Number(range.value);
    const i0 = tri.q.length - n;
    const keys = tri.q.slice(i0), cen = tri.cen.slice(i0), com = tri.commits.slice(i0);
    out.textContent = n === tri.q.length ? `todo o histórico (${n} trimestres)` : `últimos ${n} trimestres`;
    const start = i0 > 0 ? tri.cen[i0 - 1] : 0;
    document.getElementById('k-cen').textContent = cen[cen.length - 1];
    document.getElementById('k-cen-d').textContent = fmtD(cen[cen.length - 1] - start, 'no período');
    document.getElementById('k-com').textContent = com.reduce((a, b) => a + b, 0);
    document.getElementById('k-com-d').textContent = `${keys[0].replace('-T', ' T')} a ${keys[keys.length - 1].replace('-T', ' T')}`;
    // projetos com atividade (união aproximada: máximo por trimestre não serve; usamos a soma de trimestres ativos)
    const ativos = tri.ativosRepos ? new Set(tri.ativosRepos.slice(i0).flat()).size : Math.max(...tri.ativos.slice(i0));
    document.getElementById('k-proj').textContent = ativos;
    document.getElementById('k-proj-d').textContent = 'com commits na janela';

    // linha
    const line = document.getElementById('line'); line.replaceChildren();
    const maxC = nice(Math.max(...cen, 10));
    axis(line, maxC, 4);
    const xL = (i) => L + ((W - L - R) * i) / Math.max(keys.length - 1, 1);
    const yL = (v) => H - B - ((H - B - T) * v) / maxC;
    xlabels(line, keys, xL);
    const d = cen.map((v, i) => `${i ? 'L' : 'M'}${xL(i)},${yL(v)}`).join(' ');
    line.append(svgEl('path', { d: `${d} L${xL(cen.length - 1)},${H - B} L${xL(0)},${H - B} Z`, class: 'area' }));
    line.append(svgEl('path', { d, class: 'stroke' }));
    cen.forEach((v, i) => {
      const c = svgEl('circle', { cx: xL(i), cy: yL(v), r: 4, class: 'dot', tabindex: 0 });
      const t = svgEl('title', {}); t.textContent = `${lbl(keys[i])}: ${v} cenários`; c.append(t);
      const show = () => { tip.textContent = `${lbl(keys[i])}: ${v} cenários automatizados no total.`; };
      c.addEventListener('mouseenter', show); c.addEventListener('focus', show);
      c.addEventListener('mouseleave', () => { tip.textContent = defTip; });
      line.append(c);
    });

    // barras
    const bars = document.getElementById('bars'); bars.replaceChildren();
    const maxB = nice(Math.max(...com, 10));
    axis(bars, maxB, 4);
    const bw = (W - L - R) / keys.length;
    const xB = (i) => L + bw * i + bw / 2;
    xlabels(bars, keys, xB);
    com.forEach((v, i) => {
      const h = ((H - B - T) * v) / maxB;
      const r = svgEl('rect', { x: L + bw * i + bw * 0.15, y: H - B - h, width: bw * 0.7, height: Math.max(h, v ? 2 : 0), rx: 3, class: 'bar', tabindex: 0 });
      const t = svgEl('title', {}); t.textContent = `${lbl(keys[i])}: ${v} commits`; r.append(t);
      const show = () => { tip.textContent = `${lbl(keys[i])}: ${v} commits em ${tri.ativos[i0 + i]} ${tri.ativos[i0 + i] === 1 ? 'projeto' : 'projetos'}.`; };
      r.addEventListener('mouseenter', show); r.addEventListener('focus', show);
      r.addEventListener('mouseleave', () => { tip.textContent = defTip; });
      bars.append(r);
    });
  };
  range.addEventListener('input', render);
  render();
})();
