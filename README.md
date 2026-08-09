# mdlinks

A small CLI that checks markdown files for broken links.

It scans one or more markdown files for inline links (`[text](url)`). Links
that point at a local file are resolved relative to the markdown file's
directory and checked for existence on disk. Links to `http(s)://` URLs are
checked with an HTTP request instead: a `HEAD` request first, falling back
to `GET` if the server doesn't seem to support `HEAD`. Remote checks run
with a concurrency limit and a per-request timeout so a single slow or
unreachable host doesn't stall the whole run. Other schemes, like
`mailto:`, are skipped.

## Install

```sh
npm install
npm run build
```

## Usage

```sh
node dist/cli.js README.md
```

```
OK    ./package.json
FAIL  ./nope.md

1 broken link(s) found
```

Each argument can be a markdown file, a directory (searched recursively for
`.md` files), or a glob pattern:

```sh
node dist/cli.js docs README.md 'guides/*.md'
```

When more than one file is checked, results are grouped under each file's
path and broken link counts are aggregated across all of them.

Exits with a non-zero status if any link is broken, so it can be used as a
CI check.

## Development

```sh
npm test        # run the test suite
npm run typecheck
```
