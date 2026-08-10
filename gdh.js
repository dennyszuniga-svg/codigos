const SUPABASE_URL='https://uibiwhkxlyxdfytvudbn.supabase.co';
const SUPABASE_KEY='sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt';
const DOCUMENT_BUCKET='gdh-documentos';
const ANNOUNCEMENT_BUCKET='gdh-comunicados';
const SITES=[['puruchuco','Real Plaza Puruchuco'],['salaverry','Real Plaza Salaverry'],['primavera','Real Plaza Primavera'],['civico','Real Plaza Civico'],['gama','GAMA']];
const ROLES=[['anfitrion','Anfitrion'],['tecnico','Tecnico'],['charly','Charly'],['eco','ECO'],['supervisor','Supervisor'],['fortaleza','Fortaleza'],['admin','Administrador'],['jefe_operaciones','Jefe de operaciones'],['coordinador_operaciones','Coordinador de operaciones']];
let client=null,session=null,profile=null,users=[],documents=[],announcements=[],readings=[];

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const formatDate=value=>value?new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'';
const isManager=()=>['encargado_ti','gdh'].includes(profile?.rol);
function status(id,text,state=''){const el=$(id);if(el){el.textContent=text;el.dataset.state=state;}}
function toast(text){const el=$('gdhToast');el.textContent=text;el.hidden=false;clearTimeout(el.timer);el.timer=setTimeout(()=>el.hidden=true,4000)}
function safeName(name){return String(name||'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-100)}

async function signedUrl(bucket,path){const {data,error}=await client.storage.from(bucket).createSignedUrl(path,300);if(error)throw error;return data.signedUrl}
async function openStored(bucket,path){window.open(await signedUrl(bucket,path),'_blank','noopener,noreferrer')}

function selectTab(name){document.querySelectorAll('[data-gdh-tab]').forEach(button=>button.classList.toggle('active',button.dataset.gdhTab===name));document.querySelectorAll('[data-gdh-panel]').forEach(panel=>panel.hidden=panel.dataset.gdhPanel!==name);if(name==='gestion'&&isManager())loadMetrics()}

async function loadDocuments(){
  $('myDocumentsList').innerHTML='<p class="empty-state">Cargando documentos...</p>';
  const {data,error}=await client.from('gdh_documentos').select('*').order('created_at',{ascending:false});
  if(error){$('myDocumentsList').innerHTML='<p class="empty-state">No se pudieron cargar los documentos.</p>';return}
  documents=data||[];renderDocuments();
}
function renderDocuments(){
  const list=$('myDocumentsList');list.replaceChildren();
  const visible=isManager()?documents.filter(doc=>doc.user_id===session.user.id):documents;
  if(!visible.length){list.innerHTML='<p class="empty-state">Aun no hay documentos disponibles en tu expediente.</p>';return}
  visible.forEach(doc=>{const article=document.createElement('article');article.className='document-card';article.innerHTML=`<div><h3>${esc(doc.titulo)}</h3><p>${esc(doc.categoria)}${doc.periodo?` · ${esc(doc.periodo)}`:''} · ${formatDate(doc.created_at)}</p></div>`;const button=document.createElement('button');button.className='document-action';button.type='button';button.textContent='Ver archivo';button.addEventListener('click',()=>openStored(DOCUMENT_BUCKET,doc.storage_path).catch(()=>toast('No se pudo abrir el archivo.')));article.append(button);list.append(article)})
}

async function loadAnnouncements(){
  $('announcementsList').innerHTML='<p class="empty-state">Cargando comunicados...</p>';
  const [{data:items,error},{data:seen}]=await Promise.all([client.from('gdh_comunicados').select('*').order('created_at',{ascending:false}),client.from('gdh_lecturas').select('*')]);
  if(error){$('announcementsList').innerHTML='<p class="empty-state">No se pudieron cargar los comunicados.</p>';return}
  announcements=items||[];readings=seen||[];renderAnnouncements();
}
function renderAnnouncements(){
  const list=$('announcementsList');list.replaceChildren();if(!announcements.length){list.innerHTML='<p class="empty-state">No hay comunicados vigentes.</p>';return}
  announcements.forEach(item=>{const read=readings.find(row=>row.comunicado_id===item.id&&row.user_id===session.user.id);const article=document.createElement('article');article.className=`announcement-card${item.obligatorio?' mandatory':''}`;article.innerHTML=`<div><h3>${esc(item.titulo)}</h3><p>${item.obligatorio?'Lectura obligatoria':'Comunicado'} · ${read?.confirmado?'Confirmado':read?'Visto':'Nuevo'} · ${formatDate(item.created_at)}</p></div>`;const button=document.createElement('button');button.className='document-action';button.type='button';button.textContent='Abrir';button.addEventListener('click',()=>openAnnouncement(item));article.append(button);list.append(article)})
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
  $('viewerContent').innerHTML=`<div class="viewer-content">${esc(item.contenido)}</div>`;
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
    const {error}=await client.from('gdh_documentos').insert({id,user_id:userId,colaborador_nombre:collaborator?.apellidos_nombres||collaborator?.nombre||'',colaborador_dni:collaborator?.dni||null,categoria:$('documentCategory').value,titulo:$('documentTitle').value.trim(),periodo:$('documentPeriod').value||null,storage_path:path,archivo_nombre:file.name,mime_type:file.type||'application/octet-stream',tamano_bytes:file.size,uploaded_by:session.user.id});if(error){await client.storage.from(DOCUMENT_BUCKET).remove([path]);throw error}
    event.target.reset();status('documentUploadStatus','Documento guardado correctamente.','success');toast('Documento agregado al expediente.');await loadDocuments();
  }catch(error){console.error(error);status('documentUploadStatus','No se pudo guardar el documento.','error')}
}
async function publishAnnouncement(event){
  event.preventDefault();const audience=$('announcementAudience').value;const selected=[...$('announcementAudienceOptions').querySelectorAll('input:checked')].map(input=>input.value);if(audience!=='todos'&&!selected.length){status('announcementStatus','Selecciona al menos un destinatario.','error');return}
  status('announcementStatus','Publicando comunicado...');const id=crypto.randomUUID(),file=$('announcementFile').files[0];let path=null;
  try{if(file){path=`${id}/${safeName(file.name)}`;const {error}=await client.storage.from(ANNOUNCEMENT_BUCKET).upload(path,file,{contentType:file.type});if(error)throw error}
    const payload={id,titulo:$('announcementTitle').value.trim(),contenido:$('announcementContent').value.trim(),link_url:$('announcementLink').value.trim()||null,storage_path:path,archivo_nombre:file?.name||null,obligatorio:$('announcementMandatory').checked,audiencia:audience,sedes:audience==='sedes'?selected:[],roles:audience==='roles'?selected:[],usuarios:audience==='usuarios'?selected:[],vence_at:$('announcementExpiry').value?new Date($('announcementExpiry').value).toISOString():null,created_by:session.user.id};
    const {error}=await client.from('gdh_comunicados').insert(payload);if(error){if(path)await client.storage.from(ANNOUNCEMENT_BUCKET).remove([path]);throw error}
    event.target.reset();renderAudienceOptions();status('announcementStatus','Comunicado publicado.','success');toast('Comunicado disponible para los destinatarios.');await loadAnnouncements();await loadMetrics();
  }catch(error){console.error(error);status('announcementStatus','No se pudo publicar el comunicado.','error')}
}
function targetsFor(item){return users.filter(user=>item.audiencia==='todos'||(item.audiencia==='sedes'&&item.sedes.includes(user.sede))||(item.audiencia==='roles'&&item.roles.includes(user.rol))||(item.audiencia==='usuarios'&&item.usuarios.includes(user.id)))}
async function loadMetrics(){
  if(!isManager())return;const [{data:items},{data:seen}]=await Promise.all([client.from('gdh_comunicados').select('*').order('created_at',{ascending:false}),client.from('gdh_lecturas').select('*')]);announcements=items||[];readings=seen||[];
  const mandatory=announcements.filter(item=>item.obligatorio),totalTargets=mandatory.reduce((sum,item)=>sum+targetsFor(item).length,0),confirmed=mandatory.reduce((sum,item)=>sum+readings.filter(row=>row.comunicado_id===item.id&&row.confirmado).length,0);const pct=totalTargets?Math.round(confirmed/totalTargets*100):0;
  $('gdhMetrics').innerHTML=`<article class="metric-card"><span>Comunicados vigentes</span><strong>${announcements.length}</strong></article><article class="metric-card"><span>Lecturas obligatorias</span><strong>${totalTargets}</strong></article><article class="metric-card"><span>Confirmadas</span><strong>${confirmed}</strong></article><article class="metric-card"><span>Cumplimiento</span><strong>${pct}%</strong></article>`;
  const tbody=$('gdhMetricsTable');tbody.replaceChildren();mandatory.forEach(item=>{const target=targetsFor(item),done=readings.filter(row=>row.comunicado_id===item.id&&row.confirmado&&target.some(user=>user.id===row.user_id)).length;const tr=document.createElement('tr');tr.innerHTML=`<td>${esc(item.titulo)}</td><td>${target.length}</td><td>${done}</td><td>${Math.max(0,target.length-done)}</td><td>${target.length?Math.round(done/target.length*100):0}%</td>`;tbody.append(tr)});
}

async function init(){
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});const {data}=await client.auth.getSession();session=data.session;if(!session){location.replace('index.html');return}
  const {data:p,error}=await client.from('profiles').select('nombre,apellidos_nombres,dni,rol,sede,activo').eq('id',session.user.id).maybeSingle();if(error||!p?.activo){location.replace('index.html');return}profile=p;$('gdhUserLabel').textContent=`${p.apellidos_nombres||p.nombre} · ${p.dni?`DNI ${p.dni}`:p.rol}`;
  $('gdhManagementTab').hidden=!isManager();await loadUsers();await Promise.all([loadDocuments(),loadAnnouncements()]);
  document.querySelectorAll('[data-gdh-tab]').forEach(button=>button.addEventListener('click',()=>selectTab(button.dataset.gdhTab)));$('refreshDocuments').addEventListener('click',loadDocuments);$('refreshAnnouncements').addEventListener('click',loadAnnouncements);$('refreshMetrics').addEventListener('click',loadMetrics);$('documentUploadForm').addEventListener('submit',uploadDocument);$('announcementForm').addEventListener('submit',publishAnnouncement);$('announcementAudience').addEventListener('change',renderAudienceOptions);$('closeViewer').addEventListener('click',()=>$('announcementViewer').hidden=true);
  const applies=item=>item.audiencia==='todos'||(item.audiencia==='sedes'&&item.sedes.includes(profile.sede))||(item.audiencia==='roles'&&item.roles.includes(profile.rol))||(item.audiencia==='usuarios'&&item.usuarios.includes(session.user.id));
  const mandatory=announcements.find(item=>item.obligatorio&&applies(item)&&!readings.some(row=>row.comunicado_id===item.id&&row.user_id===session.user.id&&row.confirmado));if(mandatory)openAnnouncement(mandatory);
}
init().catch(error=>{console.error(error);document.body.innerHTML='<p style="padding:24px">No se pudo abrir el modulo GDH. Vuelve a intentarlo.</p>'});
