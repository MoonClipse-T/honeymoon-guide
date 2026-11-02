"""src/parts/edit.js, edit.css를 src/template.html에 끼워 넣는다 (한 번만 실행)."""
import io, os, re

SRC = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(SRC, 'template.html')
t = io.open(P, encoding='utf-8').read()
js = io.open(os.path.join(SRC, 'parts', 'edit.js'), encoding='utf-8').read()
css = io.open(os.path.join(SRC, 'parts', 'edit.css'), encoding='utf-8').read()
assert 'function touch(){' not in t, 'already spliced'

SORT = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js"></script>'

# 1) CSS
a = t.index('<style id="gs">'); b = t.index('</style>', a)
t = t[:b] + css + t[b:]
# 2) JS 블록 교체
a = t.index('function refreshSaveBar(){'); b = t.index('/* ---------- 히어로 눈송이 ---------- */')
t = t[:a] + js + t[b:]
# 3) 순번 기반 dayStat 제거 (새 dayStat은 edit.js에 있음)
t = re.sub(r'function dayStat\(d\)\{var n=\(d\.items\|\|\[\]\)\.length,done=0,next=-1;.*?\n', '', t, count=1)
# 4) 잠금 상태, Sortable 태그 상수
t = t.replace("var IMG=/*IMG*/{};",
              "var IMG=/*IMG*/{};\nvar SORTABLE_TAG='<script src=\"https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js\"><\\/script>';\n"
              "var locked=false;try{locked=localStorage.getItem(\"hm-lock\")===\"1\"}catch(e){}", 1)
# 5) 페이지에 Sortable 로드
t = t.replace('<script id="gjs">', SORT + '\n<script id="gjs">', 1)
# 6) 머리줄: 편집하기 버튼 → 잠금 토글, 안내, 렌더 뒤 정렬·포커스
old_btn = re.search(r"  h\+='<button class=\"btn edit-toggle.*?\n", t).group(0)
t = t.replace(old_btn,
  "  h+='<button class=\"btn edit-toggle lock-btn '+(locked?\"red\":\"ghost\")+'\" type=\"button\" data-act=\"lock\" aria-pressed=\"'+locked+'\">'+(locked?\"편집 켜기\":\"읽기 모드\")+'</button></div>';\n", 1)
hint = ("  var hintSeen=false;try{hintSeen=localStorage.getItem(\"hm-hint\")===\"1\"}catch(e){}\n"
        "  if(!locked&&!hintSeen)h+='<div class=\"hint\" role=\"note\"><span>글자를 누르면 바로 고쳐지고, ⋮⋮를 잡고 끌면 순서가 바뀌어요. 휴대폰에서는 일정·할 일을 오른쪽으로 밀면 완료, 왼쪽으로 밀면 삭제예요. 다 고치면 아래 저장하기를 눌러 주세요.</span><button class=\"btn sm ghost\" type=\"button\" data-act=\"hint-x\">알겠어요</button></div>';\n")
t = t.replace("  h+='<section class=\"status\" aria-label=\"한눈에 보기\">';", hint + "  h+='<section class=\"status\" aria-label=\"한눈에 보기\">';", 1)
t = t.replace("  app.innerHTML=h;\n  drawSceneSoon();", "  app.innerHTML=h;\n  app.className=locked?\"locked\":\"unlocked\";\n  initSort();\n  focusPending();\n  drawSceneSoon();", 1)
io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
print('spliced', len(t), 'editMode left:', t.count('editMode'), 'refs to old tickStop(b):', t.count('tickStop(b)'))
