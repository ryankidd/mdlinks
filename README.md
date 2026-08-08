# mdlinks

A small CLI that checks a markdown file for broken links.

It scans a markdown file for inline links (`[text](url)`), and for every
link that points at a local file — as opposed to `http(s)://`, `mailto:`,
or similar — checks that the target actually exists on disk, resolved
relative to the markdown file's directory. Links to external URLs are
currently listed but not checked.

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

Exits with a non-zero status if any local link is broken, so it can be
used as a CI check.

## Development

```sh
npm test        # run the test suite
npm run typecheck
```
