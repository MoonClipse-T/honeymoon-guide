"""할슈타트는 1박으로 확정: 2박 선택지(점검 f15, 퀘스트 q19)와 16일 안내 문구를 정리한다.
사용: python src/update_one_night.py  (src/data.json을 고쳐 씀)
"""
import datetime, io, json, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
d = json.load(io.open(P, encoding='utf-8'))
d['fixes'] = [f for f in d['fixes'] if f['id'] != 'f15']
d['quests'] = [q for q in d['quests'] if q['id'] != 'q19']
for day in d['days']:
    if day['id'] == 'd16':
        day['alert'] = '빈은 들르지 않아도 돼요. 들르고 싶으면 투어·여행사 탭의 빈 경유 선택지를 보세요.'
d['meta']['updated'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
io.open(P, 'w', encoding='utf-8', newline='\n').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('fixes', len(d['fixes']), 'quests', len(d['quests']))
