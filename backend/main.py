from fastapi import FastAPI, Query
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import Optional
from database import init_db, save_history, get_history, save_favorite, get_favorites, delete_favorite

# Load environment variables
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

# Initialize database
init_db()

app = FastAPI(title="Product Purchase AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Updated for broader compatibility during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class FavoriteRequest(BaseModel):
    product_name: str
    price: Optional[str] = None
    rating: Optional[str] = None
    link: Optional[str] = None
    source: Optional[str] = None

@app.post("/api/search")
async def search_product(request: QueryRequest):
    from agent import run_agent
    try:
        result = run_agent(request.query)
        recommendation = result["markdown"]
        products = result["products"]
        save_history(request.query, recommendation)
        return {"message": "Success", "recommendation": recommendation, "products": products}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@app.get("/api/history")
async def fetch_history(q: Optional[str] = Query(None)):
    try:
        history = get_history(q)
        return {"message": "Success", "history": history}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@app.post("/api/favorites")
async def add_favorite(request: FavoriteRequest):
    try:
        save_favorite(request.product_name, request.price, request.rating, request.link, request.source)
        return {"message": "Success"}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@app.get("/api/favorites")
async def fetch_favorites():
    try:
        favorites = get_favorites()
        return {"message": "Success", "favorites": favorites}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@app.delete("/api/favorites/{favorite_id}")
async def remove_favorite(favorite_id: int):
    try:
        delete_favorite(favorite_id)
        return {"message": "Success"}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@app.get("/")
def read_root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
