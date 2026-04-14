(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const t of o)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const t={};return o.integrity&&(t.integrity=o.integrity),o.referrerPolicy&&(t.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?t.credentials="include":o.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(o){if(o.ep)return;o.ep=!0;const t=n(o);fetch(o.href,t)}})();function p(){if(!document.querySelector("#app"))return;const r=g(),n=y();document.body.insertBefore(r,document.body.firstChild),document.body.appendChild(n),v(),b()}function g(){const e=document.createElement("header");return e.innerHTML=`
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
  `,e}function v(){const e=document.querySelector(".mobile-menu-toggle"),r=document.querySelector(".mobile-menu");e&&r&&e.addEventListener("click",()=>{const n=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",!n),r.classList.toggle("active"),document.body.style.overflow=n?"":"hidden"})}function b(){const e=window.location.pathname;document.querySelectorAll(".nav-links a").forEach(n=>{const a=n.getAttribute("href");(e===a||e==="/"&&a==="/index.html"||e.includes(a)&&a!=="/")&&n.classList.add("active")})}function y(){const e=document.createElement("footer");return e.innerHTML=`
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
  `,e}const x="https://rafaeldasilva.substack.com/feed",S="https://api.allorigins.win/get?url=";async function w(){try{const e=await fetch(`${S}${encodeURIComponent(x)}`);if(!e.ok)throw new Error("Network response was not ok");const r=await e.json(),o=new DOMParser().parseFromString(r.contents,"text/xml").querySelectorAll("item");return Array.from(o).map(t=>{const i=t.querySelector("title")?.textContent||"",m=t.querySelector("link")?.textContent||"",u=new Date(t.querySelector("pubDate")?.textContent||""),f=t.querySelector("description")?.textContent||"",L=t.querySelector("dc\\:creator, creator")?.textContent||"Rafael Rodrigues da Silva",c=document.createElement("div");c.innerHTML=f;const h=c.textContent.substring(0,150)+"...";let l=null;const d=t.getElementsByTagName("content:encoded")[0]?.textContent;if(d){const s=d.match(/<img[^>]+src="([^">]+)"/);s&&(l=s[1])}if(!l){const s=t.getElementsByTagName("media:content")[0];s&&(l=s.getAttribute("url"))}return{title:i,link:m,date:u.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"}),snippet:h,imageUrl:l||"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",category:"Blog"}})}catch(e){return console.error("Error fetching Substack posts:",e),[]}}p();document.addEventListener("DOMContentLoaded",async()=>{if(window.location.pathname.includes("blog.html")){const r=document.querySelector("#blog-posts-container");if(!r)return;const n=await w();if(n.length===0){r.innerHTML='<p style="text-align: center; grid-column: 1/-1;">Não foi possível carregar os artigos no momento. Por favor, tente novamente mais tarde.</p>';return}r.innerHTML=n.map(a=>`
            <article class="blog-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                <div style="height: 220px; overflow: hidden;">
                    <img src="${a.imageUrl}" alt="${a.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 2rem;">
                    <div style="font-size: 0.85rem; color: var(--color-accent); font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem;">
                        ${a.date} • ${a.category}
                    </div>
                    <h3 style="margin-bottom: 1rem; line-height: 1.4;">${a.title}</h3>
                    <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; font-size: 0.95rem;">${a.snippet}</p>
                    <a href="${a.link}" target="_blank" style="color: var(--color-primary); font-weight: 700; text-decoration: none; border-bottom: 2px solid var(--color-accent); padding-bottom: 2px;">
                        Ler no Substack &rarr;
                    </a>
                </div>
            </article>
        `).join("")}});
