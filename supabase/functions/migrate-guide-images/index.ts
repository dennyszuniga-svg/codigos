import { createClient } from '@supabase/supabase-js';

const BUCKET = 'guide-images';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type GuidePhoto = {
  dataUrl?: string;
  path?: string;
  nombre?: string;
  agregadaEn?: string;
};

type GuideStep = {
  titulo?: string;
  descripcion?: string;
  foto?: GuidePhoto | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s);
  if (!match) {
    throw new Error('Formato de imagen no compatible');
  }

  const mimeType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  return { bytes, mimeType, extension };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Faltan secretos de funcion' }, 500);
  }

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse({ error: 'No autorizado' }, 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rol,activo')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || profile?.rol !== 'admin' || profile?.activo !== true) {
    return jsonResponse({ error: 'Solo administradores pueden migrar imagenes' }, 403);
  }

  const { data: guides, error: guidesError } = await supabase
    .from('guias_operativas')
    .select('id,creado_por,pasos');
  if (guidesError) {
    return jsonResponse({ error: guidesError.message }, 500);
  }

  let migratedGuides = 0;
  let migratedPhotos = 0;

  for (const guide of guides || []) {
    const steps: GuideStep[] = Array.isArray(guide.pasos) ? guide.pasos : [];
    const uploadedPaths: string[] = [];
    let changed = false;

    try {
      const updatedSteps: GuideStep[] = [];
      for (const step of steps) {
        const photo = step?.foto;
        if (!photo?.dataUrl || photo.path) {
          updatedSteps.push(step);
          continue;
        }

        const decoded = decodeDataUrl(photo.dataUrl);
        const owner = guide.creado_por || userData.user.id;
        const path = `${owner}/${guide.id}/${crypto.randomUUID()}.${decoded.extension}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, decoded.bytes, {
            contentType: decoded.mimeType,
            upsert: false,
          });
        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(path);
        migratedPhotos += 1;
        changed = true;
        updatedSteps.push({
          ...step,
          foto: {
            path,
            nombre: photo.nombre || `foto-${migratedPhotos}.${decoded.extension}`,
            agregadaEn: photo.agregadaEn || new Date().toISOString(),
          },
        });
      }

      if (!changed) {
        continue;
      }

      const { error: updateError } = await supabase
        .from('guias_operativas')
        .update({ pasos: updatedSteps })
        .eq('id', guide.id);
      if (updateError) {
        throw updateError;
      }
      migratedGuides += 1;
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
      }
      return jsonResponse({
        error: error instanceof Error ? error.message : 'No se pudo completar la migracion',
        migratedGuides,
        migratedPhotos,
      }, 500);
    }
  }

  return jsonResponse({ migratedGuides, migratedPhotos });
});
