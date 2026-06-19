# 🎨 Colour Lab

An interactive web app for **learning how colours work through hands-on mixing**. Built for students, teachers, designers, artists, and anyone curious about colour theory.

> Mix colours, explore theory, play with a colour wheel, take practice challenges, and save palettes — all in one calm, modern lab.

## ✨ Features

- **Interactive Colour Mixer** — combine two or more colours with strength sliders, switch between **additive (light)** and **subtractive (paint)** mixing, and read the result instantly in **HEX / RGB / HSL**.
- **Colour Theory Learning Mode** — bite-sized lessons on primary/secondary/tertiary colours, warm & cool, complementary, analogous, monochromatic, tints/shades/tones, and saturation & brightness — each with a live interactive demo.
- **Additive & Subtractive Mixing** — physically-motivated models: RGB light adds toward white; CMY pigment multiplies toward dark/muddy.
- **Colour Wheel** — pick from an HSL wheel and generate complementary, analogous, triadic, split-complementary, tetradic and monochromatic harmonies. Copy or save any palette.
- **Practice Challenges** — match a target, make a colour warmer/cooler, find the complement, or create a tint/shade. Get **constructive, directional feedback** and a score — not just right/wrong. Includes a **daily challenge** and progress tracking.
- **Palette Builder** — build palettes from any colour, rename them, copy hex codes, and **export as JSON or PNG**. Saved to your browser via `localStorage`.

## ♿ Accessibility

Keyboard-operable controls, visible focus states, labelled sliders/buttons, WCAG-aware contrast, and information is never conveyed by colour alone (every swatch is paired with its value/label).

## 🧱 Tech Stack

- **Next.js 14** (App Router) + **React 18**
- **TypeScript** (strict)
- **Tailwind CSS** with a token-based design system
- **framer-motion** for tasteful animation, **lucide-react** for icons
- **localStorage** for persisting palettes & challenge progress

## 🚀 Getting Started

```bash
npm install
npm run dev      # start the dev server at http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # TypeScript check (tsc --noEmit)
```

## 🗂 Project Structure

```
app/                 # Next.js App Router (layout, page shell, global styles)
components/          # Reusable UI: ColourPicker, ColourMixer, ColourWheel,
                     # PaletteCard, ChallengeCard, TheoryLesson, SliderControl,
                     # ResultPreview, ColourSwatch, AppShell, ui/*
sections/            # Page sections: Home, Mixer, Theory, Wheel, Challenges, Palettes
lib/                 # Colour math: color, mixing, harmonies, challenges, theory
hooks/               # useLocalStorage, useCopy
store/               # AppStateProvider (palettes, progress, toasts)
types.ts             # Shared domain types
```

## 🎨 How the mixing models work

- **Additive (light / screens):** each colour is light scaled by its strength; channels add together, so full red + green + blue light reaches **white**.
- **Subtractive (paint / ink):** pigments absorb light, modelled as a weighted geometric mean per channel (a multiply). Cyan + yellow → green, and mixing many hues drifts toward **dark / muddy** — exactly like real paint.

---

Made with curiosity about colour. 🌈
