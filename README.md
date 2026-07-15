# Solar Zombi — Acid Wash

Personal site for Solar Zombi (z6mbi6): Acid Wash art, the Cheshire / Goddoita mythos,
commissions, merch, and code. Plain HTML/CSS/JS, zero build step, one external
dependency (see Music below).

## Run locally

Just open `index.html` in a browser, or serve it:

```
py -m http.server 8090
```

then visit http://localhost:8090

## Deploy for free — GitHub Pages + solarzombi.is-a.dev

Domain decided: **solarzombi.is-a.dev** (free forever). This repo already has the
`CNAME` file set to that domain, so once Pages is live and the domain is
registered, it just works. Order matters a little — do it in this sequence:

1. Create a new **public** GitHub repo named `z6mbi6.github.io` (must be exactly
   `<your-username>.github.io` for a user-root Pages site — this is what makes
   `z6mbi6.github.io` resolve at all, which the is-a.dev CNAME record points to).
2. Push everything in this folder (`index.html`, `styles.css`, `script.js`,
   `gallery-data.js`, `gallery/`, `music-data.js`, `.nojekyll`, `CNAME`) to that
   repo's default branch. The `gallery/` folder is ~50MB — a normal `git push`
   handles that fine, just don't be surprised it takes a minute over a slow
   connection.
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch `main`, folder `/ (root)`. Save.
   Your site is now live for free at `https://z6mbi6.github.io/` — this URL keeps
   working forever, even after the custom domain is attached.
4. Fork https://github.com/is-a-dev/register
5. Copy `is-a-dev-domains-solarzombi.json` (already in this folder) into that fork
   as `domains/solarzombi.json`.
6. Open a pull request against `is-a-dev/register`. A bot validates it automatically;
   once a maintainer merges it (usually within a day or two), `solarzombi.is-a.dev`
   goes live pointing at your GitHub Pages site.
7. Back in **Settings → Pages → Custom domain**, enter `solarzombi.is-a.dev` and
   save (GitHub will verify DNS once the PR above is merged, then issue HTTPS
   automatically).

Steps 1–3 require only your GitHub account. Step 6 is a public pull request on a
third-party repo — Claude can't open it on your behalf without your GitHub
credentials, so that one PR is on you, but it's copy-paste from the file already
sitting in this folder.

## Music

`music-data.js` holds all 34 tracks from your SoundCloud uploads
(`soundcloud.com/z6mbi`), pulled directly from SoundCloud's own public API — title,
URL, genre, play count, duration, artwork. Only tracks from your **Tracks** tab
(things you uploaded) are included, not reposts or other people's tracks.

The player itself is real playback, not just embeds: clicking a row calls the
official **SoundCloud Widget JS API** (`w.soundcloud.com/player/api.js`, loaded
on first play so it doesn't slow down initial page load) to load and play that
track through a hidden SoundCloud iframe, with a custom bottom player bar
(play/pause, prev/next, seek, volume, close) built to match the site's look.
This is the one external script the site depends on — there's no legitimate way
to get real SoundCloud playback without it (downloading/rehosting the audio
would violate SoundCloud's terms; this is the same API SoundCloud's own site
uses).

To add a new upload later: get its track page URL from SoundCloud and append an
entry to the array in `music-data.js` with the same shape as the existing ones.

## Gallery

`gallery/` + `gallery-data.js` hold 152 finished pieces pulled from
`Pictures/my art/`, organized into the 34 series subfolders that already existed
there (Cheshire, 63 Imps, Demonic Duality, Goddoita Vol.1, etc). Only `.jpg`/`.png`
files were used — `.ai` source files and the `Camera Roll`/`Screenshots` folders
were excluded per your instructions. Each image was re-encoded to a ~480px thumb
and a ~1600px full view (transparency flattened onto the site's dark background),
shrinking the set from 552MB raw to 50MB total, largest file under 700KB.

To add new art later: drop new `.jpg`/`.png` files into a `Pictures/my art/<series>`
folder and re-run the same resize pipeline (ask Claude, or see the generation
approach — regenerate thumbs at ~480px, full at ~1600px, append to
`gallery-data.js`).

## Known gaps to fix before going live

- **Merch link**: pulled from your DeviantArt bio / Bluesky posts
  (`tee-zr.com/z6mbi6/`) — confirmed live with 38 products at time of writing.
- **Facebook**: profile returned a privacy-restricted page when viewed logged out;
  the link is included as requested but may not show anything to visitors who
  aren't logged in or aren't your friend.
