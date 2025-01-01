// DOM Elements
const aiChatButton = document.getElementById('ai-chat-button');
const aiChatModal = document.getElementById('ai-chat-modal');
const modalClose = aiChatModal.querySelector('.modal__close');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSubmit = document.getElementById('chat-submit');

// Constants
const BACKEND_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:7501'
    : window.location.hostname === 'localhost'
        ? 'http://localhost:7501'
        : 'http://10.1.1.144:7501'; // Replace with actual production URL when deploying to production

// Modal Functions
function openModal() {
    aiChatModal.classList.add('is-active');
    chatInput.focus();
}

function closeModal() {
    aiChatModal.classList.remove('is-active');
}

// Message Functions
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message--${isUser ? 'user' : 'ai'}`;
    messageDiv.innerHTML = `<div class="message__text">${text}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createProductCard(product) {
    // Log the product data
    console.log('Creating card for product:', product);

    const card = document.createElement('div');
    card.className = 'chat-product-card';

    // Extract filename and create normalized versions for HTML and image
    const apiFilename = product.link.split('/').pop();
    console.log('Original API filename:', apiFilename);
    
    // Map API product names to actual filenames
    const productMapping = {
        'curious-cat': {
            page: 'window-watcher',
            image: 'curious_cat'
        },
        'playful-cat': {
            page: 'joyful-moments',
            image: 'playful_cat'
        }
    };

    const mapping = productMapping[apiFilename] || {
        page: apiFilename,
        image: apiFilename.replace(/-/g, '_')
    };
    console.log('Mapped filenames:', mapping);

    const link = document.createElement('a');
    const basePath = window.location.protocol === 'file:' 
        ? '/home/jose/src/ui-ai-assistant/cat-pictures-website'
        : '';
    link.href = `${basePath}/products/${mapping.page}.html`;
    link.className = 'chat-product-card__link';

    const image = document.createElement('img');
    image.src = `${basePath}/images/${mapping.image}.jpg`;
    image.alt = product.title;
    image.className = 'chat-product-card__image';
    link.appendChild(image);

    const title = document.createElement('h3');
    title.className = 'chat-product-card__title';
    title.textContent = product.title;

    const description = document.createElement('p');
    description.className = 'chat-product-card__description';
    description.textContent = product.description;

    card.appendChild(link);
    card.appendChild(title);
    card.appendChild(description);

    return card;
}

function createPageLink(page) {
    const linkContainer = document.createElement('div');
    linkContainer.className = 'chat-page-link';

    const link = document.createElement('a');
    link.href = page.link.replace(/^\//, ''); // Remove leading slash
    link.className = 'chat-page-link__anchor';
    // Format the link text to be more user-friendly
    const linkText = page.link.replace(/^\//, '').replace(/\.html$/, '');
    link.textContent = linkText;

    const description = document.createElement('p');
    description.className = 'chat-page-link__description';
    description.textContent = page.description;

    linkContainer.appendChild(link);
    linkContainer.appendChild(description);

    return linkContainer;
}

function createResponseTable(answer, results) {
    const container = document.createElement('div');
    container.className = 'response-container';
    
    // Check if results contain products or pages
    const products = results.filter(result => result.document.type === 'product');
    const pages = results.filter(result => result.document.type === 'page');
    
    // Log detailed results data
    console.log('Results from API:', {
        products,
        pages,
        firstProduct: products[0]?.document,
        firstPage: pages[0]?.document,
        totalResults: results.length,
        resultTypes: results.map(r => r.document.type)
    });
    
    if (products.length > 0) {
        // Create product cards grid
        const grid = document.createElement('div');
        grid.className = 'chat-product-grid';
        
        products.forEach(result => {
            grid.appendChild(createProductCard(result.document));
        });
        
        container.appendChild(grid);
    } else if (pages.length > 0) {
        // Create page links
        const linksContainer = document.createElement('div');
        linksContainer.className = 'chat-page-links';
        
        pages.forEach(result => {
            linksContainer.appendChild(createPageLink(result.document));
        });
        
        container.appendChild(linksContainer);
    } else {
        // Add regular response card
        const card = document.createElement('div');
        card.className = 'response-card';
        card.textContent = answer;
        container.appendChild(card);
    }
    
    return container;
}

function navigateToSource(source) {
    // Handle navigation based on document type and link
    closeModal();
    if (source.type === 'page' && source.link) {
        window.location.href = source.link;
    }
}

// API Functions
async function sendMessage(message) {
    try {
        console.log('Sending request to:', BACKEND_URL);
        const response = await fetch(`${BACKEND_URL}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({ query: message })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`Failed to get response: ${response.status} ${errorText}`);
        }
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Fix potential JSON formatting issues
        const fixedText = text.replace(/([{,])([a-zA-Z]+):/g, '$1"$2":')
                             .replace(/\n/g, '')
                             .replace(/\r/g, '');
        console.log('Fixed response:', fixedText);
        
        const data = JSON.parse(fixedText);
        console.log('Parsed response:', data);
        
        if (!data.results || !Array.isArray(data.results)) {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from server');
        }
        
        // Log detailed API response
        console.log('API Response:', {
            results: data.results,
            firstResult: data.results[0],
            firstDoc: data.results[0]?.document,
            resultCount: data.results.length
        });
        
        return {
            answer: data.results[0]?.document?.description || 'No relevant information found.',
            results: data.results
        };
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            type: error.name
        });
        return {
            answer: `Sorry, I encountered an error: ${error.message}`,
            results: []
        };
    }
}

// Event Handlers
async function handleSubmit() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    
    // Show loading state
    chatSubmit.disabled = true;
    chatSubmit.textContent = 'Sending...';
    
    // Get response from backend
    const response = await sendMessage(message);
    
    // Create and add response table
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message--ai';
    messageDiv.appendChild(createResponseTable(response.answer, response.results));
    chatMessages.appendChild(messageDiv);
    
    // Reset submit button
    chatSubmit.disabled = false;
    chatSubmit.textContent = 'Send';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
aiChatButton.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
chatSubmit.addEventListener('click', handleSubmit);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

// Close modal when clicking outside
aiChatModal.addEventListener('click', (e) => {
    if (e.target === aiChatModal) {
        closeModal();
    }
});
