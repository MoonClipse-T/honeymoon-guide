function refreshSaveBar(){var old=$(".savebar"),html=saveBarHtml();if(old)old.remove();if(html)document.body.insertAdjacentHTML("beforeend",html)}
function touch(){dirty++;lsSet({base:BASE.meta.updated,state:S,n:dirty});refreshSaveBar()}
function keep(){lsSet({base:BASE.meta.updated,state:S,n:dirty})}
function dueWord(s){var n=dDiff(s);if(n==null)return "";if(n<0)return " (지남 "+(-n)+"일)";if(n===0)return " (오늘)";return " (D-"+n+")"}

/* ---------- 바로 편집 조각 ---------- */
var IC={
  grip:'<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><g fill="currentColor"><circle cx="4.5" cy="3" r="1.3"/><circle cx="9.5" cy="3" r="1.3"/><circle cx="4.5" cy="7" r="1.3"/><circle cx="9.5" cy="7" r="1.3"/><circle cx="4.5" cy="11" r="1.3"/><circle cx="9.5" cy="11" r="1.3"/></g></svg>',
  pen:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>',
  plus:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
};
// 고칠 수 있는 글자. multi면 줄바꿈 허용
function ed(col,id,f,val,o){
  o=o||{};var tag=o.tag||"span";
  var attrs=' class="ed'+(o.cls?" "+o.cls:"")+(o.multi?" multi":"")+'" data-col="'+col+'" data-id="'+esc(id)+'" data-f="'+esc(f)+'" data-ph="'+esc(o.ph||"")+'"';
  if(!locked)attrs+=' contenteditable="true" spellcheck="false"'+(o.multi?'':' data-single="1"')+' role="textbox" aria-label="'+esc(o.ph||"내용")+'"';
  return '<'+tag+attrs+'>'+esc(val)+'</'+tag+'>';
}
// 눌러서 다음 값으로 넘기는 칩
function cyc(col,id,f,val,cls,label){
  if(locked)return '<span class="pill '+cls+'">'+esc(label||val)+'</span>';
  return '<button type="button" class="pill cyc '+cls+'" data-act="cyc" data-col="'+col+'" data-id="'+esc(id)+'" data-f="'+f+'" title="눌러서 바꾸기">'+esc(label||val)+'</button>';
}
function cityDot(c,col,id){
  if(!c)return "";
  var st=' style="--img:url(\''+(IMG[c]||IMG.hero)+'\')"';
  if(locked||!col)return '<span class="city-dot"'+st+'>'+esc(c)+'</span>';
  return '<button type="button" class="city-dot cyc" data-act="cyc" data-col="'+col+'" data-id="'+esc(id)+'" data-f="city"'+st+' title="눌러서 도시 바꾸기">'+esc(c)+'</button>';
}
function ctl(col,id,noGrip){
  if(locked)return "";
  var del=pendingDel===col+":"+id;
  return '<span class="ctl">'+(noGrip?'':'<button type="button" class="ic grip" aria-label="끌어서 순서 바꾸기">'+IC.grip+'</button>')+
    '<button type="button" class="ic" data-act="open" data-col="'+col+'" data-id="'+esc(id)+'" aria-label="자세히 수정">'+IC.pen+'</button>'+
    '<button type="button" class="ic del'+(del?" on":"")+'" data-act="del" data-col="'+col+'" data-id="'+esc(id)+'" aria-label="삭제">'+(del?"삭제할까요?":IC.x)+'</button></span>';
}
function addCard(col,label,extra){return locked?"":'<button type="button" class="add-card" data-act="add" data-col="'+col+'"'+(extra||"")+'>'+IC.plus+label+'</button>'}
function link(u,t){u=safeUrl(u);return u?'<a class="src-link" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(t||"링크 열기")+'</a>':""}
function empty(msg){return '<div class="empty"><b>찾는 항목이 없어요</b>'+esc(msg||"검색어나 도시 거르기를 바꿔 보세요.")+'</div>'}
function top(desc,btn){return '<div class="panel-top"><p>'+desc+'</p>'+(btn||"")+'</div>'}
function swUnder(done){return '<div class="sw-under" aria-hidden="true"><span class="sw-done">'+(done?"되돌리기":"완료")+'</span><button type="button" class="sw-del" data-act="swdel" tabindex="-1">삭제</button></div>'}

function renderTab(){
  var L=(S[tab]||[]).filter(match);
  if(tab==="days"){
    var h=top("하루씩 넘기며 다녀온 곳을 체크하세요. 글자를 누르면 바로 고쳐지고, ⋮⋮를 잡고 끌면 순서가 바뀌어요.",locked?"":'<button class="btn ghost sm" type="button" data-act="open" data-col="days" data-id="">날짜 추가</button>');
    if(!L.length)return h+empty();
    L=L.slice().sort(function(a,b){return a.date<b.date?-1:1});
    if(!L.some(function(d){return d.id===curDay}))curDay=pickDay(L);
    var di=L.findIndex(function(d){return d.id===curDay}),d=L[di];
    h+='<div class="ql-days" id="ql-days" role="group" aria-label="날짜">';
    L.forEach(function(x){
      var st=dayStat(x);
      h+='<button type="button" class="ql-day'+(st.n&&st.done===st.n?" done-all":"")+'" data-act="day" data-id="'+esc(x.id)+'" aria-pressed="'+(x.id===curDay)+'" style="--c:'+(CCOL[x.city]||CCOL["공통"])+'"><b>'+fmtMD(x.date)+'</b><span>'+dowOf(x.date)+'요일</span><i></i></button>';
    });
    h+='</div>';
    var st2=dayStat(d);
    h+='<div class="day-hero" style="--img:url(\''+(IMG[d.city]||IMG.hero)+'\')"><div><div class="dh-text"><small>'+fmtMD(d.date)+' '+dowOf(d.date)+'요일, '+esc(d.city)+'</small>'+ed("days",d.id,"title",d.title,{tag:"h2",ph:"이날의 제목"})+'</div><div class="ql-nav">';
    if(!locked)h+='<button type="button" class="btn sm glass" data-act="open" data-col="days" data-id="'+esc(d.id)+'" aria-label="이날 자세히 수정">'+IC.pen+'</button>';
    h+='<button type="button" class="btn sm" data-act="day" data-id="'+(di>0?esc(L[di-1].id):"")+'"'+(di>0?"":" disabled")+'>전날</button><button type="button" class="btn sm" data-act="day" data-id="'+(di<L.length-1?esc(L[di+1].id):"")+'"'+(di<L.length-1?"":" disabled")+'>다음 날</button></div></div></div>';
    h+='<div class="ql-meta"><div class="stay">오늘 숙소 '+ed("days",d.id,"stay",d.stay,{tag:"b",ph:"숙소 이름"})+'</div>'+((d.alert||!locked)?'<div class="alert'+(d.alert?"":" alert-empty")+'">'+ed("days",d.id,"alert",d.alert,{multi:true,ph:"주의할 점이 있으면 여기에 적어 두세요"})+'</div>':'')+'</div>';
    h+='<div class="ql-prog"><span id="ql-count">'+st2.done+' / '+st2.n+' 완료</span><div class="ql-bar"><i id="ql-bar" style="transform:scaleX('+(st2.n?st2.done/st2.n:0)+')"></i></div></div>';
    h+='<ol class="ql-list'+(dayEnter?" enter":"")+'" data-sort="items" data-day="'+esc(d.id)+'">';
    (d.items||[]).forEach(function(it,j){
      var on=!!S.checks[d.id+":"+it[2]],key=it[2];
      h+='<li class="ql-item swipe'+(on?" done":"")+(key===st2.next?" next":"")+'" data-key="'+esc(key)+'" data-rk="item" style="--i:'+j+'">'+swUnder(on)+'<div class="sw-body">';
      h+=(locked?'':'<button type="button" class="ic grip" aria-label="끌어서 순서 바꾸기">'+IC.grip+'</button>');
      h+='<button type="button" class="ql-check" data-act="ck" data-key="'+esc(key)+'" aria-pressed="'+on+'" aria-label="'+esc(it[1])+' 완료">'+IC.check+'</button>';
      h+=ed("days",d.id,"items."+key+".0",it[0],{cls:"ql-time",ph:"시각"});
      h+='<span class="ql-text">'+(key===st2.next?'<span class="ql-next">다음</span>':'')+ed("days",d.id,"items."+key+".1",it[1],{ph:"할 일, 장소"})+'</span>';
      h+=(locked?'':'<button type="button" class="ic del'+(pendingDel==="item:"+key?" on":"")+'" data-act="delitem" data-key="'+esc(key)+'" aria-label="삭제">'+(pendingDel==="item:"+key?"삭제할까요?":IC.x)+'</button>');
      h+='</div></li>';
    });
    h+='</ol>';
    if(!locked)h+='<button type="button" class="add-row" data-act="additem">'+IC.plus+'일정 추가</button>';
    dayEnter=false;
    return h;
  }
  if(tab==="quests"){
    var h2=top("예약·확인해야 할 일이에요. 글자를 눌러 바로 고치고, ⋮⋮로 순서를 바꿔요. 휴대폰에서는 오른쪽으로 밀면 완료, 왼쪽으로 밀면 삭제예요.","");
    if(!L.length&&locked)return h2+empty();
    h2+='<ol class="quests" data-sort="quests">';
    L.forEach(function(x){
      var n=dDiff(x.due);var cls=n==null?"cool":n<=3?"hot":n<=10?"warm":"cool";
      h2+='<li class="quest swipe'+(x.done?" done":"")+'" data-key="'+esc(x.id)+'" data-rk="quest">'+swUnder(x.done)+'<div class="sw-body">';
      h2+=(locked?'':'<button type="button" class="ic grip" aria-label="끌어서 순서 바꾸기">'+IC.grip+'</button>');
      h2+='<button class="check" type="button" data-act="tick" data-id="'+esc(x.id)+'" aria-pressed="'+!!x.done+'" aria-label="완료 표시">'+IC.check+'</button>';
      h2+='<div class="q-main"><div class="meta">'+ed("quests",x.id,"text",x.text,{cls:"q-text",ph:"할 일"})+cyc("quests",x.id,"prio",x.prio,"prio-"+x.prio)+'</div>';
      if(x.note||!locked)h2+=ed("quests",x.id,"note",x.note,{cls:"q-note",multi:true,ph:"메모"});
      if(x.url)h2+='<div>'+link(x.url,"예약 페이지")+'</div>';
      h2+='</div>';
      h2+='<button type="button" class="due '+(x.done?"cool":cls)+'"'+(locked?' disabled':' data-act="open" data-col="quests" data-id="'+esc(x.id)+'" title="마감일 바꾸기"')+'>'+(x.due?fmtMD(x.due):"마감일")+'<small>'+(x.done?"완료":x.due?dueWord(x.due).replace(/[()]/g,"").trim():"")+'</small></button>';
      h2+=ctl("quests",x.id,true)+'</div></li>';
    });
    h2+='</ol>';
    if(!locked)h2+='<button type="button" class="add-row" data-act="add" data-col="quests">'+IC.plus+'할 일 추가</button>';
    return h2;
  }
  if(tab==="places"){
    var kinds=["관광","식당","맥주","카페","온천","체험","교통"];
    var h3=top("판정 칩(필수·추천…)과 종류·도시 칩을 누르면 다음 값으로 바뀌어요. 패스는 12월에 닫거나 시간 대비 아쉬운 곳이에요.","");
    h3+='<div class="kinds" role="group" aria-label="종류 거르기"><button class="chip" type="button" data-kind="" aria-pressed="'+(kindF==="")+'">전체</button>';
    kinds.forEach(function(k){h3+='<button class="chip" type="button" data-kind="'+k+'" aria-pressed="'+(kindF===k)+'">'+k+'</button>'});
    h3+='</div>';
    L=L.filter(function(p){return !kindF||p.kind===kindF});
    if(!L.length&&locked)return h3+empty();
    h3+='<div class="grid" data-sort="places">';
    L.forEach(function(p){
      h3+='<article class="card" data-key="'+esc(p.id)+'"><div class="meta">'+cyc("places",p.id,"verdict",p.verdict,"v-"+p.verdict)+cyc("places",p.id,"kind",p.kind,"k")+cityDot(p.city,"places",p.id)+ctl("places",p.id)+'</div>';
      h3+=ed("places",p.id,"name",p.name,{tag:"h3",ph:"장소 이름"})+ed("places",p.id,"note",p.note,{tag:"p",multi:true,ph:"메모"});
      h3+=link(p.url,"출처 보기")+'</article>';
    });
    h3+=addCard("places","장소 추가")+'</div>';
    return h3;
  }
  if(tab==="tours"){
    var h4=top("15일·16일 이동과 현지 투어 업체를 비교했어요. 칸을 눌러 가격이나 메모를 바로 고칠 수 있어요.","");
    if(!L.length&&locked)return h4+empty();
    h4+='<div class="grid" data-sort="tours">';
    L.forEach(function(t){
      h4+='<article class="card" data-key="'+esc(t.id)+'"><div class="meta">'+cyc("tours",t.id,"pick",t.pick,"pick-"+t.pick)+cyc("tours",t.id,"cat",t.cat,"k")+cityDot(t.city,"tours",t.id)+ctl("tours",t.id)+'</div>'+ed("tours",t.id,"name",t.name,{tag:"h3",ph:"업체·상품 이름"})+'<dl class="kv">';
      [["leg","용도"],["price","가격"],["drop","하차"],["ko","한국어"],["rating","평점"],["cancel","취소"]].forEach(function(f){if(t[f[0]]||!locked)h4+='<dt>'+f[1]+'</dt>'+ed("tours",t.id,f[0],t[f[0]],{tag:"dd",ph:"-"})});
      h4+='</dl>'+ed("tours",t.id,"note",t.note,{tag:"p",multi:true,ph:"메모"});
      h4+=link(t.url,"상품 페이지")+'</article>';
    });
    h4+=addCard("tours","업체 추가")+'</div>';
    return h4;
  }
  if(tab==="tips"){
    var h5=top("유튜브, 인스타그램, 블로그, 커뮤니티 후기에서 이번 일정에 바로 쓸 만한 것만 골랐어요.","");
    if(!L.length&&locked)return h5+empty();
    h5+='<div class="grid" data-sort="tips">';
    L.forEach(function(t){
      h5+='<article class="card" data-key="'+esc(t.id)+'"><div class="meta">'+cyc("tips",t.id,"src",t.src,"src-"+t.src)+cityDot(t.city,"tips",t.id)+ctl("tips",t.id)+'</div>'+ed("tips",t.id,"title",t.title,{tag:"h3",ph:"제목"})+ed("tips",t.id,"body",t.body,{tag:"p",multi:true,ph:"내용"});
      h5+=link(t.url,"원문 보기")+'</article>';
    });
    h5+=addCard("tips","꿀팁 추가")+'</div>';
    return h5;
  }
  if(tab==="guide"){
    var hg=top("처음 가는 동유럽 겨울 여행에서 준비할 것과 현지에서 움직이는 법이에요. 요금은 2026년 기준이라 출발 전에 앱에서 한 번 더 확인하세요.","");
    var cats=GUIDE_CATS.filter(function(c){return L.some(function(g){return g.cat===c})||(!locked&&!q)});
    L.forEach(function(g){if(cats.indexOf(g.cat)<0)cats.push(g.cat)});
    if(!cats.length)return hg+empty();
    hg+='<nav class="g-toc" aria-label="분류">';cats.forEach(function(c,i){hg+='<a href="#g-'+i+'">'+esc(c)+'</a>'});hg+='</nav>';
    cats.forEach(function(c,i){
      hg+='<section class="g-sec" id="g-'+i+'"><h2 class="g-head">'+esc(c)+'</h2><div class="grid" data-sort="guide">';
      L.filter(function(g){return g.cat===c}).forEach(function(g){
        hg+='<article class="card" data-key="'+esc(g.id)+'"><div class="meta meta-end">'+ctl("guide",g.id)+'</div>'+ed("guide",g.id,"title",g.title,{tag:"h3",ph:"제목"})+ed("guide",g.id,"body",g.body,{tag:"p",multi:true,ph:"내용"})+link(g.url,"근거 보기")+'</article>';
      });
      hg+=addCard("guide","항목 추가",' data-cat="'+esc(c)+'"')+'</div></section>';
    });
    return hg;
  }
  if(tab==="fixes"){
    var h6=top("기존 보고서와 노션 자료를 맞대어 보고 고칠 곳, 더할 곳, 다시 확인할 곳을 골랐어요.","");
    if(!L.length&&locked)return h6+empty();
    h6+='<div class="grid" data-sort="fixes">';
    L.forEach(function(f){
      h6+='<article class="card" data-key="'+esc(f.id)+'"><div class="meta">'+cyc("fixes",f.id,"sev",f.sev,"sev-"+f.sev)+ctl("fixes",f.id)+'</div>'+ed("fixes",f.id,"title",f.title,{tag:"h3",ph:"제목"})+ed("fixes",f.id,"body",f.body,{tag:"p",multi:true,ph:"내용"})+link(f.url,"근거 보기")+'</article>';
    });
    h6+=addCard("fixes","점검 항목 추가")+'</div>';
    return h6;
  }
  if(tab==="budget"){
    var all=S.budget||[];
    var paidT=all.filter(function(b){return b.status==="결제완료"}).reduce(function(a,b){return a+(+b.krw||0)},0);
    var estT=all.filter(function(b){return b.status!=="결제완료"}).reduce(function(a,b){return a+(+b.krw||0)},0);
    var h7=top("결제완료는 노션 신혼여행 지출표 금액이고, 예상은 보고서 가격으로 어림한 값이에요. 금액 칸을 눌러 바로 고치고, 상태 칩을 누르면 결제완료로 바뀌어요.","");
    h7+='<div class="money"><div class="card"><span>결제 완료</span><b>'+won(paidT)+'</b></div><div class="card"><span>앞으로 예상</span><b>'+won(estT)+'</b></div><div class="card"><span>총 예상 경비</span><b>'+won(paidT+estT)+'</b></div></div>';
    var bc=["항공","숙소","교통","투어·입장","식사","기타"];var max=0;var rows=bc.map(function(c){var p=0,e=0;all.forEach(function(b){if(b.cat===c){if(b.status==="결제완료")p+=+b.krw||0;else e+=+b.krw||0}});max=Math.max(max,p+e);return [c,p,e]}).filter(function(r){return r[1]+r[2]>0});
    h7+='<div class="legend"><span><i style="background:var(--pine)"></i>결제 완료</span><span><i style="background:var(--gold)"></i>예상</span></div><div class="cat-bars">';
    rows.forEach(function(r){h7+='<div class="cat-row"><span>'+r[0]+'</span><div class="cat-track"><i style="width:'+(r[1]/max*100)+'%;background:var(--pine)"></i><i style="width:'+(r[2]/max*100)+'%;background:var(--gold)"></i></div><span>'+won(r[1]+r[2])+'</span></div>'});
    h7+='</div>';
    h7+='<div class="tbl-wrap"><table><thead><tr>'+(locked?'':'<th class="gcol"></th>')+'<th>항목</th><th>분류</th><th>상태</th><th style="text-align:right">금액(원)</th><th>메모</th>'+(locked?'':'<th class="gcol"></th>')+'</tr></thead><tbody data-sort="budget">';
    L.forEach(function(b){h7+='<tr data-key="'+esc(b.id)+'">'+(locked?'':'<td class="gcol"><button type="button" class="ic grip" aria-label="끌어서 순서 바꾸기">'+IC.grip+'</button></td>')+'<td>'+ed("budget",b.id,"name",b.name,{ph:"항목"})+'</td><td>'+cyc("budget",b.id,"cat",b.cat,"k")+'</td><td>'+cyc("budget",b.id,"status",b.status,"st-"+b.status)+'</td><td class="num">'+ed("budget",b.id,"krw",(+b.krw||0).toLocaleString("ko-KR"),{cls:"num-ed",ph:"0"})+'</td><td>'+ed("budget",b.id,"note",b.note,{ph:"메모"})+'</td>'+(locked?'':'<td class="gcol">'+ctl("budget",b.id,true)+'</td>')+'</tr>'});
    h7+='</tbody></table></div>';
    if(!locked)h7+='<button type="button" class="add-row" data-act="add" data-col="budget">'+IC.plus+'항목 추가</button>';
    return h7;
  }
  return "";
}

function saveBarHtml(){
  if(!dirty)return "";
  var msg=canWrite?"저장하지 않은 수정 "+dirty+"건":"보기 전용 화면이라 수정 "+dirty+"건이 이 브라우저에만 남아요";
  return '<div class="savebar" role="region" aria-label="저장"><span>'+msg+'</span><button class="btn sm ghost" type="button" data-act="revert">'+(pendingDel==="revert"?"한 번 더 누르면 되돌리기":"되돌리기")+'</button>'+(canWrite?'<button class="btn sm red" type="button" data-act="save">저장하기 <kbd>Ctrl S</kbd></button>':'')+'</div>';
}

/* ---------- 데이터 고치기 ---------- */
function markDirty(){touch();render()}
function findIdx(col,id){return (S[col]||[]).findIndex(function(o){return o.id===id})}
function getItem(col,id){return (S[col]||[]).find(function(o){return o.id===id})}
function setField(col,id,f,v){
  var o=getItem(col,id);if(!o)return;
  if(f.indexOf("items.")===0){var p=f.split(".");var it=(o.items||[]).find(function(x){return x[2]===p[1]});if(it)it[+p[2]]=v;return}
  if(f==="krw"){o.krw=+String(v).replace(/[^\d]/g,"")||0;return}
  o[f]=v;
}
function optionsFor(col,f){var s=(SCHEMA[col]||[]).find(function(x){return x.k===f});return s&&s.o?s.o:[]}
function migrateItems(st){
  st.checks=st.checks||{};
  (st.days||[]).forEach(function(d){(d.items||[]).forEach(function(it,j){if(!it[2]){var nid=uid();if(st.checks[d.id+":"+j]){st.checks[d.id+":"+nid]=1;delete st.checks[d.id+":"+j]}it[2]=nid}})});
}
migrateItems(S);
function dayStat(d){var n=(d.items||[]).length,done=0,next=null;(d.items||[]).forEach(function(it){if(S.checks[d.id+":"+it[2]])done++;else if(next===null)next=it[2]});return {n:n,done:done,next:next}}
function curDayObj(){return (S.days||[]).find(function(x){return x.id===curDay})}
function tickStop(key){
  // 화면 전체를 다시 그리지 않고 이 날만 고쳐서 체크 애니메이션이 살아 있게 한다
  var d=curDayObj();if(!d)return;
  var k=d.id+":"+key;
  if(S.checks[k])delete S.checks[k];else S.checks[k]=1;
  var st=dayStat(d);
  document.querySelectorAll(".ql-item").forEach(function(li){
    var kk=li.getAttribute("data-key"),on=!!S.checks[d.id+":"+kk];
    li.classList.toggle("done",on);li.classList.toggle("next",kk===st.next);
    var b=li.querySelector(".ql-check");if(b)b.setAttribute("aria-pressed",String(on));
    var u=li.querySelector(".sw-done");if(u)u.textContent=on?"되돌리기":"완료";
    var t=li.querySelector(".ql-text"),tag=t.querySelector(".ql-next");
    if(kk===st.next&&!tag)t.insertAdjacentHTML("afterbegin",'<span class="ql-next">다음</span>');
    if(kk!==st.next&&tag)tag.remove();
  });
  $("#ql-count").textContent=st.done+" / "+st.n+" 완료";
  $("#ql-bar").style.transform="scaleX("+(st.n?st.done/st.n:0)+")";
  var db=document.querySelector('.ql-day[aria-pressed="true"]');if(db)db.classList.toggle("done-all",st.n>0&&st.done===st.n);
  touch();
}
var DEF={city:function(){return city||"공통"},kind:function(){return kindF||"관광"},verdict:"추천",pick:"참고",prio:"보통",status:"예상",sev:"보완",src:"블로그",cat:{tours:"현지 업체",budget:"기타",guide:"출국 전"}};
function addItem(col,cat){
  var o={id:uid()};
  (SCHEMA[col]||[]).forEach(function(s){
    var v=DEF[s.k];
    if(s.k==="cat")v=cat||(DEF.cat[col]||"");
    if(typeof v==="function")v=v();
    if(v===undefined)v=s.t==="number"?0:"";
    if(s.t==="select"&&s.o.indexOf(v)<0)v=s.o[0];
    o[s.k]=v;
  });
  if(col==="quests")o.done=false;
  S[col].push(o);q="";focusNext={col:col,id:o.id};touch();render();
}
function addStop(){
  var d=curDayObj();if(!d)return;var nid=uid();
  d.items.push(["","",nid]);focusNext={col:"days",id:d.id,f:"items."+nid+".0"};touch();render();
}
function reorder(el){
  var col=el.getAttribute("data-sort");
  var keys=[].slice.call(el.children).filter(function(n){return n.hasAttribute("data-key")}).map(function(n){return n.getAttribute("data-key")});
  if(col==="items"){
    var d=getItem("days",el.getAttribute("data-day"));if(!d)return;
    d.items.sort(function(a,b){return keys.indexOf(a[2])-keys.indexOf(b[2])});touch();render();return;
  }
  var arr=S[col]||[],pos=[];
  arr.forEach(function(o,i){if(keys.indexOf(o.id)>=0)pos.push(i)});
  var moved=keys.map(function(k){return arr.find(function(o){return o.id===k})});
  pos.forEach(function(p,i){arr[p]=moved[i]});
  touch();
}
var sortables=[];
function initSort(){
  sortables.forEach(function(s){try{s.destroy()}catch(e){}});sortables=[];
  if(locked||!window.Sortable)return;
  document.querySelectorAll("[data-sort]").forEach(function(el){
    sortables.push(Sortable.create(el,{handle:".grip",draggable:"[data-key]",animation:180,easing:"cubic-bezier(0.23,1,0.32,1)",ghostClass:"sort-ghost",chosenClass:"sort-chosen",dragClass:"sort-drag",forceFallback:true,fallbackOnBody:true,onEnd:function(ev){if(ev.oldIndex!==ev.newIndex)reorder(el)}}));
  });
}
var focusNext=null;
function focusPending(){
  if(!focusNext)return;
  var sel='.ed[data-col="'+focusNext.col+'"][data-id="'+focusNext.id+'"]'+(focusNext.f?'[data-f="'+focusNext.f+'"]':'');
  var el=document.querySelector(sel);focusNext=null;
  if(el){el.focus();el.scrollIntoView({block:"center",behavior:"smooth"})}
}
function openForm(col,id){
  var o=id?S[col][findIdx(col,id)]:{};
  var f='<div class="modal" id="modal"><div class="win" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="win-h" id="mt">'+(id?"자세히 수정":"새 항목")+'</div><div class="win-b" style="overflow:auto"><form id="ef">';
  SCHEMA[col].forEach(function(s){
    var v=o[s.k];var nm='f_'+s.k;
    f+='<label class="fld" for="'+nm+'">'+esc(s.l);
    if(s.t==="select"){f+='<select id="'+nm+'" name="'+s.k+'">';s.o.forEach(function(x){f+='<option'+(v===x?" selected":"")+'>'+esc(x)+'</option>'});f+='</select>'}
    else if(s.t==="textarea")f+='<textarea id="'+nm+'" name="'+s.k+'">'+esc(v)+'</textarea>';
    else if(s.t==="lines")f+='<textarea class="lines" id="'+nm+'" name="'+s.k+'">'+esc((v||[]).map(function(it){return it[0]+" | "+it[1]}).join("\n"))+'</textarea>';
    else f+='<input id="'+nm+'" name="'+s.k+'" type="'+(s.t==="number"?"number":s.t==="date"?"date":s.t==="url"?"url":"text")+'" value="'+esc(v)+'">';
    f+='</label>';
  });
  f+='<div class="form-act"><button class="btn ghost" type="button" data-act="close">취소</button><button class="btn red" type="submit">적용</button></div></form></div></div></div>';
  document.body.insertAdjacentHTML("beforeend",f);
  var first=$("#ef input, #ef select, #ef textarea");if(first)first.focus();
  $("#ef").addEventListener("submit",function(e){
    e.preventDefault();
    var fd=new FormData(e.target);var n=id?clone(o):{id:uid()};
    SCHEMA[col].forEach(function(s){
      var v=fd.get(s.k)||"";
      if(s.t==="lines"){var old=(o.items||[]);n[s.k]=String(v).split("\n").map(function(l){return l.trim()}).filter(Boolean).map(function(l,i){var k=l.indexOf("|");var tm=k<0?"":l.slice(0,k).trim(),tx=k<0?l:l.slice(k+1).trim();return [tm,tx,(old[i]&&old[i][2])||uid()]})}
      else if(s.t==="number")n[s.k]=+v||0;
      else n[s.k]=String(v).trim();
    });
    if(id)S[col][findIdx(col,id)]=n;else S[col].push(n);
    closeForm();markDirty();toast(id?"고쳤어요. 저장하기를 누르면 공유돼요":"추가했어요. 저장하기를 누르면 공유돼요");
  });
}
function closeForm(){var m=$("#modal");if(m)m.remove()}

function save(){
  var prev=S.meta.updated;
  document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
  S.meta.updated=new Date().toISOString();
  lsSet({base:BASE.meta.updated,state:S,n:dirty,pending:S.meta.updated});
  if(!art){S.meta.updated=prev;toast("여기서는 서버 저장을 쓸 수 없어 이 브라우저에만 보관했어요");return}
  toast("저장하는 중…");
  art.publish(buildDoc(S)).then(function(){toast("저장했어요")}).catch(function(err){
    var c=err&&err.code;S.meta.updated=prev;
    if(c==="conflict"){toast("다른 곳에서 먼저 저장해서 최신본을 다시 불러와요")}
    else if(["not_writer","not_granted","consent_required","capability_disabled","capability_removed","not_declared"].indexOf(c)>=0){canWrite=false;lsSet({base:BASE.meta.updated,state:S,n:dirty});render();toast("보기 전용 화면이라 이 브라우저에만 보관했어요")}
    else if(c==="rate_limited"){toast("너무 자주 저장했어요. 잠시 뒤 다시 눌러 주세요")}
    else{toast("저장하지 못했어요. 잠시 뒤 다시 눌러 주세요")}
  });
}
function buildDoc(state){
  var css=document.getElementById("gs").textContent;
  var js=document.getElementById("gjs").textContent;
  var json=JSON.stringify(state).replace(/</g,"\\u003c");
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+RESET+'</style></head><body>'+
    '<title>12월 신혼여행 가이드</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+FONT_LINK+'\n<style id="gs">'+css+'</style>\n<div id="app"></div>\n<script type="application/json" id="trip-data">'+json+'<\/script>\n'+SORTABLE_TAG+'\n<script id="gjs">'+js+'<\/script></body></html>';
}
var toastT;
function toast(m){var t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},3200)}

/* ---------- 이벤트 ---------- */
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-act],[data-tab],[data-city],[data-kind]");
  if(!e.target.closest(".swipe.open"))closeSwipes();
  if(!b)return;
  if(b.hasAttribute("data-tab")){tab=b.getAttribute("data-tab");kindF="";dayEnter=true;render();return}
  if(b.hasAttribute("data-kind")&&!b.hasAttribute("data-act")){kindF=b.getAttribute("data-kind");render();return}
  if(b.hasAttribute("data-city")&&!b.hasAttribute("data-act")){var c=b.getAttribute("data-city");city=(city===c)?"":c;render();return}
  var a=b.getAttribute("data-act");
  if(a==="day"){var id=b.getAttribute("data-id");if(id&&id!==curDay){curDay=id;dayEnter=true;render()}}
  else if(a==="ck"){tickStop(b.getAttribute("data-key"))}
  else if(a==="lock"){locked=!locked;try{localStorage.setItem("hm-lock",locked?"1":"")}catch(e2){}pendingDel=null;render();toast(locked?"읽기 모드예요. 실수로 고칠 일이 없어요":"편집 모드예요. 글자를 누르면 바로 고쳐져요")}
  else if(a==="hint-x"){try{localStorage.setItem("hm-hint","1")}catch(e3){}var hh=$(".hint");if(hh)hh.remove()}
  else if(a==="open"){openForm(b.getAttribute("data-col"),b.getAttribute("data-id"))}
  else if(a==="close"){closeForm()}
  else if(a==="add"){addItem(b.getAttribute("data-col"),b.getAttribute("data-cat"))}
  else if(a==="additem"){addStop()}
  else if(a==="cyc"){
    var col=b.getAttribute("data-col"),cid=b.getAttribute("data-id"),f=b.getAttribute("data-f");
    var opts=f==="city"?SEL_CITY:optionsFor(col,f),o=getItem(col,cid);if(!o||!opts.length)return;
    o[f]=opts[(opts.indexOf(o[f])+1)%opts.length];markDirty();
    var nb=document.querySelector('[data-act="cyc"][data-col="'+col+'"][data-id="'+cid+'"][data-f="'+f+'"]');if(nb)nb.focus();
  }
  else if(a==="del"){var key=b.getAttribute("data-col")+":"+b.getAttribute("data-id");
    if(pendingDel===key){var col2=b.getAttribute("data-col");S[col2].splice(findIdx(col2,b.getAttribute("data-id")),1);pendingDel=null;markDirty();toast("삭제했어요. 되돌리기로 살릴 수 있어요")}
    else{pendingDel=key;render();setTimeout(function(){if(pendingDel===key){pendingDel=null;render()}},3500)}}
  else if(a==="delitem"){var ik=b.getAttribute("data-key"),pk="item:"+ik;
    if(pendingDel===pk){removeStop(ik);pendingDel=null}
    else{pendingDel=pk;render();setTimeout(function(){if(pendingDel===pk){pendingDel=null;render()}},3500)}}
  else if(a==="swdel"){var row=b.closest(".swipe");if(row)swipeDelete(row)}
  else if(a==="tick"){var i=findIdx("quests",b.getAttribute("data-id"));S.quests[i].done=!S.quests[i].done;markDirty()}
  else if(a==="save"){save()}
  else if(a==="revert"){if(pendingDel==="revert"){S=clone(BASE);migrateItems(S);dirty=0;pendingDel=null;lsSet(null);render();toast("마지막 저장 상태로 되돌렸어요")}else{pendingDel="revert";refreshSaveBar();setTimeout(function(){if(pendingDel==="revert"){pendingDel=null;refreshSaveBar()}},3500)}}
  else if(a==="draft-load"){S=draft.state;migrateItems(S);S.meta.updated=BASE.meta.updated;dirty=draft.n;showDraftBanner=false;render();toast("수정본을 불러왔어요. 저장하기를 눌러 마무리하세요")}
  else if(a==="draft-drop"){lsSet(null);showDraftBanner=false;draft=null;render()}
});
function removeStop(key){var d=curDayObj();if(!d)return;d.items=d.items.filter(function(x){return x[2]!==key});delete S.checks[d.id+":"+key];markDirty();toast("삭제했어요. 되돌리기로 살릴 수 있어요")}

// 바로 편집: 글자를 고치면 곧바로 데이터에 반영
var edT;
document.addEventListener("focusin",function(e){var el=e.target.closest&&e.target.closest(".ed[contenteditable]");if(el){el._counted=false;el._orig=el.innerText}});
document.addEventListener("input",function(e){
  if(e.target.id==="q"){
    clearTimeout(qT);var v=e.target.value;
    qT=setTimeout(function(){q=v.trim().toLowerCase();render();var el2=$("#q");el2.focus();el2.setSelectionRange(v.length,v.length)},180);
    return;
  }
  var el=e.target.closest&&e.target.closest(".ed[contenteditable]");if(!el)return;
  var val=el.innerText.replace(/ /g," ");if(el.hasAttribute("data-single"))val=val.replace(/\n/g," ");
  setField(el.getAttribute("data-col"),el.getAttribute("data-id"),el.getAttribute("data-f"),val.replace(/\n$/,""));
  if(!el._counted){el._counted=true;touch()}else{clearTimeout(edT);edT=setTimeout(keep,300)}
});
document.addEventListener("focusout",function(e){
  var el=e.target.closest&&e.target.closest(".ed[contenteditable]");if(!el)return;
  if(!el.innerText.trim())el.innerHTML="";
  if(el.getAttribute("data-f")==="krw"&&el._counted)render();
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){closeForm();var a=document.activeElement;if(a&&a.classList&&a.classList.contains("ed"))a.blur();return}
  if((e.ctrlKey||e.metaKey)&&(e.key==="s"||e.key==="S")){e.preventDefault();if(dirty&&canWrite)save();return}
  var el=e.target.closest&&e.target.closest(".ed[data-single]");
  if(el&&e.key==="Enter"){e.preventDefault();el.blur()}
});
document.addEventListener("paste",function(e){
  var el=e.target.closest&&e.target.closest(".ed[contenteditable]");if(!el)return;
  e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData("text/plain")||"";
  if(el.hasAttribute("data-single"))t=t.replace(/\s*\n\s*/g," ");
  document.execCommand("insertText",false,t);
});
document.addEventListener("click",function(e){if(e.target.id==="modal")closeForm()});
var qT;

// 휴대폰 스와이프: 오른쪽 = 완료, 왼쪽 = 삭제 버튼
var sw=null;
function closeSwipes(except){document.querySelectorAll(".swipe.open").forEach(function(r){if(r!==except){r.classList.remove("open");var b=r.querySelector(".sw-body");if(b)b.style.transform=""}})}
document.addEventListener("pointerdown",function(e){
  if(locked||e.pointerType==="mouse")return;
  var row=e.target.closest(".swipe");if(!row||e.target.closest(".grip"))return;
  sw={row:row,x:e.clientX,y:e.clientY,dx:0,on:false};
},{passive:true});
document.addEventListener("pointermove",function(e){
  if(!sw)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;
  if(!sw.on){if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.6){sw.on=true;sw.row.classList.add("dragging-x");closeSwipes(sw.row);var a=document.activeElement;if(a&&a.blur)a.blur()}else if(Math.abs(dy)>12){sw=null;return}else return}
  sw.dx=Math.max(-120,Math.min(120,dx));
  sw.row.classList.toggle("to-done",sw.dx>0);
  sw.row.querySelector(".sw-body").style.transform="translateX("+sw.dx+"px)";
},{passive:true});
function swEnd(){
  if(!sw)return;var r=sw.row,b=r.querySelector(".sw-body");r.classList.remove("dragging-x");
  if(sw.on){
    if(sw.dx<-64){b.style.transform="translateX(-96px)";r.classList.add("open")}
    else{b.style.transform="";r.classList.remove("open");if(sw.dx>64)swipeDone(r)}
  }
  sw=null;
}
document.addEventListener("pointerup",swEnd);document.addEventListener("pointercancel",swEnd);
function swipeDone(r){
  if(r.getAttribute("data-rk")==="item")tickStop(r.getAttribute("data-key"));
  else{var o=getItem("quests",r.getAttribute("data-key"));if(o){o.done=!o.done;markDirty()}}
}
function swipeDelete(r){
  if(r.getAttribute("data-rk")==="item")removeStop(r.getAttribute("data-key"));
  else{var i=findIdx("quests",r.getAttribute("data-key"));if(i>=0){S.quests.splice(i,1);markDirty();toast("삭제했어요. 되돌리기로 살릴 수 있어요")}}
}

