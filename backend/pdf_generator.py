import re
import logging
from fpdf import FPDF

logger = logging.getLogger(__name__)


def sanitize_text(text: str) -> str:
    """Replace problematic Unicode characters with ASCII equivalents."""
    replacements = {
        '\u2022': '-',     # bullet •
        '\u2013': '-',     # en-dash –
        '\u2014': '--',    # em-dash —
        '\u2018': "'",     # left single quote '
        '\u2019': "'",     # right single quote '
        '\u201c': '"',     # left double quote "
        '\u201d': '"',     # right double quote "
        '\u2026': '...',   # ellipsis …
        '\u2192': '->',    # right arrow →
        '\u2190': '<-',    # left arrow ←
        '\u2023': '>',     # triangular bullet ‣
        '\u25b8': '>',     # right triangle ▸
        '\u25cf': '*',     # black circle ●
        '\u2714': '[x]',   # check mark ✔
        '\u2716': '[!]',   # cross mark ✖
        '\u00a0': ' ',     # non-breaking space
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    # Remove any remaining non-latin1 characters
    try:
        text.encode('latin-1')
    except UnicodeEncodeError:
        text = text.encode('latin-1', errors='replace').decode('latin-1')
    return text


class CVPdf(FPDF):
    """Professional CV PDF generator using built-in fonts."""

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def add_name(self, name: str):
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(30, 30, 30)
        self.cell(0, 12, sanitize_text(name), align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def add_contact(self, contact: str):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, sanitize_text(contact), align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def add_divider(self):
        self.set_draw_color(200, 200, 200)
        self.set_line_width(0.3)
        y = self.get_y()
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(4)

    def add_section_title(self, title: str):
        self.ln(3)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(44, 62, 80)
        self.cell(0, 8, sanitize_text(title.upper()), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(52, 152, 219)
        self.set_line_width(0.6)
        y = self.get_y()
        self.line(self.l_margin, y, self.l_margin + 40, y)
        self.ln(4)

    def add_subsection(self, text: str):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 40, 40)
        self.cell(0, 7, sanitize_text(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def add_body_text(self, text: str):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 5, sanitize_text(text))
        self.ln(1)

    def add_bullet(self, text: str):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(60, 60, 60)
        # Use ASCII dash as bullet since Helvetica doesn't support unicode bullets
        bullet_text = "  -  " + sanitize_text(text)
        self.multi_cell(0, 5, bullet_text)
        self.ln(1)

    def add_skill_line(self, text: str):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 5, sanitize_text(text))
        self.ln(1)


def markdown_to_pdf(md_text: str) -> bytes:
    """Convert LLM-generated markdown CV to a professionally formatted PDF."""
    logger.info("Converting markdown CV to PDF...")

    pdf = CVPdf()
    pdf.add_page()
    pdf.set_margins(20, 15, 20)

    lines = md_text.strip().split('\n')
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        # Horizontal rule
        if line in ('---', '***', '___'):
            pdf.add_divider()
            i += 1
            continue

        # H1 - Candidate name
        if line.startswith('# ') and not line.startswith('## '):
            name = line[2:].strip().replace('**', '')
            pdf.add_name(name)
            i += 1
            continue

        # H2 - Section title
        if line.startswith('## '):
            title = line[3:].strip().replace('**', '')
            pdf.add_section_title(title)
            i += 1
            continue

        # H3 - Subsection
        if line.startswith('### '):
            sub = line[4:].strip().replace('**', '')
            pdf.add_subsection(sub)
            i += 1
            continue

        # Bold contact line
        if line.startswith('**') and line.endswith('**'):
            contact = line.strip('*').strip()
            pdf.add_contact(contact)
            i += 1
            continue

        # Bullet points
        if line.startswith('- ') or line.startswith('* ') or re.match(r'^\d+\.\s', line):
            bullet_text = re.sub(r'^[-*]\s+|^\d+\.\s+', '', line)
            bullet_text = bullet_text.replace('**', '').replace('*', '')
            pdf.add_bullet(bullet_text)
            i += 1
            continue

        # Regular text
        text = line.replace('**', '').replace('*', '')
        pdf.add_body_text(text)
        i += 1

    # Generate PDF bytes
    try:
        pdf_bytes = pdf.output()
        logger.info(f"PDF generated: {len(pdf_bytes)} bytes")
        return bytes(pdf_bytes)
    except Exception as e:
        logger.error(f"PDF output error: {e}")
        raise
