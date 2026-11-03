# Content model

Use a brief working model to guide composition, not a separate report or visible canvas section.

- **Reading task:** what must this audience understand, compare, decide or follow?
- **Facts:** names, values, claims and constraints supplied by the user. Do not invent evidence.
- **Entities:** actors, activities, decisions, states, artifacts, boundaries and outcomes.
- **Typed relationships:** sequence, condition, containment, dependency, handoff, feedback, exception,
  comparison or time. Record direction, labels and branch conditions when present.
- **Emphasis:** the central mechanism or conclusion, plus secondary details that need to survive.
- **Uncertainty:** distinguish missing facts from reasonable conceptual organization. Ask when a
  missing fact changes correctness; do not invent a branch condition or a performance metric.

Choose a spatial argument from these relationships. Different parts of a diagram may need different
structures. Presentation forms are open descriptions, not an enum or a fixed menu. Use concrete
labels that fit the topic; do not force every concept into definition/mechanism/value buckets.

A useful implementation note for a complex diagram can contain:

```json
{
  "reading_task": "follow the normal route and identify escalation points",
  "entities": [{"id": "review", "role": "decision", "label": "..."}],
  "relationships": [{"from": "review", "to": "handoff", "kind": "exception", "label": "..."}],
  "groups": [{"id": "operations", "members": ["review"]}],
  "composition": "responsibility lanes with an exterior feedback route"
}
```

This is an optional working aid, not a new required file format or automated layout engine.
Preserve all meaningful branches, merges, states and exceptions. Simplify repeated prose, not
relationship structure. Use overview plus detail, larger bounds, or multiple linked views when
readability warrants it; explain any omitted scope. There is no global node-count limit.

Keep important user wording, names and numbers exact unless rewriting is requested. Use the user's
language for prose, with original technical terms where clearer. Do not copy sample labels from
this skill or a preview. Process commentary belongs in chat, while requested citations, dates,
units, legends and source evidence may appear on the canvas when useful to its reader.
