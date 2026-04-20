(function(){
  const c=document.getElementById('star-canvas');
  const x=c.getContext('2d');
  let S=[];
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;}
  function init(){S=[];for(let i=0;i<150;i++)S.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.1+0.2,a:Math.random(),d:Math.random()*0.004+0.001,ph:Math.random()*Math.PI*2});}
  function draw(){x.clearRect(0,0,c.width,c.height);S.forEach(s=>{s.ph+=s.d;const a=s.a*(0.5+0.5*Math.sin(s.ph));x.beginPath();x.arc(s.x,s.y,s.r,0,Math.PI*2);x.fillStyle='rgba(0,212,170,'+a+')';x.fill();});requestAnimationFrame(draw);}
  resize();init();draw();
  window.addEventListener('resize',()=>{resize();init();});
})();

function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem('aak-theme',t);
  document.querySelectorAll('.theme-btn').forEach((b,i)=>{b.classList.toggle('active',['dark','light','terminal'][i]===t);});
}
(function(){setTheme(localStorage.getItem('aak-theme')||'dark');})();

(function(){
  const phrases=['Systems Architect','Low-Level Developer','AI Systems Builder','Memory Allocator Author','Competitive Programmer'];
  let pi=0,ci=0,del=false;
  const el=document.getElementById('typewriter');
  function tick(){
    const ph=phrases[pi];
    if(!del){el.textContent=ph.slice(0,ci+1);ci++;if(ci===ph.length){setTimeout(()=>{del=true;},1800);setTimeout(tick,1860);return;}
    }else{el.textContent=ph.slice(0,ci-1);ci--;if(ci===0){del=false;pi=(pi+1)%phrases.length;}}
    setTimeout(tick,del?42:82);
  }
  setTimeout(tick,1200);
})();

function updateUptime(){
  const d=Math.floor((new Date()-new Date('2024-08-01'))/(864e5));
  const el=document.getElementById('uptime-val');
  if(el)el.textContent=d+' days';
}
updateUptime();

const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

window.addEventListener('scroll',()=>{
  const secs=['about','skills','projects','achievements','research','github'];
  const sy=window.scrollY+80;
  secs.forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    const lk=document.querySelector('.nav-link[href="#'+id+'"]');
    if(lk)lk.classList.toggle('active',sy>=el.offsetTop&&sy<el.offsetTop+el.offsetHeight);
  });
});

let curLayout='grid';
function setLayout(l){
  curLayout=l;
  document.getElementById('btn-grid').classList.toggle('active',l==='grid');
  document.getElementById('btn-list').classList.toggle('active',l==='list');
  const g=document.getElementById('pgrid');
  const ls=document.getElementById('plist');
  if(g&&ls){g.style.display=l==='grid'?'grid':'none';ls.style.display=l==='list'?'flex':'none';}
}

const langColors={'C++':'#f34b7d','C':'#555555','Python':'#3572A5','JavaScript':'#f1e05a','TypeScript':'#2b7489','HTML':'#e34c26','CSS':'#563d7c','Go':'#00ADD8','Rust':'#dea584','Shell':'#89e051','Lua':'#000080'};
function lc(lang){return langColors[lang]||'#8b949e';}
function timeAgo(d){
  const s=Math.floor((new Date()-new Date(d))/1000);
  if(s<60)return 'just now';
  if(s<3600)return Math.floor(s/60)+'m ago';
  if(s<86400)return Math.floor(s/3600)+'h ago';
  if(s<2592000)return Math.floor(s/86400)+'d ago';
  return Math.floor(s/2592000)+'mo ago';
}
function picon(lang){
  const m={'C++':'&#9881;','C':'&#9889;','Python':'&#9643;','JavaScript':'&#10022;','TypeScript':'&#9670;','HTML':'&#9673;','CSS':'&#9673;','Go':'&#9672;','Rust':'&#9840;','Shell':'&#9654;'};
  return m[lang]||'&#9702;';
}

let allRepos=[];let curFilter='all';

async function fetchGitHub(){
  const u='Za-Coding-Paradox';
  const h={'Accept':'application/vnd.github.v3+json'};
  try{
    const r=await fetch('https://api.github.com/users/'+u+'/repos?per_page=100&sort=updated',{headers:h});
    if(!r.ok)throw new Error('API '+r.status);
    allRepos=await r.json();
    document.getElementById('stat-repos').textContent=allRepos.length;
    const ts=allRepos.reduce((a,r)=>a+r.stargazers_count,0);
    document.getElementById('stat-stars').textContent=ts;
    renderProjects(allRepos);
    renderTopRepos(allRepos.slice().sort((a,b)=>b.stargazers_count-a.stargazers_count).slice(0,5));
    fetchEvents(u,h);
  }catch(err){
    console.warn('GitHub API:',err);
    renderFallback();
  }
  buildHeatmap();
}

function renderProjects(repos){
  const fil=curFilter==='all'?repos:repos.filter(r=>(r.language||'').toLowerCase()===curFilter.toLowerCase());
  const c=document.getElementById('projects-container');
  
  let g='<div id="pgrid" class="proj-grid" style="display:grid;">';
  fil.forEach(r=>{
    const col=lc(r.language);
    const desc=(r.description||'No description provided.');
    const shortDesc=desc.length>110?desc.slice(0,110)+'&#8230;':desc;
    g+='<div class="pcard" onmousemove="setGlow(this,event)">';
    g+='<div class="pcard-top"><div class="picon">'+picon(r.language)+'</div><div class="plinks">';
    g+='<a href="'+r.html_url+'" target="_blank" rel="noopener" class="plink" title="GitHub">&#9955;</a>';
    if(r.homepage)g+='<a href="'+r.homepage+'" target="_blank" rel="noopener" class="plink" title="Live">&#8599;</a>';
    g+='</div></div>';
    g+='<div class="pname">'+r.name+'</div>';
    g+='<div class="pdesc">'+shortDesc+'</div>';
    g+='<div class="pfooter">';
    if(r.language)g+='<span class="ldot"><span class="lcirc" style="background:'+col+'"></span>'+r.language+'</span>';
    g+='<span class="pstars">&#9733; '+r.stargazers_count+'</span>';
    g+='<span class="pupdated">'+timeAgo(r.updated_at)+'</span>';
    g+='</div></div>';
  });
  g+='</div>';

  let l='<div id="plist" class="proj-list" style="display:none;">';
  fil.forEach((r,i)=>{
    const col=lc(r.language);
    l+='<div class="pli">';
    l+='<span class="pli-idx">'+(i+1<10?'0'+(i+1):i+1)+'</span>';
    l+='<span class="pli-name">'+r.name+'</span>';
    l+='<span class="pli-desc">'+((r.description||'&#8212;').slice(0,75))+'</span>';
    l+='<span class="pli-meta">';
    if(r.language)l+='<span style="display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:'+col+';flex-shrink:0;"></span>'+r.language+'</span>';
    l+='<span>&#9733; '+r.stargazers_count+'</span>';
    l+='</span></div>';
  });
  l+='</div>';
  
  c.innerHTML=g+l;
  setLayout(curLayout);

  document.querySelectorAll('.ftab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      curFilter=btn.dataset.filter;
      document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(allRepos);
    });
  });
}

function setGlow(card,e){
  const rect=card.getBoundingClientRect();
  card.style.setProperty('--mx',((e.clientX-rect.left)/rect.width*100)+'%');
  card.style.setProperty('--my',((e.clientY-rect.top)/rect.height*100)+'%');
}

function renderTopRepos(repos){
  const el=document.getElementById('top-repos');
  el.innerHTML=repos.map(r=>{
    const lb=r.language?'<span style="font-size:10px;padding:2px 7px;border-radius:4px;background:var(--accd);color:var(--acc);">'+r.language+'</span>':'';
    return '<div class="rcard2"><div class="rname"><span>'+r.name+'</span>'+lb+'</div><div class="rdesc">'+((r.description||'No description.').slice(0,72))+'</div><div class="rmeta2"><span>&#9733; '+r.stargazers_count+'</span><span>&#9335; '+r.forks_count+'</span><span>'+timeAgo(r.updated_at)+'</span></div></div>';
  }).join('');
}

async function fetchEvents(u,h){
  try{
    const r=await fetch('https://api.github.com/users/'+u+'/events/public?per_page=8',{headers:h});
    if(!r.ok)throw new Error();
    const evts=await r.json();
    const icons={PushEvent:'&#9654;',CreateEvent:'&#10022;',WatchEvent:'&#9733;',ForkEvent:'&#9335;',IssuesEvent:'&#9673;',PullRequestEvent:'&#8635;',DeleteEvent:'&#10005;'};
    const el=document.getElementById('recent-events');
    el.innerHTML=evts.slice(0,6).map(e=>{
      const ic=icons[e.type]||'&#9702;';
      const rn=e.repo.name.split('/')[1];
      let txt='';
      if(e.type==='PushEvent'){const n=e.payload.commits?e.payload.commits.length:0;txt='Pushed <strong>'+n+' commit'+(n!==1?'s':'')+'</strong> to '+rn;}
      else if(e.type==='CreateEvent')txt='Created '+e.payload.ref_type+' in <strong>'+rn+'</strong>';
      else if(e.type==='WatchEvent')txt='Starred <strong>'+rn+'</strong>';
      else txt='<strong>'+e.type.replace('Event','')+'</strong> on '+rn;
      return '<div class="evt"><span class="evtico" style="color:var(--acc)">'+ic+'</span><span class="evttxt">'+txt+'</span><span class="evttime">'+timeAgo(e.created_at)+'</span></div>';
    }).join('');
  }catch{
    document.getElementById('recent-events').innerHTML='<div style="padding:12px 0;font-family:var(--font-mono);font-size:11px;color:var(--t3);">Activity feed unavailable.</div>';
  }
}

function buildHeatmap(){
  const g=document.getElementById('heatmap-grid');
  let h='';
  for(let w=0;w<26;w++){
    h+='<div class="hwk">';
    for(let d=0;d<7;d++){
      const lv=Math.random()<0.38?0:Math.floor(Math.random()*4)+1;
      h+='<div class="hcell h'+lv+'" title="Commit activity"></div>';
    }
    h+='</div>';
  }
  g.innerHTML=h;
}

function renderFallback(){
  allRepos=[
    {name:'Custom_Memory_Allocator',description:'High-performance custom memory allocator with lock-free handle system and cache-line-optimized pool architecture.',language:'C++',stargazers_count:0,forks_count:0,updated_at:new Date().toISOString(),html_url:'https://github.com/Za-Coding-Paradox',homepage:''},
    {name:'AI-Path-Finder-Visualizer',description:'Interactive visualization engine for pathfinding algorithms including A*, Dijkstra, BFS and DFS with real-time rendering.',language:'Python',stargazers_count:0,forks_count:0,updated_at:new Date().toISOString(),html_url:'https://github.com/Za-Coding-Paradox',homepage:''},
    {name:'AuraLM',description:'A language model runtime with context isolation architecture. Each inference session runs in a sandboxed memory arena.',language:'C++',stargazers_count:0,forks_count:0,updated_at:new Date().toISOString(),html_url:'https://github.com/Za-Coding-Paradox',homepage:''},
  ];
  renderProjects(allRepos);
  renderTopRepos(allRepos);
  buildHeatmap();
}

const cmdItems=[
  {icon:'&#9672;',name:'hero',hint:'Go to top / intro',act:()=>gto('#hero')},
  {icon:'&#9702;',name:'about',hint:'About Abdullah',act:()=>gto('#about')},
  {icon:'&#9881;',name:'skills',hint:'Technical Arsenal',act:()=>gto('#skills')},
  {icon:'&#9638;',name:'projects',hint:'GitHub Projects',act:()=>gto('#projects')},
  {icon:'&#127942;',name:'achievements',hint:"Dean's List + Code Clash",act:()=>gto('#achievements')},
  {icon:'&#9673;',name:'research',hint:'System design articles',act:()=>gto('#research')},
  {icon:'&#9335;',name:'github',hint:'Live GitHub Dashboard',act:()=>gto('#github')},
  {icon:'&#9679;',name:'dark mode',hint:'Switch to dark theme',act:()=>setTheme('dark')},
  {icon:'&#9728;',name:'light mode',hint:'Switch to light theme',act:()=>setTheme('light')},
  {icon:'&#9889;',name:'terminal mode',hint:'Pywal terminal theme',act:()=>setTheme('terminal')},
  {icon:'&#9993;',name:'email',hint:'Abdullah.Ahmad.Khan.Professional@gmail.com',act:()=>window.open('mailto:Abdullah.Ahmad.Khan.Professional@gmail.com')},
  {icon:'&#9955;',name:'github profile',hint:'Za-Coding-Paradox',act:()=>window.open('https://github.com/Za-Coding-Paradox','_blank')},
];

function gto(id){
  const el=document.querySelector(id);
  if(el)el.scrollIntoView({behavior:'smooth'});
  closeCmd();
}

let cmdSel=0,filtCmds=cmdItems;

function openCmd(){
  document.getElementById('cmd-overlay').classList.add('open');
  document.getElementById('cmd-input').value='';
  filtCmds=cmdItems;cmdSel=0;renderCmdRes();
  setTimeout(()=>document.getElementById('cmd-input').focus(),50);
}
function closeCmd(){document.getElementById('cmd-overlay').classList.remove('open');}
function closeCmdOuter(e){if(e.target===document.getElementById('cmd-overlay'))closeCmd();}

document.getElementById('cmd-input').addEventListener('input',function(){
  const q=this.value.toLowerCase();
  filtCmds=cmdItems.filter(i=>i.name.includes(q)||i.hint.toLowerCase().includes(q));
  cmdSel=0;renderCmdRes();
});
document.getElementById('cmd-input').addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'){e.preventDefault();cmdSel=Math.min(cmdSel+1,filtCmds.length-1);renderCmdRes();}
  else if(e.key==='ArrowUp'){e.preventDefault();cmdSel=Math.max(cmdSel-1,0);renderCmdRes();}
  else if(e.key==='Enter'&&filtCmds[cmdSel])filtCmds[cmdSel].act();
  else if(e.key==='Escape')closeCmd();
});
function renderCmdRes(){
  const el=document.getElementById('cmd-results');
  if(!filtCmds.length){el.innerHTML='<div style="padding:20px;text-align:center;font-family:var(--font-mono);font-size:12px;color:var(--t3);">No results found.</div>';return;}
  el.innerHTML='<div class="cmd-sec-lbl">Navigation &amp; Actions</div>'+
  filtCmds.map((item,i)=>'<div class="ci'+(i===cmdSel?' sel':'')+'" onclick="filtCmds['+i+'].act()" role="option" aria-selected="'+(i===cmdSel)+'"><div class="ci-icon">'+item.icon+'</div><div class="ci-txt"><div class="ci-name">'+item.name+'</div><div class="ci-hint">'+item.hint+'</div></div>'+(i===cmdSel?'<span class="ci-enter">&#8629;</span>':'')+'</div>').join('');
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openCmd();}
  if(e.key==='Escape'&&document.getElementById('cmd-overlay').classList.contains('open'))closeCmd();
});

fetchGitHub();