import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const converter = fileURLToPath(new URL('../src/skills/prompt-to-canvas/scripts/svg-to-scene.mjs', import.meta.url));
function convert(content) {
  const dir = mkdtempSync(join(tmpdir(), 'canvas-style-test-'));
  try {
    const svg = join(dir, 'input.svg');
    const scene = join(dir, 'scene.json');
    writeFileSync(svg, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">${content}</svg>`);
    execFileSync(process.execPath, [converter, '--svg', svg, '--out', scene]);
    return JSON.parse(readFileSync(scene, 'utf8'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('filled native surfaces remain borderless when SVG omits stroke', () => {
  const { elements } = convert(`
    <rect id="paper" x="0" y="0" width="800" height="500" fill="#ECE9DC"/>
    <rect id="card" x="20" y="20" width="180" height="120" rx="24" fill="#E2A8CE"/>
    <circle id="dot" cx="300" cy="80" r="40" fill="#C9DA4F"/>
    <ellipse id="lens" cx="450" cy="80" rx="80" ry="40" fill="#2BA483"/>`);
  assert.equal(elements.length, 4);
  for (const element of elements) assert.equal(element.strokeColor, 'transparent', element.id);
  assert.equal(elements[0].backgroundColor, '#ECE9DC');
  assert.notEqual(elements[1].roundness, null);
  assert.deepEqual(elements.map(e => e.type), ['rectangle', 'rectangle', 'ellipse', 'ellipse']);
});

test('explicit none and zero-width strokes stay invisible, including inline styles', () => {
  const { elements } = convert(`
    <rect id="none" x="20" y="20" width="100" height="100" fill="#fff" stroke="none"/>
    <rect id="zero" x="140" y="20" width="100" height="100" fill="#fff" stroke="#000" stroke-width="0"/>
    <circle id="css" cx="300" cy="70" r="50" style="fill:#fff;stroke:none"/>
    <line id="invisible" x1="20" y1="200" x2="200" y2="200" stroke="#000" stroke-width="0"/>`);
  assert.equal(elements.length, 4);
  for (const element of elements) assert.equal(element.strokeColor, 'transparent', element.id);
});

test('painted frames and directed connectors retain their stroke and endpoints', () => {
  const { elements } = convert(`
    <rect id="frame" x="20" y="20" width="100" height="100" fill="#fff" stroke="#0A0A0A" stroke-width="3"/>
    <line id="next" x1="110" y1="80" x2="150" y2="80" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arrow)"/>
    <polyline id="retry" points="400,120 400,240 200,240 200,120" fill="none" stroke="#0055A4" stroke-width="2" marker-end="url(#arrow)"/>`);
  const [frame, arrow, retry] = elements;
  assert.equal(frame.strokeColor, '#0A0A0A');
  assert.equal(frame.strokeWidth, 3);
  assert.equal(arrow.type, 'arrow');
  assert.equal(arrow.strokeColor, '#0A0A0A');
  assert.equal(arrow.endArrowhead, 'arrow');
  assert.deepEqual(arrow.points, [[0, 0], [40, 0]]);
  assert.equal(arrow.x, 110);
  assert.equal(retry.strokeWidth, 2);
  assert.equal(retry.strokeColor, '#0055A4');
  assert.deepEqual(retry.points, [[200, 0], [200, 120], [0, 120], [0, 0]]);
  assert.equal(retry.endArrowhead, 'arrow');
});

test('text uses its ink colour even though ordinary filled shapes have no default stroke', () => {
  const { elements } = convert('<text x="30" y="70" font-size="34" fill="#1C1A17">需求确认</text><text x="30" y="140">开发</text><text x="30" y="210" stroke-width="0" fill="#0055A4">发布</text>');
  assert.equal(elements[0].strokeColor, '#1C1A17');
  assert.equal(elements[0].text, '需求确认');
  assert.equal(elements[1].strokeColor, '#1A1A16');
  assert.equal(elements[1].fontFamily, 1);
  assert.equal(elements[2].strokeColor, '#0055A4');
});
