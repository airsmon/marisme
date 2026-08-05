# Design QA: Codex-like TOC rail

## Comparison target

- Source visual truth: `/var/folders/kp/vfczc_yx27n5h4kxq3gmg2240000gn/T/codex-clipboard-f9a76728-e645-428e-8154-aacd959e258b.png`
- Follow-up alignment evidence: `/var/folders/kp/vfczc_yx27n5h4kxq3gmg2240000gn/T/codex-clipboard-5e2bc0d9-dc66-4401-891a-cde48c666f0d.png`
- Browser-rendered implementation: `/Users/marisme/.codex/visualizations/2026/08/04/019fcb65-5173-7a03-8052-32a890e11546/02-toc-first-item-after-full.png`
- Source pixels: 459 × 337
- Implementation viewport: 1440 × 900 CSS px
- Implementation screenshot pixels: 1440 × 900
- Device scale factor: 1
- State: light theme, article at the first TOC item

## Full-view comparison evidence

- The article ends at x=1087 and the right-side rail starts at x=1119, leaving a 32px gap; the preview ends at x=1367 inside the 1440px viewport.
- The document client and scroll widths are both 1440px; the desktop rail introduces no horizontal overflow.
- Scrollspy keeps exactly one `aria-current="location"` item and updates the preview to the same heading.
- The long rail remains bounded by the viewport and automatically keeps the active marker visible.

## Focused comparison evidence

- The implementation preserves the source's 6 × 2px idle markers, bright current marker, 1–4× pointer-distance lens curve, dark raised card, compact 10px radius, and soft lower shadow. The continuous 1px baseline was removed by the follow-up layout direction.
- The title-only card is 196px wide and grows from 40px for one line to about 54px for two lines. This adapts the 322px Codex activity card to the available 260px right gutter without covering content.
- Marker centers use a compact 12px pitch, close to the source's measured 10px pitch. The rail scrolls internally when all headings do not fit.
- A focused comparison was required because marker pitch, lens scaling, card position, and text hierarchy were too small to judge in the full-page image.

## Required fidelity surfaces

- Fonts and typography: the site system font is retained; the preview contains one compact semibold title with no secondary copy.
- Spacing and layout rhythm: each marker begins 17px inside its 46 × 12px target, the card begins 52px from the rail, and its dynamic height remains centered on the active marker.
- Colors and visual tokens: PaperMod theme tokens replace fixed colors so light and dark themes remain coherent; dark mode keeps a low-contrast track, bright active marker, and elevated card.
- Image quality and asset fidelity: the target contains no image assets or icons to reproduce; the rail is native interface geometry and remains sharp at device scale factor 1.
- Copy and content: every card state contains only the article heading; all metadata and instructional copy have been removed.

## Interaction and responsive checks

- Pointer movement produces a smooth neighboring-marker scale curve with measured values from 1.00 to 4.00 across the compact 12px pitch.
- A 2600px jump updates the active heading to `强调`; larger jumps and the document bottom also update correctly.
- At 1280px the inline TOC starts collapsed, expands from a unique button, and retains one `#TableOfContents`.
- At 390 × 844 the collapsed TOC is 362px wide inside a 390px viewport with no horizontal overflow.
- The server-rendered mobile panel already carries `hidden` when `TocOpen=false`; a `noscript` rule restores an expanded fallback without JavaScript.
- Desktop rail links measure 46 × 12px to retain the compact Codex rhythm; the narrow-screen inline TOC keeps its normal text-sized targets.
- Keyboard focus styles and `aria-expanded`, `aria-controls`, and `aria-current="location"` are present.
- Console errors: none.

## Comparison history

1. P2: the first scrollspy draft could miss a large scroll jump because the observer band was skipped.
   - Fix: cache heading offsets, binary-search them on a requestAnimationFrame-throttled scroll handler, and refresh offsets only on layout changes.
   - Post-fix evidence: active item changed at 2600px and 5000px jumps, remained unique, and stayed inside the rail viewport.
2. P2: the first rail draft encoded heading levels as fixed marker lengths, while the source uses a continuous fisheye curve.
   - Fix: use 6px base markers, a 12px active marker, and distance-based pointer scaling up to 4×.
   - Post-fix evidence: final measured scales form a continuous curve (`1.00, 1.38, 2.45, 3.55, 4.00, 3.39, 2.25, 1.25, 1.00`).
3. P2: the narrow layout initially rendered the full panel before deferred JavaScript applied `TocOpen=false`, risking a flash and layout shift.
   - Fix: render the closed state as `hidden` in Hugo, override it for desktop, and provide a `noscript` expanded fallback.
   - Post-fix evidence: generated HTML includes the initial `hidden` attribute; at 390px the panel starts closed and expands from one accessible toggle.
4. P2: the first fisheye rail used 46 × 12px link boxes, which were too small for reliable pointer use.
   - Fix: expand every desktop link to 46 × 24px and widen the fisheye influence radius to preserve a smooth multi-marker curve.
   - Post-fix evidence: browser measurements report 46 × 24px targets, one active item, and no document overflow.
5. Follow-up direction: the 24px desktop pitch was visually too loose after the rail moved to the right.
   - Fix: restore a 12px pitch and reduce the fisheye radius from 90px to 45px so the same number of neighboring markers reacts.
   - Post-fix evidence: browser measurements report a consistent 12px center pitch at 1360px and 1440px, with no document overflow.
6. P2: the first preview card was 10px below its active marker because panel-relative edge clamping overrode center alignment.
   - Fix: center from the marker and card rectangles, then clamp only against the viewport; normalize the bounds for extremely short viewports.
   - Post-fix evidence: the first and last items both report a 0px center delta at 1360px, including a 600px-high viewport.

## Findings

No actionable visual P0, P1, or P2 differences remain. The compact 12px desktop target is an explicit density tradeoff; the smaller preview card, right-side placement, removed continuous baseline, and omission of the Codex outer container are intentional adaptations to the latest direction.

final result: passed
