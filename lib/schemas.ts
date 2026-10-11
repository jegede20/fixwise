import { z } from 'zod';

const appliances = z.enum(['washer','dryer','dishwasher','refrigerator','oven','stove','microwave','water_heater','hvac_unit','garbage_disposal','other','not_an_appliance','unknown']);
const followUp = z.object({ question:z.string().min(10), reason:z.string().min(10) });
export const intakeSchema = z.object({
  phase:z.enum(['intake','narrowing']), appliance_type:appliances,
  appliance_brand:z.string().nullable(), appliance_model:z.string().nullable(),
  symptom_category:z.enum(['leaking','not_starting','unusual_noise','error_code','not_heating','not_cooling','not_draining','not_spinning','not_tumbling','not_cleaning','ice_maker','water_dispenser','smell','vibration','other']),
  initial_assessment:z.string().min(20).max(700), follow_up_questions:z.array(followUp).min(1).max(3), complexity:z.literal('unknown'), safety_alert:z.string().nullable()
});
export const diagnosisSchema = z.object({
  phase:z.literal('diagnosis'), appliance_type:z.string(), appliance_brand:z.string().nullable(), appliance_model:z.string().nullable(),
  primary_cause:z.object({name:z.string().min(3),explanation:z.string().min(20),likelihood:z.enum(['very likely','likely','possible'])}),
  alternative_causes:z.array(z.object({name:z.string(),explanation:z.string(),likelihood:z.string()})).max(3), confidence:z.enum(['high','medium','low']), complexity:z.enum(['diy_safe','moderate','professional']),
  safety_warnings:z.array(z.string()).min(1), tools_needed:z.array(z.string()), estimated_time:z.string(),
  steps:z.array(z.object({step_number:z.number().int().positive(),title:z.string().min(3),instruction:z.string().min(10),safety_critical:z.boolean()})),
  professional_reason:z.string().nullable(), what_to_tell_technician:z.string().nullable(), warranty_note:z.string().nullable()
}).superRefine((v,ctx)=>{if(v.complexity==='professional'&&v.steps.length)ctx.addIssue({code:'custom',message:'Professional diagnoses cannot contain steps',path:['steps']});if(v.complexity!=='professional'&&!v.steps.length)ctx.addIssue({code:'custom',message:'Safe diagnoses require steps',path:['steps']});});
export const emergencySchema = z.object({phase:z.literal('emergency'),safety_alert:z.string().min(20),emergency_action:z.string().min(20),do_not:z.string().min(10),contact:z.string().min(10)});
export type Intake = z.infer<typeof intakeSchema>; export type Diagnosis = z.infer<typeof diagnosisSchema>; export type Emergency = z.infer<typeof emergencySchema>;
export type FixWiseResponse = Intake | Diagnosis | Emergency;
