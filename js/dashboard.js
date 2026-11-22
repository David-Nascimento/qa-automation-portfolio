// Dashboard de qualidade: dados reais, contados nos repositórios públicos em 22/11/2026.
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

const GH = 'https://github.com/David-Nascimento/';

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

const commits = {
  2021: { 'Robot Framework': 49, 'Cypress Enjoeat': 17, 'Mobile Android': 8 },
  2022: { 'Robot Framework': 3, 'Mobile Android': 2 },
  2023: { 'k6': 24, 'Cypress Enjoeat': 14, 'Mobile Android': 2 },
  2024: {},
  2025: { 'BDD GenerationX': 153, 'Appium Failure Helper': 78, 'Login E2E Cypress': 4, 'API com Cypress': 3, 'QAXpert': 3 },
  2026: { 'Ruby E2E': 7, 'QA Playground (automação)': 7, 'Karate': 1, 'Cypress Enjoeat': 1 },
};

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

// ---------- colunas: commits por ano ----------
(function cols() {
  const box = document.getElementById('cols');
  const detail = document.getElementById('cols-detail');
  const anos = Object.keys(commits);
  const totais = anos.map((a) => Object.values(commits[a]).reduce((s, v) => s + v, 0));
  const max = Math.max(...totais);
  const nomes = [...new Set(anos.flatMap((a) => Object.keys(commits[a])))];
  const cor = (n) => `var(--c${(nomes.indexOf(n) % 6) + 1})`;
  const def = detail.textContent;
  anos.forEach((a, i) => {
    const col = el('button', { type: 'button', className: 'col' });
    col.setAttribute('aria-label', `${a}: ${totais[i]} commits`);
    const stack = el('span', { className: 'col-stack', style: `--h:${(totais[i] / max) * 100}%` });
    Object.entries(commits[a]).sort((x, y) => y[1] - x[1]).forEach(([n, v]) => {
      stack.append(el('span', { className: 'col-seg', style: `flex:${v};background:${cor(n)}` }));
    });
    col.append(el('span', { className: 'col-val' }, `${totais[i]}`), stack, el('span', { className: 'col-year' }, a));
    const show = () => {
      const parts = Object.entries(commits[a]).sort((x, y) => y[1] - x[1]).map(([n, v]) => `${n} (${v})`);
      detail.textContent = parts.length ? `${a}: ${parts.join(', ')}.` : `${a}: nenhum commit nos repositórios de automação.`;
      [...box.children].forEach((c) => c.classList.toggle('dim', c !== col));
    };
    const hide = () => { detail.textContent = def; [...box.children].forEach((c) => c.classList.remove('dim')); };
    ['mouseenter', 'focus', 'click'].forEach((ev) => col.addEventListener(ev, show));
    ['mouseleave', 'blur'].forEach((ev) => col.addEventListener(ev, hide));
    box.appendChild(col);
  });
})();

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
