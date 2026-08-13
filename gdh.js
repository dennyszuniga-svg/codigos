const SUPABASE_URL='https://uibiwhkxlyxdfytvudbn.supabase.co';
const SUPABASE_KEY='sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt';
const DOCUMENT_BUCKET='gdh-documentos';
const ANNOUNCEMENT_BUCKET='gdh-comunicados';
const ANNOUNCEMENT_IMAGE_LIMIT=12*1024*1024;
const ANNOUNCEMENT_VIDEO_LIMIT=40*1024*1024;
const ANNOUNCEMENT_FILE_LIMIT=20*1024*1024;
const SITES=[['puruchuco','Real Plaza Puruchuco'],['salaverry','Real Plaza Salaverry'],['primavera','Real Plaza Primavera'],['civico','Real Plaza Civico'],['gama','GAMA']];
const ROLES=[['anfitrion','Anfitrion'],['tecnico','Tecnico'],['charly','Charly'],['eco','ECO'],['supervisor','Supervisor'],['fortaleza','Fortaleza'],['admin','Administrador'],['jefe_operaciones','Jefe de operaciones'],['coordinador_operaciones','Coordinador de operaciones']];
let client=null,session=null,profile=null,users=[],documents=[],documentReadings=[],announcements=[],readings=[],announcementPreviewUrl=null;

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const formatDate=value=>value?new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'';
const isManager=()=>['encargado_ti','gdh'].includes(profile?.rol);
function status(id,text,state=''){const el=$(id);if(el){el.textContent=text;el.dataset.state=state;}}
function toast(text){const el=$('gdhToast');el.textContent=text;el.hidden=false;clearTimeout(el.timer);el.timer=setTimeout(()=>el.hidden=true,4000)}
function safeName(name){return String(name||'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-100)}
function announcementMediaKind(source){
  const type=String(source?.type||source?.mime_type||'').toLowerCase();
  const name=String(source?.archivo_nombre||source?.name||source?.storage_path||'').toLowerCase();
  if(type.startsWith('image/')||/\.(jpe?g|png|webp|gif)$/.test(name))return'image';
  if(type.startsWith('video/')||/\.(mp4|webm|mov)$/.test(name))return'video';
  if(type==='application/pdf'||name.endsWith('.pdf'))return'pdf';
  return'file';
}
function validateAnnouncementFile(file){
  if(!file)return'';
  const kind=announcementMediaKind(file);
  if(!['image','video','pdf'].includes(kind))return'El formato seleccionado no es compatible.';
  const limit=kind==='image'?ANNOUNCEMENT_IMAGE_LIMIT:kind==='video'?ANNOUNCEMENT_VIDEO_LIMIT:ANNOUNCEMENT_FILE_LIMIT;
  return file.size>limit?`El archivo supera el limite de ${Math.round(limit/1024/1024)} MB.`:'';
}
function clearAnnouncementPreview(){
  if(announcementPreviewUrl)URL.revokeObjectURL(announcementPreviewUrl);
  announcementPreviewUrl=null;
  const preview=$('announcementMediaPreview');
  if(preview){preview.replaceChildren();preview.hidden=true}
}
function previewAnnouncementFile(){
  clearAnnouncementPreview();
  const file=$('announcementFile')?.files?.[0];
  if(!file)return;
  const error=validateAnnouncementFile(file);
  if(error){status('announcementStatus',error,'error');$('announcementFile').value='';return}
  const preview=$('announcementMediaPreview'),kind=announcementMediaKind(file);
  announcementPreviewUrl=URL.createObjectURL(file);
  const media=kind==='image'?document.createElement('img'):kind==='video'?document.createElement('video'):null;
  if(media){media.src=announcementPreviewUrl;media.className='announcement-media';media.setAttribute('aria-label',`Vista previa de ${file.name}`);if(kind==='video'){media.controls=true;media.preload='metadata';media.playsInline=true}preview.append(media)}
  const detail=document.createElement('p');detail.textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)} MB`;preview.append(detail);preview.hidden=false;status('announcementStatus','','');
}
async function appendAnnouncementMedia(item,container,compact=false){
  const kind=announcementMediaKind(item);if(!item.storage_path||!['image','video'].includes(kind))return;
  try{
    const url=await signedUrl(ANNOUNCEMENT_BUCKET,item.storage_path);
    const media=kind==='image'?document.createElement('img'):document.createElement('video');
    media.src=url;media.className=compact?'announcement-thumbnail':'announcement-media';media.setAttribute('aria-label',item.archivo_nombre||`Adjunto de ${item.titulo}`);
    if(kind==='video'){media.preload='metadata';media.playsInline=true;media.muted=compact;if(!compact)media.controls=true}
    container.prepend(media);
  }catch(error){console.error(error)}
}

async function signedUrl(bucket,path){const {data,error}=await client.storage.from(bucket).createSignedUrl(path,300);if(error)throw error;return data.signedUrl}
async function openStored(bucket,path){window.open(await signedUrl(bucket,path),'_blank','noopener,noreferrer')}

function selectTab(name){document.querySelectorAll('[data-gdh-tab]').forEach(button=>button.classList.toggle('active',button.dataset.gdhTab===name));document.querySelectorAll('[data-gdh-panel]').forEach(panel=>panel.hidden=panel.dataset.gdhPanel!==name);if(name==='gestion'&&isManager())loadMetrics()}

async function loadDocuments(){
  $('myDocumentsList').innerHTML='<p class="empty-state">Cargando documentos...</p>';
  const [{data,error},{data:seen}]=await Promise.all([client.from('gdh_documentos').select('*').order('created_at',{ascending:false}),client.from('gdh_documento_lecturas').select('*')]);
  if(error){$('myDocumentsList').innerHTML='<p class="empty-state">No se pudieron cargar los documentos.</p>';return}
  documents=data||[];documentReadings=seen||[];renderDocuments();
}
function renderDocuments(){
  const list=$('myDocumentsList');list.replaceChildren();
  const visible=isManager()?documents.filter(doc=>doc.user_id===session.user.id):documents;
  if(!visible.length){list.innerHTML='<p class="empty-state">Aun no hay documentos disponibles en tu expediente.</p>';return}
  visible.forEach(doc=>{const reading=documentReadings.find(row=>row.documento_id===doc.id&&row.user_id===session.user.id),state=doc.obligatorio?readingStatus(reading):null;const article=document.createElement('article');article.className=`document-card${doc.obligatorio?' mandatory':''}`;const info=document.createElement('div'),title=document.createElement('h3'),meta=document.createElement('p');title.textContent=doc.titulo;meta.textContent=`${doc.categoria}${doc.periodo?` · ${doc.periodo}`:''} · ${formatDate(doc.created_at)}`;info.append(title,meta);if(state){const badge=document.createElement('span');badge.className=`reading-status ${state.className}`;badge.textContent=state.label;info.append(badge)}const button=document.createElement('button');button.className='document-action';button.type='button';button.textContent=doc.obligatorio?'Ver y confirmar':'Ver archivo';button.addEventListener('click',()=>doc.obligatorio?openMandatoryDocument(doc):openStored(DOCUMENT_BUCKET,doc.storage_path).catch(()=>toast('No se pudo abrir el archivo.')));article.append(info,button);list.append(article)})
}
async function registerDocumentReading(doc,confirmed=false){
  const existing=documentReadings.find(row=>row.documento_id===doc.id&&row.user_id===session.user.id);if(existing?.confirmado)return;
  const payload={documento_id:doc.id,user_id:session.user.id,visto_at:existing?.visto_at||new Date().toISOString(),confirmado:confirmed,confirmado_at:confirmed?new Date().toISOString():null};
  const {error}=await client.from('gdh_documento_lecturas').upsert(payload,{onConflict:'documento_id,user_id'});if(error)throw error;await loadDocuments();
}
async function openMandatoryDocument(doc){
  $('documentViewerTitle').textContent=doc.titulo;const content=$('documentViewerContent'),actions=$('documentViewerActions');content.replaceChildren();actions.replaceChildren();
  try{const url=await signedUrl(DOCUMENT_BUCKET,doc.storage_path),kind=announcementMediaKind(doc);if(kind==='image'){const image=document.createElement('img');image.src=url;image.className='announcement-media';image.alt=doc.titulo;content.append(image)}else if(kind==='pdf'){const frame=document.createElement('iframe');frame.src=url;frame.className='document-frame';frame.title=doc.titulo;content.append(frame)}const open=document.createElement('a');open.className='document-action';open.href=url;open.target='_blank';open.rel='noopener noreferrer';open.textContent='Abrir archivo completo';actions.append(open)}catch(error){console.error(error);toast('No se pudo abrir el documento.');return}
  const current=documentReadings.find(row=>row.documento_id===doc.id&&row.user_id===session.user.id);if(!current?.confirmado){const confirm=document.createElement('button');confirm.className='primary-button';confirm.type='button';confirm.textContent='Confirmo que revise el documento';confirm.addEventListener('click',async()=>{await registerDocumentReading(doc,true);$('documentViewer').hidden=true;toast('Documento confirmado correctamente.')});actions.append(confirm);if(!current)await registerDocumentReading(doc,false)}
  $('documentViewer').hidden=false;
}

async function loadAnnouncements(){
  $('announcementsList').innerHTML='<p class="empty-state">Cargando comunicados...</p>';
  const [{data:items,error},{data:seen}]=await Promise.all([client.from('gdh_comunicados').select('*').order('created_at',{ascending:false}),client.from('gdh_lecturas').select('*')]);
  if(error){$('announcementsList').innerHTML='<p class="empty-state">No se pudieron cargar los comunicados.</p>';return}
  announcements=items||[];readings=seen||[];renderAnnouncements();
}
function renderAnnouncements(){
  const list=$('announcementsList');list.replaceChildren();if(!announcements.length){list.innerHTML='<p class="empty-state">No hay comunicados vigentes.</p>';return}
  announcements.forEach(item=>{const read=readings.find(row=>row.comunicado_id===item.id&&row.user_id===session.user.id);const article=document.createElement('article');article.className=`announcement-card${item.obligatorio?' mandatory':''}`;const summary=document.createElement('div');summary.className='announcement-summary';const text=document.createElement('div');const title=document.createElement('h3');title.textContent=item.titulo;const meta=document.createElement('p');meta.textContent=`${item.obligatorio?'Lectura obligatoria':'Comunicado'} · ${read?.confirmado?'Confirmado':read?'Visto':'Nuevo'} · ${formatDate(item.created_at)}`;text.append(title,meta);summary.append(text);article.append(summary);appendAnnouncementMedia(item,summary,true);const button=document.createElement('button');button.className='document-action';button.type='button';button.textContent='Abrir';button.addEventListener('click',()=>openAnnouncement(item));article.append(button);list.append(article)})
}
async function registerView(item,confirmed=false){
  const existing=readings.find(row=>row.comunicado_id===item.id&&row.user_id===session.user.id);
  if(existing?.confirmado)return;
  const payload={comunicado_id:item.id,user_id:session.user.id,visto_at:existing?.visto_at||new Date().toISOString(),confirmado:confirmed,confirmado_at:confirmed?new Date().toISOString():null};
  const {error}=await client.from('gdh_lecturas').upsert(payload,{onConflict:'comunicado_id,user_id'});if(error)throw error;
  await loadAnnouncements();
}
async function openAnnouncement(item){
  $('viewerTag').textContent=item.obligatorio?'Lectura obligatoria':'Comunicado';$('viewerTitle').textContent=item.titulo;
  const content=$('viewerContent');content.replaceChildren();const body=document.createElement('div');body.className='viewer-content';body.textContent=item.contenido;content.append(body);await appendAnnouncementMedia(item,content,false);
  const actions=$('viewerActions');actions.replaceChildren();
  if(item.link_url){const link=document.createElement('a');link.className='document-action';link.href=item.link_url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Abrir enlace';actions.append(link)}
  if(item.storage_path){const file=document.createElement('button');file.className='document-action';file.type='button';file.textContent='Ver adjunto';file.addEventListener('click',()=>openStored(ANNOUNCEMENT_BUCKET,item.storage_path));actions.append(file)}
  const read=readings.find(row=>row.comunicado_id===item.id&&row.user_id===session.user.id);
  $('closeViewer').hidden=Boolean(item.obligatorio&&!read?.confirmado);
  if(item.obligatorio&&!read?.confirmado){const confirm=document.createElement('button');confirm.className='primary-button';confirm.type='button';confirm.textContent='Si, confirmo que he leido';confirm.addEventListener('click',async()=>{await registerView(item,true);$('announcementViewer').hidden=true;toast('Lectura confirmada.')});actions.append(confirm)}
  else if(!read){await registerView(item,false)}
  $('announcementViewer').hidden=false;
}

function renderAudienceOptions(){
  const type=$('announcementAudience').value,box=$('announcementAudienceOptions');box.replaceChildren();box.hidden=type==='todos';
  const source=type==='sedes'?SITES:type==='roles'?ROLES:type==='usuarios'?users.map(user=>[user.id,`${user.apellidos_nombres||user.nombre} · ${user.dni||'sin DNI'}`]):[];
  source.forEach(([value,label])=>{const row=document.createElement('label');row.innerHTML=`<input type="checkbox" value="${esc(value)}"> ${esc(label)}`;box.append(row)})
}
async function loadUsers(){
  if(!isManager())return;const {data,error}=await client.from('profiles').select('id,nombre,apellidos_nombres,dni,rol,sede,activo').eq('activo',true).order('nombre');if(error)return;users=data||[];
  const select=$('documentUser');select.replaceChildren(new Option('Seleccionar colaborador',''));users.forEach(user=>select.add(new Option(`${user.apellidos_nombres||user.nombre} · DNI ${user.dni||'pendiente'}`,user.id)));renderAudienceOptions();
}
async function uploadDocument(event){
  event.preventDefault();const file=$('documentFile').files[0],userId=$('documentUser').value;if(!file||!userId)return;status('documentUploadStatus','Guardando documento...');
  const collaborator=users.find(user=>user.id===userId);
  const id=crypto.randomUUID(),path=`${userId}/${id}/${safeName(file.name)}`;
  try{const {error:uploadError}=await client.storage.from(DOCUMENT_BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;
    const {error}=await client.from('gdh_documentos').insert({id,user_id:userId,colaborador_nombre:collaborator?.apellidos_nombres||collaborator?.nombre||'',colaborador_dni:collaborator?.dni||null,categoria:$('documentCategory').value,titulo:$('documentTitle').value.trim(),periodo:$('documentPeriod').value||null,obligatorio:$('documentMandatory').checked,storage_path:path,archivo_nombre:file.name,mime_type:file.type||'application/octet-stream',tamano_bytes:file.size,uploaded_by:session.user.id});if(error){await client.storage.from(DOCUMENT_BUCKET).remove([path]);throw error}
    event.target.reset();status('documentUploadStatus','Documento guardado correctamente.','success');toast('Documento agregado al expediente.');await loadDocuments();
  }catch(error){console.error(error);status('documentUploadStatus','No se pudo guardar el documento.','error')}
}
async function publishAnnouncement(event){
  event.preventDefault();const audience=$('announcementAudience').value;const selected=[...$('announcementAudienceOptions').querySelectorAll('input:checked')].map(input=>input.value);if(audience!=='todos'&&!selected.length){status('announcementStatus','Selecciona al menos un destinatario.','error');return}
  status('announcementStatus','Publicando comunicado...');const id=crypto.randomUUID(),file=$('announcementFile').files[0];let path=null;
  const fileError=validateAnnouncementFile(file);if(fileError){status('announcementStatus',fileError,'error');return}
  try{if(file){path=`${id}/${safeName(file.name)}`;const {error}=await client.storage.from(ANNOUNCEMENT_BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(error)throw error}
    const payload={id,titulo:$('announcementTitle').value.trim(),contenido:$('announcementContent').value.trim(),link_url:$('announcementLink').value.trim()||null,storage_path:path,archivo_nombre:file?.name||null,mime_type:file?.type||null,tamano_bytes:file?.size||null,obligatorio:$('announcementMandatory').checked,audiencia:audience,sedes:audience==='sedes'?selected:[],roles:audience==='roles'?selected:[],usuarios:audience==='usuarios'?selected:[],vence_at:$('announcementExpiry').value?new Date($('announcementExpiry').value).toISOString():null,created_by:session.user.id};
    const {error}=await client.from('gdh_comunicados').insert(payload);if(error){if(path)await client.storage.from(ANNOUNCEMENT_BUCKET).remove([path]);throw error}
    event.target.reset();clearAnnouncementPreview();renderAudienceOptions();status('announcementStatus','Comunicado publicado.','success');toast('Comunicado disponible para los destinatarios.');await loadAnnouncements();await loadMetrics();
  }catch(error){console.error(error);status('announcementStatus','No se pudo publicar el comunicado.','error')}
}
function targetsFor(item){return users.filter(user=>item.audiencia==='todos'||(item.audiencia==='sedes'&&item.sedes.includes(user.sede))||(item.audiencia==='roles'&&item.roles.includes(user.rol))||(item.audiencia==='usuarios'&&item.usuarios.includes(user.id)))}
function catalogLabel(catalog,value){return catalog.find(([key])=>key===value)?.[1]||String(value||'Sin asignar').replaceAll('_',' ')}
function readingStatus(reading){
  if(reading?.confirmado)return{label:'Confirmado',className:'confirmed',date:reading.confirmado_at||reading.visto_at};
  if(reading)return{label:'Visto sin confirmar',className:'viewed',date:reading.visto_at};
  return{label:'Pendiente',className:'pending',date:null};
}
function refreshPersonnelAnnouncementOptions(mandatory){
  const select=$('personnelAnnouncementFilter'),previous=select.value;select.replaceChildren();
  if(!mandatory.length){select.add(new Option('No hay publicaciones obligatorias',''));select.disabled=true;return}
  select.disabled=false;mandatory.forEach(item=>select.add(new Option(`${item.titulo} · ${formatDate(item.created_at)}`,item.id)));
  if(mandatory.some(item=>item.id===previous))select.value=previous;
}
function renderPersonnelStatus(){
  const tbody=$('personnelStatusTableBody'),summary=$('personnelStatusSummary');tbody.replaceChildren();
  const announcement=announcements.find(item=>item.id===$('personnelAnnouncementFilter').value&&item.obligatorio);
  if(!announcement){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=6;cell.className='empty-table-cell';cell.textContent='Selecciona una publicacion obligatoria.';row.append(cell);tbody.append(row);summary.textContent='';return}
  const query=$('personnelStatusSearch').value.trim().toLocaleLowerCase('es');
  const target=targetsFor(announcement).sort((a,b)=>String(a.apellidos_nombres||a.nombre).localeCompare(String(b.apellidos_nombres||b.nombre),'es'));
  const visible=target.filter(user=>!query||[user.apellidos_nombres,user.nombre,user.dni,catalogLabel(SITES,user.sede),catalogLabel(ROLES,user.rol)].some(value=>String(value||'').toLocaleLowerCase('es').includes(query)));
  const confirmed=target.filter(user=>readings.some(row=>row.comunicado_id===announcement.id&&row.user_id===user.id&&row.confirmado)).length;
  summary.textContent=`${confirmed} de ${target.length} confirmaron`;
  if(!visible.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=6;cell.className='empty-table-cell';cell.textContent='No se encontraron colaboradores con ese filtro.';row.append(cell);tbody.append(row);return}
  visible.forEach(user=>{
    const reading=readings.find(row=>row.comunicado_id===announcement.id&&row.user_id===user.id),state=readingStatus(reading),row=document.createElement('tr');
    const values=[user.apellidos_nombres||user.nombre||'Sin nombre',user.dni||'Pendiente',catalogLabel(SITES,user.sede),catalogLabel(ROLES,user.rol)];
    values.forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell)});
    const statusCell=document.createElement('td'),badge=document.createElement('span');badge.className=`reading-status ${state.className}`;badge.textContent=state.label;statusCell.append(badge);row.append(statusCell);
    const dateCell=document.createElement('td');dateCell.textContent=state.date?formatDate(state.date):'Sin registro';row.append(dateCell);tbody.append(row);
  });
}
function renderDocumentStatus(){
  const tbody=$('documentStatusTableBody');tbody.replaceChildren();const query=$('documentStatusSearch').value.trim().toLocaleLowerCase('es');
  const rows=documents.filter(doc=>doc.obligatorio&&doc.user_id).map(doc=>({doc,user:users.find(user=>user.id===doc.user_id)})).filter(row=>row.user).filter(({doc,user})=>!query||[user.apellidos_nombres,user.nombre,user.dni,catalogLabel(SITES,user.sede),doc.titulo,doc.categoria].some(value=>String(value||'').toLocaleLowerCase('es').includes(query))).sort((a,b)=>String(a.user.apellidos_nombres||a.user.nombre).localeCompare(String(b.user.apellidos_nombres||b.user.nombre),'es'));
  if(!rows.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=6;cell.className='empty-table-cell';cell.textContent='No hay documentos obligatorios con ese filtro.';row.append(cell);tbody.append(row);return}
  rows.forEach(({doc,user})=>{const reading=documentReadings.find(item=>item.documento_id===doc.id&&item.user_id===user.id),state=readingStatus(reading),row=document.createElement('tr'),values=[user.apellidos_nombres||user.nombre||'Sin nombre',user.dni||'Pendiente',catalogLabel(SITES,user.sede),doc.titulo];values.forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell)});const statusCell=document.createElement('td'),badge=document.createElement('span');badge.className=`reading-status ${state.className}`;badge.textContent=state.label;statusCell.append(badge);row.append(statusCell);const dateCell=document.createElement('td');dateCell.textContent=state.date?formatDate(state.date):'Sin registro';row.append(dateCell);tbody.append(row)});
}
function buildComplianceRows(){
  const mandatoryAnnouncements=announcements.filter(item=>item.obligatorio),mandatoryDocuments=documents.filter(doc=>doc.obligatorio&&doc.user_id);
  return users.map(user=>{
    const assignedDocuments=mandatoryDocuments.filter(doc=>doc.user_id===user.id),confirmedDocuments=assignedDocuments.filter(doc=>documentReadings.some(row=>row.documento_id===doc.id&&row.user_id===user.id&&row.confirmado));
    const assignedAnnouncements=mandatoryAnnouncements.filter(item=>targetsFor(item).some(target=>target.id===user.id)),confirmedAnnouncements=assignedAnnouncements.filter(item=>readings.some(row=>row.comunicado_id===item.id&&row.user_id===user.id&&row.confirmado));
    const assigned=assignedDocuments.length+assignedAnnouncements.length,confirmed=confirmedDocuments.length+confirmedAnnouncements.length,pct=assigned?Math.round(confirmed/assigned*100):null;
    return{user,assignedDocuments,confirmedDocuments,assignedAnnouncements,confirmedAnnouncements,assigned,confirmed,pct};
  });
}
function exportComplianceExcel(){
  if(!window.XLSX){toast('No se pudo cargar el generador de Excel.');return}
  const rows=buildComplianceRows(),summary=rows.map(row=>({'Apellidos y nombres':row.user.apellidos_nombres||row.user.nombre||'',DNI:row.user.dni||'',Sede:catalogLabel(SITES,row.user.sede),Rol:catalogLabel(ROLES,row.user.rol),'Documentos obligatorios':row.assignedDocuments.length,'Documentos confirmados':row.confirmedDocuments.length,'Comunicados obligatorios':row.assignedAnnouncements.length,'Comunicados confirmados':row.confirmedAnnouncements.length,'Total asignado':row.assigned,'Total confirmado':row.confirmed,'Cumplimiento %':row.pct??'N/A','Cumple 100%':row.pct===100?'SI':row.assigned?'NO':'SIN ASIGNACIONES'}));
  const detail=[];rows.forEach(row=>{row.assignedDocuments.forEach(item=>{const reading=documentReadings.find(read=>read.documento_id===item.id&&read.user_id===row.user.id),state=readingStatus(reading);detail.push({'Apellidos y nombres':row.user.apellidos_nombres||row.user.nombre||'',DNI:row.user.dni||'',Sede:catalogLabel(SITES,row.user.sede),Tipo:'Documento',Titulo:item.titulo,Estado:state.label,'Fecha de confirmacion':state.date?formatDate(state.date):''})});row.assignedAnnouncements.forEach(item=>{const reading=readings.find(read=>read.comunicado_id===item.id&&read.user_id===row.user.id),state=readingStatus(reading);detail.push({'Apellidos y nombres':row.user.apellidos_nombres||row.user.nombre||'',DNI:row.user.dni||'',Sede:catalogLabel(SITES,row.user.sede),Tipo:'Comunicado',Titulo:item.titulo,Estado:state.label,'Fecha de confirmacion':state.date?formatDate(state.date):''})})});
  const workbook=XLSX.utils.book_new(),summarySheet=XLSX.utils.json_to_sheet(summary),detailSheet=XLSX.utils.json_to_sheet(detail);summarySheet['!cols']=[{wch:34},{wch:12},{wch:24},{wch:24},{wch:22},{wch:22},{wch:23},{wch:23},{wch:16},{wch:18},{wch:16},{wch:15}];detailSheet['!cols']=[{wch:34},{wch:12},{wch:24},{wch:14},{wch:42},{wch:22},{wch:24}];XLSX.utils.book_append_sheet(workbook,summarySheet,'Cumplimiento por personal');XLSX.utils.book_append_sheet(workbook,detailSheet,'Detalle obligatorio');XLSX.writeFile(workbook,`Cumplimiento_GDH_${new Date().toISOString().slice(0,10)}.xlsx`);toast('Reporte Excel generado.');
}
async function loadMetrics(){
  if(!isManager())return;const [{data:items},{data:seen},{data:docs},{data:docSeen}]=await Promise.all([client.from('gdh_comunicados').select('*').order('created_at',{ascending:false}),client.from('gdh_lecturas').select('*'),client.from('gdh_documentos').select('*').order('created_at',{ascending:false}),client.from('gdh_documento_lecturas').select('*')]);announcements=items||[];readings=seen||[];documents=docs||[];documentReadings=docSeen||[];
  const mandatory=announcements.filter(item=>item.obligatorio),totalTargets=mandatory.reduce((sum,item)=>sum+targetsFor(item).length,0),confirmed=mandatory.reduce((sum,item)=>{const targetIds=new Set(targetsFor(item).map(user=>user.id));return sum+readings.filter(row=>row.comunicado_id===item.id&&row.confirmado&&targetIds.has(row.user_id)).length},0),mandatoryDocs=documents.filter(doc=>doc.obligatorio&&doc.user_id),confirmedDocs=mandatoryDocs.filter(doc=>documentReadings.some(row=>row.documento_id===doc.id&&row.user_id===doc.user_id&&row.confirmado)).length,complianceRows=buildComplianceRows(),evaluated=complianceRows.filter(row=>row.assigned>0),fullCompliance=evaluated.filter(row=>row.pct===100).length;
  $('gdhMetrics').innerHTML=`<article class="metric-card"><span>Personal evaluado</span><strong>${evaluated.length}</strong></article><article class="metric-card"><span>Cumplen al 100%</span><strong>${fullCompliance}</strong></article><article class="metric-card"><span>Documentos confirmados</span><strong>${confirmedDocs}/${mandatoryDocs.length}</strong></article><article class="metric-card"><span>Comunicados confirmados</span><strong>${confirmed}/${totalTargets}</strong></article>`;
  const tbody=$('gdhMetricsTable');tbody.replaceChildren();mandatory.forEach(item=>{const target=targetsFor(item),done=readings.filter(row=>row.comunicado_id===item.id&&row.confirmado&&target.some(user=>user.id===row.user_id)).length;const tr=document.createElement('tr');tr.innerHTML=`<td>${esc(item.titulo)}</td><td>${target.length}</td><td>${done}</td><td>${Math.max(0,target.length-done)}</td><td>${target.length?Math.round(done/target.length*100):0}%</td>`;tbody.append(tr)});
  refreshPersonnelAnnouncementOptions(mandatory);renderPersonnelStatus();renderDocumentStatus();
}

async function init(){
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});const {data}=await client.auth.getSession();session=data.session;if(!session){location.replace('index.html');return}
  const {data:p,error}=await client.from('profiles').select('nombre,apellidos_nombres,dni,rol,sede,activo').eq('id',session.user.id).maybeSingle();if(error||!p?.activo){location.replace('index.html');return}profile=p;$('gdhUserLabel').textContent=`${p.apellidos_nombres||p.nombre} · ${p.dni?`DNI ${p.dni}`:p.rol}`;
  $('gdhManagementTab').hidden=!isManager();await loadUsers();await Promise.all([loadDocuments(),loadAnnouncements()]);
  document.querySelectorAll('[data-gdh-tab]').forEach(button=>button.addEventListener('click',()=>selectTab(button.dataset.gdhTab)));$('refreshDocuments').addEventListener('click',loadDocuments);$('refreshAnnouncements').addEventListener('click',loadAnnouncements);$('refreshMetrics').addEventListener('click',loadMetrics);$('exportComplianceExcel').addEventListener('click',exportComplianceExcel);$('documentUploadForm').addEventListener('submit',uploadDocument);$('announcementForm').addEventListener('submit',publishAnnouncement);$('announcementFile').addEventListener('change',previewAnnouncementFile);$('announcementAudience').addEventListener('change',renderAudienceOptions);$('personnelAnnouncementFilter').addEventListener('change',renderPersonnelStatus);$('personnelStatusSearch').addEventListener('input',renderPersonnelStatus);$('documentStatusSearch').addEventListener('input',renderDocumentStatus);$('closeViewer').addEventListener('click',()=>$('announcementViewer').hidden=true);$('closeDocumentViewer').addEventListener('click',()=>$('documentViewer').hidden=true);
  const applies=item=>item.audiencia==='todos'||(item.audiencia==='sedes'&&item.sedes.includes(profile.sede))||(item.audiencia==='roles'&&item.roles.includes(profile.rol))||(item.audiencia==='usuarios'&&item.usuarios.includes(session.user.id));
  const mandatory=announcements.find(item=>item.obligatorio&&applies(item)&&!readings.some(row=>row.comunicado_id===item.id&&row.user_id===session.user.id&&row.confirmado));if(mandatory)openAnnouncement(mandatory);
}
init().catch(error=>{console.error(error);document.body.innerHTML='<p style="padding:24px">No se pudo abrir el modulo GDH. Vuelve a intentarlo.</p>'});
