const EVENTS=[
{id:1,title:"Neon Nights Festival",cat:"Music",city:"Austin",date:"2026-11-14",price:89,icon:"🎸",bg:"#ffe3ec"},
{id:2,title:"City Lights Orchestra",cat:"Music",city:"Boston",date:"2026-11-21",price:55,icon:"🎻",bg:"#e6ecff"},
{id:3,title:"Hamilton Heights",cat:"Theatre",city:"New York",date:"2026-12-02",price:120,icon:"🎭",bg:"#fff1d6"},
{id:4,title:"The Midnight Mystery",cat:"Theatre",city:"Chicago",date:"2026-12-09",price:48,icon:"🕵️",bg:"#e9e3ff"},
{id:5,title:"Derby Night: Rovers vs. United",cat:"Sports",city:"Manchester",date:"2026-11-30",price:70,icon:"⚽",bg:"#dcf5e6"},
{id:6,title:"Playoff Finals Game 1",cat:"Sports",city:"Denver",date:"2026-12-12",price:95,icon:"🏀",bg:"#ffe8d9"},
{id:7,title:"Laugh Out Loud Tour",cat:"Comedy",city:"Seattle",date:"2026-11-18",price:40,icon:"🎤",bg:"#fff6c9"},
{id:8,title:"Stand-Up Saturday",cat:"Comedy",city:"Portland",date:"2026-12-05",price:32,icon:"😂",bg:"#d9f3f7"}
];
const SEATS={general:{name:"General admission",mult:1},premium:{name:"Premium",mult:1.6},vip:{name:"VIP",mult:2.5}};
const FEE=4.5;
const $=s=>document.querySelector(s);
const money=n=>"$"+n.toFixed(2);
const fmtDate=d=>new Date(d+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});
const get=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const byId=id=>EVENTS.find(e=>e.id==id);
const total=b=>{const e=byId(b.eventId);return e.price*SEATS[b.seat].mult*b.qty+FEE*b.qty};

function card(e){return `<article class="card"><div class="img" style="background:${e.bg}">${e.icon}</div><div class="body"><span class="tag">${e.cat}</span><h3>${e.title}</h3><div class="meta">${e.city} · ${fmtDate(e.date)}</div><div class="price">From ${money(e.price)}</div><a class="btn" href="booking.html?id=${e.id}">Book now</a></div></article>`}

const pages={
home(){ $("#featured").innerHTML=EVENTS.slice(0,4).map(card).join("") },
events(){
  const cats=["All",...new Set(EVENTS.map(e=>e.cat))];
  const f=$("#filters"),g=$("#list");
  const draw=c=>{
    f.innerHTML=cats.map(x=>`<button class="chip ${x===c?"on":""}" data-c="${x}">${x}</button>`).join("");
    g.innerHTML=EVENTS.filter(e=>c==="All"||e.cat===c).map(card).join("");
  };
  f.addEventListener("click",e=>{if(e.target.dataset.c)draw(e.target.dataset.c)});
  draw("All");
},
booking(){
  const id=new URLSearchParams(location.search).get("id");
  const sel=$("#event");
  sel.innerHTML=EVENTS.map(e=>`<option value="${e.id}">${e.title} — ${e.city}</option>`).join("");
  if(byId(id))sel.value=id;
  $("#seat").innerHTML=Object.entries(SEATS).map(([k,s])=>`<option value="${k}">${s.name}</option>`).join("");
  let qty=2;
  const draw=()=>{
    const b={eventId:+sel.value,seat:$("#seat").value,qty},e=byId(b.eventId);
    $("#qty").textContent=qty;
    $("#date").textContent=e.city+" · "+fmtDate(e.date);
    $("#unit").textContent=money(e.price*SEATS[b.seat].mult)+" × "+qty;
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
  if(!b){$("#content").innerHTML='<div class="panel empty"><p>No tickets chosen yet.</p><a class="btn" href="events.html">Browse events</a></div>';return}
  const e=byId(b.eventId);
  $("#summary").innerHTML=`<h3>${e.title}</h3><div class="meta">${e.city} · ${fmtDate(e.date)}</div><div class="sum"><div><span>${SEATS[b.seat].name} × ${b.qty}</span><span>${money(e.price*SEATS[b.seat].mult*b.qty)}</span></div><div><span>Service fees</span><span>${money(FEE*b.qty)}</span></div><div class="total"><span>Total</span><span>${money(total(b))}</span></div></div>`;
  $("#form").addEventListener("submit",ev=>{
    ev.preventDefault();
    const code="TK-"+Math.random().toString(36).slice(2,8).toUpperCase();
    set("order",{...b,code,name:$("#name").value,email:$("#email").value,total:total(b)});
    location.href="confirmation.html";
  });
},
confirmation(){
  const o=get("order");
  if(!o){$("#content").innerHTML='<div class="panel empty"><p>No order found.</p><a class="btn" href="events.html">Browse events</a></div>';return}
  const e=byId(o.eventId);
  $("#content").innerHTML=`<div class="ticket"><div class="ok">✓</div><h2>You're going, ${o.name.split(" ")[0]}!</h2><p class="meta">We sent a confirmation to ${o.email}</p><h3>${e.icon} ${e.title}</h3><p>${e.city} · ${fmtDate(e.date)}<br>${o.qty} × ${SEATS[o.seat].name}</p><div class="code">${o.code}</div><p class="meta">Show this code at the door. Total paid: ${money(o.total)}</p><a class="btn" href="events.html">Book more events</a></div>`;
},
};
document.addEventListener("DOMContentLoaded",()=>{const p=document.body.dataset.page;pages[p]&&pages[p]()});
