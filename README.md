# 두 사람의 크리스마스 원정

2026년 12월 12일 출발, 프라하 → 드레스덴 → 체스키크룸로프 → 할슈타트 → 빈 → 부다페스트 8박 9일 신혼여행 가이드.

- 사이트: https://moonclipse-t.github.io/honeymoon-guide/
- claude.ai 버전(저장 버튼이 둘이 같이 쓰는 저장으로 동작): https://claude.ai/artifact/SK8c8KRQ4aqbayqx2GvBWW

## 폴더

| 경로 | 내용 |
|---|---|
| `index.html` | GitHub Pages로 보이는 사이트. `src/build_pages.py`로 만든다 |
| `honeymoon-guide.html` | claude.ai에 올리는 버전 (이미지가 claude.ai 저장소 주소를 씀) |
| `images/` | ElevenLabs로 만든 크리스마스 사진 (AI 이미지) |
| `src/template.html` | 화면 코드 (디자인, 기능) |
| `src/data.json` | 일정, 예약 퀘스트, 장소, 투어, 꿀팁, 점검, 예산 데이터 |
| `src/md2docx.py`, `src/fixes_section.md` | 보고서를 Word로 만드는 스크립트와 0장(추가 점검) 원고 |
| `report/` | 처음 쓴 보고서 원문(.md) |
| `신혼여행 보고서.hwp`, `.docx` | 0장을 더한 보고서 |
| `prototype/` | 일정 화면 시안 3종 (퀘스트 로그를 골랐음) |

## 고치는 법

1. 내용은 `src/data.json`, 화면은 `src/template.html`을 고친다.
2. 저장소 루트에서 `python src/build_pages.py`를 실행해 `index.html`을 다시 만든다.
3. 커밋하고 푸시하면 1~2분 뒤 사이트에 반영된다.

GitHub Pages 사이트에서 편집하기로 고친 내용은 그 브라우저에만 남는다. 둘이 같이 고치려면 claude.ai 버전을 쓰거나 `src/data.json`을 고쳐서 푸시한다.

가격과 운영 시간은 2026년 11월 2일 기준이다.
