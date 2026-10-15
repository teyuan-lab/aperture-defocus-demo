function renderRays(z,angle){
 const xs=90,xl=390,xi=690,xe=990,cy=210,k=.55;
 const point=$('source').value==='point',size=+$('sourceSize').value;
 const pupil=sampleMask($('shape').value),r=angle*Math.PI/180;
 let lo=Infinity,hi=-Infinity;for(const [x,y] of pupil){const v=x*Math.sin(r)+y*Math.cos(r);lo=Math.min(lo,v);hi=Math.max(hi,v)}
 let sourceYs=[0];if(!point){const pts=sampleMask($('source').value);let a=Infinity,b=-Infinity;for(const [,y] of pts){a=Math.min(a,y);b=Math.max(b,y)}sourceYs=[a*size,b*size]}
 const xo=xl+300*z;
 let svg='<defs><marker id="zArrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#8393a9"/></marker></defs>';
 svg+=`<path d="M40 ${cy} H1050" stroke="#a3b0c2" marker-end="url(#zArrow)"/><text x="1050" y="235" fill="#647790">z</text>`;
 sourceYs.forEach((u,i)=>{const color=i?'#cb7836':'#2465df';for(const a of [lo,hi]){const obs=(1-z)*a-z*u;svg+=`<path d="M${xs} ${cy+k*u} L${xl} ${cy+k*a} L${xe} ${cy+k*(-a-2*u)}" fill="none" stroke="${color}" stroke-width="1.8" opacity=".75"/><circle cx="${xo}" cy="${cy+k*obs}" r="3.5" fill="${color}"/>`}svg+=`<circle cx="${xs}" cy="${cy+k*u}" r="4" fill="${color}"/><circle cx="${xi}" cy="${cy-k*u}" r="4" fill="${color}"/>`});
 for(const [x,title,label,color] of [[xs,'Source plane','−zᵢ (−2f)','#647790'],[xl,'Lens + aperture','0','#172b46'],[xi,'Ideal image plane','zᵢ (2f)','#647790']]){svg+=`<path d="M${x} 62 V355" stroke="${color}" stroke-width="${x===xl?4:1.5}" ${x===xl?'':'stroke-dasharray="5 5"'}/><text x="${x}" y="35" text-anchor="middle" fill="${color}">${title}</text><text x="${x}" y="380" text-anchor="middle" fill="${color}">z = ${label}</text>`}
 svg+=`<path d="M${xo} 75 V350" stroke="#2465df" stroke-width="2.5"/><text x="${xo}" y="417" text-anchor="middle" fill="#2465df">Observation: ${z.toFixed(2)} zᵢ</text><text x="990" y="380" text-anchor="middle" fill="#647790">2zᵢ</text>`;
 $('rays').innerHTML=svg;
}
