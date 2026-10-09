# Contributing to Appsolutely Free

Thanks for helping people ditch subscriptions. Everything on the site comes from this repo, so every fix here improves the site.

## Ways to help

- Fix a mistake or an out-of-date detail
- Add an alternative we're missing
- Add a paid app people want to replace
- Review pull requests, especially parity scores
- Report a suspicious or impersonating repo

## Add an alternative

1. Search `alternatives/` to make sure it isn't already listed.
2. Check it against the inclusion criteria below.
3. Copy `alternatives/penpot.yml` to `alternatives/<slug>.yml`. The slug is the project name in lowercase with hyphens, such as `kdenlive` or `darktable`.
4. Fill in every required field. Each slug in `replaces` must match a file in `apps/`. If the paid app isn't listed, add it first (see below).
5. Open a pull request. CI checks the schema and references. A reviewer then checks your parity breakdown and the wording.

No Git? Use the **Submit an alternative** issue form and we'll turn it into a file.

## Inclusion criteria

- A recognized open source license, or clearly labeled source-available or freeware terms
- Not archived, with a commit or release in the last 12 months
- Working install instructions and a usable README
- At least one tagged release or a documented install path
- Not a trivial fork. Forks must be meaningfully different or be the maintained successor.
- Stars are a signal, never a requirement

## Writing style

- **Use your own words.** Don't paste from the project's README or website.
- **Summary:** one or two sentences covering what it is and who it suits. Skip superlatives like "best," "powerful," or "blazing fast."
- **Pros and cons:** specific and checkable, each under about 100 characters. List at least two of each. If you can't find a downside, look harder.
- **Compare to the paid app,** not in the abstract. "Opens PSD files with layers" beats "great file support."

## Scoring parity

Each paid app has a checklist in `must_have_features`. For each feature:

- Fully supported: 1 point
- Partly supported: 0.5 points
- Not supported: 0 points

`parity = round(100 x points / number of features)`. Paste the per-feature results into your pull request description so reviewers can check your work. Be conservative. Reviewers may adjust scores, and a score from a project's own maintainer is welcome but is always reviewed.

## Choosing switching difficulty

- **easy:** install it, open your files, and get going with little retraining
- **moderate:** some retraining, or some formatting loss when opening files
- **hard:** a major workflow change, missing features that matter, or technical setup such as Docker or building from source

## Add a paid app

Copy `apps/figma.yml` to `apps/<slug>.yml`. The checklist should hold 5 to 12 features that real users depend on, phrased neutrally ("real-time collaboration," not "amazing collaboration").

## Maturity and warnings

Set `maturity: early` when the project calls itself alpha or beta, or has not reached version 1.0. Add a `warnings` entry only for a known maintenance or security problem, and always link its source, ideally the project's own security notices. Warnings affect ranking, so reviewers check them closely.

## Don't edit these fields

Stars, forks, commit dates, releases, issues, contributors, and archived status come from the code host automatically. Pull requests that add them will fail validation.

## If you maintain the project

Maintainers are welcome to submit and correct their own listings. Please say so in the pull request. To claim a listing, open the pull request from an account with write access to the repo and add your handle as `claimed_by`.

## Corrections and removals

Think a score or a label is wrong? Open an issue with evidence, such as a link to the docs, a release note, or a license file. Projects that become archived or abandoned are flagged and may be removed.

## Report a suspicious repo

If a listing links to a fake, typosquatted, or malicious repo, open an issue titled `Report: <project name>` with the details. We link only to official sources and take these reports seriously.

## Conduct

Be kind and assume good faith. Keep feedback about the listing, not the person.
