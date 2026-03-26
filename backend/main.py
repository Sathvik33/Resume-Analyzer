import io
import traceback
import logging

logging.basicConfig(level=logging.INFO)
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber

from analyzer import analyze_resume
from cv_generator import generate_cv
from pdf_generator import markdown_to_pdf

app = FastAPI(title="AI Resume Analyzer", version="1.0.0")

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    jd_text: str
    resume_text: str


class GenerateCVRequest(BaseModel):
    jd_text: str
    resume_text: str
    analysis_results: dict


class DownloadPDFRequest(BaseModel):
    cv_markdown: str


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "model": "qwen2.5"}


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume content cannot be empty")

    try:
        result = await analyze_resume(request.jd_text, request.resume_text)
        return result
    except Exception as e:
        logging.error(f"Analysis failed: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()
        pdf_bytes = io.BytesIO(contents)

        text = ""
        with pdfplumber.open(pdf_bytes) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        return {"text": text.strip(), "pages": len(pdf.pages) if pdf else 0}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")


@app.post("/api/generate-cv")
async def generate_cv_endpoint(request: GenerateCVRequest):
    if not request.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume content cannot be empty")

    try:
        cv_markdown = await generate_cv(
            request.jd_text,
            request.resume_text,
            request.analysis_results
        )
        return {"cv_markdown": cv_markdown}
    except Exception as e:
        logging.error(f"CV generation failed: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"CV generation failed: {str(e)}")


@app.post("/api/download-cv-pdf")
async def download_cv_pdf(request: DownloadPDFRequest):
    if not request.cv_markdown.strip():
        raise HTTPException(status_code=400, detail="CV content cannot be empty")

    try:
        pdf_bytes = markdown_to_pdf(request.cv_markdown)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"}
        )
    except Exception as e:
        logging.error(f"PDF generation failed: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
