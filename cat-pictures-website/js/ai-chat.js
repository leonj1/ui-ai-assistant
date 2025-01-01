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

function createResponseTable(answer, sources) {
    const container = document.createElement('div');
    container.className = 'response-container';
    
    // Add sources as links if available
    if (sources && sources.length > 0) {
        sources.forEach(source => {
            if (source.type === 'page' && source.link) {
                const linkDiv = document.createElement('div');
                linkDiv.className = 'response-link';
                const link = document.createElement('a');
                link.href = source.link;
                link.textContent = source.link;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateToSource(source);
                });
                linkDiv.appendChild(link);
                container.appendChild(linkDiv);
            }
        });
    }
    
    // Add answer as a card
    const card = document.createElement('div');
    card.className = 'response-card';
    card.textContent = answer;
    container.appendChild(card);
    
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
        // Transform the response to match expected format
        return {
            answer: data.results[0]?.document?.description || 'No relevant information found.',
            sources: data.results.map(result => ({
                type: result.document.type,
                link: result.document.link
            }))
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            answer: 'Sorry, I encountered an error. Please try again later.',
            sources: []
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
    messageDiv.appendChild(createResponseTable(response.answer, response.sources));
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
