const {readFileSync,readdirSync}=require("node:fs");
const {join}=require("node:path");
const {createHash}=require("node:crypto");
const {execFileSync}=require("node:child_process");

try {
 const pkg=JSON.parse(readFileSync(join(__dirname,"package.json"),"utf8"));
 const metadata=JSON.parse(readFileSync(join(__dirname,"dist/build.json"),"utf8"));
 const bundle=readFileSync(join(__dirname,"dist/nodedots.cjs"));
 if(pkg.private||pkg.dependencies||pkg.optionalDependencies)throw Error("Package must be public and standalone.");
 if(pkg.bin?.nodedots!=="dist/nodedots.cjs")throw Error("Unexpected executable path.");
 if(readdirSync(join(__dirname,"dist")).sort().join(",")!=="build.json,nodedots.cjs")throw Error("Unexpected files in dist.");
 if(metadata.version!==pkg.version||metadata.sha256!==createHash("sha256").update(bundle).digest("hex"))throw Error("Bundle is stale or changed.");
 if(!bundle.toString().startsWith("#!/usr/bin/env node\n"))throw Error("Executable is missing its shebang.");
 if(execFileSync(process.execPath,[join(__dirname,pkg.bin.nodedots),"--version"],{encoding:"utf8"}).trim()!==`nodedots ${pkg.version}`)throw Error("Executable version differs.");
 for(const path of ["LICENSE","NOTICE","README.md"])if(!readFileSync(join(__dirname,path)).length)throw Error(`Missing ${path}.`);
} catch(error) {
 console.error(`CLI package verification failed: ${error.message} Build from the source root with npm run cli:build.`);
 process.exitCode=1;
}
