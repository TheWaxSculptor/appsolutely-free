# Appsolutely Free: Data

The open dataset behind [AppsolutelyFree.com](https://appsolutelyfree.com), a directory of free and open source alternatives to paid software.

Every listing on the site is a YAML file in this repo. Found a mistake? Know a great alternative we're missing? Open a pull request or an issue.

## What's in here

| Path | What it holds |
|---|---|
| `apps/` | Paid apps people want to replace, one file each, including a checklist of must-have features |
| `alternatives/` | Free and open source alternatives, one file each |
| `schema/` | JSON Schemas that every file must pass |
| `scripts/` | Small helpers used by CI |
| `.github/` | The submission issue form and the validation workflow |

## How a listing works

An alternative names the paid apps it `replaces` and scores itself against each app's feature checklist under `parity`. The website joins the two files at build time.

```yaml
# alternatives/penpot.yml (abridged)
name: Penpot
type: open-source
license: MPL-2.0
replaces: [figma]
parity: { figma: 78 }
```

See `alternatives/penpot.yml` and `apps/figma.yml` for complete examples. The examples are illustrations: verify every field before relying on it.

## Labels

- **open-source:** the license is approved by the Open Source Initiative.
- **source-available:** the code is public, but the license restricts use. This is not open source.
- **freeware:** free to use, with closed code.

## What you don't edit by hand

Stars, forks, last commit, last release, open issues, contributor counts, and archived status are fetched automatically from the code host every night and merged in at build time. The schema rejects these fields on purpose.

## Check your changes locally

```bash
pip install check-jsonschema pyyaml
check-jsonschema --schemafile schema/alternative.schema.json alternatives/*.yml
check-jsonschema --schemafile schema/app.schema.json apps/*.yml
python scripts/check_refs.py
```

The same checks run on every pull request.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). The short version: copy an example file, fill it in with your own words, and open a pull request. No Git experience? Use the **Submit an alternative** issue form instead.

## License

The data in this repo is released under CC BY 4.0. Add a `LICENSE` file with the full text before publishing the repo.
