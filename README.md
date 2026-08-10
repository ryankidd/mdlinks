# mdlinks

A small CLI that checks markdown files for broken links.

```sh
mdlinks docs README.md 'guides/*.md'
```

## Features

- Checks local links by resolving them relative to the markdown file and
  confirming the target exists on disk.
- Checks remote (`http(s)://`) links with a real HTTP request — `HEAD`
  first, falling back to `GET` if the server doesn't seem to support
  `HEAD` — with a concurrency limit and a per-request timeout so one slow
  or unreachable host doesn't stall the run.
- Accepts markdown files, directories (searched recursively for `.md`
  files), and glob patterns, mixed freely on the command line.
- Ignores link syntax shown inside inline code spans or fenced code
  blocks, so documenting the `[text](url)` syntax itself doesn't get
  flagged as a broken link.
- `--ignore` skips URLs matching a glob pattern, e.g. `mailto:*` or
  internal-only hosts.
- `--format json` for machine-readable output; plain text by default.
- CI-friendly exit codes: `0` clean, `1` broken links found, `2` on a
  usage or tool error (e.g. no markdown files matched).

## Install

```sh
git clone https://github.com/ryankidd/mdlinks.git
cd mdlinks
npm install
npm run build
npm link
```

This puts an `mdlinks` binary on your `PATH`. Requires Node 18+.

## Usage

```
mdlinks [OPTIONS] <paths...>
```

Each argument is a markdown file, a directory, or a glob pattern:

```sh
mdlinks README.md
```

```
OK    ./package.json
FAIL  ./nope.md

1 broken link(s) found
```

When more than one file is checked, results are grouped under each file's
path and broken link counts are aggregated across all of them:

```sh
mdlinks docs README.md 'guides/*.md'
```

### Ignoring links (`--ignore`)

Skip URLs matching a glob pattern (`*` as a wildcard, everything else
literal). Repeat the flag to skip multiple patterns:

```sh
mdlinks --ignore 'mailto:*' --ignore '*localhost*' README.md
```

### JSON output (`--format json`)

```sh
mdlinks --format json README.md
```

```json
{
  "ok": false,
  "brokenCount": 1,
  "files": [
    {
      "file": "/path/to/README.md",
      "results": [
        { "url": "./package.json", "ok": true, "resolvedPath": "/path/to/package.json" },
        { "url": "./nope.md", "ok": false, "resolvedPath": "/path/to/nope.md" }
      ]
    }
  ]
}
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0`  | No broken links found |
| `1`  | One or more broken links found |
| `2`  | Usage or tool error (no markdown files matched, unreadable file, unknown `--format`) |

This makes `mdlinks` usable directly as a CI check — a nonzero exit fails
the job.

## Development

```sh
npm test        # run the test suite
npm run typecheck
npm run lint
```

CI runs all three, plus a build, on every push and pull request.
