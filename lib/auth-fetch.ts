import {getSupabaseBrowserClient} from './supabase';
export async function authHeaders(extra:Record<string,string>={}){const db=getSupabaseBrowserClient();const {data}=db?await db.auth.getSession():{data:{session:null}} as any;return {...extra,...(data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{})}}
