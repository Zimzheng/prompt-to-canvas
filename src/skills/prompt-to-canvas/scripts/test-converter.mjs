import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { convert } from './svg-to-scene.mjs';
import { validateScene } from './validate-scene.mjs';

const wrap = content => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">${content}</svg>`;
const scene = content => convert(wrap(content));
const rect = '<rect id="node" x="100" y="100" width="200" height="100" fill="#fff"/>';

test('group paint inheritance, overrides, dash, opacity and nested selection groups survive', () => {
  const s = scene(`<g id="outer" fill="#aabbcc" stroke="#123456" stroke-width="3" opacity="0.5"><g id="inner" opacity="0.4"><rect id="a" x="10" y="20" width="100" height="60"/><rect id="b" x="200" y="20" width="100" height="60" style="fill:#ffeecc;stroke:none"/><line x1="20" y1="200" x2="100" y2="200" stroke-dasharray="6 4"/></g></g>`);
  assert.equal(s.elements[0].backgroundColor, '#aabbcc');
  assert.equal(s.elements[0].strokeColor, '#123456');
  assert.equal(s.elements[0].opacity, 20);
  assert.deepEqual(s.elements[0].groupIds, ['inner','outer']);
  assert.equal(s.elements[1].backgroundColor, '#ffeecc');
  assert.equal(s.elements[1].strokeColor, 'transparent');
  assert.equal(s.elements[2].strokeStyle, 'dashed');
  assert.ok(s.metadata.conversionWarnings.some(w => w.includes('compositing')));
  assert.deepEqual(validateScene(s), []);
});

test('a real diamond is native; a triangle stays an editable closed line', () => {
  const s = scene('<polygon id="d" points="200,0 300,80 200,160 100,80" fill="#fff"/><polygon id="triangle" points="400,0 500,160 300,160" fill="#def"/>');
  assert.equal(s.elements[0].type,'diamond');
  assert.deepEqual([s.elements[0].x,s.elements[0].y,s.elements[0].width,s.elements[0].height],[100,0,200,160]);
  assert.equal(s.elements[1].type,'line');
  assert.deepEqual(s.elements[1].points[0],s.elements[1].points.at(-1));
  assert.equal(s.elements[1].backgroundColor,'#def');
});

test('relative path commands and curve sampling preserve exact endpoints and arrow semantics', () => {
  const s = scene('<path id="route" d="m10 20 h40 v30 l20 -10 c10 0 20 20 30 20 q10 10 20 0" fill="none" stroke="#123" marker-end="url(#arrow)"/>');
  const e=s.elements[0];
  assert.equal(e.type,'arrow');
  assert.deepEqual([e.x+e.points[0][0], e.y+e.points[0][1]],[10,20]);
  assert.deepEqual([e.x+e.points.at(-1)[0], e.y+e.points.at(-1)[1]],[120,60]);
  assert.ok(e.points.length>16);
  assert.equal(e.endArrowhead,'arrow');
  assert.ok(s.metadata.conversionWarnings.some(w => w.includes('sampled')));
});

test('closed linear paths preserve fill and closing point',()=>{
  const e=scene('<path d="M10 10 L100 10 L50 100 Z" fill="#abc"/>').elements[0];
  assert.deepEqual(e.points[0],e.points.at(-1));
  assert.equal(e.backgroundColor,'#abc');
});

test('forward-referenced labels and endpoints create reciprocal bindings',()=>{
  const s=scene(`<line id="edge" x1="300" y1="150" x2="500" y2="150" stroke="#123" marker-start="url(#arrow)" data-start-id="#node" data-end-id="other"/><text id="label" x="200" y="160" text-anchor="middle" data-container-id="node">审核</text>${rect}<rect id="other" x="500" y="100" width="200" height="100"/>`);
  const edge=s.elements[0], label=s.elements[1], node=s.elements[2];
  assert.equal(edge.startBinding.elementId,'node');
  assert.equal(edge.endBinding.elementId,'other');
  assert.equal(edge.startBinding.focus,0);
  assert.equal(edge.endArrowhead,null);
  assert.equal(label.containerId,'node');
  assert.ok(node.boundElements.some(e=>e.id==='edge'));
  assert.ok(node.boundElements.some(e=>e.id==='label'));
  assert.deepEqual(validateScene(s),[]);
});

test('repeated conversion is deterministic and does not leak seed state',()=>{
  assert.deepEqual(scene(rect),scene(rect));
});

test('text entities, explicit tspan lines and native sans font remain editable',()=>{
  const e=scene('<g data-font-family="2"><text x="10" y="50" font-size="24"><tspan x="10">API &amp; 模型</tspan><tspan x="10" dy="32">&#x5BA1;&#26680;</tspan></text></g>').elements[0];
  assert.equal(e.fontFamily,2);
  assert.equal(e.text,'API & 模型\n审核');
  assert.ok(e.width>100);
  const text=scene('<text x="10" y="50">&amp;lt; &lt; &amp;</text>').elements[0].text;
  assert.equal(text,'&lt; < &');
});

test('transforms preserve rotated native shape angle and uniform scale',()=>{
  const e=scene('<g transform="translate(10 20) rotate(30) scale(2)"><rect x="0" y="0" width="100" height="50" fill="#fff" stroke="#123" stroke-width="2"/></g>').elements[0];
  assert.ok(Math.abs(e.width-200)<1e-8);
  assert.ok(Math.abs(e.height-100)<1e-8);
  assert.ok(Math.abs(e.angle-Math.PI/6)<1e-8);
  assert.equal(e.strokeWidth,4);
});

test('definitions and commented graphics never leak into the scene',()=>{
  const s=scene(`<!-- <rect width="9" height="9"/> --><defs><marker id="arrow"><path d="M0 0 L10 4 L0 8 Z"/></marker><rect id="unused" width="5" height="5"/></defs>${rect}`);
  assert.equal(s.elements.length,1);
});

test('unsupported visible geometry, CSS and compositing fail explicitly',()=>{
  for(const content of [
    '<image href="x.png"/>', '<path d="M0 0 A10 10 0 0 0 20 20"/>',
    '<path d="M0 0 L10 10 M20 20 L30 30"/>', '<use href="#node"/>',
    '<rect width="100" height="100" filter="url(#blur)"/>',
    '<rect width="100" height="100" fill="url(#gradient)"/>',
    '<style>rect{fill:red}</style>', '<rect width="100" height="100" fill-opacity=".4"/>',
    '<g transform="skewX(20)">'+rect+'</g>', '<g transform="scale(2 3)">'+rect+'</g>',
    '<text><tspan fill="red">inline</tspan></text>'
  ]) assert.throws(()=>scene(content), /unsupported|requires|Only|Inline|Unknown/i, content);
});

test('malformed input, duplicate IDs, invalid geometry and broken bindings fail',()=>{
  for(const content of [
    '<g>'+rect, rect+rect, '<rect width="NaN" height="100"/>',
    '<rect width="100%" height="100"/>', '<rect width="-10" height="100"/>',
    '<polygon points="0,0 20,20 30"/>', '<path d="M0 0 L"/>',
    '<text data-container-id="missing">label</text>',
    rect+'<line x1="0" y1="0" x2="100" y2="100" data-end-id="node"/>',
    rect+'<text data-container-id="node">A</text><text data-container-id="node">B</text>'
  ]) assert.throws(()=>scene(content), undefined, content);
});

test('validator catches malformed arrays, nonfinite geometry, duplicate IDs and dangling links',()=>{
  assert.ok(validateScene({type:'excalidraw',appState:{viewBackgroundColor:'#ffffff'},elements:{}}).length);
  const valid=scene(rect);
  assert.deepEqual(validateScene(valid),[]);
  for(const mutate of [
    s=>s.elements.push({...s.elements[0]}), s=>s.elements[0].x=null,
    s=>s.elements[0].groupIds=['x','x'],
    s=>s.elements[0].boundElements=[{id:'gone',type:'text'}]
  ]) {const copy=structuredClone(valid);mutate(copy);assert.ok(validateScene(copy).length);}
});

test('validator detects wrong script while allowing bilingual technical labels',()=>{
  assert.ok(validateScene(scene('<text>English explanation</text>'),{expectedLanguage:'zh'}).length);
  assert.deepEqual(validateScene(scene('<text>审核 Agent</text>'),{expectedLanguage:'zh'}),[]);
});

test('CLI writes a validated scene; failed conversion does not create an output',()=>{
  const dir=mkdtempSync(join(tmpdir(),'canvas-converter-'));
  const converter=fileURLToPath(new URL('./svg-to-scene.mjs',import.meta.url));
  const validator=fileURLToPath(new URL('./validate-scene.mjs',import.meta.url));
  try {
    const input=join(dir,'input.svg'), output=join(dir,'scene.json');
    writeFileSync(input,wrap(rect));
    execFileSync(process.execPath,[converter,'--svg',input,'--out',output]);
    assert.equal(JSON.parse(readFileSync(output,'utf8')).elements.length,1);
    execFileSync(process.execPath,[validator,'--scene',output]);
    writeFileSync(input,wrap('<image href="bad.png"/>'));
    const missing=join(dir,'should-not-exist.json');
    const result=spawnSync(process.execPath,[converter,'--svg',input,'--out',missing],{encoding:'utf8'});
    assert.equal(result.status,1);
    assert.match(result.stderr,/Unsupported SVG element/);
    assert.equal(existsSync(missing),false);
  } finally {rmSync(dir,{recursive:true,force:true});}
});


test('bound curves keep useful endpoint tangents and exact source endpoints',()=>{
  const s=scene(`<rect id="a" x="600" y="200" width="240" height="100"/><rect id="b" x="100" y="100" width="200" height="100"/><path id="curve" d="M720 300 C720 700 200 700 200 200" fill="none" stroke="#123" marker-end="url(#arrow)" data-start-id="a" data-end-id="b"/>`);
  const e=s.elements.find(e=>e.id==='curve');
  assert.deepEqual([e.x+e.points[0][0],e.y+e.points[0][1]],[720,300]);
  assert.deepEqual([e.x+e.points.at(-1)[0],e.y+e.points.at(-1)[1]],[200,200]);
  for(const [first,next] of [[e.points[0],e.points[1]],[e.points.at(-1),e.points.at(-2)]]) assert.ok(Math.hypot(first[0]-next[0],first[1]-next[1])>100);
  assert.deepEqual(validateScene(s),[]);
});

test('the actual editor bridge preserves explicitly absent arrowheads',()=>{
  const source=readFileSync(new URL('../assets/editor/editor-bridge.js',import.meta.url),'utf8');
  const context={window:{}};
  runInNewContext(source,context);
  const normalized=context.window.PromptToCanvas.normalizeToExcalidrawScene({elements:[{id:'start-only',type:'arrow',startArrowhead:'arrow',endArrowhead:null,points:[[0,0],[100,0]]}]});
  assert.equal(normalized.elements[0].startArrowhead,'arrow');
  assert.equal(normalized.elements[0].endArrowhead,null);
});
