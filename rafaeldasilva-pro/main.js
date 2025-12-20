import './style.css'
import { initLayout } from './src/components/layout.js'
import { fetchBlogPosts, fetchPostById } from './src/services/blogService.js'

initLayout();

// Page specific logic
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;

    // Blog Listing Page
    if (path.includes('blog.html')) {
        const container = document.querySelector('#blog-posts-container');
        if (!container) return;

        const posts = await fetchBlogPosts();

        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum artigo encontrado.</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <article class="blog-card-minimal">
                <div class="post-meta">
                    <span class="date">${new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    <span class="separator">|</span>
                    <span class="category">${post.category}</span>
                </div>
                <h2 class="post-title">
                    <a href="/post.html?id=${post.id}">${post.title}</a>
                </h2>
                <p class="post-excerpt">${post.excerpt}</p>
                <a href="/post.html?id=${post.id}" class="read-more">Ler Artigo &rarr;</a>
            </article>
        `).join('');
    }

    // Post Detail Page
    if (path.includes('post.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            window.location.href = '/blog.html';
            return;
        }

        const post = await fetchPostById(postId);

        if (!post) {
            document.querySelector('#app').innerHTML = '<div class="container" style="padding: 10rem 0; text-align: center;"><h1>Artigo não encontrado</h1><a href="/blog.html" class="btn btn-primary">Voltar ao Blog</a></div>';
            return;
        }

        // Inject content
        document.title = `${post.title} | Rafael Rodrigues da Silva`;
        document.querySelector('#post-title').textContent = post.title;
        document.querySelector('#post-date').textContent = new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        document.querySelector('#post-category').textContent = post.category;
        document.querySelector('#post-excerpt').textContent = post.excerpt;
        document.querySelector('#post-content').innerHTML = post.content;

        const heroContainer = document.querySelector('#post-hero-image');
        if (post.image && heroContainer) {
            heroContainer.innerHTML = `<img src="${post.image}" alt="${post.title}" style="width: 100%; border-radius: 12px; margin-bottom: 3rem;">`;
        }
    }
});
