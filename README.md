# Quest Log

A gamified daily task tracker that turns your to-do list into an XP system — small wins earn points, points level you up, and a streak counter keeps you honest day to day.

**[Live demo →](#)** *(add your GitHub Pages link here once deployed)*

![Quest Log screenshot](screenshot.png)

## Why I built this

I'm a marketer and founder, not an engineer — but I use Claude to build small tools that solve real problems in how I run my day and my business. This one started as a simple question: *what if my to-do list actually felt rewarding to use?*

Quest Log reframes tasks as "quests" with tiered point values (small, medium, big, boss), tracks a daily streak, and levels you up as XP accumulates. No account, no backend, no tracking — everything lives in your browser.

## Features

- **XP & leveling** — tasks are worth different points based on effort (small = 5xp, boss = 60xp), and you level up automatically as XP accumulates
- **Streak tracking** — completing at least one quest keeps your streak alive; missing a full day resets it
- **Daily rollover** — completed quests clear at midnight, unfinished ones carry over so nothing gets lost
- **Circular progress ring** — a visual read on how close you are to the next level
- **Zero setup** — pure HTML/CSS/JS, no build step, no dependencies, works offline

## Tech

Just HTML, CSS, and vanilla JavaScript. Data persists in `localStorage`, so your progress stays on your device between sessions.

- `index.html` — structure
- `style.css` — styling (parchment/moss color system, Cormorant Garamond + Work Sans + JetBrains Mono)
- `script.js` — all the logic: XP math, leveling, streaks, and daily rollover

## Running it locally

No build tools needed. Clone the repo and open `index.html` in a browser, or serve it locally:

```bash
git clone https://github.com/YOUR-USERNAME/quest-log.git
cd quest-log
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

This is a static site, so GitHub Pages works out of the box:

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set the source to the `main` branch, root folder
4. Your live link will be `https://YOUR-USERNAME.github.io/quest-log/`

## About me

I'm Krista — a marketer and founder building [Locale](https://app.localecampus.com), a campus creator marketplace, and writing about systems, automation, and nervous-system-friendly productivity at [@remotelykrista](https://instagram.com/remotelykrista). More of my work: [kristahook.social](https://kristahook.social)

## License

MIT — feel free to fork this and make it your own.
