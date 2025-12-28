// Reveal observer (kept)
const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  },
  { threshold: 0.2 }
);

elements.forEach(el => observer.observe(el));

// --- Smooth custom cursor with easing ---
;(function initCustomCursor(){
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  let mouseX = window.innerWidth/2;
  let mouseY = window.innerHeight/2;
  let posX = mouseX;
  let posY = mouseY;
  const ease = 0.18; // lower = smoother/slower

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Hover targets: links, buttons and badges
  const hoverSelectors = ['a', 'button', '.stack-badge', '.project-tags span', '.case-link'];
  hoverSelectors.forEach(sel => {
    document.addEventListener('mouseover', e => {
      if (e.target.closest(sel)) cursor.classList.add('cursor--hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(sel)) cursor.classList.remove('cursor--hover');
    });
  });

  function raf() {
    posX += (mouseX - posX) * ease;
    posY += (mouseY - posY) * ease;
    cursor.style.left = posX + 'px';
    cursor.style.top = posY + 'px';
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

// --- Basic anti-inspect (deterrent only) ---
(function antiInspect(){
  // disable right-click context menu
  document.addEventListener('contextmenu', e => e.preventDefault());

  // prevent some keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  document.addEventListener('keydown', e => {
    // F12
    if (e.key === 'F12') return e.preventDefault();

    // Ctrl+Shift+I / J / C
    if (e.ctrlKey && e.shiftKey && ['I','J','C','i','j','c'].includes(e.key)) return e.preventDefault();

    // Ctrl+U (view source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) return e.preventDefault();
  });
})();

