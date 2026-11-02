import json, io, os, sys
sp, out = sys.argv[1], sys.argv[2]
d = json.load(io.open(sp + '/data.json', encoding='utf-8'))
t = io.open(sp + '/template.html', encoding='utf-8').read()
s = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
img = {}
if os.path.exists(sp + '/img.json'):
    img = json.load(io.open(sp + '/img.json', encoding='utf-8'))
assert t.count('/*DATA*/') == 1 and t.count('/*IMG*/{}') == 1
t = t.replace('/*DATA*/', s).replace('/*IMG*/{}', '/*IMG*/' + json.dumps(img, ensure_ascii=False))
io.open(out, 'w', encoding='utf-8', newline='\n').write(t)
print('merged, images:', len(img))
