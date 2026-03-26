import re
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings


class SemanticMatcher:
    """Matches resume sections against JD requirements using semantic similarity."""

    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.Client(Settings(anonymized_telemetry=False))

    def _chunk_text(self, text: str, chunk_type: str = "general") -> list[str]:
        """Split text into meaningful chunks (sentences/bullet points)."""
        # Split on newlines, bullet points, numbered lists
        lines = re.split(r'\n+', text.strip())
        chunks = []

        for line in lines:
            line = line.strip()
            # Remove bullet markers
            line = re.sub(r'^[\-\•\*\>\d+\.]+\s*', '', line).strip()
            if len(line) > 15:  # Skip very short lines
                chunks.append(line)

        # If too few chunks, also split on sentence boundaries
        if len(chunks) < 3:
            sentences = re.split(r'[.!?]+\s+', text)
            for s in sentences:
                s = s.strip()
                if len(s) > 15 and s not in chunks:
                    chunks.append(s)

        return chunks if chunks else [text.strip()]

    def _extract_skills_section(self, text: str) -> list[str]:
        """Extract individual skills/keywords from text."""
        # Common delimiters for skill lists
        skills = []

        # Find comma/pipe separated lists
        skill_patterns = re.findall(
            r'(?:skills?|technologies?|tools?|frameworks?|languages?)\s*[:\-]?\s*([^\n]+)',
            text, re.IGNORECASE
        )

        for match in skill_patterns:
            parts = re.split(r'[,|/;•·]+', match)
            skills.extend([p.strip() for p in parts if len(p.strip()) > 1])

        # Also extract standalone terms that look like skills
        tech_terms = re.findall(
            r'\b(?:Python|Java|JavaScript|TypeScript|React|Angular|Vue|Node\.?js|'
            r'SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Docker|Kubernetes|AWS|Azure|GCP|'
            r'Git|CI/CD|REST|GraphQL|FastAPI|Flask|Django|Spring|TensorFlow|'
            r'PyTorch|Pandas|NumPy|Scikit-learn|Machine Learning|Deep Learning|'
            r'NLP|Computer Vision|AI|ML|LLM|RAG|LangChain|HTML|CSS|'
            r'Agile|Scrum|DevOps|Linux|C\+\+|C#|Go|Rust|Kotlin|Swift)\b',
            text, re.IGNORECASE
        )
        skills.extend(tech_terms)

        # Deduplicate while preserving order
        seen = set()
        unique_skills = []
        for s in skills:
            sl = s.lower()
            if sl not in seen:
                seen.add(sl)
                unique_skills.append(s)

        return unique_skills

    def compute_similarity(self, jd_text: str, resume_text: str) -> dict:
        """Compute semantic similarity between JD and resume sections."""

        # Delete existing collections if they exist (fresh analysis each time)
        try:
            self.client.delete_collection("jd_chunks")
        except Exception:
            pass
        try:
            self.client.delete_collection("resume_chunks")
        except Exception:
            pass

        # Chunk texts
        jd_chunks = self._chunk_text(jd_text, "jd")
        resume_chunks = self._chunk_text(resume_text, "resume")

        # Extract skills
        jd_skills = self._extract_skills_section(jd_text)
        resume_skills = self._extract_skills_section(resume_text)

        # Store JD chunks in ChromaDB
        jd_collection = self.client.create_collection(
            name="jd_chunks",
            metadata={"hnsw:space": "cosine"}
        )

        jd_embeddings = self.model.encode(jd_chunks).tolist()
        jd_collection.add(
            embeddings=jd_embeddings,
            documents=jd_chunks,
            ids=[f"jd_{i}" for i in range(len(jd_chunks))]
        )

        # Store resume chunks in ChromaDB
        resume_collection = self.client.create_collection(
            name="resume_chunks",
            metadata={"hnsw:space": "cosine"}
        )

        resume_embeddings = self.model.encode(resume_chunks).tolist()
        resume_collection.add(
            embeddings=resume_embeddings,
            documents=resume_chunks,
            ids=[f"res_{i}" for i in range(len(resume_chunks))]
        )

        # --- Compute Overall Similarity ---
        # For each JD chunk, find the best matching resume chunk
        jd_to_resume_scores = []
        for i, jd_chunk in enumerate(jd_chunks):
            results = resume_collection.query(
                query_embeddings=[jd_embeddings[i]],
                n_results=min(3, len(resume_chunks))
            )
            if results['distances'] and results['distances'][0]:
                # ChromaDB cosine distance: 0 = identical, 2 = opposite
                # Convert to similarity: 1 - (distance / 2)
                best_distance = results['distances'][0][0]
                similarity = 1 - (best_distance / 2)
                jd_to_resume_scores.append(similarity)

        overall_similarity = float(np.mean(jd_to_resume_scores)) if jd_to_resume_scores else 0.0

        # --- Compute Skill-level Similarity ---
        skill_matches = []
        missing_skills = []
        matched_skills = []

        if jd_skills:
            jd_skill_embeddings = self.model.encode(jd_skills)
            resume_skill_embeddings = self.model.encode(resume_skills) if resume_skills else None

            for i, jd_skill in enumerate(jd_skills):
                if resume_skill_embeddings is not None and len(resume_skills) > 0:
                    # Compute cosine similarity with each resume skill
                    jd_emb = jd_skill_embeddings[i]
                    similarities = np.dot(resume_skill_embeddings, jd_emb) / (
                        np.linalg.norm(resume_skill_embeddings, axis=1) * np.linalg.norm(jd_emb)
                    )
                    best_idx = int(np.argmax(similarities))
                    best_score = float(similarities[best_idx])

                    if best_score >= 0.75:
                        matched_skills.append({
                            "jd_skill": jd_skill,
                            "resume_skill": resume_skills[best_idx],
                            "similarity": round(best_score, 3)
                        })
                        skill_matches.append(best_score)
                    elif best_score >= 0.5:
                        skill_matches.append(best_score * 0.6)
                        matched_skills.append({
                            "jd_skill": jd_skill,
                            "resume_skill": resume_skills[best_idx],
                            "similarity": round(best_score, 3),
                            "partial": True
                        })
                    else:
                        missing_skills.append(jd_skill)
                        skill_matches.append(0.0)
                else:
                    missing_skills.append(jd_skill)
                    skill_matches.append(0.0)

        skill_similarity = float(np.mean(skill_matches)) if skill_matches else 0.0

        # --- Compute Section-level Scores ---
        # Query JD requirements against resume to find best matched sections
        top_matches = []
        for i, jd_chunk in enumerate(jd_chunks[:10]):  # Limit to top 10 JD requirements
            results = resume_collection.query(
                query_embeddings=[jd_embeddings[i]],
                n_results=1
            )
            if results['documents'] and results['documents'][0]:
                best_distance = results['distances'][0][0]
                similarity = 1 - (best_distance / 2)
                top_matches.append({
                    "jd_requirement": jd_chunk[:100],
                    "best_resume_match": results['documents'][0][0][:100],
                    "similarity": round(similarity, 3)
                })

        # Clean up collections
        try:
            self.client.delete_collection("jd_chunks")
            self.client.delete_collection("resume_chunks")
        except Exception:
            pass

        return {
            "overall_similarity": round(overall_similarity, 4),
            "skill_similarity": round(skill_similarity, 4),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "jd_skills_found": jd_skills,
            "resume_skills_found": resume_skills,
            "top_section_matches": top_matches,
            "jd_chunks_count": len(jd_chunks),
            "resume_chunks_count": len(resume_chunks),
        }
