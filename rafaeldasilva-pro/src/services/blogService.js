
/**
 * Service to fetch and manage local blog posts
 */

export async function fetchBlogPosts() {
    try {
        const response = await fetch('/src/data/posts.json');
        if (!response.ok) throw new Error('Falha ao carregar posts locais');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return [];
    }
}

export async function fetchPostById(id) {
    const posts = await fetchBlogPosts();
    return posts.find(post => post.id === id);
}
