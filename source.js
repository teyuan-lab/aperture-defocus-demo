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
 for(let y=0;y<160;y+=2)for(let x=0;x<160;x+=2)if(data[(y*160+x)*4+3]>127)points.push([x-80,y-80]);sourceCache.set(kind,points);return points;
}
function renderSource(z,angle){
 const kind=$('source').value,point=kind==='point';
 if(point){$('sourcePreview').innerHTML=screen(0,0);return}
 const preview=sourceMask(kind);preview.style='height:100%;width:auto';preview.setAttribute('aria-label','Selected source shape');$('sourcePreview').replaceChildren(preview);
 const src=sampleMask(kind),pupil=sampleMask($('shape').value),canvas=document.createElement('canvas');canvas.width=240;canvas.height=200;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Geometric image of extended source');canvas.style='width:100%;height:100%;object-fit:contain';const c=canvas.getContext('2d'),bins=new Float32Array(48000),r=angle*Math.PI/180,co=Math.cos(r),si=Math.sin(r),s=1-z;
 let seed=246813579;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<160000;i++){const u=src[Math.floor(random()*src.length)],a=pupil[Math.floor(random()*pupil.length)];const x=Math.round(120+s*(co*a[0]-si*a[1])-z*.65*u[0]),y=Math.round(100+s*(si*a[0]+co*a[1])-z*.65*u[1]);if(x>=0&&x<240&&y>=0&&y<200)bins[y*240+x]++}
 const smooth=new Float32Array(bins.length);let peak=0;
 for(let y=1;y<199;y++)for(let x=1;x<239;x++){let v=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)v+=bins[(y+dy)*240+x+dx];smooth[y*240+x]=v;peak=Math.max(peak,v)}
 const img=c.createImageData(240,200);for(let i=0;i<bins.length;i++){const v=peak?Math.pow(smooth[i]/peak,.65):0;img.data[i*4]=13+v*121;img.data[i*4+1]=24+v*157;img.data[i*4+2]=42+v*213;img.data[i*4+3]=255}c.putImageData(img,0,0);$('observation').replaceChildren(canvas);
 $('status').textContent=Math.abs(s)<1e-8?'At focus: a sharp, inverted image of the extended source.':'Extended source: overlapping aperture footprints blur the source image. Each point’s aperture footprint rotates 180° across focus.';
 $('footprint').textContent=`Aperture defocus scale: ${s.toFixed(2)}×. Source-image scale: ${(-z).toFixed(2)}× (unit negative magnification at focus).`;
}
