# mdlinks

A small CLI that checks a markdown file for broken links.

It scans a markdown file for inline links (`[text](url)`). Links that point
at a local file are resolved relative to the markdown file's directory and
checked for existence on disk. Links to `http(s)://` URLs are checked with
an HTTP request instead: a `HEAD` request first, falling back to `GET` if
the server doesn't seem to support `HEAD`. Remote checks run with a
concurrency limit and a per-request timeout so a single slow or unreachable
host doesn't stall the whole run. Other schemes, like `mailto:`, are
skipped.

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
