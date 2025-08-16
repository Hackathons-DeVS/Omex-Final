import os
import re
import fitz
import requests
from openai import OpenAI

# --------------------------
# CONFIG
# --------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

# Fallbacks
if not OPENAI_API_KEY:
    OPENAI_API_KEY = "your-openai-key-here"   # Replace with your OpenAI key

GITHUB_API_BASE = "https://models.github.ai/inference"
GITHUB_MODEL = "openai/gpt-5"
OPENAI_MODEL = "Provider-7/gpt-4o-mini"
BASE_URL = "https://models.github.ai/inference"   # For OpenAI client fallback

# --------------------------
# PDF Processing
# --------------------------
def extract_text(pdf_path):
    """Ultra-fast text extraction using PyMuPDF"""
    try:
        if not pdf_path or not os.path.exists(pdf_path):
            raise ValueError(f"PDF file not found or invalid path: {pdf_path}")
        doc = fitz.open(pdf_path)
        if doc.page_count == 0:
            raise ValueError("PDF file has no pages")
        return "\n".join(page.get_text() for page in doc)
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_text(text):
    """Optimized text cleaning"""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\x0c', '', text)
    return text[:150000]

# --------------------------
# GitHub Models API Wrapper
# --------------------------
def github_chat_completion(messages, model=GITHUB_MODEL):
    """Call GitHub Models API for chat completions"""
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Content-Type": "application/json"
    }
    body = {
        "messages": messages,
        "model": model
    }
    resp = requests.post(f"{GITHUB_API_BASE}/chat/completions", headers=headers, json=body)
    if resp.status_code != 200:
        raise Exception(f"GitHub API error {resp.status_code}: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"]

# --------------------------
# AI Mindmap Generation
# --------------------------
def generate_mindmaps(text, use_github=False):
    if not text or len(text.strip()) == 0:
        raise ValueError("Input text is empty or None")

    system_prompt = """Generate separate Markdown mindmaps for each major topic and its subtopics.
Format exactly like this:
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

    user_prompt = f"Create structured mindmaps for:\n{text[:150000]}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    try:
        print("generating AI response...")

        if use_github:
            # GitHub Models API
            ai_output = github_chat_completion(messages)
        else:
            # OpenAI Python SDK
            client = OpenAI(api_key=OPENAI_API_KEY, base_url=BASE_URL)
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=4000
            )
            ai_output = response.choices[0].message.content

        print("generation done ✅")
        return ai_output
    except Exception as e:
        raise Exception(f"Failed to generate mindmaps: {str(e)}")

# --------------------------
# Mermaid Validation
# --------------------------
def validate_mermaid(code):
    """Prepares Mermaid mindmap code"""
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

# --------------------------
# MAIN
# --------------------------
if __name__ == "__main__":
    pdf_path = "example.pdf"   # <--- Change to your PDF
    raw_text = extract_text(pdf_path)
    cleaned = clean_text(raw_text)

    # Switch between OpenAI and GitHub Models
    ai_output = generate_mindmaps(cleaned, use_github=True)  # set False for OpenAI

    # Process mindmaps
    mindmaps = process_mindmaps(ai_output)

    # Print result
    for mm in mindmaps:
        print(f"\n### {mm['title']}\n{mm['code']}\n")
