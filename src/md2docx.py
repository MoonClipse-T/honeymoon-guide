import io, re, sys
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

src, fixes, out = sys.argv[1], sys.argv[2], sys.argv[3]
md = io.open(src, encoding='utf-8').read()
fx = io.open(fixes, encoding='utf-8').read()

# 원본 본문은 그대로 두고, 첫 구분선 뒤에 0장(추가 점검)을 넣는다
first_hr = md.index('\n---\n') + len('\n---\n')
md = md[:first_hr] + '\n' + fx + '\n' + md[first_hr:]
md = md.replace('| 1 | **15일 투어** (#3427309, 안 되면 테이스트 프라하) |',
                '| 1 | **15일 투어** (KKday 546626 또는 #3427309, 0장 참고) |')
md = md.replace('# 12월 신혼여행, 이 순서로 예약하고 움직이세요',
                '# 12월 신혼여행, 이 순서로 예약하고 움직이세요\n\n2026년 11월 2일 작성, 같은 날 노션 자료 대조 후 0장 추가')

FONT = '맑은 고딕'
RED = RGBColor(0xB0, 0x1E, 0x2F)
INK = RGBColor(0x22, 0x22, 0x22)
MUTED = RGBColor(0x6A, 0x6A, 0x6A)
LINK = RGBColor(0x1F, 0x5F, 0xBF)

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.orientation = WD_ORIENT.PORTRAIT
for side in ('left_margin', 'right_margin'):
    setattr(sec, side, Cm(1.8))
sec.top_margin, sec.bottom_margin = Cm(1.8), Cm(1.8)

def set_font(style_or_run, size=None, bold=None, color=None):
    f = style_or_run.font
    f.name = FONT
    rpr = style_or_run.element.get_or_add_rPr()
    fonts = rpr.find(qn('w:rFonts'))
    if fonts is None:
        fonts = OxmlElement('w:rFonts'); rpr.append(fonts)
    for a in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
        fonts.set(qn(a), FONT)
    if size: f.size = Pt(size)
    if bold is not None: f.bold = bold
    if color is not None: f.color.rgb = color

set_font(doc.styles['Normal'], 10, color=INK)
doc.styles['Normal'].paragraph_format.space_after = Pt(4)
doc.styles['Normal'].paragraph_format.line_spacing = 1.25
for name, size, color in (('Title', 20, INK), ('Heading 1', 14, RED), ('Heading 2', 11.5, INK)):
    st = doc.styles[name]
    set_font(st, size, True, color)
    st.paragraph_format.space_before = Pt(14 if name != 'Title' else 0)
    st.paragraph_format.space_after = Pt(6)
for name in ('List Bullet', 'List Number'):
    set_font(doc.styles[name], 10)

def add_link(par, text, url, size=None, bold=False):
    rid = par.part.relate_to(url, RT.HYPERLINK, is_external=True)
    h = OxmlElement('w:hyperlink'); h.set(qn('r:id'), rid)
    r = OxmlElement('w:r'); rpr = OxmlElement('w:rPr')
    fonts = OxmlElement('w:rFonts')
    for a in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
        fonts.set(qn(a), FONT)
    rpr.append(fonts)
    c = OxmlElement('w:color'); c.set(qn('w:val'), '1F5FBF'); rpr.append(c)
    u = OxmlElement('w:u'); u.set(qn('w:val'), 'single'); rpr.append(u)
    if bold:
        rpr.append(OxmlElement('w:b'))
    if size:
        sz = OxmlElement('w:sz'); sz.set(qn('w:val'), str(int(size * 2))); rpr.append(sz)
    r.append(rpr)
    t = OxmlElement('w:t'); t.text = text; t.set(qn('xml:space'), 'preserve'); r.append(t)
    h.append(r); par._p.append(h)

TOK = re.compile(r'\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)')

def add_inline(par, text, size=None, bold=False, color=None):
    pos = 0
    for m in TOK.finditer(text):
        if m.start() > pos:
            run = par.add_run(text[pos:m.start()]); set_font(run, size, bold or None, color)
        if m.group(1) is not None:
            inner = m.group(1)
            if TOK.search(inner):
                add_inline(par, inner, size, True, color)
            else:
                run = par.add_run(inner); set_font(run, size, True, color)
        else:
            add_link(par, m.group(2), m.group(3), size, bold)
        pos = m.end()
    if pos < len(text):
        run = par.add_run(text[pos:]); set_font(run, size, bold or None, color)

def shade(cell, hexcolor):
    tcpr = cell._tc.get_or_add_tcPr()
    s = OxmlElement('w:shd'); s.set(qn('w:val'), 'clear'); s.set(qn('w:color'), 'auto'); s.set(qn('w:fill'), hexcolor)
    tcpr.append(s)

def add_table(rows):
    cells = [[c.strip() for c in r.strip().strip('|').split('|')] for r in rows]
    cells = [r for r in cells if not all(re.fullmatch(r':?-{2,}:?', c or '--') for c in r)]
    ncol = max(len(r) for r in cells)
    t = doc.add_table(rows=len(cells), cols=ncol)
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, r in enumerate(cells):
        for j in range(ncol):
            cell = t.cell(i, j)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            txt = r[j] if j < len(r) else ''
            add_inline(p, txt, 8.5, bold=(i == 0))
            if i == 0:
                shade(cell, 'F2F2F2')
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

lines = md.split('\n')
i = 0
while i < len(lines):
    ln = lines[i]
    s = ln.strip()
    if not s or s == '---':
        i += 1; continue
    if s.startswith('|'):
        block = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            block.append(lines[i]); i += 1
        add_table(block); continue
    if s.startswith('# '):
        p = doc.add_paragraph(style='Title'); add_inline(p, s[2:], 20, True)
    elif s.startswith('## '):
        p = doc.add_paragraph(style='Heading 1'); add_inline(p, s[3:], 14, True, RED)
    elif s.startswith('### '):
        p = doc.add_paragraph(style='Heading 2'); add_inline(p, s[4:], 11.5, True)
    elif s.startswith('> '):
        p = doc.add_paragraph(); add_inline(p, s[2:], 9, color=MUTED)
        p.paragraph_format.left_indent = Cm(0.4)
    elif re.match(r'^\s*- ', ln):
        level = (len(ln) - len(ln.lstrip(' '))) // 2
        p = doc.add_paragraph(style='List Bullet' if level == 0 else 'List Bullet 2')
        add_inline(p, re.sub(r'^\s*- ', '', ln))
    elif re.match(r'^\d+\. ', s):
        p = doc.add_paragraph(style='List Number'); add_inline(p, re.sub(r'^\d+\. ', '', s))
    elif s.startswith('2026년 11월 2일 작성'):
        p = doc.add_paragraph(); add_inline(p, s, 9.5, color=MUTED)
    else:
        p = doc.add_paragraph(); add_inline(p, s)
    i += 1

doc.save(out)
print('saved', out)
