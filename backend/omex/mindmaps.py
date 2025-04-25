from openai import OpenAI
import re
import fitz
import os
import requests
import time

# Use standard OpenAI API endpoint
API_KEY = os.environ.get('OPENAI_API_KEY')
# If no API key in environment, use this one (replace with your actual API key)
if not API_KEY:
    API_KEY = "ddc-beta-1n5ga83c9t-zUwU6o5umOi6jq9D3SIWIw9Yz9YFL9rrW3u"  # Replace with your valid OpenAI API key
# Fallback to standard OpenAI API if custom endpoint fails
BASE_URL = "https://beta.sree.shop/v1"


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


def generate_mindmaps(text):
    if not text or len(text.strip()) == 0:
        raise ValueError("Input text is empty or None")

    try:
        print('generating ai response')
        client = OpenAI(
            api_key=API_KEY,
            base_url=BASE_URL
        )

        response = client.chat.completions.create(
            model="Provider-7/gpt-4o-mini",
            messages=[{
                    "role": "system",
                "content": """Generate separate Markdown mindmaps for each major topic and its subtopics. 
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
            }, {
                "role": "user",
                "content": f"Create structured mindmaps for:\n{text[:150000]}"
                }],
                temperature=0.3,
                max_tokens=4000
            )
        print("generation done")
        return response.choices[0].message.content

    except Exception as e:
        print(f"Error during text completion: {e}")
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

    # Remove dangerous characters from lines
    cleaned_lines = []
    for i, line in enumerate(lines):
        indent_level = len(line) - len(line.lstrip(' '))
        indent = '  ' * (indent_level // 2)

        # Clean line content
        content = line.strip()
        content = re.sub(r'[()\[\]{}]', '', content)

        # First line should be root — wrap it as root((...))
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

    # Split by markdown headers
    sections = re.split(r'### (.*?)\n', ai_output)[1:]

    for i in range(0, len(sections), 2):
        title = sections[i].strip()
        content = sections[i + 1]

        # Extract mermaid code blocks
        mermaid_blocks = re.findall(r'```mindmap\n(.*?)```', content, re.DOTALL)

        for block in mermaid_blocks:
            mindmaps.append({
                'title': title,
                'code': validate_mermaid(block.strip())
            })

    return mindmaps