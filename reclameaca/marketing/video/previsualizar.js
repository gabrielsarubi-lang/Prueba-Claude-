/* Saca PNGs de una pieza en los segundos que le pidas, sin renderizar el video entero.
   Uso:  node previsualizar.js reel-01-gimnasio 0.9 3.4 6.2   */
const fs=require('fs'),path=require('path'),{chromium}=require('playwright-core');
const DIR=__dirname, SALIDA=path.join(DIR,'salida','previa');
const CHROME=process.env.CHROME_BIN||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async()=>{
  const id=process.argv[2], tiempos=process.argv.slice(3).map(Number);
  const pieza=require('./piezas.js').find(p=>p.id===id);
  if(!pieza){console.error('No existe la pieza '+id);process.exit(1);}
  fs.mkdirSync(SALIDA,{recursive:true});
  const html=path.join(DIR,`.previa.html`);
  fs.writeFileSync(html,`<!doctype html><html lang="es-AR"><head><meta charset="utf-8">
<link rel="stylesheet" href="lib/estilo.css"></head><body><div id="stage">
${pieza.escenas.join('\n')}
${pieza.progreso===false?'':'<div id="prog"><i></i></div>'}
</div><script src="lib/motor.js"></script></body></html>`);
  const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--disable-gpu','--font-render-hinting=none','--force-color-profile=srgb']});
  const pg=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await pg.goto('file://'+html,{waitUntil:'load'});
  await pg.evaluate(()=>document.fonts.ready);
  const dur=await pg.evaluate(()=>window.DURACION);
  const ts=tiempos.length?tiempos:[...Array(pieza.escenas.length)].map((_,i)=>0);
  for(const t of ts){
    await pg.evaluate(x=>window.seek(x),t);
    const f=path.join(SALIDA,`${id}_${t.toFixed(2)}s.png`);
    await pg.screenshot({path:f});
    console.log(f);
  }
  console.log('duración total: '+dur.toFixed(2)+'s');
  await b.close(); fs.unlinkSync(html);
})();
