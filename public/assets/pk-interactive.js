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

  function paintCurve(svg, mode) {
    svg.replaceChildren();
    svg.setAttribute("aria-label", "药物浓度时间曲线；" + captions[mode]);
    const box={left:46,top:36,right:594,bottom:174,maxT:18};
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
  }

  function paintAUC(svg, mode) {
    svg.replaceChildren();
    const linear = mode === "linear";
    const left=48, right=478, top=31, bottom=144;
    const sx = t => left + t/2*(right-left);
    const sy = c => bottom - c/3.0*(bottom-top);
    const start=[0,2.5], end=[2,1.25];
    const points = linear ? [start,end] : Array.from({length:37},(_,i)=>{
      const t=2*i/36;
      return [t,2.5*Math.exp(-Math.LN2*t/2)];
    });
    svg.setAttribute("aria-label",linear
      ? "线性梯形法：两端点连直线，AUC 为 3.750 ng·h/mL"
      : "对数梯形法：指数下降，AUC 约为 3.607 ng·h/mL");
    line(svg,left,bottom,right,bottom,{stroke:"#bdbfbd"});
    line(svg,left,top,left,bottom,{stroke:"#bdbfbd"});
    text(svg,left,top-9,"浓度",{class:"pk-viz-axis"});
    text(svg,left,bottom+19,"0",{"text-anchor":"middle",class:"pk-viz-axis"});
    text(svg,right,bottom+19,"2 h",{"text-anchor":"middle",class:"pk-viz-axis"});
    add(svg,"path",{d:areaFor(points,sx,sy,bottom),fill:linear?"#e3eeed":"#f7eddc"});
    add(svg,"path",{d:pathFor(points,sx,sy),fill:"none",stroke:linear?"#385f65":"#b0844a","stroke-width":2.5,"stroke-linecap":"round"});
    dot(svg,sx(0),sy(2.5));
    dot(svg,sx(2),sy(1.25));
    text(svg,left+9,sy(2.5)-12,"2.5",{class:"pk-viz-value"});
    text(svg,right-8,sy(1.25)-12,"1.25",{"text-anchor":"end",class:"pk-viz-value"});
    text(svg,(left+right)/2,top+24,linear?"AUC = 3.750":"AUC ≈ 3.607",{"text-anchor":"middle",class:"pk-viz-value"});
  }

  function bind(root, render, explanations) {
    const svg = root.querySelector("svg");
    const label = root.querySelector("[data-pk-caption]");
    const buttons = Array.from(root.querySelectorAll("[data-mode]"));
    function activate(mode) {
      buttons.forEach(button => button.setAttribute("aria-pressed",String(button.dataset.mode===mode)));
      render(svg,mode);
      label.textContent = explanations[mode] || "";
    }
    buttons.forEach(button => button.addEventListener("click",()=>activate(button.dataset.mode)));
    const active = buttons.find(b=>b.getAttribute("aria-pressed")==="true") || buttons[0];
    if (svg && active) activate(active.dataset.mode);
  }
  const curve = document.querySelector('[data-pk-demo="curve"]');
  if (curve) bind(curve,paintCurve,captions);

  const auc = document.querySelector('[data-pk-demo="auc"]');
  if (auc) {
    const areaLinear=(2.5+1.25)/2*2;
    const areaLog=(2.5-1.25)/Math.log(2.5/1.25)*2;
    bind(auc,paintAUC,{
      linear:"线性梯形法：AUC = (2.5 + 1.25) / 2 × 2 = "+areaLinear.toFixed(3)+" ng·h/mL。下降段按直线连接。",
      log:"对数梯形法：AUC = (2.5 − 1.25) / ln(2.5 / 1.25) × 2 ≈ "+areaLog.toFixed(3)+" ng·h/mL。下降段按指数曲线连接。"
    });
  }
})();
