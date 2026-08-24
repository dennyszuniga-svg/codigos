const CONFIG={url:'https://uibiwhkxlyxdfytvudbn.supabase.co',key:'sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt'};
const client=window.supabase.createClient(CONFIG.url,CONFIG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=id=>document.getElementById(id);let session=null,profile=null,sites=[],shifts=[],people=[],qrTimer=null,qrSeconds=0,scannerStream=null,scannerFrame=null,markType='entrada',biometric=null,faceStream=null,faceMode='enroll',faceMarkType='entrada',faceSamples=[],faceModelsReady=false,faceModelsPromise=null;
const siteName=id=>sites.find(site=>site.codigo===id)?.nombre||id;
const dateIso=date=>{const copy=new Date(date);copy.setMinutes(copy.getMinutes()-copy.getTimezoneOffset());return copy.toISOString().slice(0,10)};
const mondayOf=value=>{const date=new Date(`${value||dateIso(new Date())}T12:00:00`);const day=date.getDay()||7;date.setDate(date.getDate()-day+1);return date};
const schedulingMonday=()=>{const today=new Date();const monday=mondayOf(dateIso(today));if(today.getDay()===0)monday.setDate(monday.getDate()+7);return monday};
const addDays=(date,days)=>{const next=new Date(date);next.setDate(next.getDate()+days);return next};
const formatDate=value=>new Date(`${value}T12:00:00`).toLocaleDateString('es-PE',{weekday:'short',day:'2-digit',month:'2-digit'});
const formatDateTime=value=>value?new Date(value).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'}):'-';
const clear=node=>{while(node?.firstChild)node.firstChild.remove()};
function status(message,error=false){$('attendanceStatus').textContent=message;$('attendanceStatus').style.color=error?'#b42318':'#607184'}
function option(text,value){const item=document.createElement('option');item.textContent=text;item.value=value;return item}
const globalRoles = ['encargado_ti','jefe_operaciones','coordinador_operaciones','gdh'];
function isGlobalRole(){return globalRoles.includes(profile?.rol)}
function isManager(){return ['encargado_ti','admin','jefe_operaciones','coordinador_operaciones','gdh'].includes(profile?.rol)}
function allowedSites(){return isGlobalRole()?sites:sites.filter(site=>site.codigo===profile?.sede)}
function fillSiteSelect(select,preferred=''){clear(select);allowedSites().forEach(site=>select.appendChild(option(site.nombre,site.codigo)));if([...select.options].some(item=>item.value===preferred))select.value=preferred}

async function init(){
 const {data:{session:current}}=await client.auth.getSession();session=current;if(!session?.user){location.replace('index.html');return}
 const {data,error}=await client.from('profiles').select('id,nombre,apellidos_nombres,dni,rol,sede,activo').eq('id',session.user.id).single();
 if(error||!data?.activo){location.replace('index.html');return}profile=data;
 const [siteResult,shiftResult]=await Promise.all([client.from('asistencia_sedes').select('*').eq('activa',true).order('nombre'),client.from('asistencia_turnos').select('*').eq('activo',true).order('hora_inicio')]);
 if(siteResult.error||shiftResult.error){status('No se pudo cargar la configuracion de asistencia.',true);return}
 sites=siteResult.data||[];shifts=shiftResult.data||[];$('attendanceUser').textContent=`${profile.apellidos_nombres||profile.nombre}${profile.dni?` - DNI ${profile.dni}`:''} - ${profile.rol}`;$('attendanceApp').hidden=false;
 if(['anfitrion','tecnico','supervisor','fortaleza','encargado_ti','admin'].includes(profile.rol))$('workerPanel').hidden=false;
 $('biometricPanel').hidden=false;$('faceOfficialActions').hidden=!['anfitrion','tecnico','supervisor','fortaleza','encargado_ti','admin'].includes(profile.rol);$('faceTest').hidden=!isManager();await loadBiometric();
 if(isManager()){$('adminPanel').hidden=false;['qrSite','scheduleSite','summarySite'].forEach(id=>fillSiteSelect($(id),isGlobalRole()?'puruchuco':profile.sede));$('scheduleWeek').value=dateIso(schedulingMonday());$('summaryMonth').value=dateIso(new Date()).slice(0,7);await loadSchedule()}
 const preloadFace=()=>loadFaceModels().catch(()=>{});if('requestIdleCallback'in window)requestIdleCallback(preloadFace,{timeout:1500});else setTimeout(preloadFace,500);
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
 const canEnter=Boolean(todaySchedule&&todaySchedule.estado==='programado'&&!todayRecord?.entrada_at);const canExit=Boolean(todayRecord?.entrada_at&&!todayRecord?.salida_at);$('markEntry').disabled=!canEnter;$('markExit').disabled=!canExit;
 if($('faceEntry'))$('faceEntry').disabled=!canEnter||!biometric;if($('faceExit'))$('faceExit').disabled=!canExit||!biometric;
 const help=$('markHelp');help.className='mark-help';
 if(!todaySchedule||todaySchedule.estado!=='programado'){help.textContent='Marcacion bloqueada: el administrador debe asignarte un turno para hoy.';help.classList.add('warning')}
 else if(canEnter)help.textContent='Turno programado. Pulsa Marcar entrada para abrir la camara y escanear el QR.';
 else if(canExit)help.textContent='Entrada registrada. Pulsa Marcar salida al terminar tu jornada.';
 else help.textContent='La entrada y salida de este turno ya fueron registradas.';
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
function horasDesdeMinutos(minutos){return Number(((Number(minutos)||0)/60).toFixed(2))}
function textoFechaHoraExcel(valor){return valor?new Date(valor).toLocaleString('es-PE',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):''}
function ajustarHojaExcel(hoja,anchos){hoja['!cols']=anchos.map(wch=>({wch}));if(hoja['!ref'])hoja['!autofilter']={ref:hoja['!ref']}}

async function exportarResumenAsistenciaExcel(){
 const site=$('summarySite').value,month=$('summaryMonth').value;
 if(!site||!month){status('Selecciona la sede y el mes.',true);return}
 if(!window.XLSX){status('No se pudo cargar el generador de Excel. Revisa la conexion.',true);return}
 status('Generando Excel mensual...');
 const start=`${month}-01`,endDate=new Date(`${start}T12:00:00`);endDate.setMonth(endDate.getMonth()+1);const end=dateIso(endDate);
 const [{data:summary,error:summaryError},{data:records,error:recordsError},{data:staff,error:staffError}]=await Promise.all([
  client.rpc('resumen_asistencia_mes',{sede_arg:site,mes_arg:month}),
  client.from('asistencia_registros').select('*,asistencia_programacion(fecha,estado,asistencia_turnos(nombre,hora_inicio,hora_fin,refrigerio_minutos,es_nocturno))').eq('sede',site).gte('fecha_laboral',start).lt('fecha_laboral',end).order('fecha_laboral').order('entrada_at'),
  client.rpc('listar_personal_asistencia',{sede_arg:site})
 ]);
 if(summaryError||recordsError||staffError){status('No se pudieron obtener todos los datos para el Excel.',true);return}
 const personal=new Map((staff||[]).map(item=>[item.id,item]));
 const extrasNocturnas=new Map();
 (records||[]).forEach(item=>{
  const turno=item.asistencia_programacion?.asistencia_turnos;
  if(!turno?.es_nocturno)return;
  const actual=extrasNocturnas.get(item.user_id)||{total:0,extra25:0,extra35:0};
  actual.total+=Number(item.horas_extra_aprobadas)||0;
  actual.extra25+=Number(item.horas_extra_25)||0;
  actual.extra35+=Number(item.horas_extra_35)||0;
  extrasNocturnas.set(item.user_id,actual);
 });
 const resumenFilas=(summary||[]).map(item=>{const nocturnas=extrasNocturnas.get(item.user_id)||{};return{
  'Personal':item.nombre,'Rol':item.rol,'Sede':siteName(site),'Mes':month,'Dias trabajados':Number(item.dias_trabajados)||0,
  'Horas trabajadas':Number(item.horas_trabajadas)||0,'Horas nocturnas':Number(item.horas_nocturnas)||0,
  'Horas extra 25%':Number(item.horas_extra_25)||0,'Horas extra 35%':Number(item.horas_extra_35)||0,
  'Extras nocturnas':nocturnas.total||0,'Extras nocturnas 25%':nocturnas.extra25||0,'Extras nocturnas 35%':nocturnas.extra35||0,
  'Tardanza (min)':Number(item.minutos_tardanza)||0,'Extras pendientes':Number(item.extras_pendientes)||0
 }});
 const detalleFilas=(records||[]).map(item=>{const persona=personal.get(item.user_id)||{},turno=item.asistencia_programacion?.asistencia_turnos||{},esNocturno=Boolean(turno.es_nocturno);return{
  'Fecha':item.fecha_laboral,'Personal':persona.nombre||'Usuario','Rol':persona.rol||'','Sede':siteName(item.sede),'Turno':turno.nombre||'',
  'Tipo de turno':esNocturno?'Nocturno':'Diurno','Entrada programada':turno.hora_inicio||'','Salida programada':turno.hora_fin||'',
  'Ingreso real':textoFechaHoraExcel(item.entrada_at),'Salida real':textoFechaHoraExcel(item.salida_at),'Horas trabajadas':horasDesdeMinutos(item.minutos_trabajados),
  'Tardanza (min)':Number(item.minutos_tardanza)||0,'Extra solicitada':Number(item.horas_extra_solicitadas)||0,'Extra aprobada':Number(item.horas_extra_aprobadas)||0,
  'Extra 25%':Number(item.horas_extra_25)||0,'Extra 35%':Number(item.horas_extra_35)||0,'Extra nocturna':esNocturno?(Number(item.horas_extra_aprobadas)||0):0,
  'Estado extra':item.estado_extra||'','Distancia ingreso (m)':Number(item.distancia_entrada_m)||0,'Distancia salida (m)':Number(item.distancia_salida_m)||0,
  'Observacion':item.observacion_aprobacion||''
 }});
 if(!resumenFilas.length&&!detalleFilas.length){status('No hay registros para exportar en el mes seleccionado.',true);return}
 const libro=XLSX.utils.book_new(),hojaResumen=XLSX.utils.json_to_sheet(resumenFilas),hojaDetalle=XLSX.utils.json_to_sheet(detalleFilas);
 ajustarHojaExcel(hojaResumen,[28,16,28,12,16,18,18,18,18,18,22,22,17,18]);
 ajustarHojaExcel(hojaDetalle,[12,28,16,28,24,16,20,20,22,22,18,17,18,18,14,14,18,16,20,20,34]);
 XLSX.utils.book_append_sheet(libro,hojaResumen,'Resumen mensual');
 XLSX.utils.book_append_sheet(libro,hojaDetalle,'Detalle diario');
 libro.Props={Title:`Asistencia ${siteName(site)} ${month}`,Subject:'Control mensual de asistencia',Author:'URBAPARK',Company:'URBAPARK'};
 const nombreSede=siteName(site).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'');
 XLSX.writeFile(libro,`Asistencia-${nombreSede}-${month}.xlsx`,{compression:true});
 status('Excel mensual generado.');
}

function emptyCard(text){const card=document.createElement('article');card.className='summary-item';card.textContent=text;return card}
function extraCard(item,name){const card=document.createElement('article');card.className='summary-item pending';const title=document.createElement('strong'),detail=document.createElement('span'),actions=document.createElement('div'),input=document.createElement('input'),approve=document.createElement('button'),reject=document.createElement('button');title.textContent=`${name} - ${item.fecha_laboral}`;detail.textContent=`Solicita ${item.horas_extra_solicitadas} hora(s) completa(s). Salida: ${formatDateTime(item.salida_at)}`;actions.className='extra-actions';input.type='number';input.min='0';input.max=String(item.horas_extra_solicitadas);input.value=String(item.horas_extra_solicitadas);approve.textContent='Aprobar';approve.dataset.approveExtra=item.id;reject.textContent='Rechazar';reject.className='secondary';reject.dataset.rejectExtra=item.id;actions.append(input,approve,reject);card.append(title,detail,actions);return card}
async function approveExtra(button,hours){const {error}=await client.rpc('aprobar_horas_extra_asistencia',{registro_arg:button.dataset.approveExtra||button.dataset.rejectExtra,horas_arg:hours,observacion_arg:hours?'Aprobado desde control mensual':'Rechazado desde control mensual'});if(error){status(error.message,true);return}await loadSummary()}

function openScanner(type){markType=type;$('scannerModal').hidden=false;$('scannerStatus').textContent='Iniciando camara...';navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(stream=>{scannerStream=stream;$('scannerVideo').srcObject=stream;$('scannerVideo').play();scanFrame()}).catch(()=>{$('scannerStatus').textContent='No se pudo abrir la camara. Revisa el permiso.'})}
function closeScanner(){if(scannerFrame)cancelAnimationFrame(scannerFrame);scannerFrame=null;if(scannerStream)scannerStream.getTracks().forEach(track=>track.stop());scannerStream=null;$('scannerModal').hidden=true}
function scanFrame(){const video=$('scannerVideo'),canvas=$('scannerCanvas');if(video.readyState>=2){canvas.width=video.videoWidth;canvas.height=video.videoHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(video,0,0);const image=context.getImageData(0,0,canvas.width,canvas.height);const code=window.jsQR?.(image.data,image.width,image.height);if(code?.data?.startsWith('URBAPARK_ATTENDANCE:')){closeScanner();markAttendance(code.data);return}}scannerFrame=requestAnimationFrame(scanFrame)}
function currentPosition(){return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:15000,timeout:12000}))}
async function markAttendance(token){status('Validando ubicacion y hora oficial...');try{const position=await currentPosition();const {data,error}=await client.functions.invoke('attendance-qr',{body:{action:'mark',type:markType,token,latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy}});if(error||data?.error){status(data?.error||'No se pudo registrar la marcacion.',true);return}status(`${markType==='entrada'?'Entrada':'Salida'} registrada. Distancia a sede: ${data.distance} m.`);await loadWorker()}catch(error){status(error?.message||'No se pudo obtener una ubicacion precisa.',true)}}

async function loadBiometric(){
 const {data,error}=await client.from('asistencia_biometria').select('user_id,updated_at,activa').eq('user_id',session.user.id).maybeSingle();
 biometric=!error&&data?.activa?data:null;const badge=$('biometricBadge');badge.textContent=biometric?'Rostro registrado':'Sin registrar';badge.classList.toggle('ready',Boolean(biometric));$('deleteFace').hidden=!biometric;$('enrollFace').textContent=biometric?'Volver a registrar mi rostro':'Registrar mi rostro';
 $('faceTest').disabled=!biometric;if(!$('faceOfficialActions').hidden){$('faceHelp').textContent=biometric?'Puedes marcar con rostro o continuar usando el QR como respaldo.':'Primero registra tu rostro para habilitar la marcacion facial.';await loadWorker()}else $('faceHelp').textContent=biometric?'Tu rostro esta listo. Usa el boton de prueba para validar este celular.':'Registra tu rostro y enviaremos una marcacion de prueba sin afectar el reporte laboral.';
}
async function loadFaceModels(){
 if(faceModelsReady)return;if(faceModelsPromise)return faceModelsPromise;if(!window.faceapi)throw new Error('No se pudo cargar el reconocimiento facial.');
 $('faceModalStatus').textContent='Preparando reconocimiento facial...';const base='./assets/face-models';faceModelsPromise=Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(base),faceapi.nets.faceLandmark68TinyNet.loadFromUri(base),faceapi.nets.faceRecognitionNet.loadFromUri(base)]).then(()=>{faceModelsReady=true}).finally(()=>{faceModelsPromise=null});return faceModelsPromise;
}
async function openFace(mode,type='entrada'){
 faceMode=mode;faceMarkType=type;faceSamples=[];$('faceModal').hidden=false;$('faceConsentRow').hidden=mode!=='enroll';$('faceConsent').checked=false;$('faceModalTitle').textContent=mode==='enroll'?'Registrar mi rostro':mode==='test'?'Prueba de marcacion facial':`${type==='entrada'?'Entrada':'Salida'} con rostro`;$('captureFace').textContent=mode==='enroll'?'Capturar muestra 1 de 3':'Verificar y marcar';$('faceModalStatus').textContent='Preparando camara...';
 try{await loadFaceModels();faceStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:480},height:{ideal:640}},audio:false});$('faceVideo').srcObject=faceStream;await $('faceVideo').play();$('faceModalStatus').textContent='Mira de frente, sin gorra ni lentes oscuros, y mantente dentro del marco.'}catch(error){$('faceModalStatus').textContent=error?.message||'No se pudo abrir la camara. Revisa el permiso.'}
}
function closeFace(){if(faceStream)faceStream.getTracks().forEach(track=>track.stop());faceStream=null;$('faceVideo').srcObject=null;$('faceModal').hidden=true;$('faceModal').querySelector('.face-card').classList.remove('busy')}
async function readFaceDescriptor(){
 const results=await faceapi.detectAllFaces($('faceVideo'),new faceapi.TinyFaceDetectorOptions({inputSize:192,scoreThreshold:.58})).withFaceLandmarks(true).withFaceDescriptors();
 if(!results.length)throw new Error('No se detecto un rostro. Acercate y mejora la iluminacion.');if(results.length>1)throw new Error('Debe aparecer una sola persona en la camara.');return Array.from(results[0].descriptor);
}
function averageFaceSamples(samples){const average=new Array(128).fill(0);samples.forEach(sample=>sample.forEach((value,index)=>average[index]+=value/samples.length));const norm=Math.sqrt(average.reduce((sum,value)=>sum+value*value,0))||1;return average.map(value=>Number((value/norm).toFixed(8)))}
async function facialFunctionError(error,data,fallback){
 if(data?.error)return data.error;
 try{if(error?.context?.clone){const payload=await error.context.clone().json();if(payload?.error)return payload.error}}catch{}
 return error?.message||fallback;
}
async function captureFace(){
 const card=$('faceModal').querySelector('.face-card');if(card.classList.contains('busy'))return;if(faceMode==='enroll'&&!$('faceConsent').checked){$('faceModalStatus').textContent='Marca la autorizacion para continuar.';return}card.classList.add('busy');
 try{const captured=faceMode==='enroll'?[await readFaceDescriptor(),null]:await Promise.all([readFaceDescriptor(),currentPosition()]);const [descriptor,position]=captured;if(faceMode==='enroll'){faceSamples.push(descriptor);if(faceSamples.length<3){$('faceModalStatus').textContent=`Muestra ${faceSamples.length} correcta. Mueve ligeramente el rostro y toma la siguiente.`;$('captureFace').textContent=`Capturar muestra ${faceSamples.length+1} de 3`;return}const {error}=await client.from('asistencia_biometria').upsert({user_id:session.user.id,descriptor:averageFaceSamples(faceSamples),modelo:'face-api-0.22.2',consentimiento_at:new Date().toISOString(),activa:true,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;closeFace();status('Rostro registrado correctamente.');await loadBiometric();return}
  $('faceModalStatus').textContent='Validando identidad y hora oficial...';const action=faceMode==='test'?'face-test':'face-mark';const {data,error}=await client.functions.invoke('attendance-qr',{body:{action,type:faceMarkType,descriptor,latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy}});if(error||data?.error)throw new Error(await facialFunctionError(error,data,'No se pudo completar la marcacion facial.'));closeFace();if(faceMode==='test')status(`Prueba facial aprobada en ${data.site}. Coincidencia correcta y distancia a sede: ${data.distance} m.`);else{status(`${faceMarkType==='entrada'?'Entrada':'Salida'} facial registrada. Distancia a sede: ${data.distance} m.`);await loadWorker()}
 }catch(error){const message=error?.message||'No se pudo validar el rostro.';$('faceModalStatus').textContent=message;status(`Marcacion facial no completada: ${message}`,true)}finally{card.classList.remove('busy')}
}
async function deleteBiometric(){if(!confirm('¿Eliminar tu registro facial? La marcacion por QR seguira disponible.'))return;const {error}=await client.from('asistencia_biometria').delete().eq('user_id',session.user.id);if(error){status(error.message,true);return}status('Registro facial eliminado.');await loadBiometric()}
function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}

document.querySelector('.admin-tabs')?.addEventListener('click',event=>{const button=event.target.closest('[data-attendance-tab]');if(button)switchTab(button.dataset.attendanceTab)});
$('refreshWorker')?.addEventListener('click',loadWorker);$('markEntry')?.addEventListener('click',()=>openScanner('entrada'));$('markExit')?.addEventListener('click',()=>openScanner('salida'));$('closeScanner')?.addEventListener('click',closeScanner);
$('enrollFace')?.addEventListener('click',()=>openFace('enroll'));$('deleteFace')?.addEventListener('click',deleteBiometric);$('faceEntry')?.addEventListener('click',()=>openFace('mark','entrada'));$('faceExit')?.addEventListener('click',()=>openFace('mark','salida'));$('faceTest')?.addEventListener('click',()=>openFace('test'));$('captureFace')?.addEventListener('click',captureFace);$('closeFace')?.addEventListener('click',closeFace);
$('startQr')?.addEventListener('click',startQr);$('stopQr')?.addEventListener('click',stopQr);$('qrSite')?.addEventListener('change',()=>{if(qrTimer)generateQr()});$('loadSchedule')?.addEventListener('click',loadSchedule);$('saveSchedule')?.addEventListener('click',saveSchedule);$('loadSummary')?.addEventListener('click',loadSummary);$('exportSummaryExcel')?.addEventListener('click',exportarResumenAsistenciaExcel);
$('pendingExtras')?.addEventListener('click',event=>{const approve=event.target.closest('[data-approve-extra]'),reject=event.target.closest('[data-reject-extra]');if(approve){const value=Number(approve.closest('.extra-actions').querySelector('input').value);approveExtra(approve,value)}else if(reject)approveExtra(reject,0)});
window.addEventListener('pagehide',()=>{stopQr();closeScanner();closeFace()});init();
