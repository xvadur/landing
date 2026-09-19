# Design QA

## Source and capture

- Source visual: `/Users/xvadur_mac/.codex/generated_images/01a04399-b747-7c50-8b5f-7aa6d28ce301/exec-dcce8c49-df69-4add-bce5-4366ed593da3.png`
- Source dimensions: 864 × 1821
- Implementation capture: `qa/implementation-desktop.png`
- Captured implementation viewport: 1450 × 1220 in the Codex in-app browser
- Combined comparison input: `qa/reference-vs-implementation.png`

## Comparison

- Hierarchy: passed. The monumental Adam identity, split hero, consultation CTA and editorial content hierarchy remain dominant in the same order as the source.
- Visual language: passed. Warm paper, dark plum ink, pink/lilac fields, acid CTA, hard borders, offset shadows and condensed display typography match the approved neo-brutalist direction.
- Asset fidelity: passed. The generated fisheye Adam hero, pixel-cloud treatment and world-scale composition are used as real raster assets rather than approximated in CSS.
- Density: passed for the responsive desktop interpretation. The wide viewport expands the hero into a two-panel editorial spread while preserving the compact source composition at smaller breakpoints.
- Typography and contrast: passed. Display and reading faces are locally bundled; body text, navigation and controls retain readable contrast.
- Core journey: passed. All primary CTAs open the four-question consultation wizard; the final state generates a human-controlled prefilled WhatsApp message.
- Responsive structure: passed by breakpoint inspection. Hero, edition cards, consultation band and capability grid collapse without horizontal overflow at the 980 px and 680 px breakpoints.
- Build/runtime: passed. Production build and Sites worker tests complete successfully.

## Findings and fixes

- P1: Prototype bootstrap initially blocked the required `esbuild` postinstall. Fixed by explicitly allowing only `esbuild` in `pnpm-workspace.yaml`; the lockfile supply-chain check and build then passed.
- P2: The selected mock could have made unfinished showcase concepts look deployed. Fixed with visible `KONCEPT` and `THREE.JS EXPERIMENT` labels and proof-bounded copy.
- P2: Desktop content could lose the source's physical-editorial feeling when stretched. Fixed with bounded split panels, hard section rules, offset card shadows and a maximum text measure.
- P0: none remaining.
- P1: none remaining.
- P2: none remaining.

Final result: passed.
