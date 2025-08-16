from openai import OpenAI
import re
import fitz
import os
import requests

# ===== CONFIG =====
API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    API_KEY = "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"  # replace with real key

BASE_URL = "https://models.github.ai/inference"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_MODEL = "openai/gpt-5"  # from your Node sample
OPENAI_MODEL = "Provider-7/gpt-4o-mini"


def extract_text(pdf_path):
    """Ultra-fast text extraction using PyMuPDF"""
    if not pdf_path or not os.path.exists(pdf_path):
        raise ValueError(f"PDF file not found or invalid path: {pdf_path}")
    doc = fitz.open(pdf_path)
    if doc.page_count == 0:
        raise ValueError("PDF file has no pages")
    return "\n".join(page.get_text() for page in doc)


def clean_text(text):
    """Optimized text cleaning"""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\x0c", "", text)
    return text[:150000]


def generate_mindmaps(text, use_github=False):
    """
    Generate mindmaps using either:
    - OpenAI client (default)
    - GitHub Models Marketplace (if use_github=True)
    """
    if not text or len(text.strip()) == 0:
        raise ValueError("Input text is empty or None")

    system_prompt = """Generate separate Markdown mindmaps for each major topic and its subtopics. 
Format exactly like this:

### Topic 1
```mindmap
root((Topic 1))
  "Subtopic A"
    "Detail 1"
    "Detail 2"
  "Subtopic B"
```

### Topic 2
```mindmap
root((Topic 2))
  "Subtopic C"
  "Subtopic D"
```

- Use ONLY 2-space indentation
- NEVER use dashes/bullets
- Include ALL content from the text"""

    try:
        if use_github:
            # ===== GitHub Marketplace API =====
            headers = {
                "Authorization": f"Bearer {GITHUB_TOKEN}",
                "Content-Type": "application/json",
            }
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Create structured mindmaps for:\n{text[:150000]}"},
                ],
                "model": GITHUB_MODEL,
            }
            resp = requests.post(f"{BASE_URL}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

        else:
            # ===== OpenAI API =====
            print("generating ai response")
            client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Create structured mindmaps for:\n{text[:150000]}"},
                ],
                temperature=0.3,
                max_tokens=4000,
            )
            print("generation done")
            return response.choices[0].message.content

    except Exception as e:
        raise Exception(f"Failed to generate mindmaps: {str(e)}")


def validate_mermaid(code):
    """
    Prepares Mermaid mindmap code:
    - Ensures it starts with 'mindmap'
    - Wraps root node with double parentheses
    - Normalizes indentation
    - Removes (), [], {} from labels
    """
    lines = code.strip().split('\n')

    cleaned_lines = []
    for i, line in enumerate(lines):
        indent_level = len(line) - len(line.lstrip(' '))
        indent = '  ' * (indent_level // 2)

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
        mermaid_blocks = re.findall(r'```mindmap\n(.*?)```', content, re.DOTALL)

        for block in mermaid_blocks:
            mindmaps.append({
                'title': title,
                'code': validate_mermaid(block.strip())
            })

    return mindmaps
