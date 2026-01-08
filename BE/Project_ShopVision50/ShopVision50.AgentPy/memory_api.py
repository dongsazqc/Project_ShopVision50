from fastapi import FastAPI
from pydantic import BaseModel
from memory_manager import MemoryManager  # file quản lý vector memory 

app = FastAPI()
mem = MemoryManager()

class Query(BaseModel):
    text: str

@app.post("/search")
async def search_memory(query: Query):
    results = mem.search(query.text, top_k=1)  # Lấy 1 kết quả gần nhất
    return {"results": results}
    