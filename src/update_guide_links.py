"""여행 준비 A–Z 항목마다 참고한 사이트(공식 사이트, 블로그, 커뮤니티)를 여러 개 붙인다.
모두 보고서·조사 때 실제로 본 주소이거나 공식 사이트 첫 화면이다.
사용: python src/update_guide_links.py  (src/data.json을 고쳐 씀)
"""
import datetime, io, json, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
d = json.load(io.open(P, encoding='utf-8'))

L = {
 "여권과 입국 심사": [
  ("EU 공식 여행 안내 (EES·ETIAS)", "https://travel-europe.europa.eu/"),
  ("VisasNews: EES 전면 시행 소식", "https://visasnews.com/en/despite-a-rocky-ees-rollout-etias-is-still-expected-by-late-2026/"),
  ("외교부 해외안전여행", "https://www.0404.go.kr/")],
 "ETIAS(사전 여행 허가)": [
  ("EU 공식 여행 안내", "https://travel-europe.europa.eu/"),
  ("Connexion: ETIAS 시행 지연 기사", "https://www.connexionfrance.com/news/delays-forecast-for-eu-travel-authorisation-scheme-after-website-changes/808384"),
  ("InsideFlyer: 2027년으로 미뤄질 가능성", "https://www.insideflyer.com/posts/etias-launch-delayed-again-now-expected-in-2027/")],
 "여행자보험과 서류": [
  ("외교부 해외안전여행", "https://www.0404.go.kr/")],
 "트래블카드와 ATM": [
  ("Revolut: 프라하 환전과 DCC 주의", "https://www.revolut.com/en-US/blog/post/currency-exchange-prague/"),
  ("부다페스트 관광객 바가지 정리 (ATM 포함)", "https://www.budapest-trip.com/guides/budapest-tourist-traps/")],
 "현금이 필요한 곳": [
  ("할슈타트 페리 공식 (현금)", "https://hallstattschifffahrt.at/en"),
  ("블로그: 할슈타트 저녁·페리 후기 (티스토리)", "https://ddingbo.tistory.com/148"),
  ("블로그: 드레스덴 마켓 머그 보증금 (네이버)", "https://m.blog.naver.com/alswn0692/223679276561"),
  ("Reddit: 프라하 구시가지 펍 (현금만 받는 곳)", "https://www.reddit.com/r/Prague/comments/1r5b0dc/mustvisit_pubs_in_pragues_old_town/")],
 "팁 문화": [
  ("부다페스트 봉사료(szervizdíj) 안내", "https://www.budapest-trip.com/guides/budapest-tourist-traps/")],
 "깔아 둘 앱": [
  ("PID 프라하 교통 공식", "https://pid.cz/en/"),
  ("BKK 부다페스트 교통 공식", "https://bkk.hu/en/"),
  ("ÖBB 오스트리아 철도", "https://www.oebb.at/en/"),
  ("České dráhy 체코 철도", "https://www.cd.cz/en/"),
  ("DB 독일 철도", "https://www.bahn.de/"),
  ("Bolt 택시", "https://bolt.eu/"),
  ("Daytrip 개인 차량", "https://daytrip.com/")],
 "트램·지하철 표": [
  ("PID 공식: 2026년 새 요금", "https://pid.cz/en/new-pid-tariff-from-1-january-2026-dont-pay-more-than-you-have-to/"),
  ("Expats.cz: 2026년 요금 인상 정리", "https://www.expats.cz/czech-news/article/prague-transport-fares-increase-from-january-don-t-pay-more-than-you-have-to"),
  ("Trvlogue: PID Lítačka 앱 사용법", "https://www.trvlogue.com/en/prague-public-transport-guide")],
 "공항에서 시내로": [
  ("프라하 관광청: 공항에서 시내로", "https://prague.eu/en/getting-to-prague/"),
  ("HelloPrague: 공항 교통·택시 비교", "https://www.helloprague.net/how-to-get-from-prague-airport-to-city-centre-transfers-taxis-buses/")],
 "유럽 기차 타는 법": [
  ("Seat61: 빈↔부다페스트 열차 (표 사는 법)", "https://www.seat61.com/trains-and-routes/vienna-to-budapest-by-train.htm"),
  ("HelloPrague: 프라하 출발 국제 열차", "https://www.helloprague.net/international-trains-from-prague/")],
 "프라하↔드레스덴": [
  ("DB 시간표: 드레스덴→프라하", "https://www.bahn.de/reisen/view/verbindung/dresden/prag.shtml"),
  ("rail.cc: 프라하→드레스덴 요금", "https://rail.cc/train/prague-to-dresden"),
  ("Delve into Europe: 프라하→드레스덴 가이드", "https://delveintoeurope.com/prague-to-dresden/"),
  ("블로그: 드레스덴 크리스마스 마켓 당일치기 (네이버)", "https://m.blog.naver.com/alswn0692/223679276561")],
 "차량과 짐": [
  ("Premium Transfer: 할슈타트에 짐 들고 가기", "https://www.premiumtransfer.net/en/blog/salzburg-to-hallstatt-with-luggage"),
  ("블로그: 할슈타트 페리·오버트라운 (네이버)", "https://m.blog.naver.com/sengildong/223309495027")],
 "할슈타트→부다페스트": [
  ("Daytrip: 할슈타트→부다페스트 개인 차량", "https://daytrip.com/en/transfers/hallstatt-at/budapest-hu"),
  ("Rome2rio: 할슈타트→헝가리 교통 비교", "https://www.rome2rio.com/s/Hallstatt/Hungary"),
  ("Hallstatt.net: 오스트리아 기차로 오가기", "https://www.hallstatt.net/service-eng/anreise-en-US/austria-by-rail/"),
  ("할슈타트 페리 시간표 (PDF)", "https://hallstattschifffahrt.at/uploads/downloads/Fahrplan-Markt-zur-Bahnstation-14.12.25-13.12.26.pdf")],
 "교통권": [
  ("BKK 부다페스트 교통 공식", "https://bkk.hu/en/"),
  ("Trvlogue: BudapestGO 2026 요금", "https://www.trvlogue.com/en/budapest-go-app-guide"),
  ("The Better Vacation: 부다페스트 교통 정리", "https://thebettervacation.com/budapest/getting-around-budapest/amp/")],
 "택시와 공항": [
  ("부다페스트 바가지 택시 주의", "https://www.budapest-trip.com/guides/budapest-tourist-traps/"),
  ("100E 공항버스 안내", "https://mavericklodges.com/budapest-airport-city-bus-200e-100e-info/"),
  ("켈레티역 안내 (택시·지하철)", "https://budapestfrontier.com/budapest-keleti-train-station/")],
 "12월 날씨": [
  ("As We Saw It: 겨울 할슈타트", "https://www.aswesawit.com/hallstatt-in-winter/"),
  ("Live Like It's the Weekend: 겨울 할슈타트", "https://www.livelikeitstheweekend.com/hallstatt-in-winter/"),
  ("Reddit: 12월 오스트리아 여행", "https://www.reddit.com/r/AskAustria/comments/1matfqi/is_december_a_good_time_to_travel_to_austria/")],
 "옷과 신발": [
  ("블로그: 겨울 체스키크룸로프 (미끄럼 주의, 네이버)", "https://blog.naver.com/PostView.naver?blogId=hj332018&logNo=224436383234&redirect=Dlog"),
  ("As We Saw It: 겨울 할슈타트 준비물", "https://www.aswesawit.com/hallstatt-in-winter/")],
 "식당 이용": [
  ("Beer Wanderers: 프라하 맥주집 가이드", "https://www.beerwanderers.com/2025/11/prague-beer-breweries-pocket-guide/"),
  ("Reddit: 프라하 펍 추천", "https://www.reddit.com/r/Prague/comments/1vcxasn/pub_recs/"),
  ("Reddit: 부다페스트 크래프트 맥주", "https://www.reddit.com/r/budapest/comments/1f1mc55/craft_beer_in_budapest/")],
 "크리스마스 마켓 즐기는 법": [
  ("Prague Experience: 프라하 크리스마스 마켓", "https://www.pragueexperience.com/events/christmas-markets.asp"),
  ("드레스덴 슈트리첼마르크트 공식", "https://striezelmarkt.dresden.de/en/"),
  ("Vienna Unwrapped: 빈 크리스마스 마켓", "https://www.vienna-unwrapped.com/vienna-christmas-market/"),
  ("Hungary Unlocked: 부다페스트 크리스마스 마켓", "https://hungaryunlocked.com/budapests-christmas-markets/")],
 "소매치기와 사기": [
  ("부다페스트 관광객 바가지 정리", "https://www.budapest-trip.com/guides/budapest-tourist-traps/"),
  ("Boak & Bailey: 관광지 함정 펍", "https://boakandbailey.com/tag/tourist-traps/"),
  ("외교부 해외안전여행", "https://www.0404.go.kr/")],
 "급할 때 연락처": [
  ("외교부 해외안전여행 (영사콜센터)", "https://www.0404.go.kr/")],
 "보통 이렇게 보내요": [
  ("Best Prague Guide: 프라하 사진 명소와 시간대", "https://bestpragueguide.com/en/blog/prague-instagram-photo-spots"),
  ("Nomad Epicureans: 할슈타트 사진 시간표", "https://www.nomadepicureans.com/europe/austria/hallstatt-photography-guide-2026-sunrise-sunset-map/"),
  ("Chasing Hippoz: 부다페스트 사진 명소", "https://www.chasinghippoz.com/travel-photo-blog/budapest-hungary"),
  ("블로그: 할슈타트 1박 후기 (네이버)", "https://blog.naver.com/halosoy/224410045466")],
 "택스 리펀드": [
  ("Global Blue 택스 리펀드", "https://www.globalblue.com/")],
}

missing = []
for g in d.get('guide', []):
    links = [{"t": t, "u": u} for t, u in L.get(g['title'], [])]
    if g.get('url') and not any(x['u'] == g['url'] for x in links):
        links.insert(0, {"t": "근거 자료", "u": g['url']})
    g['links'] = links
    g.pop('url', None)
    if not links:
        missing.append(g['title'])

d['meta']['updated'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
io.open(P, 'w', encoding='utf-8', newline='\n').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('items:', len(d['guide']), 'links:', sum(len(g['links']) for g in d['guide']), 'no links:', missing)
