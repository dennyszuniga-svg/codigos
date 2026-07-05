const CONFIG={url:'https://uibiwhkxlyxdfytvudbn.supabase.co',key:'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'};
const client=window.supabase.createClient(CONFIG.url,CONFIG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=id=>document.getElementById(id);let session=null,profile=null,sites=[],shifts=[],people=[],qrTimer=null,qrSeconds=0,scannerStream=null,scannerFrame=null,markType='entrada';
const siteName=id=>sites.find(site=>site.codigo===id)?.nombre||id;
const dateIso=date=>{const copy=new Date(date);copy.setMinutes(copy.getMinutes()-copy.getTimezoneOffset());return copy.toISOString().slice(0,10)};
const mondayOf=value=>{const date=new Date(`${value||dateIso(new Date())}T12:00:00`);const day=date.getDay()||7;date.setDate(date.getDate()-day+1);return date};
const addDays=(date,days)=>{const next=new Date(date);next.setDate(next.getDate()+days);return next};
const formatDate=value=>new Date(`${value}T12:00:00`).toLocaleDateString('es-PE',{weekday:'short',day:'2-digit',month:'2-digit'});
const formatDateTime=value=>value?new Date(value).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'}):'-';
const clear=node=>{while(node?.firstChild)node.firstChild.remove()};
function status(message,error=false){$('attendanceStatus').textContent=message;$('attendanceStatus').style.color=error?'#b42318':'#607184'}
function option(text,value){const item=document.createElement('option');item.textContent=text;item.value=value;return item}
function isManager(){return ['encargado_ti','admin'].includes(profile?.rol)}
function allowedSites(){return profile?.rol==='encargado_ti'?sites:sites.filter(site=>site.codigo===profile?.sede)}
function fillSiteSelect(select,preferred=''){clear(select);allowedSites().forEach(site=>select.appendChild(option(site.nombre,site.codigo)));if([...select.options].some(item=>item.value===preferred))select.value=preferred}

async function init(){
 const {data:{session:current}}=await client.auth.getSession();session=current;if(!session?.user){location.replace('index.html');return}
 const {data,error}=await client.from('profiles').select('id,nombre,rol,sede,activo').eq('id',session.user.id).single();
 if(error||!data?.activo){location.replace('index.html');return}profile=data;
 const [siteResult,shiftResult]=await Promise.all([client.from('asistencia_sedes').select('*').eq('activa',true).order('nombre'),client.from('asistencia_turnos').select('*').eq('activo',true).order('hora_inicio')]);
 if(siteResult.error||shiftResult.error){status('No se pudo cargar la configuracion de asistencia.',true);return}
 sites=siteResult.data||[];shifts=shiftResult.data||[];$('attendanceUser').textContent=`${profile.nombre} - ${profile.rol}`;$('attendanceApp').hidden=false;
 if(['anfitrion','tecnico','supervisor'].includes(profile.rol)){$('workerPanel').hidden=false;await loadWorker()}
 if(isManager()){$('adminPanel').hidden=false;['qrSite','scheduleSite','summarySite'].forEach(id=>fillSiteSelect($(id),profile.rol==='encargado_ti'?'puruchuco':profile.sede));$('scheduleWeek').value=dateIso(mondayOf());$('summaryMonth').value=dateIso(new Date()).slice(0,7);await loadSchedule()}
 status('Asistencia lista.');
}

async function loadWorker(){
 const start=mondayOf(),end=addDays(start,6),today=dateIso(new Date());
 const [{data:schedule,error},{data:records}]=await Promise.all([
  client.from('asistencia_programacion').select('id,sede,fecha,estado,asistencia_turnos(*)').eq('user_id',session.user.id).gte('fecha',dateIso(start)).lte('fecha',dateIso(end)).order('fecha'),
  client.from('asistencia_registros').select('*').eq('user_id',session.user.id).gte('fecha_laboral',dateIso(start)).lte('fecha_laboral',dateIso(end))
 ]);
 if(error){status('No se pudo cargar tu programacion.',true);return}const week=$('workerWeek');clear(week);const map=new Map((schedule||[]).map(item=>[item.fecha,item]));const recordMap=new Map((records||[]).map(item=>[item.fecha_laboral,item]));
 for(let i=0;i<7;i++){const date=dateIso(addDays(start,i)),item=map.get(date),record=recordMap.get(date);const card=document.createElement('article');card.className='week-item';const title=document.createElement('strong');const detail=document.createElement('span');title.textContent=formatDate(date);detail.textContent=item?.estado==='programado'?`${item.asistencia_turnos?.nombre||'Turno'} - ${siteName(item.sede)}${record?` | Entrada ${formatDateTime(record.entrada_at)} | Salida ${formatDateTime(record.salida_at)}`:''}`:item?item.estado:'Sin programacion';card.append(title,detail);week.appendChild(card)}
 const todaySchedule=map.get(today);const todayRecord=recordMap.get(today)||(records||[]).find(item=>!item.salida_at);const box=$('todayShift');clear(box);const strong=document.createElement('strong'),text=document.createElement('span');
 strong.textContent=todaySchedule?.estado==='programado'?(todaySchedule.asistencia_turnos?.nombre||'Turno programado'):'Sin turno programado hoy';text.textContent=todaySchedule?.estado==='programado'?`${siteName(todaySchedule.sede)} | Refrigerio ${todaySchedule.asistencia_turnos?.refrigerio_minutos||0} min${todaySchedule.asistencia_turnos?.es_nocturno?' | Turno nocturno':''}`:'Solicita al administrador que programe tu semana.';box.append(strong,text);
 $('markEntry').disabled=!todaySchedule||todaySchedule.estado!=='programado'||Boolean(todayRecord?.entrada_at);$('markExit').disabled=!todayRecord?.entrada_at||Boolean(todayRecord?.salida_at);
}

function switchTab(name){document.querySelectorAll('[data-attendance-tab]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.attendanceTab===name)));document.querySelectorAll('[data-attendance-view]').forEach(view=>view.hidden=view.dataset.attendanceView!==name)}
async function generateQr(){
 const site=$('qrSite').value;if(!site)return;const {data,error}=await client.functions.invoke('attendance-qr',{body:{action:'generate',site}});if(error||data?.error){status(data?.error||'No se pudo generar el QR.',true);return}
 const container=$('qrCode');clear(container);new QRCode(container,{text:data.token,width:280,height:280,correctLevel:QRCode.CorrectLevel.M});$('qrSiteName').textContent=data.site.nombre;qrSeconds=55;updateQrCountdown();
}
function updateQrCountdown(){$('qrCountdown').textContent=qrTimer?`Renovacion en ${qrSeconds} s`:'QR detenido'}
async function startQr(){stopQr();await generateQr();qrTimer=setInterval(async()=>{qrSeconds-=1;if(qrSeconds<=0)await generateQr();else updateQrCountdown()},1000)}
function stopQr(){if(qrTimer)clearInterval(qrTimer);qrTimer=null;qrSeconds=0;updateQrCountdown()}

async function loadSchedule(){
 const site=$('scheduleSite').value;if(!site)return;status('Cargando programacion...');const start=mondayOf($('scheduleWeek').value);$('scheduleWeek').value=dateIso(start);const end=addDays(start,6);
 const [{data:staff,error:staffError},{data:scheduled,error:scheduleError}]=await Promise.all([client.rpc('listar_personal_asistencia',{sede_arg:site}),client.from('asistencia_programacion').select('*').eq('sede',site).gte('fecha',dateIso(start)).lte('fecha',dateIso(end))]);
 if(staffError||scheduleError){status('No se pudo cargar la semana.',true);return}people=staff||[];const map=new Map((scheduled||[]).map(item=>[`${item.user_id}:${item.fecha}`,item]));const grid=$('scheduleGrid');clear(grid);
 people.forEach(person=>{const card=document.createElement('article');card.className='schedule-person';const heading=document.createElement('h3');heading.textContent=`${person.nombre} - ${person.rol}`;const days=document.createElement('div');days.className='schedule-days';
  for(let i=0;i<7;i++){const date=dateIso(addDays(start,i)),saved=map.get(`${person.id}:${date}`);const label=document.createElement('label');label.className='schedule-day';label.textContent=formatDate(date);const select=document.createElement('select');select.dataset.userId=person.id;select.dataset.date=date;select.append(option('Sin asignar',''),option('Descanso','descanso'),option('Libre','libre'));shifts.forEach(shift=>select.append(option(shift.nombre,`turno:${shift.id}`)));select.value=saved?.estado==='programado'?`turno:${saved.turno_id}`:(saved?.estado||'');label.appendChild(select);days.appendChild(label)}card.append(heading,days);grid.appendChild(card)});
 status(`Semana cargada: ${people.length} trabajadores.`);
}
async function saveSchedule(){const site=$('scheduleSite').value;const items=[...document.querySelectorAll('#scheduleGrid select[data-user-id]')].filter(select=>select.value).map(select=>({user_id:select.dataset.userId,sede:site,fecha:select.dataset.date,estado:select.value.startsWith('turno:')?'programado':select.value,turno_id:select.value.startsWith('turno:')?select.value.split(':')[1]:null}));if(!items.length){status('Selecciona al menos un turno o descanso.',true);return}const {data,error}=await client.rpc('guardar_programacion_asistencia',{items_arg:items});if(error){status(error.message||'No se pudo guardar la semana.',true);return}status(`${data} asignaciones guardadas.`);await loadSchedule()}

async function loadSummary(){const site=$('summarySite').value,month=$('summaryMonth').value;if(!site||!month)return;const start=`${month}-01`,endDate=new Date(`${start}T12:00:00`);endDate.setMonth(endDate.getMonth()+1);const end=dateIso(endDate);
 const [{data:summary,error},{data:pending,error:pendingError},{data:staff}]=await Promise.all([client.rpc('resumen_asistencia_mes',{sede_arg:site,mes_arg:month}),client.from('asistencia_registros').select('*').eq('sede',site).gte('fecha_laboral',start).lt('fecha_laboral',end).eq('estado_extra','pendiente').order('fecha_laboral'),client.rpc('listar_personal_asistencia',{sede_arg:site})]);if(error||pendingError){status('No se pudo cargar el resumen mensual.',true);return}const names=new Map((staff||[]).map(item=>[item.id,item.nombre]));const list=$('monthlySummary');clear(list);(summary||[]).forEach(item=>{const card=document.createElement('article');card.className='summary-item';card.innerHTML=`<strong>${escapeHtml(item.nombre)} - ${escapeHtml(item.rol)}</strong><span>${item.horas_trabajadas} h | ${item.dias_trabajados} dias | Tardanza ${item.minutos_tardanza} min | Nocturnas ${item.horas_nocturnas} h | Extra 25%: ${item.horas_extra_25} h | Extra 35%: ${item.horas_extra_35} h</span>`;list.appendChild(card)});const extras=$('pendingExtras');clear(extras);if(!(pending||[]).length){extras.appendChild(emptyCard('No hay horas extra pendientes.'))}else (pending||[]).forEach(item=>extras.appendChild(extraCard(item,names.get(item.user_id)||'Usuario')));status('Resumen actualizado.')}
function emptyCard(text){const card=document.createElement('article');card.className='summary-item';card.textContent=text;return card}
function extraCard(item,name){const card=document.createElement('article');card.className='summary-item pending';const title=document.createElement('strong'),detail=document.createElement('span'),actions=document.createElement('div'),input=document.createElement('input'),approve=document.createElement('button'),reject=document.createElement('button');title.textContent=`${name} - ${item.fecha_laboral}`;detail.textContent=`Solicita ${item.horas_extra_solicitadas} hora(s) completa(s). Salida: ${formatDateTime(item.salida_at)}`;actions.className='extra-actions';input.type='number';input.min='0';input.max=String(item.horas_extra_solicitadas);input.value=String(item.horas_extra_solicitadas);approve.textContent='Aprobar';approve.dataset.approveExtra=item.id;reject.textContent='Rechazar';reject.className='secondary';reject.dataset.rejectExtra=item.id;actions.append(input,approve,reject);card.append(title,detail,actions);return card}
async function approveExtra(button,hours){const {error}=await client.rpc('aprobar_horas_extra_asistencia',{registro_arg:button.dataset.approveExtra||button.dataset.rejectExtra,horas_arg:hours,observacion_arg:hours?'Aprobado desde control mensual':'Rechazado desde control mensual'});if(error){status(error.message,true);return}await loadSummary()}

function openScanner(type){markType=type;$('scannerModal').hidden=false;$('scannerStatus').textContent='Iniciando camara...';navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(stream=>{scannerStream=stream;$('scannerVideo').srcObject=stream;$('scannerVideo').play();scanFrame()}).catch(()=>{$('scannerStatus').textContent='No se pudo abrir la camara. Revisa el permiso.'})}
function closeScanner(){if(scannerFrame)cancelAnimationFrame(scannerFrame);scannerFrame=null;if(scannerStream)scannerStream.getTracks().forEach(track=>track.stop());scannerStream=null;$('scannerModal').hidden=true}
function scanFrame(){const video=$('scannerVideo'),canvas=$('scannerCanvas');if(video.readyState>=2){canvas.width=video.videoWidth;canvas.height=video.videoHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(video,0,0);const image=context.getImageData(0,0,canvas.width,canvas.height);const code=window.jsQR?.(image.data,image.width,image.height);if(code?.data?.startsWith('URBAPARK_ATTENDANCE:')){closeScanner();markAttendance(code.data);return}}scannerFrame=requestAnimationFrame(scanFrame)}
function currentPosition(){return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:20000}))}
async function markAttendance(token){status('Validando ubicacion y hora oficial...');try{const position=await currentPosition();const {data,error}=await client.functions.invoke('attendance-qr',{body:{action:'mark',type:markType,token,latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy}});if(error||data?.error){status(data?.error||'No se pudo registrar la marcacion.',true);return}status(`${markType==='entrada'?'Entrada':'Salida'} registrada. Distancia a sede: ${data.distance} m.`);await loadWorker()}catch(error){status(error?.message||'No se pudo obtener una ubicacion precisa.',true)}}
function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}

document.querySelector('.admin-tabs')?.addEventListener('click',event=>{const button=event.target.closest('[data-attendance-tab]');if(button)switchTab(button.dataset.attendanceTab)});
$('refreshWorker')?.addEventListener('click',loadWorker);$('markEntry')?.addEventListener('click',()=>openScanner('entrada'));$('markExit')?.addEventListener('click',()=>openScanner('salida'));$('closeScanner')?.addEventListener('click',closeScanner);
$('startQr')?.addEventListener('click',startQr);$('stopQr')?.addEventListener('click',stopQr);$('qrSite')?.addEventListener('change',()=>{if(qrTimer)generateQr()});$('loadSchedule')?.addEventListener('click',loadSchedule);$('saveSchedule')?.addEventListener('click',saveSchedule);$('loadSummary')?.addEventListener('click',loadSummary);
$('pendingExtras')?.addEventListener('click',event=>{const approve=event.target.closest('[data-approve-extra]'),reject=event.target.closest('[data-reject-extra]');if(approve){const value=Number(approve.closest('.extra-actions').querySelector('input').value);approveExtra(approve,value)}else if(reject)approveExtra(reject,0)});
window.addEventListener('pagehide',()=>{stopQr();closeScanner()});init();
