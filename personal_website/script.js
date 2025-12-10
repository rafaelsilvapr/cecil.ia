// Navigation Logic
const homeView = document.querySelector('.home-view');
const contentOverlay = document.getElementById('content-overlay');
const dynamicContent = document.getElementById('dynamic-content');
const pageTitle = document.getElementById('page-title');

// Map tab IDs to readable titles
const titles = {
    'consultoria': 'Palestras e Consultoria',
    'livros': 'Livros e Publicações',
    'professor': 'Professor (Unipampa)',
    'musico': 'Músico e Compositor',
    'blog': 'Blog',
    'imprensa': 'Imprensa e Mídia',
    'contato': 'Contato'
};

function openTab(tabId) {
    // 1. Get the content from the hidden template
    const template = document.getElementById(`content-${tabId}`);
    if (!template) {
        console.error(`Content for ${tabId} not found`);
        return;
    }

    // 2. Inject content into the overlay
    dynamicContent.innerHTML = template.innerHTML;
    pageTitle.textContent = titles[tabId] || 'Detalhes';

    // 3. Show the overlay with animation
    contentOverlay.classList.add('active');

    // Optional: Fade out home view slightly for depth
    homeView.style.opacity = '0.3';
    homeView.style.transform = 'scale(0.95)';
}

function closeTab() {
    // 1. Hide the overlay
    contentOverlay.classList.remove('active');

    // 2. Restore home view
    homeView.style.opacity = '1';
    homeView.style.transform = 'scale(1)';

    // 3. Clear content after transition (optional, but good for memory)
    setTimeout(() => {
        dynamicContent.innerHTML = '';
    }, 400);
}

// Close tab on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contentOverlay.classList.contains('active')) {
        closeTab();
    }
});
