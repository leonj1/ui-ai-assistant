// DOM Elements
const aiChatButton = document.getElementById('ai-chat-button');
const aiChatModal = document.getElementById('ai-chat-modal');
const modalClose = aiChatModal.querySelector('.modal__close');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSubmit = document.getElementById('chat-submit');

// Constants
const BACKEND_URL = window.location.hostname === 'localhost' 
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
    link.href = `../products/${mapping.page}.html`;
    link.className = 'chat-product-card__link';

    const image = document.createElement('img');
    image.src = `../images/${mapping.image}.jpg`;
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

function createResponseTable(answer, results) {
    const container = document.createElement('div');
    container.className = 'response-container';
    
    // Check if results contain products
    const products = results.filter(result => result.document.type === 'product');
    
    // Log the products data
    console.log('Products from API:', products);
    
    if (products.length > 0) {
        // Create product cards grid
        const grid = document.createElement('div');
        grid.className = 'chat-product-grid';
        
        products.forEach(result => {
            grid.appendChild(createProductCard(result.document));
        });
        
        container.appendChild(grid);
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
        const response = await fetch(`${BACKEND_URL}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: message })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        // Log the API response
        console.log('API Response:', data);
        return {
            answer: data.results[0]?.document?.description || 'No relevant information found.',
            results: data.results
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            answer: 'Sorry, I encountered an error. Please try again later.',
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
