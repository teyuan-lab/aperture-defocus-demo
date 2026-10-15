// Uniform incoherent source and pupil sampling; no wave diffraction.
const kittyPath='M -60 -28 L -61 -65 L -28 -48 Q 0 -56 28 -48 L 61 -65 L 60 -28 Q 82 -5 66 30 Q 52 56 0 56 Q -52 56 -66 30 Q -82 -5 -60 -28 Z';
const sourceCache=new Map();
function sourceMask(kind){
 const c=document.createElement('canvas');c.width=160;c.height=160;const g=c.getContext('2d');g.translate(80,80);g.fillStyle='#86b5ff';g.fill(new Path2D(kind==='kitty'?kittyPath:shapes[kind]));
 if(kind==='kitty'){
  g.globalCompositeOperation='destination-out';g.lineWidth=3;
  for(const [x,y,rx,ry] of [[-25,6,5,8],[25,6,5,8],[0,21,7,5]]){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
  for(const side of [-1,1])for(const y of [-4,12,28]){g.beginPath();g.moveTo(side*44,y);g.lineTo(side*69,y+(y-12)*.3);g.stroke()}
  g.globalCompositeOperation='source-over';g.fillStyle='#ff91bb';g.fill(new Path2D('M 28 -42 L 14 -60 L 12 -29 Z M 28 -42 L 49 -59 L 49 -26 Z'));g.beginPath();g.arc(28,-42,6,0,Math.PI*2);g.fill();
 }
 return c;
}
function sampleMask(kind){
 if(sourceCache.has(kind))return sourceCache.get(kind);
 const canvas=sourceMask(kind),data=canvas.getContext('2d').getImageData(0,0,160,160).data,points=[];
 for(let y=0;y<160;y+=2)for(let x=0;x<160;x+=2)if(data[(y*160+x)*4+3]>127)points.push([x-80,y-80,data[(y*160+x)*4],data[(y*160+x)*4+1],data[(y*160+x)*4+2]]);sourceCache.set(kind,points);return points;
}
function renderSource(z,angle){
 const kind=$('source').value,point=kind==='point',size=+$('sourceSize').value,mag=conjugates().mag,zoom=fieldZoom(); $('sourceSizeValue').textContent=point?'Point (zero extent)':size.toFixed(2)+'× aperture coordinate scale'; $('sourceSize').disabled=point;
 if(point){$('sourcePreview').innerHTML=screen(0,0);return}
 const preview=sourceMask(kind);preview.style=`height:${90*size/1.2}px;width:${90*size/1.2}px;object-fit:contain`;preview.setAttribute('aria-label','Selected source shape');$('sourcePreview').replaceChildren(preview);
 const src=sampleMask(kind),pupil=sampleMask($('shape').value),canvas=document.createElement('canvas');canvas.width=600;canvas.height=500;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Geometric image of extended source');canvas.style='width:100%;height:100%;object-fit:contain';const c=canvas.getContext('2d'),bins=new Float32Array(300000),red=new Float32Array(300000),green=new Float32Array(300000),blue=new Float32Array(300000),r=angle*Math.PI/180,co=Math.cos(r),si=Math.sin(r),s=1-z;
 if(Math.abs(s)<1e-8){c.fillStyle='#0d182a';c.fillRect(0,0,600,500);c.save();c.translate(300,250);c.scale(-size*mag/zoom,-size*mag/zoom);c.drawImage(sourceMask(kind),-80,-80);c.restore();$('observation').replaceChildren(canvas);$('status').textContent='At focus: a sharp, inverted image of the extended source.';$('footprint').textContent=`Aperture defocus scale: 0.00×. Source-image scale: −${mag.toFixed(2)}×.`;return}
 let seed=246813579;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<160000;i++){const u=src[Math.floor(random()*src.length)],a=pupil[Math.floor(random()*pupil.length)];const x=Math.round(300+(s*(co*a[0]-si*a[1])-z*mag*size*u[0])/zoom),y=Math.round(250+(s*(si*a[0]+co*a[1])-z*mag*size*u[1])/zoom);if(x>=0&&x<600&&y>=0&&y<500){const n=y*600+x;bins[n]++;red[n]+=u[2];green[n]+=u[3];blue[n]+=u[4]}}
 const smooth=new Float32Array(bins.length),sr=new Float32Array(bins.length),sg=new Float32Array(bins.length),sb=new Float32Array(bins.length);let peak=0;
 for(let y=1;y<499;y++)for(let x=1;x<599;x++){const n=y*600+x;let v=0,rr=0,gg=0,bb=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=(y+dy)*600+x+dx;v+=bins[j];rr+=red[j];gg+=green[j];bb+=blue[j]}smooth[n]=v;sr[n]=rr;sg[n]=gg;sb[n]=bb;peak=Math.max(peak,v)}
 const img=c.createImageData(600,500);for(let i=0;i<bins.length;i++){const v=peak?Math.pow(smooth[i]/peak,.65):0,n=smooth[i]||1;img.data[i*4]=13*(1-v)+v*sr[i]/n;img.data[i*4+1]=24*(1-v)+v*sg[i]/n;img.data[i*4+2]=42*(1-v)+v*sb[i]/n;img.data[i*4+3]=255}c.putImageData(img,0,0);$('observation').replaceChildren(canvas);
 $('status').textContent=Math.abs(s)<1e-8?'At focus: a sharp, inverted image of the extended source.':'Extended source: overlapping aperture footprints blur the source image. Each point’s aperture footprint rotates 180° across focus.';
 $('footprint').textContent=`Aperture defocus scale: ${s.toFixed(2)}×. Source-image scale: ${(-z*mag).toFixed(2)}× (magnification at focus: −${mag.toFixed(2)}×).`;
}
