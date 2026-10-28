const EVENTS=[
{id:1,cat:"music",city:"austin",date:"2026-11-14",price:89,icon:"🎸",bg:"#ffe3ec"},
{id:2,cat:"music",city:"boston",date:"2026-11-21",price:55,icon:"🎻",bg:"#e6ecff"},
{id:3,cat:"theatre",city:"newyork",date:"2026-12-02",price:120,icon:"🎭",bg:"#fff1d6"},
{id:4,cat:"theatre",city:"chicago",date:"2026-12-09",price:48,icon:"🕵️",bg:"#e9e3ff"},
{id:5,cat:"sports",city:"manchester",date:"2026-11-30",price:70,icon:"⚽",bg:"#dcf5e6"},
{id:6,cat:"sports",city:"denver",date:"2026-12-12",price:95,icon:"🏀",bg:"#ffe8d9"},
{id:7,cat:"comedy",city:"seattle",date:"2026-11-18",price:40,icon:"🎤",bg:"#fff6c9"},
{id:8,cat:"comedy",city:"portland",date:"2026-12-05",price:32,icon:"😂",bg:"#d9f3f7"}
];
const SEATS={general:{mult:1},premium:{mult:1.6},vip:{mult:2.5}};
const FEE=4.5;
const {t,money,date:fmtDate}=I18N;
const $=s=>document.querySelector(s);
const get=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const byId=id=>EVENTS.find(e=>e.id==id);
const total=b=>{const e=byId(b.eventId);return e.price*SEATS[b.seat].mult*b.qty+FEE*b.qty};
const evTitle=e=>t("event.e"+e.id+".title");
const evCity=e=>t("city."+e.city);
const seatName=k=>t("seat."+k);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function card(e){return `<article class="card"><div class="img" style="background:${e.bg}">${e.icon}</div><div class="body"><span class="tag">${t("category."+e.cat)}</span><h3>${evTitle(e)}</h3><div class="meta">${t("card.meta",{city:evCity(e),date:fmtDate(e.date)})}</div><div class="price">${t("card.from",{price:money(e.price)})}</div><a class="btn" href="booking.html?id=${e.id}">${t("card.book")}</a></div></article>`}
const emptyPanel=msg=>`<div class="panel empty"><p>${t(msg)}</p><a class="btn" href="events.html">${t("home.hero.cta")}</a></div>`;

const pages={
home(){ $("#featured").innerHTML=EVENTS.slice(0,4).map(card).join("") },
events(){
  const cats=["all",...new Set(EVENTS.map(e=>e.cat))];
  const f=$("#filters"),g=$("#list");
  const draw=c=>{
    f.innerHTML=cats.map(x=>`<button class="chip ${x===c?"on":""}" data-c="${x}">${x==="all"?t("events.filter.all"):t("category."+x)}</button>`).join("");
    g.innerHTML=EVENTS.filter(e=>c==="all"||e.cat===c).map(card).join("");
  };
  f.addEventListener("click",e=>{if(e.target.dataset.c)draw(e.target.dataset.c)});
  draw("all");
},
booking(){
  const id=new URLSearchParams(location.search).get("id");
  const sel=$("#event");
  sel.innerHTML=EVENTS.map(e=>`<option value="${e.id}">${t("booking.eventOption",{title:evTitle(e),city:evCity(e)})}</option>`).join("");
  if(byId(id))sel.value=id;
  $("#seat").innerHTML=Object.keys(SEATS).map(k=>`<option value="${k}">${seatName(k)}</option>`).join("");
  let qty=2;
  const draw=()=>{
    const b={eventId:+sel.value,seat:$("#seat").value,qty},e=byId(b.eventId);
    $("#qty").textContent=qty;
    $("#date").textContent=t("card.meta",{city:evCity(e),date:fmtDate(e.date)});
    $("#tickets").textContent=t("booking.tickets",{count:qty});
    $("#unit").textContent=t("booking.unit",{price:money(e.price*SEATS[b.seat].mult),qty});
    $("#fees").textContent=money(FEE*qty);
    $("#total").textContent=money(total(b));
    return b;
  };
  $("#minus").onclick=()=>{qty=Math.max(1,qty-1);draw()};
  $("#plus").onclick=()=>{qty=Math.min(10,qty+1);draw()};
  sel.onchange=$("#seat").onchange=draw;
  $("#go").onclick=()=>{set("booking",draw());location.href="checkout.html"};
  draw();
},
checkout(){
  const b=get("booking");
  if(!b){$("#content").innerHTML=emptyPanel("checkout.empty");return}
  const e=byId(b.eventId);
  $("#summary").innerHTML=`<h3>${evTitle(e)}</h3><div class="meta">${t("card.meta",{city:evCity(e),date:fmtDate(e.date)})}</div><div class="sum"><div><span>${t("checkout.line",{seat:seatName(b.seat),qty:b.qty})}</span><span>${money(e.price*SEATS[b.seat].mult*b.qty)}</span></div><div><span>${t("booking.fees")}</span><span>${money(FEE*b.qty)}</span></div><div class="total"><span>${t("booking.total")}</span><span>${money(total(b))}</span></div></div>`;
  $("#form").addEventListener("submit",ev=>{
    ev.preventDefault();
    const code="TK-"+Math.random().toString(36).slice(2,8).toUpperCase();
    set("order",{...b,code,name:$("#name").value,email:$("#email").value,total:total(b)});
    location.href="confirmation.html";
  });
},
confirmation(){
  const o=get("order");
  if(!o){$("#content").innerHTML=emptyPanel("confirm.empty");return}
  const e=byId(o.eventId);
  $("#content").innerHTML=`<div class="ticket"><div class="ok">✓</div><h2>${t("confirm.heading",{name:esc(o.name)})}</h2><p class="meta">${t("confirm.sent",{email:esc(o.email)})}</p><h3>${e.icon} ${evTitle(e)}</h3><p>${t("card.meta",{city:evCity(e),date:fmtDate(e.date)})}<br>${t("confirm.line",{tickets:t("booking.tickets",{count:o.qty}),seat:seatName(o.seat)})}</p><div class="code">${o.code}</div><p class="meta">${t("confirm.note",{total:money(o.total)})}</p><a class="btn" href="events.html">${t("confirm.more")}</a></div>`;
},
};
document.addEventListener("DOMContentLoaded",()=>{const p=document.body.dataset.page;pages[p]&&pages[p]()});
