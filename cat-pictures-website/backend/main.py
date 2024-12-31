from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.docstore.document import Document

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Website content
WEBSITE_CONTENT = [
    Document(
        page_content="Peaceful Dreams - A serene photograph of a sleeping cat on a windowsill, "
        "capturing the tranquil essence of feline rest. High-resolution image perfect "
        "for bringing calm to any space. Price: $29.99",
        metadata={"type": "product", "title": "Peaceful Dreams"}
    ),
    Document(
        page_content="Joyful Moments - A playful kitten caught mid-action with a toy, "
        "embodying the pure joy and energy of young cats. Vibrant high-resolution "
        "image that brings life to any room. Price: $34.99",
        metadata={"type": "product", "title": "Joyful Moments"}
    ),
    Document(
        page_content="Window Watcher - A curious cat gazing out the window, capturing the "
        "contemplative nature of our feline friends. Perfect high-resolution image "
        "for a study or reading nook. Price: $24.99",
        metadata={"type": "product", "title": "Window Watcher"}
    ),
    Document(
        page_content="At PurrPics, we're passionate about capturing the unique personality "
        "and charm of every cat. Our journey began with a simple love for felines "
        "and photography, which blossomed into a dedicated service for cat "
        "enthusiasts worldwide.",
        metadata={"type": "about", "section": "story"}
    ),
    Document(
        page_content="Single Picture Package: High resolution image, Personal use license, "
        "Instant download. Price: $29.99",
        metadata={"type": "pricing", "package": "single"}
    ),
    Document(
        page_content="Collection Pack: 3 high resolution images, Personal use license, "
        "Instant download, 20% savings. Price: $79.99",
        metadata={"type": "pricing", "package": "collection"}
    )
]

# Initialize embeddings
embeddings = OpenAIEmbeddings()

# Initialize vector store
vector_store = Chroma.from_documents(
    documents=WEBSITE_CONTENT,
    embedding=embeddings,
    persist_directory=os.path.expanduser("~/.local/share/cat-pictures-chroma")
)

# Initialize LLM and QA chain
llm = ChatOpenAI(temperature=0.7)
qa_prompt_template = """You are a helpful assistant for a cat photography website called PurrPics.
Use the following context to answer questions about our pictures, pricing, and company:

{context}

Question: {question}

Provide a natural, friendly response that directly answers the question using the context provided.
If you cannot answer the question based on the context, say so politely.

Answer:"""

qa_prompt = PromptTemplate(
    template=qa_prompt_template,
    input_variables=["context", "question"]
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
    chain_type_kwargs={"prompt": qa_prompt}
)

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None

@app.post("/api/query", response_model=QueryResponse)
async def query_website(request: QueryRequest):
    try:
        # Get response from QA chain
        result = qa_chain({"query": request.question})
        
        # Get relevant sources
        docs = vector_store.similarity_search(request.question, k=2)
        sources = [doc.metadata.get("title", "General Info") for doc in docs]
        
        return QueryResponse(
            answer=result["result"],
            sources=sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
