"""바로 편집·드래그 정렬을 위한 데이터 정리.
- 일정 항목마다 고정 id를 붙이고, 순번으로 저장돼 있던 체크를 id 기준으로 옮긴다.
- 화면이 더 이상 자동 정렬하지 않으므로, 지금 보이던 순서대로 배열을 한 번 정렬해 둔다.
사용: python src/update_free_edit.py  (src/data.json을 고쳐 씀)
"""
import datetime, io, json, os, random, string

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
d = json.load(io.open(P, encoding='utf-8'))
rid = lambda: ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(7))

checks = d.get('checks') or {}
new_checks = {}
for day in d['days']:
    for j, it in enumerate(day['items']):
        if len(it) < 3 or not it[2]:
            it[:] = [it[0], it[1], rid()]
        if checks.get('%s:%d' % (day['id'], j)):
            new_checks['%s:%s' % (day['id'], it[2])] = 1
for k, v in checks.items():
    if v and k.split(':', 1)[1] and not k.split(':', 1)[1].isdigit():
        new_checks[k] = 1
d['checks'] = new_checks

CITIES = ["프라하", "드레스덴", "체스키크룸로프", "할슈타트", "빈", "부다페스트"]
ci = lambda c: CITIES.index(c) if c in CITIES else 99
order = lambda m: (lambda v: m.get(v, 9))
d['days'].sort(key=lambda x: x['date'])
d['quests'].sort(key=lambda x: (bool(x.get('done')), x.get('due') or '9'))
vo = order({"필수": 0, "기념일": 1, "추천": 2, "선택": 3, "패스": 4})
d['places'].sort(key=lambda x: (ci(x['city']), vo(x['verdict'])))
d['tours'].sort(key=lambda x: order({"1순위": 0, "대안": 1, "참고": 2, "비추천": 3})(x['pick']))
d['tips'].sort(key=lambda x: order({"유튜브": 0, "인스타그램": 1, "블로그": 2, "커뮤니티": 3})(x['src']))
d['fixes'].sort(key=lambda x: order({"수정": 0, "보완": 1, "확인": 2})(x['sev']))

d['meta']['updated'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
io.open(P, 'w', encoding='utf-8', newline='\n').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('items with ids:', sum(len(x['items']) for x in d['days']), 'checks:', len(new_checks))
