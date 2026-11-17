#!/usr/bin/env node
// Vendored from the canvas-storybook kit's migration addon (GPL-2.0-or-later)
// so beds without the website-to-components pipeline still get cm09's parity
// audit: prepare-bed.sh stages this file to .abp-eval/pipeline/scripts/.
// Extended here with target-only auth files for protected served pages.
// Source-vs-build element inventory + parity audit (site-agnostic QA gate).
//
// Extracts a structured inventory of the VISIBLE content elements of a page —
// headings, paragraphs/list-item text, links (label + href), images (src + alt),
// and "repeating blocks" (groups of similar sibling items, with per-item field
// counts) — then diffs a SOURCE page against a BUILT page so missed or altered
// content surfaces before sign-off. This is the durable guard against the two
// recurring content bugs: invented values and dropped items in a repeating list.
//
// It runs the same extraction in-page via `agent-browser eval` against any URL
// (or a saved file:// snapshot), so it works for any site. Builder-injected noise
// (inline <style>/CSS text nodes, Squarespace's duplicate <li>/<p>) is filtered.
//
// Usage:
//   node scripts/element-inventory.js <url>                       # print inventory
//   node scripts/element-inventory.js <source-url> <built-url>    # diff source→built
//
// Target auth: append --target-cookies-file or --target-headers-file with a
// mode-0600 JSON file. Only the built-page open receives these headers.
//
// Tips: for bot-walled sources, save the HTML and pass a file:// path. The diff
// is text-based (normalised), so trivial whitespace/case differences are ignored;
// it flags source text/links/images with no match in the build, and large
// repeating-block count drops.

import { execFileSync } from 'child_process';
import { readFileSync, lstatSync } from 'node:fs';

function evalPage(url, js, headers = null) {
  // open then eval against the controlled browser tab
  // agent-browser has no file/env header option; credential exposure in argv is unavoidable without upstream support.
  try { execFileSync('agent-browser', ['open', ...(headers ? ['--headers', JSON.stringify(headers)] : []), url], { stdio: 'ignore' }); }
  catch { throw new Error('inventory could not open page'); }
  try { execFileSync('agent-browser', ['wait', '1500'], { stdio: 'ignore' }); } catch {}
  const out = execFileSync('agent-browser', ['eval', '--stdin'], { input: js, encoding: 'utf8' }).trim();
  try { let v = JSON.parse(out); if (typeof v === 'string') v = JSON.parse(v); return v; }
  catch { return null; }
}

// In-page extraction. Returns { headings[], texts[], links[{label,href}],
// images[{src,alt}], repeatingBlocks[{selector,count,fieldsPerItem}],
// shown, password }. It first waits for the page to finish rendering (and
// on the build, scrolls through it; see WALK below): a page drawn by script
// (a Storybook story) can still be blank when the page load ends (measured: a first grade after a bed update read a blank story
// and listed every item missing; the regrade passed). Rendered means visible
// text, a visible decoded picture or a visible inline svg, unchanged for
// STABLE_MS, waited for up to SETTLE_MS. Hidden text does not count: Storybook keeps its hidden
// "No Preview" messages in every page. A build still blank after the wait is
// graded as it is (everything missing): the build is the agent's, so a blank
// one must never become "could not measure".
const SETTLE_MS = 12000;
const STABLE_MS = 1500;
const EXTRACT = (walk) => `(async function(){
  var WALK=${walk ? 'true' : 'false'};
  function clean(t){ return (t||'').replace(/\\s+/g,' ').trim(); }
  function seen(){
    var pics=[].filter.call(document.images,function(i){ var r=i.getBoundingClientRect(); return r.width>1&&r.height>1&&i.complete&&i.naturalWidth>0; }).length;
    var text=clean(document.body&&document.body.innerText);
    // an icon-only page (linked inline svg, no text) is rendered too
    var svgs=[].filter.call(document.querySelectorAll('svg'),function(e){ var r=e.getBoundingClientRect(); return r.width>1&&r.height>1&&getComputedStyle(e).visibility!=='hidden'; }).length;
    pics+=svgs;
    var srcs=[].map.call(document.images,function(i){ return i.complete&&i.naturalWidth>0?i.currentSrc||i.src:''; }).join(' ');
    return { shown: !!text||pics>0, sig: text+'|'+srcs+'|'+svgs };
  }
  async function settle(){
    var start=Date.now(), last=null, since=0, now;
    for(;;){
      now=seen();
      if(now.shown&&now.sig===last&&Date.now()-since>=${STABLE_MS}) return now;
      if(now.sig!==last){ last=now.sig; since=Date.now(); }
      if(Date.now()-start>=${SETTLE_MS}) return now;
      await new Promise(function(r){ setTimeout(r,250); });
    }
  }
  var now=await settle();
  // The build only: walk it one screen at a time so content a script adds
  // on scroll (IntersectionObserver loaders) is there, then back to the top
  // and settle again. It walks after the first render, so a story that
  // mounts late is walked too; the page height is read on every step. The
  // archived source is never walked: it was scrolled through before it was
  // saved, and replaying its scripts on scroll could grow it (a feed) and
  // move the baseline. At most 40 screens: an endless feed must not hold
  // the grade.
  if(WALK){
    for(var y=0, step=Math.max(window.innerHeight,1), n=0; y<document.body.scrollHeight&&n<40; y+=step, n++){
      window.scrollTo(0,y);
      await new Promise(function(r){ setTimeout(r,150); });
    }
    window.scrollTo(0,0);
    now=await settle();
  }
  // A visible password field the source does not have: shown as a hint on
  // a FAIL (the site shield may not have been passed), never a verdict.
  var password=[].some.call(document.querySelectorAll('input[type=password]'),function(e){
    var r=e.getBoundingClientRect(), cs=getComputedStyle(e);
    return r.width>1&&r.height>1&&cs.visibility!=='hidden'&&cs.display!=='none';
  });
  function isNoise(t){ return !t || t.length>300 || /\\{|\\}|--tweak|@media|px;|block-yui|sqs-|webkit/.test(t); }
  function offscreen(e){
    var r=e.getBoundingClientRect(), cs=getComputedStyle(e);
    // clip: rect(top, right, bottom, left) hides the element only when the
    // rectangle it leaves is 1px or less.
    var clip=String(cs.clip), clipped=false;
    if(clip.indexOf('rect(')===0){
      var q=clip.slice(5,-1).split(/[ ,]+/).map(parseFloat);
      clipped=q.length===4&&q.every(function(v){return !isNaN(v);})&&(q[1]-q[3]<=1||q[2]-q[0]<=1);
    }
    return r.width<=1||r.height<=1||r.right<=0||r.bottom+scrollY<=0||clipped||cs.clipPath==='inset(50%)';
  }
  function visibleTextLeaves(){
    var out=[]; var w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null); var n;
    while(n=w.nextNode()){
      // A skip link is page chrome: an in-page anchor (left out of the link
      // diff already) that is hidden until focused or says "skip". Other
      // in-page links ("Explore our services" to #services) are content.
      var a=n.parentElement&&n.parentElement.closest('a[href]');
      if(a&&/^#/.test(a.getAttribute('href')||'')&&(offscreen(a)||clean(a.textContent).toLowerCase().split(' ')[0]==='skip')) continue;
      var t=clean(n.textContent); if(!isNoise(t)) out.push(t);
    }
    // de-dupe consecutive duplicates (Squarespace emits li then identical p)
    return out.filter(function(t,i,a){ return i===0 || a[i-1]!==t; });
  }
  var headings=[].slice.call(document.querySelectorAll('h1,h2,h3,h4')).map(function(e){return clean(e.textContent);}).filter(function(t){return t&&!isNoise(t);});
  var links=[].slice.call(document.querySelectorAll('a[href]')).map(function(a){
    var href=a.getAttribute('href')||''; return { label: clean(a.textContent) || ('['+ (a.querySelector('img,svg')?'icon':'') +']'), href: href };
  }).filter(function(l){ return l.href && !/^javascript:/.test(l.href); });
  var images=[].slice.call(document.querySelectorAll('img')).map(function(i){
    var src=(i.currentSrc||i.src||i.getAttribute('data-src')||'');
    // The absolute address, for the content pass (a protocol-relative CDN
    // address on a file:// snapshot means https, not file).
    var raw=i.getAttribute('src')||i.getAttribute('data-src')||'';
    var abs=''; try { abs=raw.slice(0,2)==='//'?'https:'+raw:new URL(src, document.baseURI).href; } catch(e){}
    return { src: src.split('?')[0].split('/').pop(), alt: clean(i.getAttribute('alt')||''), abs: abs };
  }).filter(function(o){ return o.src; });
  // Repeating blocks: parents whose >=3 element children share the same tag+class.
  var repeating=[];
  [].slice.call(document.querySelectorAll('ul,ol,div,section')).forEach(function(p){
    var kids=[].slice.call(p.children);
    if(kids.length<3) return;
    var sig={}; kids.forEach(function(k){ var s=k.tagName+'.'+(k.className||'').toString().split(' ')[0]; sig[s]=(sig[s]||0)+1; });
    var top=Object.keys(sig).sort(function(a,b){return sig[b]-sig[a];})[0];
    if(sig[top]>=3){
      var items=kids.filter(function(k){ return (k.tagName+'.'+(k.className||'').toString().split(' ')[0])===top; });
      var fields=items[0]? items[0].querySelectorAll('a,img,h1,h2,h3,h4,p,span,svg').length : 0;
      repeating.push({ selector: top, count: items.length, fieldsPerItem: fields });
    }
  });
  // keep the few biggest repeating groups
  repeating.sort(function(a,b){return b.count-a.count;});
  return JSON.stringify({
    shown: now.shown,
    password: password,
    title: clean(document.title),
    headings: headings,
    texts: visibleTextLeaves(),
    links: links,
    images: images,
    repeatingBlocks: repeating.slice(0,8),
  });
}())`;

function inventory(url, headers = null, walk = false) { return evalPage(url, EXTRACT(walk), headers); }

function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
// Visible text (headings, text bits) also folds the same text typed
// differently: "…" and "...", and the Latin letter ligatures (ﬁ and fi).
// Only those: blanket Unicode folding would make "m²" equal "m2". Links and
// picture names are compared with norm alone.
const LIGATURES = { '\ufb00': 'ff', '\ufb01': 'fi', '\ufb02': 'fl', '\ufb03': 'ffi', '\ufb04': 'ffl', '\ufb05': 'st', '\ufb06': 'st' };
function normText(s) { return norm(s).replace(/\u2026/g, '...').replace(/[\ufb00-\ufb06]/g, (c) => LIGATURES[c]); }

// dHash of a picture: 9x8 grey, each pixel brighter than its right-hand
// neighbour or not (the image-parity signature; survives resizing and
// re-encoding). Runs in the build page: source pictures arrive as data URLs
// fetched by node, build pictures are fetched same-origin in the page.
const HASH = (payload) => `(async function(){
  var p=${JSON.stringify(payload)};
  async function bits(url){
    try {
      // Decoded as image-parity decodes: an <img> from the bytes.
      var blob=await (await fetch(url,{credentials:'include'})).blob();
      var img=new Image(), obj=URL.createObjectURL(blob);
      await new Promise(function(ok,no){ img.onload=ok; img.onerror=no; img.src=obj; });
      URL.revokeObjectURL(obj);
      // Shrink by averaging, not in one jump: draw at 144x128 with smoothing,
      // then average each 16x16 block into one of the 9x8 cells. One jump
      // from a large picture samples a few pixels and moves with resolution.
      var c=document.createElement('canvas'); c.width=144; c.height=128;
      var g=c.getContext('2d'); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
      g.drawImage(img,0,0,144,128);
      var d=g.getImageData(0,0,144,128).data, lum=[], out='';
      for(var cy=0;cy<8;cy++) for(var cx=0;cx<9;cx++){
        var sum=0;
        for(var y=cy*16;y<cy*16+16;y++) for(var x=cx*16;x<cx*16+16;x++){
          var k=(y*144+x)*4; sum+=0.299*d[k]+0.587*d[k+1]+0.114*d[k+2];
        }
        lum.push(sum/256);
      }
      for(var y=0;y<8;y++) for(var x=0;x<8;x++) out+=lum[y*9+x]>lum[y*9+x+1]?'1':'0';
      var ones=out.split('1').length-1;
      if(ones<6||ones>58) return { flat: true }; // a flat fill carries no evidence
      // Colour layout: mean red, green, blue and alpha of a 3x3 grid. The
      // brightness signature above is colour-blind (a red and a blue logo of
      // one shape share it); the same picture re-encoded keeps its colours.
      var colour=[];
      for(var gy=0;gy<3;gy++) for(var gx=0;gx<3;gx++){
        var r=0,gg=0,bb=0,al=0,cnt=0;
        for(var y2=Math.floor(gy*128/3);y2<Math.floor((gy+1)*128/3);y2++) for(var x2=Math.floor(gx*144/3);x2<Math.floor((gx+1)*144/3);x2++){
          var k2=(y2*144+x2)*4; r+=d[k2]; gg+=d[k2+1]; bb+=d[k2+2]; al+=d[k2+3]; cnt++;
        }
        colour.push(r/cnt, gg/cnt, bb/cnt, al/cnt);
      }
      return { bits: out, colour: colour };
    } catch(e) { return { unread: true }; }
  }
  var r={source:[],built:[]};
  for(var i=0;i<p.source.length;i++) r.source.push(p.source[i]?await bits(p.source[i]):{ unread: true });
  for(var j=0;j<p.built.length;j++) r.built.push(await bits(p.built[j]));
  return JSON.stringify(r);
}())`;
// With the averaged shrink, the same picture re-encoded or resized sits 0-1
// bits apart and different pictures 10 or more (measured on 20 renamed and
// re-encoded images); 5 keeps a margin both ways.
const CONTENT_DIST = 5;
// Colour layout, 0-255 per channel: the same pictures at most 4.2 apart,
// different ones at least 31 (same 20 images); 16 keeps a margin both ways.
const COLOUR_DIST = 16;
async function dataUrl(url) {
  try {
    if (/^file:/.test(url)) return `data:image/*;base64,${readFileSync(new URL(url)).toString('base64')}`;
    if (!/^https?:/.test(url)) return null;
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) return null;
    const type = (resp.headers.get('content-type') || 'image/png').split(';')[0];
    return `data:${type};base64,${Buffer.from(await resp.arrayBuffer()).toString('base64')}`;
  } catch { return null; }
}
// Pictures still unpaired by name pair by content: a source picture is
// present when some build picture is within CONTENT_DIST of its brightness
// signature AND within COLOUR_DIST of its colour layout. Like the
// name match, one build picture can account for several identical source
// pictures (a logo in two headers).
//   A picture the grader could not download or read is not evidence either
// way. A source picture that is still unpaired is unmeasured, not missing,
// when its own print or any build picture's print could not be taken: the
// unread build picture may be the one it is. With no build picture left to
// pair with, it is missing whatever its print. A flat fill is read, it just
// carries no signature, so it stays a name-only match.
async function pairByContent(missing, builtExtra, builtUrl, headers) {
  if (!missing.length || !builtExtra.length) return { missing, unmeasured: [] };
  const payload = { source: await Promise.all(missing.map((i) => dataUrl(i.abs))), built: builtExtra.map((i) => i.abs) };
  let hashes = null;
  try { hashes = evalPage(builtUrl, HASH(payload), headers); } catch { hashes = null; }
  if (!hashes) return { missing: [], unmeasured: missing };
  const bitsApart = (a, b) => { let n = 0; for (let k = 0; k < 64; k++) if (a[k] !== b[k]) n++; return n; };
  const colourApart = (a, b) => Math.max(...a.map((v, k) => Math.abs(v - b[k])));
  const readable = (h) => !!h && !h.unread;
  const signed = (h) => readable(h) && !h.flat;
  const present = (hs) => signed(hs) && hashes.built.some((hb) => signed(hb)
    && bitsApart(hs.bits, hb.bits) <= CONTENT_DIST && colourApart(hs.colour, hb.colour) <= COLOUR_DIST);
  // Each unreadable build picture may be ONE of the missing source pictures
  // (copies of one picture, by name, count once on either side): it leaves that many
  // unknown, and the rest missing for certain.
  // copies of one unreadable build picture count once too
  let spare = new Set(builtExtra.filter((_, j) => !readable(hashes.built[j])).map((i) => norm(i.src))).size;
  const covered = new Set();
  const out = { missing: [], unmeasured: [] };
  missing.forEach((img, i) => {
    const hs = hashes.source[i];
    if (present(hs)) return;
    if (!readable(hs)) { out.unmeasured.push(img); return; }
    const id = norm(img.src);
    if (!covered.has(id) && spare > 0) { covered.add(id); spare--; }
    (covered.has(id) ? out.unmeasured : out.missing).push(img);
  });
  return out;
}

// Links compare by destination: a phone number by its digits (an extension
// kept apart), mail by its full set of recipients (to, cc, bcc; subject and
// body ignored), anything else by its path (origin differences ignored).
function linkKey(h) {
  const v = norm(h);
  if (/^tel:/.test(v)) {
    const [num, ...params] = v.slice(4).split(';');
    const ext = params.map((x) => x.split('=')).find(([k]) => k === 'ext');
    return 'tel:' + num.replace(/[^\d+]/g, '') + (ext ? ';ext=' + (ext[1] || '').replace(/\D/g, '') : '');
  }
  if (/^mailto:/.test(v)) {
    const [to, query = ''] = v.slice(7).split('?');
    // Decode once, and keep "+" (a legal mailbox character, not a space).
    const once = (x) => { try { return decodeURIComponent(x); } catch { return x; } };
    const list = (x) => once(x || '').split(',').map((m) => m.trim()).filter(Boolean);
    const fields = query.split('&').map((kv) => kv.split('=')).filter(([k]) => ['cc', 'bcc'].includes(k));
    const all = [...list(to), ...fields.flatMap(([, val]) => list(val))];
    return 'mailto:' + [...new Set(all)].sort().join(',');
  }
  return v.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
}

function diff(src, built) {
  const builtText = new Set(built.texts.map(normText));
  const builtHeads = new Set(built.headings.map(normText));
  const builtImgs = new Set(built.images.map((i) => norm(i.src)));
  const builtHrefs = new Set(built.links.map((l) => norm(l.href)));

  const missingHeadings = src.headings.filter((h) => !builtHeads.has(normText(h)) && !builtText.has(normText(h)));
  const missingText = src.texts.filter((t) => t.length > 12 && !builtText.has(normText(t)) && !builtHeads.has(normText(t)));
  const missingImages = src.images.filter((i) => i.src && !builtImgs.has(norm(i.src)));
  const builtKeys = new Set(built.links.map((l) => linkKey(l.href)));
  const missingLinks = src.links.filter((l) => l.href && !builtKeys.has(linkKey(l.href)) && !/^#/.test(l.href));

  return { missingHeadings, missingText, missingImages, missingLinks,
    repeating: { source: src.repeatingBlocks, built: built.repeatingBlocks } };
}

// --- main ---
if (process.argv[2] === '--supports-target-auth') { console.log('target-auth-files-v1'); process.exit(0); }
const [a, b, ...options] = process.argv.slice(2);
let targetHeaders = null;
for (let i = 0; i < options.length; i += 2) {
  if (!['--target-cookies-file', '--target-headers-file'].includes(options[i])) throw new Error('unsupported inventory option');
  const stat = lstatSync(options[i + 1]);
  if (!stat.isFile() || (stat.mode & 0o077)) throw new Error('target credential file must be mode 0600');
  try { targetHeaders = JSON.parse(readFileSync(options[i + 1], 'utf8')); }
  catch { throw new Error('invalid target credential JSON'); }
  if (!targetHeaders || typeof targetHeaders !== 'object' || Array.isArray(targetHeaders) || Object.values(targetHeaders).some((v) => typeof v !== 'string')) throw new Error('invalid target headers object');
}

if (!a) { console.error('Usage: node scripts/element-inventory.js <url> [<built-url>]'); process.exit(1); }

const srcInv = inventory(a);
if (!srcInv) { console.error('Failed to extract inventory from', a); process.exit(1); }

if (!b) {
  console.log(JSON.stringify(srcInv, null, 2));
  console.log(`\nheadings:${srcInv.headings.length} texts:${srcInv.texts.length} links:${srcInv.links.length} images:${srcInv.images.length} repeatingBlocks:${srcInv.repeatingBlocks.length}`);
  process.exit(0);
}

const builtInv = inventory(b, targetHeaders, true);
if (!builtInv) { console.error('Failed to extract inventory from', b); process.exit(1); }
// The source is the grader's archived capture, not the agent's: a source
// that shows nothing cannot be measured against (exit 2).
if (!srcInv.shown) { console.error(`INFRA: source page shows nothing after ${SETTLE_MS / 1000}s: ${a}`); process.exit(2); }
const d = diff(srcInv, builtInv);
const srcNames = new Set(srcInv.images.map((i) => norm(i.src)));
const paired = await pairByContent(d.missingImages,
  builtInv.images.filter((i) => !srcNames.has(norm(i.src)) && i.abs), b, targetHeaders);
d.missingImages = paired.missing;
d.unmeasuredImages = paired.unmeasured;

console.log(`\n=== PARITY AUDIT  source=${a}  →  built=${b} ===`);
const report = (label, arr, fmt) => {
  console.log(`\n${label}: ${arr.length}`);
  // Every entry: the wrapper grades these lines, so a cut list would let an
  // unprinted entry pass once the printed ones are allowlisted.
  arr.forEach((x) => console.log('  - ' + fmt(x)));
};
report('Headings on source but MISSING in build', d.missingHeadings, (x) => x);
report('Text bits on source but MISSING in build', d.missingText, (x) => x.slice(0, 90));
report('Links on source but MISSING in build', d.missingLinks, (x) => `${x.label} -> ${x.href}`);
report('Images on source but MISSING in build', d.missingImages, (x) => `${x.src} (alt: ${x.alt || '-'})`);
report('Images on source that could not be measured (a picture could not be downloaded or read)', d.unmeasuredImages, (x) => `${x.src} (alt: ${x.alt || '-'})`);
console.log('\nRepeating blocks (count) — source vs build:');
console.log('  source:', d.repeating.source.map((r) => `${r.selector}×${r.count}`).join(', ') || '(none)');
console.log('  built: ', d.repeating.built.map((r) => `${r.selector}×${r.count}`).join(', ') || '(none)');

const fails = d.missingHeadings.length + d.missingImages.length + d.missingLinks.length;
console.log(`\n${fails === 0 ? '✓ no missing headings/links/images' : '⚠ ' + fails + ' missing element(s) — review above'}`);
if (d.unmeasuredImages.length) console.log(`? ${d.unmeasuredImages.length} image(s) could not be measured`);
if (!builtInv.shown) console.log(`note: the build page showed nothing after ${SETTLE_MS / 1000}s`);
if (builtInv.password && !srcInv.password) console.log('note: the build page shows a password form the source does not have (a login or site shield page?)');
