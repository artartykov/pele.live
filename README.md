# Pele Live

A viewer for [Mermaid](https://mermaid.js.org) diagrams shared as links. It reads
links in the [mermaid.live](https://mermaid.live) format and draws them with
[Pele](https://github.com/obsidianmd/pele).

Open it at <https://artartykov.github.io/pele.live/>.

## Usage

Take a mermaid.live link and replace `https://mermaid.live` with
`https://artartykov.github.io/pele.live`:

```text
https://mermaid.live/view#pako:eNpVkM1qwzAQhF9l2...
https://artartykov.github.io/pele.live/view#pako:eNpVkM1qwzAQhF9l2...
```

Links to `/edit`, `/view`, and the site root all open the same viewer. Both
`#pako:` and `#base64:` links are supported.

- Scroll the mouse wheel to zoom around the cursor.
- Drag with the left mouse button to move the diagram.
- Double-click to fit the diagram to the window again.

## Differences from mermaid.live

- It only shows diagrams. There is no editor.
- Diagrams are drawn by Pele instead of Mermaid.js. Pele supports the diagram
  types of Mermaid 12.1.0, but the result can look slightly different.
- Mermaid themes from the link are passed to Pele, which may ignore them.
- Everything after `#` stays in your browser and is never sent to the server.

## Development

Requirements: Node.js 26 and pnpm.

```sh
pnpm install
pnpm dev
```

`pnpm dev` serves the viewer at <http://127.0.0.1:4317> and rebuilds TypeScript
on change. Rerun it after editing files in `static/`.

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `pnpm build`     | Builds the site into `dist/`                  |
| `pnpm lint`      | Checks formatting and lint rules with Biome   |
| `pnpm format`    | Fixes formatting and safe lint issues         |
| `pnpm typecheck` | Checks types in the viewer and the tests      |
| `pnpm test:e2e`  | Builds the site and runs the Playwright tests |

The tests load Pele from `node_modules`. Set `PELE_CDN=live` to load it from the
CDN instead, as the weekly CI run does.

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit rules.

## License

[MIT](LICENSE)
