# Style-selection regression checks

Exercise the skill with isolated requests and realistic conversation history. Save the actual first
response, selected/candidate slugs and profile dimensions; for generated outputs also save SVG,
scene JSON and rendered previews. Judge output behaviour, not whether it repeats rule wording.
No particular slug is required except when the user explicitly selects it.

| Request / context | Expected observable behaviour |
| --- | --- |
| First unstyled project canvas. | Offers 2–3 named suitable candidates with visible differences and an agent-picks option; waits before drawing. |
| First canvas with only “professional, clean”. | Uses mood as a filter without fixing a template or level; candidates remain visibly different. |
| “风格你定，直接生成，不要提问。” | Selects, announces a concrete reason and generates without another style question. |
| “用 Raw Grid。” | Uses Raw Grid directly; content topology still determines the diagram structure. |
| Explicit current-series continuation. | Preserves the series visual system despite recent repetition. |
| Earlier “这次随你选”, then an unrelated task. | Does not assume standing delegation beyond “this time”. |
| User accepted one canvas but gave no standing preference. | Does not treat acceptance alone as a permanent preference or fixed template. |
| Explicit “本次会话的独立画布都由你选”, then a similar task. | Proceeds within that scope; among equally suitable choices considers visual differences from recent independent canvases. |
| Strict brand colours / dense labels / no shadows. | Keeps real constraints; does not force three styles, a Bold option or an incompatible family. Discloses any catalogue adaptation. |
| “换一种明显不同的风格，保留回路。” | Changes suitable visual dimensions beyond colour without erasing nodes, order or feedback edges. |
| Three requested variants of the same process. | Three coherent outputs preserve facts and topology; do not copy the preview's stage count or labels. |
| Timeline, feedback system and comparison requests. | Use time, loop and comparison structures respectively instead of the same three-column layout. |
| Noninteractive run with no history. | Selects and generates without waiting or claiming access to unseen sessions. |
| Choice UI displayed but no answer submitted. | Does not treat a highlighted option or elapsed time as a submitted choice. |

Profile/resource checks: exactly one source-linked row per catalogue style; quoted source excerpts
exist; uncertainty stays explicit; every template and preview remains shipped. A generic profile
family is a comparison aid, not evidence of fit or a ban on other members.

For a distribution evaluation, compare original and revised skills using the same content set and
model settings across several task types and fresh sessions. Record candidate pools as well as
chosen slugs/families. Check visual repetition, content fidelity, legibility, question count and user
acceptance. Changing a name alone is not diversity; neither uniform use of all 35 styles nor random
selection proves quality. Small functional trials do not establish a population-level improvement.

## Converter style-fidelity regression

Run `npm run test:style` (or `node --test scripts/test-svg-style-fidelity.mjs`). It exercises native
fill-only rectangles/circles/ellipses, `stroke="none"`, zero-width and inline strokes, explicit frames
and arrow endpoints, plus text ink. Inspect real editor exports too: a syntactically valid scene can
still add unwanted outlines or lose relationships. Keep raw trial artifacts separate from corrected
QA samples so fixes do not rewrite the evidence.
