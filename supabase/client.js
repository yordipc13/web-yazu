import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://yzcgfatgtojgwntdpojp.supabase.co';
const supabasePublishableKey = 'sb_publishable_suotj74V1Gxlm_Ja3dPNNg_KH7s3odE';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);