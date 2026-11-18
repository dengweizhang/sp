/* In-article PK teaching figures; entirely local, no tracking/dependencies. */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const fmt = (n, digits = 1) => Number(n).toFixed(digits);
  function node(tag, attrs = {}, content = "") {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
    if (content) el.textContent = content;
    return el;
  }
  function add(svg, tag, attrs, content) {
    const el = node(tag, attrs, content);
    svg.appendChild(el);
    return el;
  }
  function line(svg, x1, y1, x2, y2, attrs = {}) {
    return add(svg, "line", {x1,y1,x2,y2,...attrs});
  }
  function text(svg, x, y, content, attrs = {}) {
    return add(svg, "text", {x,y,...attrs}, content);
  }
  function pathFor(points, sx, sy) {
    return points.map(([t,c], i) => (i ? "L" : "M") + fmt(sx(t),2) + " " + fmt(sy(c),2)).join(" ");
  }
  function areaFor(points, sx, sy, baseline) {
    if (!points.length) return "";
    return pathFor(points, sx, sy) + " L" + fmt(sx(points[points.length - 1][0]),2)
      + " " + baseline + " L" + fmt(sx(points[0][0]),2) + " " + baseline + " Z";
  }
  function dot(svg, x, y, r = 3.6, fill = "#385f65") {
    return add(svg, "circle", {cx:x,cy:y,r,fill,stroke:"#fff","stroke-width":1.2});
  }
  function axes(svg, bounds, ticks, maxC, axisCaption = "时间 / h") {
    const {left, top, right, bottom, maxT} = bounds;
    const sx = t => left + (t / maxT) * (right - left);
    const sy = c => bottom - (c / maxC) * (bottom - top);
    line(svg,left,bottom,right,bottom,{stroke:"#bdbfbd","stroke-width":1});
    line(svg,left,top,left,bottom,{stroke:"#bdbfbd","stroke-width":1});
    ticks.forEach(t => {
      const x=sx(t);
      line(svg,x,bottom,x,bottom+4,{stroke:"#aaa","stroke-width":1});
      text(svg,x,bottom+18,String(t),{"text-anchor":"middle",class:"pk-viz-axis"});
    });
    text(svg,left,top-10,"浓度", {class:"pk-viz-axis"});
    text(svg,right,bottom+18,axisCaption,{"text-anchor":"end",class:"pk-viz-axis"});
    return {sx,sy};
  }

  const observed = [
    [0,0],[1,2],[2,5],[3,10],[4,8],[5,6],[6,4.5],[8,2.5],[10,1.25],[12,.625]
  ];
  const extrapolated = [[12,.625],[14,.3125],[16,.15625],[18,.078125]];
  const captions = {
    peak:"Cmax = 10 ng/mL；Tmax = 3 h。两者都来自观测浓度，而不是理论拟合峰值。",
    auclst:"AUClst：从 0 积分到最后可测定浓度 tlast = 12 h。浅色区域表示积分区间。",
    aucinf:"AUCinf = AUClst + Clast / Lambda_z。右侧虚线和浅棕区域仅示意外推尾部，并非画到了无穷远。",
    lambda:"选择 8、10、12 h 的末端浓度，ln(C) 对 t 回归；本例 Lambda_z = ln(2) / 2 ≈ 0.347 h⁻¹。",
    half:"末端浓度由 2.5 降至 1.25 ng/mL 恰好经过 2 h，因此 t½ = 2 h。"
  };

  const CURVE = {left:46, top:36, right:594, bottom:174, maxT:18};
  const clip = (n,lo,hi) => Math.min(hi,Math.max(lo,n));
  function sampleAt(time) {
    const t=clip(time,0,18);
    if (t>12) return .625*Math.exp(-Math.LN2*(t-12)/2);
    for(let i=1;i<observed.length;i++){
      if(t<=observed[i][0]){
        const [t0,c0]=observed[i-1], [t1,c1]=observed[i];
        return c0+(c1-c0)*(t-t0)/(t1-t0);
      }
    }
    return observed[observed.length-1][1];
  }
  function areaTo(time) {
    const t=clip(time,0,18);
    let auc=0;
    for(let i=1;i<observed.length;i++){
      const [t0,c0]=observed[i-1], [t1,c1]=observed[i];
      if(t<=t0) break;
      const end=Math.min(t,t1);
      auc+=(c0+sampleAt(end))/2*(end-t0);
      if(t<=t1) return auc;
    }
    if(t>12){
      const lambda=Math.LN2/2;
      auc+=.625/lambda*(1-Math.exp(-lambda*(t-12)));
    }
    return auc;
  }
  function drawCursor(svg,mode,time,sx,sy,box){
    const t=clip(time,0,mode==="aucinf"?18:12), c=sampleAt(t);
    const x=sx(t), y=sy(c);
    line(svg,x,y,x,box.bottom,{stroke:"#d1aa6c","stroke-width":1.1,"stroke-dasharray":"3 4",class:"pk-cursor-guide"});
    add(svg,"circle",{cx:x,cy:y,r:10,fill:"#fff",stroke:"#b08040","stroke-width":2, "data-pk-dragger":"curve",class:"pk-cursor-grip"});
    add(svg,"circle",{cx:x,cy:y,r:3,fill:"#b08040","pointer-events":"none"});
    text(svg,x>box.right-145?x-12:x+12,Math.max(box.top+14,y-14),
       "拖动 ◉",{"text-anchor":x>box.right-145?"end":"start",class:"pk-viz-drag-label","pointer-events":"none"});
  }
  function curveCaption(mode,time){
    const t=clip(time,0,mode==="aucinf"?18:12);
    const outside=t>12;
    return captions[mode]+"\n游标：t = "+fmt(t,2)+" h；C = "+fmt(sampleAt(t),3)+" ng/mL；"
      +(outside?"AUC₀–t（观测段线性梯形＋尾部指数外推）":"AUC₀–t（线性梯形示例）")
      +" = "+fmt(areaTo(t),3)+" ng·h/mL"+(outside?" [t > 12 h 为预测值]":"");
  }

  function paintCurve(svg, mode, time=3) {
    svg.replaceChildren();
    svg.setAttribute("aria-label", "可拖动游标的药物浓度时间示例曲线；" + captions[mode]);
    const box=CURVE;
    const {sx,sy}=axes(svg,box,[0,3,6,9,12,15,18],11.5);
    if (mode==="auclst" || mode==="aucinf") {
      add(svg,"path",{d:areaFor(observed,sx,sy,box.bottom),fill:"#e3eeed",stroke:"none"});
    }
    if (mode==="aucinf") {
      add(svg,"path",{d:areaFor(extrapolated,sx,sy,box.bottom),fill:"#f7eddc",stroke:"none"});
    }
    add(svg,"path",{d:pathFor(observed,sx,sy),fill:"none",stroke:"#385f65","stroke-width":2.5,"stroke-linecap":"round","stroke-linejoin":"round"});
    if (mode==="aucinf" || mode==="lambda" || mode==="half") {
      add(svg,"path",{d:pathFor(extrapolated,sx,sy),fill:"none",stroke:"#b0844a","stroke-width":1.8,"stroke-dasharray":"5 4","stroke-linecap":"round"});
    }
    if (mode==="peak") {
      const x=sx(3), y=sy(10);
      line(svg,x,y,x,box.bottom,{stroke:"#a6c3c0","stroke-dasharray":"3 4"});
      line(svg,box.left,y,x,y,{stroke:"#a6c3c0","stroke-dasharray":"3 4"});
      dot(svg,x,y,4.5);
      text(svg,x+11,y-10,"Cmax = 10", {class:"pk-viz-value"});
      text(svg,x+11,y+8,"Tmax = 3 h", {class:"pk-viz-axis"});
    } else if (mode==="auclst" || mode==="aucinf") {
      const x=sx(12), y=sy(.625);
      line(svg,x,box.top+10,x,box.bottom,{stroke:"#a0aaa8","stroke-dasharray":"3 4"});
      dot(svg,x,y,4);
      text(svg,x-5,box.top+4,"tlast = 12 h",{"text-anchor":"end",class:"pk-viz-value"});
      if (mode==="aucinf") {
        text(svg,sx(14),box.top+29,"外推尾部", {class:"pk-viz-value"});
      } else {
        text(svg,sx(4),box.top+34,"AUClst", {class:"pk-viz-value"});
      }
    } else if (mode==="lambda") {
      [8,10,12].forEach(t => {
        const found=observed.find(point => point[0]===t);
        dot(svg,sx(t),sy(found[1]),4.5,"#b0844a");
      });
      text(svg,sx(8)+12,box.top+28,"末端拟合点", {class:"pk-viz-value"});
      text(svg,sx(8)+12,box.top+45,"Lambda_z ≈ 0.347 h⁻¹", {class:"pk-viz-axis"});
    } else if (mode==="half") {
      const xa=sx(8), xb=sx(10), ya=sy(2.5), yb=sy(1.25);
      dot(svg,xa,ya,4.5,"#b0844a");
      dot(svg,xb,yb,4.5,"#b0844a");
      line(svg,xa,box.top+23,xb,box.top+23,{stroke:"#b0844a","stroke-width":1.2});
      line(svg,xa,box.top+18,xa,box.top+28,{stroke:"#b0844a"});
      line(svg,xb,box.top+18,xb,box.top+28,{stroke:"#b0844a"});
      text(svg,(xa+xb)/2,box.top+16,"2 h",{"text-anchor":"middle",class:"pk-viz-value"});
      text(svg,sx(8)-7,ya-11,"2.5", {"text-anchor":"end",class:"pk-viz-axis"});
      text(svg,sx(10)+10,yb-9,"1.25", {class:"pk-viz-axis"});
    }
    drawCursor(svg,mode,time,sx,sy,box);
  }

  function paintAUC(svg, mode, endC=1.25) {
    svg.replaceChildren();
    const linear = mode === "linear";
    const left=48, right=478, top=31, bottom=144;
    const sx = t => left + t/2*(right-left);
    const sy = c => bottom - c/3.0*(bottom-top);
    const start=[0,2.5], end=[2,endC];
    const linearArea=(2.5+endC);
    const logArea=(2.5-endC)/Math.log(2.5/endC)*2;
    const points = linear ? [start,end] : Array.from({length:37},(_,i)=>{
      const t=2*i/36;
      return [t,2.5*Math.exp(Math.log(endC/2.5)*t/2)];
    });
    svg.setAttribute("aria-label",linear
      ? "线性梯形法，可拖动右侧圆点：AUC "+fmt(linearArea,3)+" ng·h/mL"
      : "对数梯形法，可拖动右侧圆点：AUC "+fmt(logArea,3)+" ng·h/mL");
    line(svg,left,bottom,right,bottom,{stroke:"#bdbfbd"});
    line(svg,left,top,left,bottom,{stroke:"#bdbfbd"});
    text(svg,left,top-9,"浓度",{class:"pk-viz-axis"});
    text(svg,left,bottom+19,"0",{"text-anchor":"middle",class:"pk-viz-axis"});
    text(svg,right,bottom+19,"2 h",{"text-anchor":"middle",class:"pk-viz-axis"});
    add(svg,"path",{d:areaFor(points,sx,sy,bottom),fill:linear?"#e3eeed":"#f7eddc"});
    add(svg,"path",{d:pathFor(points,sx,sy),fill:"none",stroke:linear?"#385f65":"#b0844a","stroke-width":2.5,"stroke-linecap":"round"});
    dot(svg,sx(0),sy(2.5));
    const handle=dot(svg,sx(2),sy(endC),6.3,"#b08040");
    handle.setAttribute("data-pk-dragger","end");
    handle.setAttribute("class","pk-cursor-grip");
    handle.setAttribute("tabindex","0");
    handle.setAttribute("role","slider");
    handle.setAttribute("aria-label","2 小时时浓度，使用上下方向键改变");
    handle.setAttribute("aria-valuemin","0.25");
    handle.setAttribute("aria-valuemax","2.4");
    handle.setAttribute("aria-valuenow",fmt(endC,2));
    text(svg,left+9,sy(2.5)-12,"2.5",{class:"pk-viz-value"});
    text(svg,right-10,sy(endC)-13,fmt(endC,2),{"text-anchor":"end",class:"pk-viz-value","pointer-events":"none"});
    text(svg,(left+right)/2,top+24,(linear?"AUC = ":"AUC ≈ ")+fmt(linear?linearArea:logArea,3),{"text-anchor":"middle",class:"pk-viz-value"});
  }

  function xToSvg(event, svg, viewWidth) {
    const bounds=svg.getBoundingClientRect();
    return (event.clientX-bounds.left)/Math.max(1,bounds.width)*viewWidth;
  }
  function yToSvg(event, svg, viewHeight) {
    const bounds=svg.getBoundingClientRect();
    return (event.clientY-bounds.top)/Math.max(1,bounds.height)*viewHeight;
  }
  function setCapture(svg,event) {
    if (typeof svg.setPointerCapture==="function" && event.pointerId!==undefined) {
      try{svg.setPointerCapture(event.pointerId)}catch(_){}
    }
  }
  function isPrimary(event) {
    return event.button===undefined || event.button===0;
  }

  function bindCurve(root) {
    const svg=root.querySelector("svg");
    const label=root.querySelector("[data-pk-caption]");
    const buttons=Array.from(root.querySelectorAll("[data-mode]"));
    if(!svg||!label||!buttons.length)return;
    let mode="peak", cursor=3, dragging=false;
    function refresh(){
      buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===mode)));
      paintCurve(svg,mode,cursor);
      label.textContent=curveCaption(mode,cursor);
    }
    buttons.forEach(b=>b.addEventListener("click",()=>{
      mode=b.dataset.mode;
      cursor=clip(cursor,0,mode==="aucinf"?18:12);
      refresh();
    }));
    function move(event) {
      const x=xToSvg(event,svg,640);
      const time=(x-CURVE.left)/(CURVE.right-CURVE.left)*18;
      cursor=clip(time,0,mode==="aucinf"?18:12);
      refresh();
    }
    svg.addEventListener("pointerdown",event=>{
      if(!isPrimary(event))return;
      dragging=true;
      setCapture(svg,event);
      move(event);
      event.preventDefault?.();
    });
    svg.addEventListener("pointermove",event=>{if(dragging)move(event)});
    svg.addEventListener("pointerup",()=>{dragging=false});
    svg.addEventListener("pointercancel",()=>{dragging=false});
    svg.addEventListener("lostpointercapture",()=>{dragging=false});
    refresh();
  }

  function bindAUC(root) {
    const svg=root.querySelector("svg");
    const label=root.querySelector("[data-pk-caption]");
    const buttons=Array.from(root.querySelectorAll("[data-mode]"));
    if(!svg||!label||!buttons.length)return;
    let mode="linear", endC=1.25, dragging=false;
    function refresh(){
      buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===mode)));
      paintAUC(svg,mode,endC);
      const area=mode==="linear"
        ?2.5+endC
        :(2.5-endC)/Math.log(2.5/endC)*2;
      label.textContent=(mode==="linear"?"线性梯形":"对数梯形")
        +"：C₀ = 2.50、C₂ = "+fmt(endC,2)+" ng/mL；AUC₀–₂ = "
        +fmt(area,3)+" ng·h/mL。拖动右侧圆点可改变结果。";
    }
    buttons.forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.mode;refresh()}));
    function move(event){
      const y=yToSvg(event,svg,176);
      endC=clip((144-y)/(144-31)*3,0.25,2.40);
      refresh();
    }
    svg.addEventListener("pointerdown",event=>{
      if(!isPrimary(event)||event.target?.getAttribute?.("data-pk-dragger")!=="end")return;
      dragging=true;
      setCapture(svg,event);
      move(event);
      event.preventDefault?.();
    });
    svg.addEventListener("pointermove",event=>{if(dragging)move(event)});
    svg.addEventListener("pointerup",()=>{dragging=false});
    svg.addEventListener("pointercancel",()=>{dragging=false});
    svg.addEventListener("lostpointercapture",()=>{dragging=false});
    svg.addEventListener("keydown",event=>{
      if(event.target?.getAttribute?.("data-pk-dragger")!=="end")return;
      if(event.key==="ArrowUp"||event.key==="ArrowDown"){
        endC=clip(endC+(event.key==="ArrowUp"?.10:-.10),.25,2.4);
        refresh();
        const updated=svg.querySelector('[data-pk-dragger="end"]');
        updated?.focus?.();
        event.preventDefault?.();
      }
    });
    refresh();
  }

  const curve=document.querySelector('[data-pk-demo="curve"]');
  if(curve)bindCurve(curve);
  const auc=document.querySelector('[data-pk-demo="auc"]');
  if(auc)bindAUC(auc);
})();
