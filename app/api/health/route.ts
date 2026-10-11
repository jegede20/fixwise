import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
export async function GET(){const db=getSupabaseAdmin();let database=false;if(db){const {error}=await db.from('diagnosis_sessions').select('id',{head:true,count:'exact'}).limit(1);database=!error}return NextResponse.json({ok:true,groq:!!process.env.GROQ_API_KEY,database,vision:!!process.env.GEMINI_API_KEY,visionModel:process.env.GEMINI_VISION_MODEL||null});}
