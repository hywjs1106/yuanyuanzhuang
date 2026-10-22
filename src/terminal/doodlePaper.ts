/** Clear only light neutral paper reachable from the image edge.
 * Enclosed white faces/clothes and colored strokes retain their original RGBA. */
export function clearDoodlePaper(pixels:Uint8ClampedArray,width:number,height:number){
 const seen=new Uint8Array(width*height),barrier=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
 // Close tiny breaks in sketch outlines before flood-fill, so pale hair/white fabric
 // stay inside the character rather than leaking into the surrounding paper.
 // Keep the neutral tolerance narrow: pale green hair can differ by only 7 RGB levels.
 for(let index=0;index<width*height;index++){
  const p=index*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];
  if(Math.min(r,g,b)>=180&&Math.max(r,g,b)-Math.min(r,g,b)<=5)continue;
  const x=index%width,y=Math.floor(index/width);
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<width&&ny>=0&&ny<height)barrier[ny*width+nx]=1;}
 }
 const visit=(index:number)=>{if(seen[index]||barrier[index])return;seen[index]=1;const p=index*4;const r=pixels[p],g=pixels[p+1],b=pixels[p+2];if(Math.min(r,g,b)<180||Math.max(r,g,b)-Math.min(r,g,b)>5)return;queue[tail++]=index;};
 for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}for(let y=1;y<height-1;y++){visit(y*width);visit(y*width+width-1);}
 while(head<tail){const index=queue[head++];pixels[index*4+3]=0;const x=index%width,y=Math.floor(index/width);if(x>0)visit(index-1);if(x<width-1)visit(index+1);if(y>0)visit(index-width);if(y<height-1)visit(index+width);}
}


/** Invalid/opaque frames must never replace a previously good cutout. */
export function hasDoodleCutout(pixels:Uint8ClampedArray,width:number,height:number){
 const count=width*height;if(!count||pixels[3]!==0||pixels[(width-1)*4+3]!==0||pixels[(count-width)*4+3]!==0||pixels[(count-1)*4+3]!==0)return false;
 let transparent=0;for(let p=3;p<pixels.length;p+=4)if(pixels[p]===0)transparent++;
 return transparent>count*.55;
}
