from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
import os

class MemoryManager:
    def __init__(self, index_path='faiss_index.bin', data_path='memory_data.json'):
        self.index_path = index_path
        self.data_path = data_path
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dim = 384  # embedding dimension của model trên

        if os.path.exists(self.index_path) and os.path.exists(self.data_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.data_path, 'r') as f:
                self.memory_data = json.load(f)
            print("Memory loaded!")
        else:
            self.index = faiss.IndexFlatL2(self.dim)
            self.memory_data = []
            print("Created new memory.")

    def add(self, text):
        emb = self.model.encode([text])[0]
        self.index.add(np.array([emb], dtype='float32'))
        self.memory_data.append(text)
        self._save()

    def search(self, query, top_k=3):
        q_emb = self.model.encode([query])[0]
        D, I = self.index.search(np.array([q_emb], dtype='float32'), top_k)
        results = [self.memory_data[i] for i in I[0] if i < len(self.memory_data)]
        return results

    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.data_path, 'w') as f:
            json.dump(self.memory_data, f, indent=2)
