# Release Runbook

This project now uses `v0.x.y` tags for formal releases. The first formal release is `v0.1.0`.

## Prerequisites

- `main` is clean, pushed, and approved for release
- `gh auth status` succeeds for the GitHub account that owns this repository
- `vercel whoami` succeeds for the Vercel account linked to `gooj.vercel.app`
- Production release secrets are available in the shell:
  - `DEPLOYMENT_URL`
  - `E2E_ADMIN_EMAIL`
  - `E2E_ADMIN_TOTP_SECRET`
  - `E2E_GMAIL_CLIENT_ID`
  - `E2E_GMAIL_CLIENT_SECRET`
  - `E2E_GMAIL_REFRESH_TOKEN`

## Release Secrets

The release gate uses a dedicated production admin account plus Gmail API polling.

```bash
export DEPLOYMENT_URL=https://gooj.vercel.app
export E2E_ADMIN_EMAIL=
export E2E_ADMIN_TOTP_SECRET=
export E2E_GMAIL_CLIENT_ID=
export E2E_GMAIL_CLIENT_SECRET=
export E2E_GMAIL_REFRESH_TOKEN=
```

## Release Procedure

1. Confirm the branch is clean and aligned with origin.

```bash
git checkout main
git pull --ff-only origin main
git status --short
```

2. Set the production release identifier in Vercel and redeploy `main`.

```bash
printf 'v0.1.0\n' | vercel env add VITE_WEB_VITALS_RELEASE_ID production
vercel env ls production
vercel --prod
```

3. Run the release verification gate against production.

```bash
npm run release:verify
```

4. Create release notes from the changelog entry for this release.

```bash
node scripts/extract-changelog-section.mjs 2026-03-31 > /tmp/v0.1.0-release-notes.md
```

5. Tag the verified commit and push the tag.

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

6. Publish the GitHub release.

```bash
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes-file /tmp/v0.1.0-release-notes.md
```

7. Record the release metadata in the GitHub release body or deployment notes:
   - commit SHA
   - deployment URL
   - release verification timestamp

## Rollback

1. Identify the last known good production deployment in Vercel.
2. Re-promote or redeploy that known good commit as production.
3. Reset `VITE_WEB_VITALS_RELEASE_ID` if the rollback returns to a prior release identifier.
4. Re-run `npm run test:release` against the restored production deployment.
5. Update the GitHub release or incident notes with the rollback timestamp and restored commit SHA.
