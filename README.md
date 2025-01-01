# Mock Website: PurrPics - Cat Photography Website

## Purpose

Tis mock website's purpose is to serve as a proof of concept to test AI chat to help the user navigate the website. Using this AI chat the user does not have to know the website's structure or content. Instead, the AI chat will help the user navigate the website and find the information they need.

![Landing Page](landing_page.png)

A modern website for selling cat photographs with AI-powered search capabilities.

## Features

- Responsive design
- AI-powered search using RAG (Retrieval Augmented Generation)
- Real-time search suggestions
- Detailed product information
- About page with company history
- Mobile-friendly interface

## Prerequisites

- Docker and Docker Compose
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cat-pictures-website
```

2. Set up environment variables:
```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_key_here
```

## Running the Application

1. Start both frontend and backend services:
```bash
docker-compose up -d
```

2. Access the website:
- Frontend: http://localhost:5050
- Backend API: http://localhost:5051

3. Stop the services:
```bash
docker-compose down
```

## Development

### Project Structure
```
cat-pictures-website/
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── rag.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Backend API Endpoints

- `POST /api/query`: Submit a search query
  ```json
  {
    "question": "What is the price of the Peaceful Dreams photo?"
  }
  ```

- `GET /api/health`: Health check endpoint

## Testing the Search

1. Open the website in your browser
2. Use the search box in the header
3. Type your query (e.g., "Tell me about the Peaceful Dreams photo")
4. View both regular search results and AI-powered responses

## Troubleshooting

1. If the backend fails to start:
   - Check if the OpenAI API key is correctly set in `backend/.env`
   - Verify the ports 5050 and 5051 are not in use

2. If search doesn't work:
   - Check browser console for errors
   - Verify both services are running: `docker-compose ps`
   - Check backend logs: `docker-compose logs backend`
