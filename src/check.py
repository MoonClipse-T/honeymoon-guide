import re, io, sys, json
t = io.open(sys.argv[1], encoding='utf-8').read()
js = re.search(r'<script id="gjs">(.*)</script>', t, re.S).group(1)
data = re.search(r'id="trip-data">(.*?)</script>', t, re.S).group(1)
json.loads(data)
io.open(sys.argv[2], 'w', encoding='utf-8').write(js)
print('json ok', len(js))
