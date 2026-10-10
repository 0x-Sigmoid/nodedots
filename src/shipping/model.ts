import type {ImpactReport} from "@/engine/types";
export type Settings={criticalPaths:string[];requiredChecks:string[];reviewers:string[];acknowledge:"high"|"all"|"none";releaseSteps:string[]};
export type Brief={outcome:string;criteria:string[];constraints:string};
export type ChecklistItem={key:string;label:string;source:string};
export type Check={name:string;state:"passed"|"failed"|"pending"|"neutral"|"skipped"|"unavailable";url:string|null};
export const defaultSettings:Settings={criticalPaths:[],requiredChecks:[],reviewers:[],acknowledge:"high",releaseSteps:[]};
export const emptyBrief:Brief={outcome:"",criteria:[],constraints:""};
// Opaque stable keys keep free-text policy/intent content out of action indexes.
function itemKey(value:string){let a=2166136261,b=5381;for(let i=0;i<value.length;i++){a=Math.imul(a^value.charCodeAt(i),16777619);b=Math.imul(b,33)^value.charCodeAt(i);}return `${(a>>>0).toString(16)}${(b>>>0).toString(16)}`;}
export function validSettings(value:unknown):value is Settings{
 if(!value||typeof value!=="object")return false;const s=value as Settings;
 const list=(v:unknown,max:number)=>Array.isArray(v)&&v.length<=max&&v.every(x=>typeof x==="string"&&x.trim().length>0&&x.length<=180);
 return list(s.criticalPaths,20)&&s.criticalPaths.every(p=>!p.startsWith("/")&&!p.includes("..")&&!p.includes("\\"))&&list(s.requiredChecks,30)&&list(s.reviewers,20)&&s.reviewers.every(r=>/^[a-z\d][a-z\d-]{0,38}$/i.test(r))&&["high","all","none"].includes(s.acknowledge)&&list(s.releaseSteps,20);
}
export function validBrief(value:unknown):value is Brief{if(!value||typeof value!=="object")return false;const b=value as Brief;return typeof b.outcome==="string"&&b.outcome.length<=2000&&typeof b.constraints==="string"&&b.constraints.length<=2000&&Array.isArray(b.criteria)&&b.criteria.length<=20&&b.criteria.every(c=>typeof c==="string"&&c.trim().length>0&&c.length<=180);}
export function checklist(report:ImpactReport,settings:Settings,brief:Brief):ChecklistItem[]{
 const paths=report.changed.map(c=>c.path),items:ChecklistItem[]=[
  {key:"tests",label:"Review test results and remaining test gaps",source:"Release preparation"},
  {key:"rollout",label:"Record the rollout plan",source:"Release preparation"},
  {key:"rollback",label:"Record the rollback or recovery plan",source:"Release preparation"},
  {key:"documentation",label:"Review documentation and release notes",source:"Release preparation"}
 ];
 if(paths.some(p=>/(^|\/)(migrations?\/|schema\.prisma$)/i.test(p)))items.push({key:"migration",label:"Check migration, backfill, and compatibility requirements",source:"Changed schema or migration path"});
 if(paths.some(p=>/(^|\/)(\.env[^/]*|[^/]*config\.[^/]*|wrangler\.[^/]*)$/i.test(p)))items.push({key:"configuration",label:"Confirm deployment configuration and required environment values",source:"Changed configuration path"});
 report.checklist.forEach(step=>items.push({key:`engine:${itemKey(step)}`,label:step,source:"Analysis suggested next step"}));
 settings.criticalPaths.forEach(prefix=>{if(paths.some(p=>p.startsWith(prefix)))items.push({key:`critical:${itemKey(prefix)}`,label:`Review critical area: ${prefix}`,source:"Repository policy"});});
 settings.releaseSteps.forEach(step=>items.push({key:`release:${itemKey(step)}`,label:step,source:"Repository release practice"}));
 brief.criteria.forEach(criterion=>items.push({key:`criterion:${itemKey(criterion)}`,label:criterion,source:"Acceptance criterion · reviewer assessment"}));
 return [...new Map(items.map(i=>[i.key,i])).values()];
}
export function checkState(status:string,conclusion:string|null):Check["state"]{if(status!=="completed")return "pending";if(conclusion==="success")return "passed";if(conclusion==="neutral"||conclusion==="skipped")return conclusion;if(["failure","cancelled","timed_out","action_required","stale","startup_failure"].includes(conclusion??""))return "failed";return "unavailable";}
export function requiredCheckStates(checks:Check[],required:string[]):Check[]{return required.map(name=>{const matches=checks.filter(c=>c.name===name);return matches.length===1?matches[0]:{name,state:"unavailable",url:null};});}
