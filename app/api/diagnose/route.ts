import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { detectDanger, emergency } from '@/lib/safety';
import { mockDiagnose } from '@/lib/mock-engine';
import { diagnosisSchema, intakeSchema, emergencySchema } from '@/lib/schemas';

export const runtime='nodejs';
const requestSchema=z.object({message:z.string().min(2).max(4000),history:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().max(8000)})).max(12).default([]),hasImage:z.boolean().optional()});
const SYSTEM=`You are FixWise, a calm home-appliance triage assistant. Never provide instructions involving gas lines, panels, live mains wiring, refrigerant, structural work, bypassing interlocks, or defeating safety devices. For a new case ask 2-3 binary, diagnostic questions and do not diagnose. After answers, provide a diagnosis. Return raw JSON only. Intake shape: {"phase":"intake"|"narrowing","appliance_type":"washer"|"dryer"|"dishwasher"|"refrigerator"|"oven"|"stove"|"microwave"|"water_heater"|"hvac_unit"|"garbage_disposal"|"other"|"unknown","appliance_brand":null,"appliance_model":null,"symptom_category":"leaking"|"not_starting"|"unusual_noise"|"error_code"|"not_heating"|"not_cooling"|"not_draining"|"not_spinning"|"not_tumbling"|"not_cleaning"|"ice_maker"|"water_dispenser"|"smell"|"vibration"|"other","initial_assessment":"20-500 chars","follow_up_questions":[{"question":"...","reason":"internal reason"}],"complexity":"unknown","safety_alert":null}. Diagnosis shape: {"phase":"diagnosis","appliance_type":"...","appliance_brand":null,"appliance_model":null,"primary_cause":{"name":"...","explanation":"...","likelihood":"very likely"|"likely"|"possible"},"alternative_causes":[],"confidence":"high"|"medium"|"low","complexity":"diy_safe"|"moderate"|"professional","safety_warnings":["Unplug the appliance before any inspection"],"tools_needed":[],"estimated_time":"...","steps":[{"step_number":1,"title":"...","instruction":"...","safety_critical":true}],"professional_reason":null,"what_to_tell_technician":null,"warranty_note":null}. Professional diagnoses must have no steps. Always require unplugging before inspection and water shutoff for water lines.`;

async function groqJson(messages:{role:string;content:string}[]){
 const key=process.env.GROQ_API_KEY;if(!key)return null;
 const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-120b',temperature:.1,response_format:{type:'json_object'},messages})});
 if(!res.ok)throw new Error(`Groq ${res.status}`);const data=await res.json();return JSON.parse(data.choices[0].message.content);
}
async function callGroq(message:string,history:{role:'user'|'assistant';content:string}[]){return groqJson([{role:'system',content:SYSTEM},...history,{role:'user',content:message}])}
async function safetyScan(result:any){
 if(result?.phase!=='diagnosis'||!result.steps?.length)return result;
 const stepText=JSON.stringify(result.steps);
 const hardUnsafe=/bypass|jumper|live\s+wire|gas\s+(line|valve|fitting)|refrigerant|freon|breaker\s+panel|240\s*v|high.voltage\s+capacitor/i.test(stepText);
 if(hardUnsafe)return {...result,complexity:'professional',steps:[],professional_reason:'The proposed checks may involve hazardous electrical, gas, or sealed-system work. FixWise has omitted them for your safety.',what_to_tell_technician:'The appliance needs diagnosis of a potentially hazardous internal component; no panels or safety devices have been disturbed.'};
 if(!process.env.GROQ_API_KEY)return result;
 const audit=await groqJson([{role:'system',content:'Audit homeowner repair steps for electrocution, fire, gas, refrigerant, structural, or safety-bypass risks. Return JSON only: {"safe":boolean,"severity":"none"|"low"|"high","reason":"string"}.'},{role:'user',content:stepText}]);
 if(audit&&!audit.safe&&audit.severity==='high')return {...result,complexity:'professional',steps:[],professional_reason:audit.reason||'These steps require a qualified professional.',what_to_tell_technician:'FixWise identified a potentially hazardous internal repair and did not display DIY instructions.'};
 return result;
}
function validate(v:unknown){const phase=(v as any)?.phase;if(phase==='diagnosis')return diagnosisSchema.parse(v);if(phase==='emergency')return emergencySchema.parse(v);return intakeSchema.parse(v)}
export async function POST(req:NextRequest){
 try{const body=requestSchema.parse(await req.json());const danger=detectDanger(body.message);if(danger)return NextResponse.json({data:emergency(danger),mode:'safety-filter'});
  let result;let mode='local-demo';try{result=await callGroq(body.message,body.history);if(result)mode='groq-live';}catch(e){console.error('Groq fallback:',e)}
  if(!result)result=mockDiagnose([body.history.map(h=>h.content).join(' '),body.message].join(' '),Math.ceil(body.history.length/2));
  result=await safetyScan(result);
  try{return NextResponse.json({data:validate(result),mode});}
  catch(validationError){
   if(mode==='groq-live'&&validationError instanceof z.ZodError){
    const issues=validationError.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ');
    const corrected=await groqJson([{role:'system',content:SYSTEM},...body.history,{role:'user',content:body.message},{role:'assistant',content:JSON.stringify(result)},{role:'user',content:`Your JSON failed schema validation: ${issues}. Return the complete corrected JSON object only.`}]);
    const scanned=await safetyScan(corrected);
    return NextResponse.json({data:validate(scanned),mode});
   }
   throw validationError;
  }
 }catch(e){if(e instanceof z.ZodError)return NextResponse.json({error:'Please provide a little more detail so I can help safely.'},{status:400});console.error(e);return NextResponse.json({error:'FixWise is temporarily unavailable. Your draft is safe — please try again.'},{status:500});}
}
