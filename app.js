const sampleReports = [
  {id:'RW-2048',location:'River Street, beside Central Park',type:'Pothole',severity:'High',status:'Open',date:'Today · 9:42 AM',description:'A deep pothole in the left lane is difficult to spot after rain.',support:18,icon:'◉'},
  {id:'RW-2047',location:'Market Road, near City Library',type:'Cracked pavement',severity:'Medium',status:'In progress',date:'Today · 8:15 AM',description:'Long cracks are spreading across the pavement near the crossing.',support:12,icon:'⌁'},
  {id:'RW-2044',location:'Lake Avenue, opposite Bus Stop 4',type:'Waterlogging',severity:'Medium',status:'Open',date:'Yesterday · 5:30 PM',description:'Water collects in a damaged section of the road after rainfall.',support:9,icon:'≈'},
  {id:'RW-2039',location:'Oak Lane, at the school entrance',type:'Damaged road edge',severity:'High',status:'In progress',date:'Yesterday · 1:05 PM',description:'The road edge has broken away near the pedestrian entrance.',support:21,icon:'⌑'},
  {id:'RW-2032',location:'Garden Street, outside No. 18',type:'Pothole',severity:'Low',status:'Resolved',date:'10 Nov · 11:20 AM',description:'A small pothole was filled and the surface has been levelled.',support:7,icon:'◉'},
  {id:'RW-2028',location:'East Park Road, near the roundabout',type:'Cracked pavement',severity:'Low',status:'Resolved',date:'9 Nov · 4:10 PM',description:'A cracked patch on the approach to the roundabout was repaired.',support:5,icon:'⌁'}
];
const storageKey = 'roadwatch-community-reports-v1';
let reports = readSavedReports();
let selectedFilter = 'all';
let showAll = false;
const reportList = document.querySelector('#report-list');
const emptyState = document.querySelector('#empty-state');
const modal = document.querySelector('#report-modal');
const form = document.querySelector('#report-form');
const toast = document.querySelector('#toast');

function readSavedReports(){try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');return [...saved,...sampleReports]}catch{return [...sampleReports]}}
function saveReports(){try{localStorage.setItem(storageKey,JSON.stringify(reports.filter(r=>r.local).slice(0,24)))}catch{showToast('Browser storage is unavailable; this report may not persist after refresh.') }}
function iconClass(type){if(type.includes('Cracked'))return'crack';if(type.includes('Water'))return'water';if(type.includes('edge'))return'edge';if(type.includes('Other'))return'other';return'pothole'}
function statusClass(status){return status==='In progress'?'progress':status==='Resolved'?'resolved':'open'}
function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderReports(){
  const query=document.querySelector('#report-search').value.trim().toLowerCase();
  const filtered=reports.filter(r=>(selectedFilter==='all'||r.status===selectedFilter)&&(`${r.location} ${r.type} ${r.description}`).toLowerCase().includes(query));
  const visible=showAll?filtered:filtered.slice(0,6);
  reportList.innerHTML=visible.map(r=>`<article class="report-card" data-id="${escapeText(r.id)}"><div class="issue-icon ${iconClass(r.type)}" aria-hidden="true">${r.icon||'◉'}</div><div class="issue-main"><h3>${escapeText(r.location)}</h3><p>${escapeText(r.description)}</p><div class="issue-meta"><span class="issue-type">${escapeText(r.type)}</span><span>${escapeText(r.date)}</span><span>${escapeText(r.id)}</span></div></div><div class="issue-actions"><span class="issue-status ${statusClass(r.status)}">${escapeText(r.status)}</span><button class="support-button ${r.supported?'supported':''}" data-support="${escapeText(r.id)}" ${r.supported?'disabled':''} aria-label="Support this report">♡ ${r.support}</button></div></article>`).join('');
  emptyState.hidden=visible.length>0;
  document.querySelector('#count-all').textContent=String(reports.length).padStart(2,'0');
  document.querySelector('#load-more').hidden=filtered.length<=6||showAll;
  updateStats();
}
function updateStats(){const local=reports.filter(r=>r.local).length;document.querySelector('#stat-total').textContent=128+local;document.querySelector('#stat-open').textContent=34+reports.filter(r=>r.local&&r.status!=='Resolved').length;document.querySelector('#stat-resolved').textContent=76+reports.filter(r=>r.local&&r.status==='Resolved').length}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),3100)}
function openModal(){modal.hidden=false;document.body.style.overflow='hidden';setTimeout(()=>form.elements.location.focus(),50)}
function closeModal(){modal.hidden=true;document.body.style.overflow='';form.reset();document.querySelector('#photo-button').textContent='Choose photo'}
document.querySelectorAll('[data-open-report]').forEach(button=>button.addEventListener('click',openModal));
document.querySelector('.modal-close').addEventListener('click',closeModal);
modal.addEventListener('click',event=>{if(event.target===modal)closeModal()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)closeModal()});
document.querySelectorAll('.filter-tab').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter-tab').forEach(tab=>tab.classList.remove('selected'));button.classList.add('selected');selectedFilter=button.dataset.filter;showAll=true;renderReports()}));
document.querySelector('#report-search').addEventListener('input',()=>{showAll=true;renderReports()});
document.querySelector('#load-more').addEventListener('click',()=>{showAll=true;renderReports()});
reportList.addEventListener('click',event=>{const button=event.target.closest('[data-support]');if(!button)return;const report=reports.find(r=>r.id===button.dataset.support);if(report){report.support+=1;report.supported=true;saveReports();renderReports();showToast('Thanks for supporting this community report.')}});
document.querySelector('#photo-button').addEventListener('click',()=>document.querySelector('#photo-input').click());
document.querySelector('#photo-input').addEventListener('change',event=>{if(event.target.files[0])document.querySelector('#photo-button').textContent='Photo selected'});
form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const report={id:`RW-${Math.floor(2050+Math.random()*7000)}`,location:data.get('location').trim(),type:data.get('type'),severity:data.get('severity'),status:'Open',date:'Just now',description:data.get('description').trim(),support:0,icon:data.get('type').includes('Water')?'≈':data.get('type').includes('Cracked')?'⌁':'◉',local:true};reports.unshift(report);saveReports();selectedFilter='all';showAll=true;document.querySelectorAll('.filter-tab').forEach(tab=>tab.classList.toggle('selected',tab.dataset.filter==='all'));renderReports();closeModal();document.querySelector('#reports').scrollIntoView({behavior:'smooth',block:'start'});showToast(`Report ${report.id} added to this browser's demo list.`)});
document.querySelector('.mobile-menu').addEventListener('click',event=>{const button=event.currentTarget;const nav=document.querySelector('.main-nav');const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('.main-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('.main-nav').classList.remove('open');document.querySelector('.mobile-menu').setAttribute('aria-expanded','false')}));
renderReports();
