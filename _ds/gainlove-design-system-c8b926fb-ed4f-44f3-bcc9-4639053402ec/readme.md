# GainLove Design System

## Context
GainLove is a nonprofit/charity website concept centered on global equality and child welfare campaigns ("Justice begins where inequality ends"). It is a donation-driven site: hero CTA, "Make a Difference" value props, campaign fundraising cards with progress bars, an about/impact section, and volunteer stats.

**Source material**: a single homepage screenshot was provided (`uploads/50f06a426a0d0ea0cbddb6341973cbbd.jpg`) — no codebase, no Figma file, no additional pages. This design system was built by visual inspection of that one screenshot. Values (exact hex codes, spacing, font families) are close estimates, not extracted from source — treat them as a strong starting point, not ground truth. If a codebase or Figma file for GainLove becomes available, re-derive tokens and components from it.

## Font substitution — FLAGGED
No font files were provided. The homepage uses a bold serif for headings and a clean geometric sans for body/nav/UI text. Closest Google Fonts matches were substituted:
- Headings → **Domine** (bold serif, similar weight/contrast to the source)
- Body/UI → **Jost** (geometric sans, similar to the source's nav/body type)

If real brand font files exist, please provide them and these will be swapped in `tokens/fonts.css`.

## Logo
No usable logo file was provided (only visible inside the screenshot, at low resolution, "Gain" in black + "love" in orange). No logo has been recreated or redrawn. Wherever a mark is needed, the wordmark is set in plain type (`components/navigation/NavBar.jsx`) using two-tone text ("Gain" in `--text-primary`, "love" in `--accent-primary`) rather than an image. If a real logo file exists, drop it in `assets/logo/` and swap the wordmark.

## Content fundamentals
- **Voice**: mission-driven, direct, second-person-adjacent but mostly declarative ("We're building a world where everyone has the power to shape their lives"). Short, plain sentences.
- **Casing**: headline case for big statements ("Make a Difference", "Changing Lives with Knowledge"); small caps/eyebrow labels are uppercase with wide tracking ("WHO WE ARE", "ABOUT US", "WE NEED YOUR HELP").
- **CTAs**: imperative, all-caps, short — "DONATE NOW", "LEARN MORE", "WATCH VIDEO".
- **Numbers as proof**: campaigns and stats lead with hard numbers (funding raised, % funded, volunteer counts) rather than adjectives.
- **Tone**: warm and urgent but not guilt-driven; plain-spoken rather than emotionally manipulative copy.
- **Emoji**: none observed. Do not introduce emoji.

## Visual foundations
- **Color**: warm cream page background (`--gl-cream`), near-black for text and primary buttons, one warm orange accent (`--gl-orange`) for the donate CTA and highlight dots, one teal accent (`--gl-teal`) for a secondary "play/watch" affordance. Small scattered dot accents in orange/blue/green add texture around hero imagery — decorative, not structural.
- **Type**: serif display headings (bold, tight line-height) paired with a light/clean sans for everything else — nav, body copy, buttons, eyebrow labels. Eyebrow labels are small, uppercase, orange, letter-spaced.
- **Backgrounds**: flat cream, no gradients on surfaces. The one graphic background motif is a faint world-map/continent outline watermark behind sections (very low opacity) — subtle texture, not a hero image. Photography is warm-toned documentary-style portraits (no filters/duotone), often clipped into a shape (e.g. hero photo cluster clipped to a continent silhouette; about-section photo in a circle).
- **Shadows**: soft, low-contrast card shadows (`--shadow-card`) — no hard borders on white cards, shadow does the separation.
- **Buttons**: pill-shaped (`--radius-pill`) across the board. Primary = solid black, on-dark text. Accent/donate = solid orange, dark text. Outline = transparent with black border. Icon-ghost (e.g. "Watch Video") pairs a small solid-color circle icon chip with plain-text label, no button background.
- **Cards**: white surface, large rounded corners (`--radius-md`/`--radius-lg`), soft shadow, no visible border. Feature cards center an icon inside a soft tinted circle above the title.
- **Corner radii**: generous throughout — pills for buttons/badges, 16–24px for cards, circles for icon chips and photo crops.
- **Hover/press**: not visible in the static screenshot — spec'd as a reasonable default (darken orange on hover, subtle lift + shadow increase on cards, slight scale-down on press) rather than observed; revisit once interaction/motion reference exists.
- **Layout**: centered content column, generous section spacing, 4-up card grids for feature/campaign rows. Nav is a standard left-logo / center-links / right-utility bar.
- **Imagery mood**: warm, natural light, documentary/editorial portrait photography of children — no black-and-white, no heavy grain or filter.

## Iconography
The screenshot's feature icons (globe, id-card, layered-impact, shield-heart) are simple two-tone line-and-fill icons at small size — no icon font or SVG source was provided. **Substituted with [Lucide](https://lucide.dev) icons via CDN** (`https://unpkg.com/lucide-static@latest/icons/…svg`), same stroke-forward, minimal style. This is a flagged substitution — swap in real brand icon assets if/when available. No emoji or Unicode glyphs are used as icons.

## What's here
- `styles.css` — root stylesheet, imports everything below. Consumers link only this file.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css` (Google Fonts substitution, flagged above).
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand) shown in the Design System tab.
- `components/` — reusable React primitives:
  - `components/forms/Button.jsx` — primary / accent / outline / icon-ghost variants
  - `components/cards/FeatureCard.jsx` — icon + title + body card
  - `components/cards/CampaignCard.jsx` — fundraising campaign card with progress
  - `components/navigation/NavBar.jsx` — site header
  - `components/feedback/ProgressBadge.jsx` — funding % stat chip
- `ui_kits/homepage/` — click-through recreation of the GainLove homepage.
- `assets/` — no real logo/photo assets were supplied; empty by design (see Logo section above).

## Intentional additions
No source component library was provided, so the component set above (Button, FeatureCard, CampaignCard, NavBar, ProgressBadge) is a from-scratch standard set sized to what one homepage screenshot shows — not derived from an enumerated inventory.
