# Research sources and provenance

Reviewed in full on 2026-09-12 for the bounded 70-minute MVP. There are **five distinct research documents** across the two source branches. Branch names below are provenance snapshots, not floating references for future validation.

## Frozen inputs

- `origin/main`: `41c93bd64dba9431b95801a3d502ac47c40784ec`.
- `origin/andy-wip`: `ea61ab0a4d4ae66b3c790ca8c9ca9ced4048599a`.

| Source | Original path | Last content-changing commit | Git blob | Bytes |
| --- | --- | --- | --- | --- |
| Full build blueprint | [docs/AGARENA_BUILD_BLUEPRINT.md](AGARENA_BUILD_BLUEPRINT.md) | `41c93bd64dba9431b95801a3d502ac47c40784ec` | `790df1d5075e66e8a9c274e2ebb386254d8276b2` | 100390 |
| AJM discovery/architecture | [docs/RESEARCH_AJM.md](RESEARCH_AJM.md) | `e9a1adb186308eda40320b55ea0b68262e39bbb8` | `2a96a011a151aa142e6f84f7a7359d41b3790aae` | 13115 |
| AC product/science research | [docs/research_ac.txt](research_ac.txt) | `41c93bd64dba9431b95801a3d502ac47c40784ec` | `606e8e02562c9b0aae706a1269172b480b7f46fc` | 29627 |
| FH Ontario pest research | [docs/research_fh.md](research_fh.md) | `3d8e993eeb5d100461fa263517c40df3d2017eef` | `77955fce8ef53cfd87761d77ec71b3e0c05092d1` | 20838 |
| Andy browsing/ratings notes | `andy/RESEARCH.md`, preserved as [docs/research/andy-RESEARCH.md](research/andy-RESEARCH.md) | `ea61ab0a4d4ae66b3c790ca8c9ca9ced4048599a` | `4519d3efbfe3fa621aab334dc99acb8717c51dfd` | 352 |

The first four entries were read from the frozen main tree. AJM also exists on andy-wip with the **same blob**, so it is not a sixth distinct document. Andy's unique file was absent from main. It is copied byte-for-byte without a new heading, attribution block, spelling edits or newline normalization; provenance belongs here so the original remains exact.

Andy commit author: `andy <225515007+yumenoandy@users.noreply.github.com>`; author time `2026-09-12T13:37:35-04:00`, commit time `2026-09-12T13:37:50-04:00`; subject `project context`. The original commit remains in Git history. This materialization preserves content and records provenance; it is not a merge of the entire branch.

## Content hashes

| Document | SHA-256 |
| --- | --- |
| Blueprint | `2d9f653d98d5bb4e0921cb571897306f69b7febad51a1f7ab4d12ab7202457f5` |
| AJM | `54694b89ecee7b05baf7863437c0078b0f472d628b485402069a25cdcec22bd1` |
| AC | `000f0cdd83f0d190db67ce55afa2374dd75fea73374f8237732d8b55e5a83f60` |
| FH | `0c0e91deec6cd87e6b5b643cde8d3ed5c81ed07369bda37eee6e2a019ae43ce9` |
| Andy original/materialized copy | `a48eff1b7a26599a3a19fd60fab38a7bc0577e79b04e80e7f6aa4135a5e921ba` |

Reproduce Andy's identity from a checkout retaining the original Git object:

```sh
git show ea61ab0a4d4ae66b3c790ca8c9ca9ced4048599a:andy/RESEARCH.md
git rev-parse ea61ab0a4d4ae66b3c790ca8c9ca9ced4048599a:andy/RESEARCH.md
git hash-object docs/research/andy-RESEARCH.md
```

The latter two hashes must both equal `4519d3efbfe3fa621aab334dc99acb8717c51dfd`.

## How the sources affect this build

The [MVP plan](MVP_70_MIN_PLAN.md) resolves the competing proposals against the user's explicit priority. Andy supplies the closest browsing journey; AJM supplies the lightweight map/TypeScript direction. FH supplies location/time ambiguity and repost cautions, while its CHU-first and official-API-only proposal is not adopted. AC and the full blueprint supply evidence boundaries and longer-term research, while their larger architecture and scientific/market scope are deferred.

The blueprint's 1,318 lines, including all proposed ADRs, implementation packages, source register and completion policy, were read. Its headings and example commands do not establish implementation approval, existing Rust services, accepted ADRs or passing tests. The selected user-authorized local slice is described separately rather than rewriting those historical proposals.

External links, pricing, legal interpretations, coverage, model versions and scientific parameters in the research remain the source authors' dated research claims. This synthesis does not freshly verify or adopt them as production dependencies. In particular, conflicting X API cap/pricing claims are not resolved by choosing one; this MVP does not use the X API or assert those prices.

## Implementation and evidence boundaries

The runbook follows the recovered local implementation contracts and the sibling API/UI work: React/Vite/MapLibre, Express/TypeScript, Zod, Node SQLite, Open-Meteo guidance and a host-assisted capture/import workflow. It does not describe the proposed Rust/PostGIS platform as implemented.

Keep four kinds of evidence separate:

- Original research: the frozen documents above, preserved as planning history.
- Captured X content: actual host-observed posts/images, stored locally outside public Git; not replaced by research examples.
- Provider guidance: numerical adapter responses with units, times and availability state.
- Synthetic fixtures: a separately labeled repeatable scenario; no proof of current weather or live capture.

Read-only graph queries against the frozen documentation-only baseline returned no `createApp` or owned-document nodes. Source inspection was therefore used for these docs/contracts; a graph miss is not evidence that a proposed implementation already exists.

Documentation verification checks hashes, Andy byte equality, preserved originals, Markdown links/fences and the four-file ownership boundary. Application commands `npm test`, `npm run test:e2e` and `npm run build`, plus real browser/import/provider checks, are integration obligations. **Their results are pending in this documentation revision and must be reported from actual execution.**
