import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,existsSync} from "node:fs";
import {join,resolve,sep} from "node:path";
import {tmpdir} from "node:os";
import assert from "node:assert/strict";

const root=process.cwd(),npmCli=process.env.npm_execpath;
assert(npmCli&&existsSync(npmCli),"Run this check with npm run cli:smoke.");
const temp=mkdtempSync(join(tmpdir(),"nodedots-release-"));
const pkg=JSON.parse(readFileSync(join(root,"packages/cli/package.json"),"utf8"));
const destination=join(root,".wrangler/cli-release");mkdirSync(destination,{recursive:true});
function execute(command,args,cwd=root){
 const result=spawnSync(command,args,{cwd,encoding:"utf8",shell:false,windowsHide:true,timeout:120000,maxBuffer:8_000_000});
 if(result.error)throw result.error;
 return result;
}
function npm(args,cwd=root){const result=execute(process.execPath,[npmCli,...args],cwd);assert.equal(result.status,0,`npm ${args[0]} failed: ${result.stderr}`);return result.stdout;}
function git(cwd,...args){const result=execute("git",["-c","core.hooksPath=/dev/null","-c","commit.gpgsign=false",...args],cwd);assert.equal(result.status,0,`Git ${args[0]} failed.`);return result.stdout.trim();}
function put(cwd,path,content){mkdirSync(join(cwd,path,".."),{recursive:true});writeFileSync(join(cwd,path),content);}
try {
 const packed=JSON.parse(npm(["pack","./packages/cli","--pack-destination",destination,"--json"]));
 const archive=join(destination,packed[0].filename);
 const expected=["LICENSE","NOTICE","README.md","dist/build.json","dist/nodedots.cjs","package.json","verify-package.cjs"].sort();
 assert.deepEqual(packed[0].files.map(f=>f.path).sort(),expected,"Unexpected archive contents.");
 assert(packed[0].unpackedSize<500_000,"Bundle exceeds the release size budget.");
 const installation=join(temp,"installed");
 npm(["install","--prefix",installation,archive,"--ignore-scripts","--offline","--no-audit","--no-fund"]);
 const installed=join(installation,"node_modules/nodedots/dist/nodedots.cjs");
 assert(existsSync(installed));
 assert.equal(npm(["exec","--prefix",installation,"--offline","--","nodedots","--version"]).trim(),`nodedots ${pkg.version}`);
 const cases=[
  {name:"typescript-service",path:"src/service.ts",inventory:".env.example",before:"export const value = 1;\n",after:"export const value = process.env.SERVICE_KEY;\n",missing:true},
  {name:"react-ui",path:"src/Button.tsx",inventory:"config/.env.sample",before:"export function Button(){ return <button>Go</button>; }\n",after:"export function Button(){ return <button>{process.env.UI_LABEL}</button>; }\n",missing:true},
  {name:"prisma-schema",path:"prisma/schema.prisma",inventory:".env.example",before:"model User {\n id String @id\n}\n",after:"model User {\n id String @id\n name String\n}\n",missing:false},
 ];
 for(const fixture of cases){
  const cwd=join(temp,fixture.name);mkdirSync(cwd);git(cwd,"init","--initial-branch=main");git(cwd,"config","user.name","CLI release fixture");git(cwd,"config","user.email","fixture@example.invalid");git(cwd,"config","core.autocrlf","false");
  put(cwd,fixture.path,fixture.before);put(cwd,fixture.inventory,"");git(cwd,"add",".");git(cwd,"commit","-m","base");put(cwd,fixture.path,fixture.after);git(cwd,"add",".");
  const args=["check","--cwd",cwd,"--staged","--env-example",fixture.inventory,"--format","json"];
  const report=JSON.parse(npm(["exec","--prefix",installation,"--offline","--","nodedots",...args]));
  assert.equal(report.cliVersion,pkg.version);assert.equal(report.schemaVersion,1);assert.equal(report.analyzedChanges,1);assert.equal(report.mode,"staged");assert.equal(report.exitCode,0);
  if(fixture.missing)assert(report.report.missing.length>0,"Expected an environment finding.");
  const gated=execute(process.execPath,[installed,...args,"--fail-on","low"]);assert.equal(gated.status,fixture.missing?1:JSON.parse(gated.stdout).exitCode);
  const text=execute(process.execPath,[installed,"check","--cwd",cwd,"--staged","--env-example",fixture.inventory]);assert.equal(text.status,0);assert(text.stdout.includes("NodeDots Pre-flight"));
  git(cwd,"commit","-m","head");put(cwd,fixture.path,"dirty local contents\n");const committed=execute(process.execPath,[installed,"check","--cwd",cwd,"--base","HEAD~1","--head","HEAD","--env-example",fixture.inventory,"--format","json"]);assert.equal(committed.status,0);assert.equal(JSON.parse(committed.stdout).mode,"commits");
  console.log(`${fixture.name}: installed command, JSON/text, policy, and commit checks passed`);
 }
 const invalid=execute(process.execPath,[installed,"check","--format","invalid"]);assert.equal(invalid.status,2);assert.equal(invalid.stdout,"");
 console.log(`Validated ${pkg.name}@${pkg.version} on ${process.platform}, Node ${process.version}; archive ${archive}`);
}finally{
 if(resolve(temp).startsWith(resolve(tmpdir())+sep+"nodedots-release-"))rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
