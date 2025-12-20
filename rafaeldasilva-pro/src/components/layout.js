
export function initLayout() {
  const app = document.querySelector('#app');
  if (!app) return;

  const header = createHeader();
  const footer = createFooter();

  document.body.insertBefore(header, document.body.firstChild);
  document.body.appendChild(footer);

  initMobileMenu();
  highlightActiveLink();
}

function createHeader() {
  const header = document.createElement('header');
  const path = window.location.pathname;

  header.innerHTML = `
    <nav class="container">
      <a href="/" class="logo">Rafael Rodrigues da Silva</a>
      <ul class="nav-links">
        <li><a href="/sobre.html" data-nav="sobre">Sobre</a></li>
        <li><a href="/musico.html" data-nav="musico">Músico</a></li>
        <li><a href="/professor.html" data-nav="professor">Professor</a></li>
        <li><a href="/palestrante.html" data-nav="palestrante">Palestrante</a></li>
        <li><a href="/podcast.html" data-nav="podcast">Podcast</a></li>
        <li><a href="/blog.html" data-nav="blog">Blog</a></li>
        <li><a href="/contato.html" data-nav="contato">Contato</a></li>
      </ul>
      <button class="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>
    <div class="mobile-menu">
      <ul class="mobile-nav-links">
        <li><a href="/sobre.html">Sobre</a></li>
        <li><a href="/musico.html">Músico</a></li>
        <li><a href="/professor.html">Professor</a></li>
        <li><a href="/palestrante.html">Palestrante</a></li>
        <li><a href="/podcast.html">Podcast</a></li>
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/contato.html">Contato</a></li>
      </ul>
    </div>
  `;
  return header;
}

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('active');
      document.body.style.overflow = isExpanded ? '' : 'hidden'; // Prevent scroll when menu open
    });
  }
}

function highlightActiveLink() {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (path === href || (path === '/' && href === '/index.html') || (path.includes(href) && href !== '/')) {
      link.classList.add('active');
    }
  });
}

function createFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="container grid footer-grid">
        <div class="footer-info">
            <h3>Rafael Rodrigues da Silva</h3>
            <p>Professor, Músico e Palestrante. Unindo educação, criatividade e inovação.</p>
        </div>
        <div class="footer-nav">
            <h4>Navegação</h4>
            <ul>
                <li><a href="/sobre.html">Sobre</a></li>
                <li><a href="/musico.html">Música</a></li>
                <li><a href="/professor.html">Ensino</a></li>
                <li><a href="/blog.html">Blog</a></li>
            </ul>
        </div>
        <div class="footer-social">
            <h4>Social</h4>
            <div class="social-links">
                <a href="https://instagram.com" target="_blank">Instagram</a>
                <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                <a href="https://rafaeldasilva.substack.com" target="_blank">Substack</a>
            </div>
        </div>
    </div>
    <div class="footer-bottom container">
        <p>&copy; ${new Date().getFullYear()} Rafael Rodrigues da Silva. Todos os direitos reservados.</p>
    </div>
  `;
  return footer;
}
