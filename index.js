export class Line {
  static rules=[]; static warnings=[]; static errors=[];
  static addRule(p,r){ Line.rules.push({pattern:p,replacement:r}); return Line; }

  constructor(input){
    this.raw=String(input||""); this.msg=this.raw; this.header=""; this.body="";
    this.safe(()=>this.validate());
  }

  safe(fn){ try{fn();}catch(e){Line.errors.push({error:e.message,raw:this.raw});} }

  validate(){
    const pre=this.raw.substring(0,6);
    if(!Number.isInteger(Number(pre))){
      Line.warnings.push({type:"invalid_prefix",prefix:pre,raw:this.raw});
    }
  }

  apply(){
    this.safe(()=>{ for(const r of Line.rules){ this.msg=this.msg.replace(r.pattern,r.replacement); } this.msg=this.msg.trim(); });
    return this;
  }

  parts(){
    this.safe(()=>{ const p=this.msg.split("] "); this.header=p[0]||""; this.body=p[1]||""; });
    return this;
  }
}

export class Logs {
  constructor(input,Handler=Line){
    this.lines=String(input||"").split("\n");
    this.Handler=this.policy(Handler);
    this.data=this.lines.map(l=>this.item(l));
    this.warnings=this.Handler.warnings;
    this.errors=this.Handler.errors;
  }

  item(line){
    const h=new this.Handler(line).apply().parts();
    return { raw:h.raw, msg:h.msg, header:h.header, body:h.body };
  }

  policy(H){
    H.rules=[]; H.warnings=[]; H.errors=[];
    return H
      .addRule(/(\*+)\s*(.*?)\s*\*+/,(_,s,t)=>`${s} session="${t}" ${s}`)
      .addRule(/Enhet=([^]+)/,(_,v)=>`Enhet="${v.trim()}"`)
      .addRule(/\):\s/g,"=")
      .addRule(/\*/g,"")
      .addRule(/\(/g,"");
  }
}
