---
name: DayLah
description: Clear, calm date tools with confident indigo counts.
colors:
  primary: "#4338ca"
  primary-hover: "#3327b0"
  white: "#ffffff"
  ink: "#202237"
  muted: "#626478"
  divider: "#e5e6ee"
  control-border: "#d5d6e1"
  soft: "#f0effd"
  surface: "#f7f7fc"
  result-surface: "#f4f3fe"
  result-ink: "#332777"
  focus: "#8176f0"
  error: "#a1223e"
typography:
  display:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(36px, 4.3vw, 54px)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  count:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(76px, 8vw, 104px)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontSize: "25px"
    fontWeight: 700
    letterSpacing: "-0.025em"
  title:
    fontSize: "17px"
  body:
    lineHeight: 1.5
  label:
    fontSize: "14px"
    fontWeight: 600
rounded:
  control: "10px"
  surface: "16px"
spacing:
  compact: "10px"
  control: "12px"
  desktop-gutter: "40px"
  mobile-section-gap: "34px"
  mobile-gutter: "18px"
  section-gap: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 12px"
  calculator:
    rounded: "{rounded.surface}"
  result:
    backgroundColor: "{colors.result-surface}"
    textColor: "{colors.result-ink}"
    padding: "26px 32px 32px"
---

# Design System: DayLah

## Overview

**Creative North Star: "Calendar Clarity"**

DayLah presents date arithmetic with the calm of an uncluttered calendar: white space, dark readable text, and confident indigo. The description names the shipped code-first system rather than a separate design comp. Its plain sans-serif voice follows the confirmed product brief.

Large counts carry the visual hierarchy. Light tonal surfaces group the calculator, while thin rules organize local events and holiday records. Motion serves navigation and focus movement; there is no constant animation.

**Key Characteristics:**
- White canvas and dark text with indigo emphasis.
- Large tabular counts and a thin calendar interval strip.
- Flat, gently rounded controls and quiet separators.
- Responsive calculator followed by local events and holidays.

## Colors

The palette pairs a clear indigo accent with cool, near-white surfaces and restrained dark neutrals. Values in the frontmatter are normative and extracted from `frontend/src/styles.css`.

### Primary
- **Calendar Indigo:** Primary actions, links, selected calculator mode, checkbox accent and saved-event counts.
- **Deep Indigo:** Primary-button hover treatment.
- **Pale Indigo:** Selected modes, share details and shared countdown surfaces.
- **Count Wash / Count Ink:** The result panel's light background and dark purple text.
- **Focus Violet:** Visible keyboard focus across interactive controls.

### Neutral
- **White:** Page and control backgrounds.
- **Calendar Ink:** Main text and brand.
- **Quiet Slate:** Supporting copy and field-adjacent explanations.
- **Fine Divider:** Container outlines and list separators.
- **Control Stroke:** Input and secondary-button outlines.

### Semantic
- **Error Berry:** Calculation validation messages.

Rose and forest are existing optional saved-event/share accent overrides. They are not general replacements for the default indigo identity, nor complete alternate palettes.

## Typography

**Display Font:** The shared sans-serif stack in the frontmatter.
**Body Font:** The same stack. The source uses the platform system sans-serif directly.
**Label/Mono Font:** No distinct mono font.

**Character:** Direct, readable and compact. Slightly tight headings make the large result feel intentional without a decorative display face.

### Hierarchy
- **Display:** Responsive hero title with indigo emphasis on its final word.
- **Count:** Oversized result using tabular numerals; saved-event counts also use tabular numerals. Mobile result size is 82px, while shared countdown counts use smaller context-specific sizes.
- **Headline:** Section headings; mobile section headings shrink to 22px.
- **Title:** Event and editor titles; calculator titles use 23px, or 21px on mobile.
- **Body:** Context-specific sizes rather than an invented unified scale: hero support is 18px on desktop and 13px on mobile, calculator support 14px, and list/support copy generally 11–13px.
- **Label:** Sentence-case labels; field labels use the frontmatter label role.

**The Stable Count Rule.** Use tabular numerals for large numeric results and event counts.

## Layout

Header and main content share a centered 1192px maximum width and 40px horizontal gutters. The header is 96px tall. Calculator inputs and result use a 1.06:1 column ratio; four equal mode controls sit above them. Inputs have 34px by 36px padding. Local dates and holiday records follow with the section-gap token; holidays use two columns.

At 1000px and below, the header note hides, calculator padding tightens and event actions wrap. At 700px and below, the 72px header hides desktop navigation, main gutters become 18px, and calculator, editor and holidays stack. Date pairs stay side by side. Lower section gaps become 34px, input padding becomes 20px, and the hero title settles at 30px. At 360px and below, main gutters tighten to 12px and date-pair gaps to 8px.

Mobile bottom navigation has three destinations, follows the active section while scrolling, and includes the bottom safe-area inset in its padding. Footer clearance and feedback placement keep content above it. Installed PWA display adds the top safe-area inset to the header. The mobile surface is the responsive installed PWA; no native wrapper exists.

## Elevation & Depth

The page is flat at rest: pale fills, borders and separators create grouping without card shadows. Only the fixed feedback message uses elevation to stand clear of the page.

### Shadow Vocabulary
- **Feedback lift** (`0 8px 28px rgba(32,34,55,.18)`): Fixed status message only.

**The Quiet Surface Rule.** Keep ordinary calculator, editor and share containers flat; reserve the existing shadow for transient feedback.

## Shapes

Controls use gently rounded corners from the control token; major calculator, editor and share surfaces use the surface token. Outlines and list dividers are thin (1px). The calculator clips its divided surfaces within its rounded boundary. The calendar strip is a fine line punctuated by small labels, with softly rounded endpoints (7px). The brand uses the existing rounded D calendar symbol.

## Components

### Buttons
Quiet, practical controls with clear action emphasis. Primary buttons use Calendar Indigo and white text; secondary buttons use a white fill with Control Stroke. Standard controls have a 46px minimum height and semibold text. Hover gives secondary buttons a pale fill and a darker violet border; primary hover deepens the fill. Disabled buttons use reduced opacity (.55) and the wait cursor. Text actions omit the box and use indigo text, with 36px minimum height on desktop and 44px on mobile.

### Cards / Containers
The calculator, event editor and share preview use the surface corner token. The calculator and share preview are outlined; the editor adds a near-white fill. Event and holiday records are rows separated by rules, with no enclosing card elevation. Internal padding varies with context and drops on mobile.

### Inputs / Fields
White, stroked controls use the control corner token, 13px by 12px padding and a minimum height of 49px. Labels sit above their control with a 9px gap. Date fields expose an alternate manual-entry action. Textareas can resize vertically. Validation uses textual messages in Error Berry rather than an undocumented input border state.

### Navigation
Header links are small, muted and unboxed. Calculator mode buttons pair inline SVG icons with visible labels; selection uses solid indigo and white text, with `aria-pressed` expressing state. Mobile controls stack icon and label with a 62px minimum height. Bottom navigation pairs icon and label in 56px targets; the active section uses pale indigo and `aria-current="location"`. Desktop section links indicate the active location too.

### Result and interval strip
The result has a light indigo wash, a large centered count, readable unit and detail text, and a thin interval strip. The strip samples seven representative dates at rounded equal fractions of the actual interval, including endpoints. Each sample shows month and day; endpoint fills are stronger. Short intervals may repeat dates. The strip is hidden from assistive technology because the textual result gives the interval context. Result actions sit below it. Signed backwards intervals retain the minus sign and explicit explanatory text.

### Current-date empty state and timezone disclosure

The tilted empty-state calendar shows the actual current month and day in the selected timezone. Timezone settings use native details/summary disclosure: open initially above the mobile breakpoint and collapsed initially on mobile, resetting to that default when crossing the breakpoint. The selected zone remains visible in the summary, whose minimum height is 44px. Mobile fields reach 48px minimum height; most use 16px text, with tighter date-pair text.

### Focus and feedback
Interactive elements share a visible violet outline (3px with 3px offset). Opening the event editor or share preview moves focus to its entry point. Feedback remains visible in a bottom overlay with a dismiss action. Smooth scrolling is functional; reduced-motion preferences switch scrolling to automatic and suppress animation/transition effects.

## Do's and Don'ts

### Do:
- **Do** preserve the white canvas, dark text and default indigo accent.
- **Do** use tabular numerals for large numeric results and event counts.
- **Do** preserve thin interval lines and list separators.
- **Do** keep visible keyboard focus and readable text feedback.
- **Do** stack calculator content and lower lists at the established mobile breakpoint.

### Don't:
- **Don't** add constant animation.
- **Don't** turn optional event accent overrides into unverified full themes.
- **Don't** add card shadows to ordinary flat surfaces.
- **Don't** introduce a separate display font into the established system sans-serif identity.
