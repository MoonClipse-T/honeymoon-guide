"""GitHub Pages용 index.html을 만든다.

src/template.html + src/data.json을 합치고, 이미지는 claude.ai 저장소(/_blob/...) 대신
저장소 안의 images/*.jpg를 쓰며, 독립 실행되도록 문서 머리(doctype, charset, viewport)를 붙인다.
사용: python src/build_pages.py   (저장소 루트에서)
"""
import io, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

IMG = {
    'hero': 'images/hero.jpg', '프라하': 'images/prague.jpg', '드레스덴': 'images/dresden.jpg',
    '체스키크룸로프': 'images/krumlov.jpg', '할슈타트': 'images/hallstatt.jpg', '빈': 'images/vienna.jpg',
    '부다페스트': 'images/budapest.jpg', '공통': 'images/hero.jpg',
}
HEAD = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);'
        'padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,-apple-system,sans-serif}'
        'img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n')

data = json.load(io.open(os.path.join(SRC, 'data.json'), encoding='utf-8'))
t = io.open(os.path.join(SRC, 'template.html'), encoding='utf-8').read()
assert t.count('/*DATA*/') == 1 and t.count('/*IMG*/{}') == 1
s = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
page = t.replace('/*DATA*/', s).replace('/*IMG*/{}', '/*IMG*/' + json.dumps(IMG, ensure_ascii=False))
io.open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8', newline='\n').write(HEAD + page + '\n</body>\n</html>\n')
print('index.html built')
