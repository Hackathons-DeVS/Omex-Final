import re
import fitz
import os
import requests
import time

# --------------------------
# CONFIG
# --------------------------
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    GITHUB_TOKEN = "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"   # Replace with your token

BASE_URL = "https://models.github.ai/inference"
MODEL = "openai/gpt-5"

# --------------------------
# PDF Processing
# --------------------------
def extract_text(pdf_path):
    """Ultra-fast text extraction using PyMuPDF (10-100x faster than pdfplumber)"""
    try:
        if not pdf_path or not os.path.exists(pdf_path):
            raise ValueError(f"PDF file not found or invalid path: {pdf_path}")
        doc = fitz.open(pdf_path)
        if doc.page_count == 0:
            raise ValueError("PDF file has no pages")
        return "\n".join(page.get_text() for page in doc)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_text(text):
    """Optimized text cleaning"""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\x0c', '', text)
    return text[:150000]

# --------------------------
# GitHub Models API
# --------------------------
def generate_mindmaps(text):
    if not text or len(text.strip()) == 0:
        raise ValueError("Input text is empty or None")

    try:
        print('generating ai response')

        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Content-Type": "application/json"
        }

        body = {
            "messages": [
                {
                    "role": "system",
                    "content": """Generate separate Markdown mindmaps for each major topic and its subtopics. Format exactly like this:
### Topic 1
mindmap
  root((Topic 1))
    "Subtopic A"
      "Detail 1"
      "Detail 2"
    "Subtopic B"
### Topic 2
mindmap
  root((Topic 2))
    "Subtopic C"
    "Subtopic D"
- Use ONLY 2-space indentation
- NEVER use dashes/bullets
- Include ALL content from the text"""
                },
                {
                    "role": "user",
                    "content": f"Create structured mindmaps for:\n{text[:150000]}"
                }
            ],
            "model": MODEL
        }

        resp = requests.post(f"{BASE_URL}/chat/completions", headers=headers, json=body)
        if resp.status_code != 200:
            raise Exception(f"GitHub API error {resp.status_code}: {resp.text}")

        print("generation done")
        return resp.json()["choices"][0]["message"]["content"]

    except Exception as e:
        print(f"Error during text completion: {e}")
        raise Exception(f"Failed to generate mindmaps: {str(e)}")

# --------------------------
# Mermaid Validation
# --------------------------
def validate_mermaid(code):
    """ Prepares Mermaid mindmap code """
    lines = code.strip().split('\n')
    cleaned_lines = []
    for i, line in enumerate(lines):
        indent_level = len(line) - len(line.lstrip(' '))
        indent = ' ' * (indent_level // 2)
        content = line.strip()
        content = re.sub(r'[()\[\]{}]', '', content)
        if i == 0:
            if not content.startswith("root"):
                content = "root((Mindmap))"
            else:
                topic = content[4:].strip()
                content = f"root(({topic}))"
        cleaned_lines.append(f"{indent}{content}")
    return "mindmap\n" + '\n'.join(cleaned_lines)

def process_mindmaps(ai_output):
    """Extract and validate multiple mindmaps"""
    mindmaps = []
    sections = re.split(r'### (.*?)\n', ai_output)[1:]
    for i in range(0, len(sections), 2):
        title = sections[i].strip()
        content = sections[i + 1]
        mermaid_blocks = re.findall(r'mindmap\n(.*?)(?=\n###|\Z)', content, re.DOTALL)
        for block in mermaid_blocks:
            mindmaps.append({
                'title': title,
                'code': validate_mermaid(block.strip())
            })
    return mindmaps
