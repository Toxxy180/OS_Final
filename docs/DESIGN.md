# OS / study space

The visual reference is a calm study desk: off-white #f7f8f4 canvas, white sidebar, dark forest #244f44 actions, pale sage #e8eee4 surfaces, and quiet amber memory notes. No gradients or decorative imagery. The OS mark is code-native typography. All diagrams and controls are accessible HTML/SVG, not screenshot UI.

- Desktop: 248px navigation rail; 64px main gutters; open two-column chapter rows with fine dividers.
- Typography: self-hosted Sarabun; 44px hero, 32px page heading, 24px section heading, 17px reading text at 1.85 line-height; 14–16px controls.
- Components: rounded 10px buttons, flat lesson rows, article + contents rail, restrained callouts, labelled tables, answer options, step-by-step calculation panels, print sheets.
- Navigation: ภาพรวม / บทเรียน / ฝึกทำข้อสอบ / Address Lab / ชีท A4.
- Responsive: compact mobile header and drawer, one-column rows; text never requires horizontal scrolling. Tables may scroll in their own labelled region.
- Required extensions to overview concept: long-form lessons, interactive quiz, numeric address calculator, and print preview use the same typography and palette. These are user-requested workflows.
- Print: exactly two portrait A4 pages; white background, compact Thai typography, dark ink, explicit front/back labels; no application navigation.
- Accessibility: visible focus rings, semantic headings, keyboard controls, labels, announced feedback, reduced-motion support.

## Styles and responsive behavior

`src/styles.css` is an import entry point. Shared tokens and controls live in `styles/base.css` and `styles/forms.css`; layout, overview, lesson, quiz, lab and A4 sheets each have their own stylesheet. Screen breakpoints are collected in `styles/responsive.css`. Keep print dimensions in `styles/sheet.css` and wrap viewport overrides in `@media screen`.

- At 1100px and below, the navigation becomes a scrollable drawer with a fixed-height header, focus containment, Escape close, and scroll locking.
- Below 1200px, quiz progress moves above the question and the question map collapses into an explicit toggle. Desktop keeps the question map in a scrollable sticky panel.
- At 760px and below, chapter rows, filters and lab panels stack. At 380px and below, controls and gutters tighten, and diagrams/forms use a single column where needed.
- Radio and checkbox controls must never inherit text-field dimensions. Keep option text flexible with `min-width: 0` and a fixed-size radio.
- A revealed written/calculation solution is pending until self-assessed; retry retains the written draft. Numbered question buttons expose status through both an icon and accessible text.
- Tables, code and the fixed-size A4 preview scroll inside their own containers; the document itself should not scroll horizontally.
