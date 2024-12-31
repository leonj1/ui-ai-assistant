document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchBox = document.querySelector('.search-box');

    // Define searchable content
    const pages = [
        { title: 'Home', url: 'index.html', keywords: ['home', 'cat pictures', 'photography', 'featured'] },
        { title: 'About Us', url: 'about.html', keywords: ['about', 'story', 'mission', 'quality'] },
        { title: 'Featured Pictures', url: '#featured', keywords: ['featured', 'pictures', 'peaceful dreams', 'joyful moments', 'window watcher'] },
        { title: 'Pricing', url: '#pricing', keywords: ['pricing', 'prices', 'packages', 'collection pack'] },
        { title: 'Contact', url: '#contact', keywords: ['contact', 'email', 'questions'] }
    ];

    // Search function
    function performSearch(query) {
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        const results = pages.filter(page => {
            const searchString = `${page.title} ${page.keywords.join(' ')}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        displayResults(results);
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
