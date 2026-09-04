
const GRAIN_SVG="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='150'%20height='150'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.9'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='150'%20height='150'%20filter='url(%23n)'/%3E%3C/svg%3E";
const TOOTH_SVG="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='220'%20height='220'%3E%3Cfilter%20id='t'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.4'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='220'%20height='220'%20filter='url(%23t)'/%3E%3C/svg%3E";
function bake(uri,w,h){return new Promise(function(res){var img=new Image();img.onload=function(){try{var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/png'));}catch(e){res(null);}};img.onerror=function(){res(null);};img.src=uri;});}
function bakeTextures(){return Promise.all([bake(GRAIN_SVG,150,150),bake(TOOTH_SVG,220,220)]).then(function(r){if(r[0])document.documentElement.style.setProperty('--grain','url('+r[0]+')');if(r[1])document.documentElement.style.setProperty('--tooth','url('+r[1]+')');});}
const NAMES={"illum": "Illuminated", "cert": "Guilloché", "wax": "Wax Seal", "clay": "Cuneiform", "papyrus": "Papyrus", "waka": "Ryōshi", "palm": "Palm-Leaf", "quran": "Tazhib", "rubbing": "Stone Rubbing", "bookplate": "Ex Libris", "letterpress": "Letterpress", "clip2": "Clipping"}, SRC={"illum": "Medieval manuscript", "cert": "Banknote engraving", "wax": "Sealed letter patent", "clay": "Mesopotamian clay", "papyrus": "Nile-reed scroll", "waka": "Heian-period paper", "palm": "Palm-leaf script", "quran": "Illuminated Qur’an", "rubbing": "Carved-stele rubbing", "bookplate": "Armorial bookplate", "letterpress": "Pressed into kraft", "clip2": "A torn clipping"};
const STYLE_ORDER=['illum','cert','wax','clay','papyrus','waka','palm','quran','rubbing','bookplate','letterpress','clip2'];
/* ── clip data: read from the extension (chrome.storage, key 'bayaaz_export'); sample fallback keeps the page previewable standalone ── */
var CUR={sub:'On grief',src:'Their Eyes Were Watching God',lang:'en',body:`There are years that ask questions and years that answer.\n\nI did not weep at Mama's funeral. They thought I was cold. But I was only busy being the oldest and the strongest.`};
function extractSubhead(md){var lines=md.split('\n');for(var i=0;i<lines.length;i++){var m=lines[i].match(/^#{1,6}\s+(.+)/);if(m){return m[1].trim()
 .replace(/\[([^\]\n]*)\]\(#[^\s)]*\)/g,function(_,t){t=t.trim();return (!t||/^[#\u00b6\u00a7]$/.test(t)||t.toLowerCase()==='link')?'':t;}) /* 锚点链接留文字（MDN 标题自带 [x](#y)，原样上卡是事故） */
 .replace(/\[([^\]\n]+)\]\([^)]*\)/g,'$1') /* 其余链接留文字 */
 .replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/`(.+?)`/g,'$1')
 .replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g,'$1').trim();}}return '';}
function mdToPlainBody(md){return md
 .replace(/!\[[^\]]*\]\([^)]*\)/g,'') /* 图片标记整段剥除：卡片放不了图，![图片](url) 是纯噪音 */
 .replace(/^\s*(?:```|~~~)[\w-]*\s*$/gm,'') /* 围栏行剥除：```css 若不剥会被行内反引号规则啃成 `css 漏上卡面 */
 .replace(/\[\s*\]\([^)]*\)/g,'') /* 空文字链接 [](url) 删除 */
 .replace(/\[([^\]]+)\]\(\s*\)/g,'$1') /* 空 URL 链接 [文字]() 留文字 */
 .replace(/^#{1,6}\s+.+/gm,'')
 .replace(/\*\*(.+?)\*\*/g,'$1')
 .replace(/\*(.+?)\*/g,'$1')
 .replace(/_(.+?)_/g,'$1')
 .replace(/\[(.+?)\]\(.+?\)/g,'$1')
 .replace(/`(.+?)`/g,'$1')
 .replace(/^>\s*/gm,'')
 .replace(/^[-*+]\s+/gm,'')
 .replace(/^\d+\.\s+/gm,'')
 .replace(/^---+$/gm,'')
 .replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g,'$1') /* 还原 turndown 的反斜杠转义：\[ترميم\] → [ترميم]、\[2\] → [2]，避免反斜杠裸露在卡面 */
 .replace(/[  　]/g,' ') /* nbsp/全角空格→普通空格 */
 .replace(/^[ \t]+$/gm,'') /* 公众号撑版的纯空白段落清空 */
 .replace(/\n{3,}/g,'\n\n')
 .trim();}
function detectLang(text){
 // 多语种四档兜底（见 openspec/changes/multilang-fallback-l2/design.md D1）
 // 非拉丁优先于拉丁：韩文/印地等正文常含 "PDF" 等拉丁借词，
 // 若拉丁先匹配会把整段误判为 en，破坏首字下沉与排版。
 if(/[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text)){
  // 占比守卫：仅当阿拉伯字符数≥拉丁字符数才路由 RTL。英文文案里嵌产品名 بیاض（161拉丁 vs 4阿拉伯）
  // 不再整段翻成 rtl-ur；纯阿拉伯/乌尔都、阿拉伯夹拉丁借词(阿拉伯占多)仍归 RTL。严格改进，不回归。
  var _ar=(text.match(/[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g)||[]).length, _la=(text.match(/[A-Za-zÀ-ɏ]/g)||[]).length;
  if(_ar>=_la){
   // 乌尔都/波斯特有字符 ٹ پ چ ڈ ڑ ژ ک گ ں ھ ے ی(U+06CC 波斯 yeh) → rtl-ur(Nastaliq)
   if(/[ٹپچڈڑژکگںھےی]/.test(text))return 'rtl-ur';
   return 'rtl';
  }
  /* 拉丁占多数 → 不翻 RTL，落到下面 en/other */
 }
 if(/[一-鿿㐀-䶿]/.test(text)){
  if(/[぀-ゟ゠-ヿㇰ-ㇿ]/.test(text))return 'other';
  return 'zh';
 }
 if(/[가-힯㄰-㆏぀-ゟ゠-ヿㇰ-ㇿऀ-ॿঀ-৿਀-੿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ฀-๿Ͱ-ϿЀ-ӿ]/.test(text))return 'other';
 if(/[ĂăƠơƯưĐđẠ-ỿ]/.test(text))return 'vi'; /* 越南语特征字符（ăơưđ + Latin Extended Additional 声调）：装饰性 latin 子集字体缺这些字形，单独路由换 Source Serif */
 if(/[A-zÀ-ɏ]/.test(text))return 'en';
 return 'other';
}
/* other 档内按文字再分一档，仅用于行距微调（日 2.0 / 韩 1.8 / 其余如印地·泰 默认 1.9）。
   含假名→ja；含谚文→ko；其余返回空（走默认）。不改 detectLang 既有分档逻辑。 */
function otherScript(text){
 text=text||'';
 if(/[぀-ゟ゠-ヿㇰ-ㇿ]/.test(text)) return 'ja';
 if(/[가-힣ㄱ-ㆎ가-힯ᄀ-ᇿ]/.test(text)) return 'ko';
 if(/[ऀ-ॿ]/.test(text)) return 'hi'; /* 天城文：用于 ILREQ 字距归零 */
 return '';
}
function loadExportData(){return new Promise(function(resolve){
 if(typeof chrome==='undefined'||!chrome.storage){resolve(null);return;}
 chrome.storage.local.get('bayaaz_export',function(r){resolve((r&&r.bayaaz_export)||null);});});}
var SAVED=new Date();
function cnDay(n){var t='一二三四五六七八九十';if(n<=10)return t[n-1];if(n<20)return '十'+t[n-11];var u=n%10;return t[Math.floor(n/10)-1]+'十'+(u?t[u-1]:'');}
/* zh 卡：中文数字日期（年用〇数字式、月日用数目，如 二〇二六 · 六 · 十四）；en 卡仍用花体阿拉伯 */
/* RTL 落款日期：日 月 年 + 纪元，按逻辑顺序(日→月→年)拼串；落款容器须 direction:rtl，
   浏览器才会渲染成右起「۲۸ جون ۲۰۲۶ء」。ur=乌尔都(扩展数码+ء)、ar=阿拉伯(阿拉伯数码+م)、
   fa=波斯(默认太阳历 Shamsi)。月名/数码各按语言分套，勿混。 */
function colophonDate(date,lang,opts){
 opts=opts||{};
 var EXT='۰۱۲۳۴۵۶۷۸۹', ARB='٠١٢٣٤٥٦٧٨٩';
 var num=function(n,set){return String(n).replace(/\d/g,function(d){return set[+d];});};
 var M={
  ur:['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
  ar_int:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  ar_lev:['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'],
  fa_g:['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'],
  fa_j:['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
 };
 var gy=date.getFullYear(), gm=date.getMonth()+1, gd=date.getDate();
 if(lang==='ur') return num(gd,EXT)+' '+M.ur[gm-1]+' '+num(gy,EXT)+'ء';
 if(lang==='ar'){var mo=(opts.arabicMonths==='levantine')?M.ar_lev:M.ar_int;
  return num(gd,ARB)+' '+mo[gm-1]+' '+num(gy,ARB)+(opts.era===false?'':' م');}
 if(lang==='fa'){
  if(opts.faCalendar==='gregorian') return num(gd,EXT)+' '+M.fa_g[gm-1]+' '+num(gy,EXT)+' میلادی';
  var j=gregorianToJalali(gy,gm,gd); return num(j[2],EXT)+' '+M.fa_j[j[1]-1]+' '+num(j[0],EXT);}
}
/* 公历 → 太阳历(jalaali-js 算法) */
function gregorianToJalali(gy,gm,gd){
 var gdm=[0,31,59,90,120,151,181,212,243,273,304,334];
 var jy=(gy<=1600)?0:979; gy-=(gy<=1600)?621:1600;
 var gy2=(gm>2)?gy+1:gy;
 var days=365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)-80+gd+gdm[gm-1];
 jy+=33*Math.floor(days/12053); days%=12053;
 jy+=4*Math.floor(days/1461); days%=1461;
 jy+=Math.floor((days-1)/365); if(days>365) days=(days-1)%365;
 var jm=(days<186)?1+Math.floor(days/31):7+Math.floor((days-186)/30);
 var jd=1+((days<186)?days%31:(days-186)%30);
 return [jy,jm,jd];
}
function fmtDate(d,lang,text){
 if(lang==='zh'){var dig='〇一二三四五六七八九';
  var yr=(''+d.getFullYear()).replace(/\d/g,function(c){return dig[+c];});
  return yr+' · '+cnDay(d.getMonth()+1)+' · '+cnDay(d.getDate());}
 if(lang==='rtl')    return colophonDate(d,'ar');
 /* rtl-ur 含波斯+乌尔都：有乌尔都专属字母(ٹ ڈ ڑ ں ھ ے 及乌尔都专用 heh-goal ہ，波斯无)→ ur；否则按波斯 fa(太阳历) */
 if(lang==='rtl-ur') return colophonDate(d, /[ٹڈڑںھےہ]/.test(text||'') ? 'ur' : 'fa');
 /* other 档含天城文(印地语)：天城文数码 + 天城文月名 + 公历(不换印历)，LTR 直拼「२८ जून २०२६」 */
 if(lang==='other' && /[ऀ-ॿ]/.test(text||'')){
  var DEV='०१२३४५६७८९';
  var Mh=['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
  var nd=function(n){return String(n).replace(/\d/g,function(c){return DEV[+c];});};
  return nd(d.getDate())+' '+Mh[d.getMonth()]+' '+nd(d.getFullYear());}
 var p=function(n){return n<10?'0'+n:''+n;};
 return d.getFullYear()+' · '+p(d.getMonth()+1)+' · '+p(d.getDate());}
var noDrop=false,active='illum',cardW=420;
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function buildQ(body,ex){return body.split(/\n{2,}/).map(function(p,i){var h=esc(p).replace(/\n/g,'<br>');
 var leadPunct=/^[\s\u300c\u300e\u300a\u3008\uff08\u3010\u2018\u201c\u2014\u2026"'(\[]/.test(p)&&/^\s*[^\s]/.test(p)&&/^[\u300c\u300e\u300a\u3008\uff08\u3010\u2018\u201c\u2014\u2026"'(\[]/.test(p.trim());
 var noDropLang=/^(other|rtl|rtl-ur)$/.test(ex.dataset.lang||'')||!!ex.dataset.code; /* 代码卡不下沉：悬空大 # 破坏语义 */ /* rtl/other 档首字下沉强制关闭：CSS 将 .di 设 display:none，若仍包裹会吞掉首字符（في→ي、홀로→로）*/
 var leadDigit=/^\s*\d/.test(p); /* 数字开头不下沉：章节号(2.2.3)/年份(2018年)/统计(10.82亿) —— 悬空大数字破坏古籍美学 */
 if(i===0&&ex.classList.contains('dropcap')&&!noDrop&&!leadPunct&&!noDropLang&&!leadDigit){h=h.replace(/^(\s*)(\S)/,function(m,sp,ch){return sp+'<span class="di">'+ch+'</span>';});}return '<p>'+h+'</p>';}).join('');}
function makeExcerpt(body,lang){var t=body.replace(/\n+/g,' ').trim();var max=lang==='zh'?180:400;
 if(t.length>max){t=t.slice(0,max).replace(/\s+\S*$/,'');t+='\u2026';}return t;}
function applyContent(){var s=CUR;var excerpt=makeExcerpt(s.body,s.lang);
 /* rtl-ur 内再分：波斯(无乌尔都专属字母)→ fa(字体走现代 Naskh/Vazirmatn，现代波斯散文标准)；
    乌尔都(含专属字母)→ 不打标记，仍走 Nastaliq。守卫与日期一致(含 ہ)，最大化乌尔都识别。 */
 var subScript=(s.lang==='other')?otherScript(s.body||''):
   (s.lang==='rtl-ur' && !/[ٹڈڑںھےہ]/.test(s.body||'') ? 'fa' : '');
 document.querySelectorAll('.ex').forEach(function(ex){ex.dataset.lang=s.lang||'en';
  if(s.hasCode) ex.dataset.code='1'; else delete ex.dataset.code;
  if(subScript) ex.dataset.script=subScript; else delete ex.dataset.script;
  var inFrame=!!(ex.closest&&ex.closest('.frame'));
  var q=ex.querySelector('.q'); if(q) q.innerHTML=buildQ(inFrame?excerpt:s.body,ex);
  var sub=ex.querySelector('.sub'); if(sub) sub.textContent=s.sub||'';
  var sr=ex.querySelector('.subrule'); if(sr) sr.style.display=s.sub?'':'none';
  var sc=ex.querySelector('.src'); if(sc) sc.textContent=s.src||'';
  var dt=ex.querySelector('.date'); if(dt) dt.textContent=(s.dateText!=null?s.dateText:fmtDate(SAVED,s.lang,s.body));});
 // 非拉丁/RTL 语种 CSS 已强制关闭首字下沉，开关按钮也一并隐藏避免视觉噪声
 var dropStamp=document.querySelector('.stamp[data-hide="dropcap"]');
 if(dropStamp){var noDropLang=s.lang==='other'||s.lang==='rtl'||s.lang==='rtl-ur';
  dropStamp.style.display=noDropLang?'none':'';}
 measureCards();}
var featured=document.getElementById('featured'), tag=document.getElementById('tag');
var MIN_FIT=0.55; /* readability floor: never scale the preview below this; longer cards scroll instead */
var REF_H=0; /* median natural card height for current content: taller styles (Ex Libris) are scaled to match the pack */
function measureCards(){var hs=[];
 featured.querySelectorAll('.ex').forEach(function(ex){var st=ex.style.cssText;
  ex.style.cssText='display:block;position:absolute;visibility:hidden;width:'+cardW+'px;transform:none;';
  var h=ex.offsetHeight; if(h) hs.push(h);
  ex.style.cssText=st;});
 hs.sort(function(a,b){return a-b});
 REF_H=hs.length?hs[Math.floor(hs.length/2)]:0;}
function fit(){var card=featured.querySelector('.ex.active'); if(!card) return;
 card.style.width=cardW+'px'; card.style.transform='none'; card.style.marginBottom='';
 var availW=featured.clientWidth-40, availH=featured.clientHeight-34;
 var natW=card.offsetWidth||cardW, natH=card.offsetHeight||1;
 /* align every style to the pack median, both ways: tall ones shrink, short ones may grow a touch (cap 1.12) */
 var scT=REF_H?REF_H/natH:1;
 var sc=Math.min(availW/natW, availH/natH, scT, 1.12);
 if(!isFinite(sc)||sc<=0) sc=MIN_FIT;
 /* mode decided by the MEDIAN card, so all 12 styles share the same anchor for a given clip */
 var scM=REF_H?Math.min(availW/natW, availH/REF_H, 1):sc;
 var over = scM < MIN_FIT;
 if(over){ sc=Math.min(availW/natW, .8); if(!isFinite(sc)||sc<=0) sc=.8; } /* reading mode: restrained width, not a wall of paper */
 featured.classList.toggle('overflow', over);
 if(over){ /* long clip: keep text readable, let the page scroll; shrink the layout box to the visual height */
  card.style.transformOrigin='top center';
  card.style.marginBottom=Math.round(natH*(sc-1))+'px';
  card.style.transform='scale('+sc+')';
 } else {
  var bias=parseFloat(card.dataset.fit)||1; /* per-style preview trim (Ex Libris reads big even at median) */
  card.style.transformOrigin='center center';
  /* flex "safe" alignment clamps oversized layout boxes to the top, so the visual position would
     drift with each style's natural height — translate to the true center ourselves */
  var dy=(featured.clientHeight-natH)/2 - card.offsetTop + 12; /* optical balance: sit slightly below the geometric centre */
  card.style.transform='translateY('+Math.round(dy)+'px) rotate(-0.5deg) scale('+(sc*bias)+')';
 }}
function scaleSwatches(){document.querySelectorAll('.frame').forEach(function(fr){var c=fr.querySelector('.ex'); if(!c) return;
 var fw=fr.clientWidth, fh=fr.clientHeight; if(fw<2) return;
 var ch=c.offsetHeight||1;                         /* card's natural height at 400px width */
 var s=Math.min(fw/400, fh/ch);                    /* CONTAIN → the whole card (seal, crest, meta) reads as a specimen */
 c.style.transform='translate(-50%,-50%) scale('+s+')';});}
function setActive(skin){active=skin;
 featured.querySelectorAll('.ex').forEach(function(ex){ex.classList.toggle('active',ex.dataset.style===skin);});
 document.querySelectorAll('.swatch').forEach(function(v){v.classList.toggle('active',v.dataset.skin===skin);});
 tag.querySelector('h3').textContent=NAMES[skin]||''; tag.querySelector('p').textContent=SRC[skin]||'';
 featured.classList.remove('turning'); void featured.offsetWidth; featured.classList.add('turning');
 featured.scrollTop=0; featured.classList.remove('scrolled');
 fit();}
var sw=document.getElementById('swatches');
featured.querySelectorAll('.ex').forEach(function(card){var skin=card.dataset.style;
 var w=document.createElement('div'); w.className='swatch'; w.dataset.skin=skin;
 var fr=document.createElement('div'); fr.className='frame'; var cl=card.cloneNode(true); cl.querySelectorAll('[data-edit]').forEach(function(e){e.removeAttribute('contenteditable');e.removeAttribute('data-edit');}); cl.classList.remove('active'); cl.style.display='block'; cl.style.transform=''; cl.style.width='400px'; fr.appendChild(cl);
 var lb=document.createElement('div'); lb.className='lab'; lb.innerHTML=(NAMES[skin]||skin)+'<small>'+(SRC[skin]||'')+'</small>'; w.appendChild(fr); w.appendChild(lb);
 w.addEventListener('click',function(){ if(skin!==active) setActive(skin); });
 sw.appendChild(w);});
/* tools */
var CLS={sub:'hide-sub',src:'hide-src',date:'hide-date'};
document.querySelectorAll('.stamp').forEach(function(s){s.addEventListener('click',function(){ s.classList.toggle('active'); var k=s.dataset.hide;
 if(k==='dropcap'){ noDrop=s.classList.contains('active'); applyContent(); fit(); scaleSwatches(); return; }
 var on=s.classList.contains('active'); document.querySelectorAll('.ex').forEach(function(ex){ex.classList.toggle(CLS[k],on);}); measureCards(); fit(); scaleSwatches();});});
/* Refinement 5: size/format are now real dropdowns (wired at the end of this script) */
var save=document.getElementById('save'), tip=document.getElementById('savetip'), hold;
function doSave(){var card=featured.querySelector('.ex.active'); if(!card||save.classList.contains('busy')) return;
 /* #2 反馈：立刻进入"封缄中"状态，防连点 */
 save.classList.remove('sealed'); save.classList.add('busy','pressed'); void save.offsetWidth;
 tip.textContent='Sealing…'; tip.classList.add('show');
 /* 不动可见卡片，避免导出时预览缩放跳变；缩放/阴影重置只作用到 html-to-image 的内部克隆：
    width/height 钉死自然尺寸画布 + style.transform:none → 克隆按 scale 1 渲染、填满 PNG，可见卡全程不动 */
 (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){return htmlToImage.toPng(card,{pixelRatio:3,cacheBust:true,width:card.offsetWidth,height:card.offsetHeight,style:{transform:'none',boxShadow:'none',margin:'0'}});})
 .then(function(u){
   /* 文件名：<纸样>-<标题>-<日期>-bayaaz.png（RTL 标题 → <纸样>-<日期>-<标题>-bayaaz）。标题降级链 题注→来源→正文前12字→clip；
      时间戳到天（同名同日重复导出由浏览器自动加 (1) 防覆盖）。 */
   var d=new Date(),p=function(n){return n<10?'0'+n:''+n;};
   var stamp=d.getFullYear()+p(d.getMonth()+1)+p(d.getDate());   // 日期 YYYYMMDD 紧凑（不加连字符，与标题分隔符不混）
   /* 纸样段：当前 active 的 id 过友好 slug 表，全 ASCII */
   var SKIN_SLUG={illum:'illuminated',cert:'guilloche',wax:'waxseal',clay:'cuneiform',papyrus:'papyrus',
                  waka:'ryoshi',palm:'palmleaf',quran:'tazhib',rubbing:'carverelief',
                  bookplate:'exlibris',letterpress:'letterpress',clip2:'clipping'};
   var skin=SKIN_SLUG[active]||active||'card';
   /* 标题：题注→来源→正文前12字→clip；去非法字符与控制符、剥常见标点（文件名即文案，逗号引号不上台）、
      空白折连字符、截64且**退到词边界收刀**（不斩词中；CJK 无连字符不受影响）；中/阿/越等保留不转写 */
   var raw=(CUR.sub&&CUR.sub.trim())||(CUR.src&&CUR.src.trim())||(CUR.body?CUR.body.replace(/\s+/g,' ').trim().slice(0,12):'')||'clip';
   var title=raw.replace(/[\/\\:*?"<>|\r\n\t]+/g,'-')
                .replace(/[,.;!?'"\u2018\u2019\u201C\u201D()\[\]{}\u00AB\u00BB\u2026\u00B7\u3001\u3002\uFF0C\uFF1F\uFF01\uFF1B\uFF1A\uFF08\uFF09\u300C\u300D\u300E\u300F\u300A\u300B\u060C\u061F]+/g,'')
                .replace(/\s+/g,'-').replace(/-{2,}/g,'-').replace(/^-+|-+$/g,'');
   if(title.length>64){ var cut=title.slice(0,64), atWord=cut.replace(/-[^-]*$/,''); title=atWord||cut; } /* 64：书脊预算——40 太保守常斩整句；仍守访达/路径长度安全线 */
   title=title.replace(/^-+|-+$/g,'').toLowerCase()||'clip'; /* slug 正字法=全小写（四段统一质感；防大小写敏感服务器重复URL；与 .md 导出对齐）；CJK/RTL 不受影响 */
   /* 默认 <纸样>-<标题>-<日期>；标题含 RTL 字符(阿/希/乌等)时 → <纸样>-<日期>-<标题>，标题挪末尾，避免 bidi 把日期/.png 摆乱 */
   var titleRTL=/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(title);
   var fname=(titleRTL ? (skin+'-'+stamp+'-'+title) : (skin+'-'+title+'-'+stamp))+'-bayaaz'; /* 名款殿后（落款语序：日期在前、署名收尾）；文件旅行时来历随身；RTL 时兼作 .png 前的 bidi 缓冲 */
   var a=document.createElement('a');a.href=u;a.download=fname+'.png';document.body.appendChild(a);a.click();a.remove();
   save.classList.remove('pressed','busy'); save.classList.add('sealed'); tip.textContent='Sealed';
   setTimeout(function(){ save.classList.remove('sealed'); tip.classList.remove('show'); },1500);})
 .catch(function(e){ save.classList.remove('pressed','busy'); tip.classList.remove('show'); alert('Export failed: '+e.message);});}
/* #1 触屏/桌面统一用 click 触发（手机点按也会触发 click），不再只绑 mouse */
if(save){ save.addEventListener('click', doSave); }
window.addEventListener('resize',function(){ fit(); scaleSwatches(); });
featured.addEventListener('scroll',function(){ featured.classList.toggle('scrolled', featured.scrollTop>4); });
var idle; function resetIdle(){ var c=featured.querySelector('.ex.active'); if(c) c.style.animationName=''; clearTimeout(idle); idle=setTimeout(function(){ var a=featured.querySelector('.ex.active'); if(a) a.style.animation='breath 5s ease-in-out infinite'; },30000); }
['mousemove','click','keydown'].forEach(function(e){window.addEventListener(e,resetIdle);});
var st=document.createElement('style'); st.textContent='@keyframes breath{0%,100%{filter:none}50%{filter:brightness(1.03)}}'; document.head.appendChild(st);
/* ── 就地编辑：hero 卡四部位（小标题 .sub / 正文 .q / 出处 .src / 日期 .date）可改，en/zh 通用。
   失焦提交 → 更新 CUR → applyContent 重排（含首字下沉 buildQ）+ fit 重新量高缩放。
   样品墙克隆卡在 setupEditing 之前生成、且已剥离 data-edit，故不参与编辑。
   注：导出 PNG 时卡片无 hover/focus，affordance 不显，导出干净。 ── */
function editCommit(kind,el){
 if(kind==='sub') CUR.sub=el.textContent.trim();
 else if(kind==='src') CUR.src=el.textContent.trim();
 else if(kind==='date') CUR.dateText=el.textContent.trim();
 else if(kind==='body'){
  var bl=el.querySelectorAll(':scope > p, :scope > div'); var parts=[];
  (bl.length?Array.prototype.slice.call(bl):[el]).forEach(function(b){var t=b.textContent.replace(/\s+$/,'');if(t)parts.push(t);});
  CUR.body=parts.join('\n\n');
 }
 applyContent(); fit(); scaleSwatches();
}
function editBind(el,kind){ if(!el) return;
 el.setAttribute('data-edit','');                 /* 默认纯预览，不可编辑 */
 el.addEventListener('dblclick',function(){        /* 双击进入编辑（与侧边栏一致），鼠标划过不打扰 */
  if(el.getAttribute('contenteditable')==='true') return;
  el.setAttribute('contenteditable','true'); el.focus(); });
 el.addEventListener('blur',function(){            /* 失焦：提交并退出编辑态 */
  if(el.getAttribute('contenteditable')!=='true') return;
  el.removeAttribute('contenteditable'); editCommit(kind,el); });
 if(kind!=='body') el.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); el.blur(); } });
}
function setupEditing(){ featured.querySelectorAll('.ex').forEach(function(ex){
 editBind(ex.querySelector('.sub'),'sub'); editBind(ex.querySelector('.q'),'body');
 editBind(ex.querySelector('.src'),'src'); editBind(ex.querySelector('.date'),'date'); }); }
loadExportData().then(function(clip){
 if(clip){
  var body=mdToPlainBody(clip.text||'');
  CUR={sub:extractSubhead(clip.text||''),src:clip.sourceTitle||'',body:body||(clip.text||''),lang:detectLang(body||clip.text||''),hasCode:/^\s*(?:```|~~~)/m.test(clip.text||'')};
  if(clip.savedAt){var d=new Date(clip.savedAt);if(!isNaN(d))SAVED=d;}
 }
 applyContent(); scaleSwatches(); setupEditing();
 bakeTextures().then(function(){ setActive('illum'); scaleSwatches(); });
});
if(sessionStorage.getItem('bz_sb')){ document.body.classList.add('skip'); } else { sessionStorage.setItem('bz_sb','1'); }
resetIdle();
/* re-fit once webfonts load (text reflows taller after load; without this a tall card e.g. Ex Libris can spill onto the name) */
if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(function(){ fit(); scaleSwatches(); }); }
window.addEventListener('load', function(){ fit(); scaleSwatches(); });
/* content arrives async from chrome.storage, so fonts can apply AFTER the first fit() and the
   card grows under the style name. Observe the cards themselves: any late size change re-fits. */
if(window.ResizeObserver){
 var ro=new ResizeObserver(function(){ fit(); });
 featured.querySelectorAll('.ex').forEach(function(ex){ ro.observe(ex); });
 ro.observe(featured);
}
if(document.fonts&&document.fonts.addEventListener){
 document.fonts.addEventListener('loadingdone', function(){ measureCards(); fit(); scaleSwatches(); });
}

/* === Optimization 3: keyboard shortcuts === */
document.addEventListener('keydown', function(e){
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;  /* 编辑卡片文字(contenteditable)时放行：空格照打、回车换行，不切纸样/不导出 */
  var idx = STYLE_ORDER.indexOf(active); if (idx < 0) idx = 0;
  if (e.key === 'ArrowRight' || e.key === ' '){ setActive(STYLE_ORDER[(idx + 1) % STYLE_ORDER.length]); e.preventDefault(); }
  else if (e.key === 'ArrowLeft'){ setActive(STYLE_ORDER[(idx - 1 + STYLE_ORDER.length) % STYLE_ORDER.length]); e.preventDefault(); }
  else if (e.key === 'Enter'){ doSave(); e.preventDefault(); }
});

/* === Optimization 7: swatch hover preview (no turning animation) === */
var previewTimer=null, previewed=false;
function previewSwap(skin){ featured.querySelectorAll('.ex').forEach(function(ex){ ex.classList.toggle('active', ex.dataset.style===skin); });
  tag.querySelector('h3').textContent=NAMES[skin]||''; tag.querySelector('p').textContent=SRC[skin]||''; fit(); }
document.querySelectorAll('.swatch').forEach(function(w){
  w.addEventListener('mouseenter', function(){ var skin=w.dataset.skin; if(skin===active) return;
    previewTimer=setTimeout(function(){ previewed=true; previewSwap(skin); }, 500); });
  w.addEventListener('mouseleave', function(){ clearTimeout(previewTimer);
    if(previewed){ previewSwap(active); previewed=false; } }); /* restore to the committed skin */
});

/* Size/Format dropdowns removed — single standard width (cardW=420), export is PNG via the seal. */

