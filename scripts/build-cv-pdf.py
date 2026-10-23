"""Build the downloadable CV from cv.html: python3 scripts/build-cv-pdf.py.

Optional authoring dependencies: reportlab, lxml. The static website needs neither.
Set CV_FONT_DIR to a directory containing DejaVuSans.ttf and DejaVuSans-Bold.ttf
when they are not installed at the Linux default path.
"""
from pathlib import Path
import os
import re
from html import escape
from lxml import html
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, KeepTogether
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

ROOT = Path(__file__).resolve().parents[1]
FONT = Path(os.environ.get('CV_FONT_DIR', '/usr/share/fonts/truetype/dejavu'))
for name, file in [('CV', 'DejaVuSans.ttf'), ('CVBold', 'DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT / file)))
pdfmetrics.registerFontFamily('CV', normal='CV', bold='CVBold', italic='CV', boldItalic='CVBold')

INK = colors.HexColor('#18242a')
MUTED = colors.HexColor('#52606b')
TEAL = colors.HexColor('#0b7285')
LINE = colors.HexColor('#dce4e8')
PAGE_W, PAGE_H = A4
MARGIN = 16 * mm
WIDTH = PAGE_W - MARGIN * 2
DATE_W = 30 * mm
BODY_W = WIDTH - DATE_W

styles = {
    'title': ParagraphStyle('title', fontName='CVBold', fontSize=22, leading=27, textColor=INK, spaceAfter=7),
    'contact': ParagraphStyle('contact', fontName='CV', fontSize=8, leading=11, textColor=MUTED, spaceAfter=5),
    'lead': ParagraphStyle('lead', fontName='CV', fontSize=9.2, leading=13, textColor=MUTED, spaceAfter=8),
    'section': ParagraphStyle('section', fontName='CVBold', fontSize=10.3, leading=14, textColor=TEAL, spaceBefore=10, spaceAfter=6, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='CV', fontSize=9.1, leading=12.5, textColor=INK, spaceAfter=3),
    'entry-title': ParagraphStyle('entry-title', fontName='CVBold', fontSize=9.2, leading=12.5, textColor=INK, spaceAfter=2),
    'entry-org': ParagraphStyle('entry-org', fontName='CV', fontSize=8.7, leading=12, textColor=MUTED, spaceAfter=3),
    'date': ParagraphStyle('date', fontName='CV', fontSize=8.1, leading=11.4, textColor=MUTED),
    'credential': ParagraphStyle('credential', fontName='CV', fontSize=8, leading=11.5, textColor=MUTED, spaceAfter=3),
    'bullet': ParagraphStyle('bullet', fontName='CV', fontSize=9.1, leading=12.5, textColor=INK, leftIndent=9, firstLineIndent=-7, spaceAfter=3),
}

def text(value):
    return re.sub(r'\s+', ' ', value or '').strip().translate(str.maketrans({'–':'-', '—':'-', '‑':'-', '\u00a0':' '}))

def inline(node):
    parts = [escape(node.text or '')]
    for child in node:
        content = inline(child)
        if child.tag in ('strong', 'b'):
            parts.append('<b>' + content + '</b>')
        elif child.tag == 'a' and child.get('href', '').startswith(('https://', 'http://', 'mailto:')):
            parts.append('<a href="' + escape(child.get('href'), quote=True) + '" color="#0b7285">' + content + '</a>')
        elif child.tag == 'br':
            parts.append('<br/>')
        else:
            parts.append(content)
        parts.append(escape(child.tail or ''))
    return text(''.join(parts))

def para(node, kind='body'):
    return Paragraph(inline(node), styles[kind])

def row(date, content):
    t = Table([[Paragraph(escape(text(date)), styles['date']), content]], colWidths=[DATE_W, BODY_W])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (0,-1), 0),
        ('LEFTPADDING', (1,0), (1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-1), .35, LINE),
    ]))
    return t

tree = html.fromstring((ROOT / 'cv.html').read_text())
main = tree.xpath('//main')[0]
story = [Paragraph('Giridhar Reddy Karnati', styles['title'])]
contact = ('<a href="mailto:kgiridharreddy2022@gmail.com">kgiridharreddy2022@gmail.com</a><br/>'
           '<a href="https://giridharreddyk.github.io/">giridharreddyk.github.io</a> · '
           '<a href="https://www.linkedin.com/in/kgiridharreddy">linkedin.com/in/kgiridharreddy</a><br/>'
           'Greater Hyderabad Area, India')
story.append(Paragraph(contact, styles['contact']))
lead = main.xpath('.//p[@class="page-lead"]')[0]
story.append(para(lead, 'lead'))

for section in main.xpath('.//section'):
    heading = section.xpath('./h2')[0]
    story.append(Paragraph(escape(text(heading.text_content())).upper(), styles['section']))
    for li in section.xpath('./ol/li'):
        date = li.xpath('./div[@class="entry-date"]')[0].text_content()
        detail = li.xpath('./div')[1]
        content = []
        for node in detail:
            if node.tag == 'h3':
                content.append(para(node, 'entry-title'))
            elif node.tag == 'p':
                cls = node.get('class', '')
                kind = 'credential' if 'credential-id' in cls else 'entry-org' if cls == 'entry-org' else 'body'
                content.append(para(node, kind))
            elif node.tag == 'ul':
                for bullet in node.xpath('./li'):
                    content.append(Paragraph('• ' + inline(bullet), styles['bullet']))
        story.append(row(date, content))
    for note in section.xpath('./p'):
        story.append(Spacer(1, 5))
        story.append(para(note, 'lead'))
    terms = section.xpath('./dl/dt')
    for term in terms:
        definition = term.getnext()
        t = Table([[para(term, 'entry-title'), para(definition)]], colWidths=[DATE_W+24, BODY_W-24])
        t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'), ('LEFTPADDING',(0,0),(-1,-1),0),
                              ('RIGHTPADDING',(0,0),(0,-1),9), ('BOTTOMPADDING',(0,0),(-1,-1),5)]))
        story.append(t)

def decorate(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(.4)
    canvas.line(MARGIN, 12*mm, PAGE_W-MARGIN, 12*mm)
    canvas.setFont('CV', 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 8*mm, 'Giridhar Reddy Karnati | Curriculum Vitae')
    canvas.drawRightString(PAGE_W-MARGIN, 8*mm, str(doc.page))
    if doc.page == 1:
        widget = qr.QrCodeWidget('https://giridharreddyk.github.io/')
        x0,y0,x1,y1 = widget.getBounds()
        side = 19*mm
        drawing = Drawing(side, side, transform=[side/(x1-x0),0,0,side/(y1-y0),0,0])
        drawing.add(widget)
        renderPDF.draw(drawing, canvas, PAGE_W-MARGIN-side, PAGE_H-MARGIN-side)
    canvas.restoreState()

out = ROOT / 'assets/pdf/Giridhar_Reddy_Karnati_CV.pdf'
out.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(out), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                        topMargin=14*mm, bottomMargin=17*mm, title='Curriculum Vitae - Giridhar Reddy Karnati',
                        author='Giridhar Reddy Karnati', subject='Education, experience, publications, awards and certifications')
doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
print(out)
