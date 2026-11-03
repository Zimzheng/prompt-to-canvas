# Composition strategy

## Decide topology before visual treatment

Preserve facts and relationships, serve the reading task, then compose the spatial arrangement.
Style references guide palette, line treatment, hierarchy and rhythm; their example layout, node
count, aspect ratio and sample labels are not templates. Explicit user layout requests take priority.

For a nontrivial brief, compare 2–3 short composition concepts before drawing. They should differ in
reading order, grouping, emphasis or handling of connections, not just colour. Choose using semantic
fidelity, traceability of paths, label load and the audience's task. Do not generate multiple finished
canvases unless requested. A simple prescribed flow can be built directly.

## Compose from relationships

These are composable techniques, not an exhaustive chart menu:

| Relationship / reading task | Spatial techniques |
| --- | --- |
| Sequence, branching and joining | Main spine with branch/merge nodes; label conditions at exits |
| Handoffs between actors | Responsibility lanes; explicit crossing points |
| Containment and dependencies | Nested boundaries, layers, shared service rails |
| Feedback, retry and recovery | Exterior return paths; distinguish normal and exception routes |
| Shared structure with alternatives | Shared trunk with aligned alternative branches |
| Time plus responsibility | Milestone axis across lanes or stages |
| Dense local mechanism | Overview with a linked magnified detail |
| Repeated exchanges | Actor columns and ordered message paths |
| Multiple dimensions or tradeoffs | Aligned axes or matrix with consistent comparison criteria |
| Central relationship network | Clustered neighborhoods, selective hubs and routed links |

A complex process may combine lanes, a decision tree and an outer learning loop. A circular layout
is useful when the cycle is the message, but a rectangular path with an exterior return can make a
cycle easier to follow. Choose geometry for reading, not the chart's familiar silhouette.

## Spatial craft

- Establish a clear entry point and primary path. Secondary mechanisms should be visually quieter.
- Reserve channels for connectors before placing boxes. Minimize crossings, avoid text and node
  interiors, and use consistent ports. Do not add an arrow when adjacency/containment says enough.
- Distinguish relationship roles consistently through line weight, dash, label or colour. Use a legend
  when needed; colour alone should not carry a critical condition.
- Keep branch labels close to their exit, merges unambiguous and return routes visually separate.
- Use asymmetric compositions when content warrants them; equal columns and equal cards are tools,
  not defaults. Whitespace can separate systems or reserve a routing corridor.
- Let bounds and node count follow the content. Start near 1600px wide if useful, but do not force
  a fixed width/height or delete meaningful detail to fit a poster. Separate detail from overview.
- Set readable text and spacing first. Grow nodes or wrap labels instead of shrinking everything.
  Maintain repeated gaps/alignment where they help comparison; avoid rigid uniformity where they do not.
- Use editable diamonds, paths and simple pictograms when they communicate a role. Do not introduce
  ornamental icons, badges or shadows that compete with the mechanism.

## Visual treatment

Use [style-selection.md](style-selection.md). Catalogue styles or a custom direction should define
paper/ink, accent roles, text scale, stroke hierarchy, corners, depth and spacing. Apply them within
the chosen topology. A preview's dense grid is not a reason to erase cross-links or force all
information into abutting cells; choose a compatible direction or identify the adaptation.

Keep the infinite editor background white. If the artifact needs coloured paper, use a borderless
editable background rectangle. Current converter capabilities in [../RULES.md](../RULES.md) override
legacy renderer notes in design guides. Do not promise arbitrary fonts or exact CSS corner radii.

## Review the result

Trace every meaningful source relationship in the final scene. Check branch conditions, joins,
feedback, boundaries, reading order, label proximity, text clipping and contrast. Check both overview
and detail zoom: a beautiful thumbnail can still be unreadable. Move a representative bound node,
verify text/arrow behavior, and undo. Inspect the exported rendering after fixes.

Ask whether the composition explains the mechanism or merely lists topics in decorated boxes.
If it is only a list, revise the spatial structure. A valid JSON file is not evidence of a good diagram.
