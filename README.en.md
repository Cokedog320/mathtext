# MathText

Live demo: https://mathtext.pages.dev/

MathText is a workflow tool for generating elementary math worksheets. The current build can already create a practical set of practice sheets and support print/PDF export, but it is still an actively evolving project rather than a complete math worksheet product.

## Current scope

- Number bonds
- Vertical and horizontal addition/subtraction
- Chained arithmetic
- Horizontal fill-in-the-blank equations
- Make-ten, break-ten, and flat-ten methods
- Practice ranges up to 10, 20, 30, 50, and 100
- Print preview, direct print, and PDF export
- Chinese/English bilingual UI

## Next steps

The next phase will focus on addition and subtraction within 1000, multiplication and division, parentheses expressions, and broader difficulty controls.

## Quick start

```bash
git clone https://github.com/Cokedog320/mathtext.git
cd mathtext
npm install
npm run dev
```

The dev server runs at http://localhost:3000 by default.

## Tech stack

- React 19
- Vite 6
- Tailwind CSS 4
- TypeScript
- html-to-image + jsPDF for PDF export
