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
