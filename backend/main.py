from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Product Purchase AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://prodi-jet.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.post("/api/search")
async def search_product(request: QueryRequest):
    from agent import run_agent
    try:
        recommendation = run_agent(request.query)
        return {"message": "Success", "recommendation": recommendation}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@app.get("/")
def read_root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
