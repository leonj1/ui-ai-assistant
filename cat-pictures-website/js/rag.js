class RAGService {
    constructor(baseUrl = process.env.BACKEND_URL || 'http://localhost:5051') {
        this.baseUrl = baseUrl;
    }

    async query(question) {
        try {
            const response = await fetch(`${this.baseUrl}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from RAG service');
            }

            return await response.json();
        } catch (error) {
            console.error('RAG query error:', error);
            throw error;
        }
    }
}

// Update search functionality to include RAG responses
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchBox = document.querySelector('.search-box');
    const ragService = new RAGService();

    // Define searchable content
    const pages = [
        { title: 'Home', url: 'index.html', keywords: ['home', 'cat pictures', 'photography', 'featured'] },
        { title: 'About Us', url: 'about.html', keywords: ['about', 'story', 'mission', 'quality'] },
        { title: 'Featured Pictures', url: '#featured', keywords: ['featured', 'pictures', 'peaceful dreams', 'joyful moments', 'window watcher'] },
        { title: 'Pricing', url: '#pricing', keywords: ['pricing', 'prices', 'packages', 'collection pack'] },
        { title: 'Contact', url: '#contact', keywords: ['contact', 'email', 'questions'] }
    ];

    let ragTimeout;

    // Search function with RAG integration
    async function performSearch(query) {
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        // Regular search results
        const results = pages.filter(page => {
            const searchString = `${page.title} ${page.keywords.join(' ')}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        // Display initial results
        displayResults(results);

        // Clear previous RAG timeout
        if (ragTimeout) {
            clearTimeout(ragTimeout);
        }

        // Set new timeout for RAG query
        ragTimeout = setTimeout(async () => {
            try {
                const ragResponse = await ragService.query(query);
                if (ragResponse.answer) {
                    addRAGResult(ragResponse);
                }
            } catch (error) {
                console.error('Failed to get RAG response:', error);
            }
        }, 500); // Delay RAG query to avoid too many requests
    }

    // Display results
    function displayResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        results.forEach(result => {
            const item = document.createElement('li');
            item.className = 'search-result__item';
            item.innerHTML = `<a href="${result.url}">${result.title}</a>`;
            searchResults.appendChild(item);
        });

        searchResults.style.display = 'block';
    }

    // Add RAG result to search results
    function addRAGResult(ragResponse) {
        const item = document.createElement('li');
        item.className = 'search-result__item search-result__item--rag';
        
        const answer = document.createElement('div');
        answer.className = 'search-result__answer';
        answer.textContent = ragResponse.answer;

        const sources = document.createElement('div');
        sources.className = 'search-result__sources';
        if (ragResponse.sources && ragResponse.sources.length > 0) {
            sources.textContent = `Sources: ${ragResponse.sources.join(', ')}`;
        }

        item.appendChild(answer);
        item.appendChild(sources);
        searchResults.appendChild(item);
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.style.display = 'none';
            searchInput.blur();
        }
    });
});
