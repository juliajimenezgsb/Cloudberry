# Cloudberry — A Cozy Climbing Adventure

**Author:** Julia Jimenez

A cozy, mobile-friendly jumping game built with React, TypeScript, Vite, and HTML5 Canvas.

**Play online:** https://cloudberry-cozy-climb.plaidmill3.chatgpt.site

The hosted game is public: anyone with the link can open and play it. You can also run the complete game locally using the instructions below.

## Rules and controls

Your character automatically bounces when it lands on a platform. Steer between platforms, collect stars, and climb as high as you can. Falling below the screen ends the run.

- **Computer:** Left/Right arrow keys or **A/D** to move; **Escape** to pause.
- **Phone:** Hold the left or right half of the game to move. Tap the pause button for a break.
- **Endless sky:** Climb through four unlockable worlds on Easy, Medium, or Hard.
- **Journey chapters:** Complete five Cloud Garden levels, meeting the star/bounce objectives and reaching each finish garden to unlock the next chapter.
- Spend stars in the Boutique to unlock characters and outfits. Progress is saved in your browser.
- Optional jump-reactive music is muted by default. Enable it using the music-note button or Settings.

## Start the game

Install **Node.js 22 LTS** (22.12 or later), which includes npm. Clone or download this repository, open a terminal in its folder, and run:

```sh
npm ci
npm run dev
```

Open the local address Vite prints, normally **http://localhost:5173/**. Internet access is needed to install packages. The game needs no API keys or backend. React, React DOM, Lucide icons, TypeScript, Vite, and the test tools are listed in `package.json` and installed by `npm ci`.

Optional checks:

```sh
npm test        # Run the automated tests
npm run build  # Create the production site in dist/
```

All game graphics are drawn from the included source, and sounds/music are generated with Web Audio; no separate image or audio downloads are needed. Google Fonts is optional and has local font fallbacks.

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for architecture and implementation details.
