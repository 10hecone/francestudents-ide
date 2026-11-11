"use strict";
const {createHash}=require("node:crypto");
// Process-local only: reopening the application always bootstraps instructions again.
const bootstraps=new Map();
function fingerprint(context){return createHash("sha256").update(JSON.stringify(context)).digest("hex");}
// Les faits appris du profil (« - [projet, 7] Sujet fréquent : tests ») voient leur poids
// et leur ordre changer à presque chaque demande. Ces variations ne justifient pas de
// renvoyer tout le prompt d'instructions : on les retire de la signature.
const FACT_LINE=/^- \[([^\],]+), \d+\]/;
function stablePreprompt(text){
    const lines=String(text||"").split("\n");
    const facts=lines.filter(line=>FACT_LINE.test(line)).map(line=>line.replace(FACT_LINE,"- [$1]")).sort();
    return [...lines.filter(line=>!FACT_LINE.test(line)),...facts].join("\n");
}
function has(id,signature){return Boolean(id)&&bootstraps.get(id)===signature;}
function remember(id,signature){
    if(!id)return;
    bootstraps.delete(id);bootstraps.set(id,signature);
    while(bootstraps.size>40)bootstraps.delete(bootstraps.keys().next().value);
}
module.exports={fingerprint,has,remember,stablePreprompt};
