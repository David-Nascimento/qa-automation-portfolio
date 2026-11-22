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
