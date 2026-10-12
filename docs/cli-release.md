# NodeDots CLI release procedure

The package is `nodedots`, the executable is `nodedots`, and the public first-use command is `npx nodedots check`. It runs local deterministic analysis. Node.js 22+ and Git are required; npm downloads the CLI on first use. The release remains advisory and does not promise complete coverage.

## Validate a candidate

1. Change the version in `packages/cli/package.json` and `src/cli/run.ts` together.
2. Run `npm ci` and `npm run cli:release-check` from the source root.
3. Push the CLI changes and wait for **CLI release checks**. All nine jobs must pass: Linux, Windows, and macOS, each on Node 22, 24, and 26.
4. Review the tarball listing from `npm publish ./.wrangler/cli-release/nodedots-VERSION.tgz --dry-run --access public`. Only the executable, build manifest, verifier, metadata, README, LICENSE, and NOTICE belong in the archive.
5. Confirm the target version is not already published. npm versions are immutable: fix defects in a new patch version instead of replacing an existing version.

The smoke suite installs the actual archive and invokes the installed npm executable against isolated TypeScript service, React UI, and Prisma schema repositories. Source tests cover index/worktree differences, commit snapshots, private configuration exclusions, linked directories, conflicts, unsupported scope, Git filter isolation, and failure policies. The verifier checks bundle integrity and executable/package version agreement. Cross-platform CI tests the source snapshot being pushed; record the successful run with each release.

## First publication

The owner must authenticate with `npm login`. Never commit npm credentials. After the matrix passes, publish the tested archive with:

```sh
npm publish ./.wrangler/cli-release/nodedots-0.1.0.tgz --access public
```

npm can require interactive two-factor authentication or browser approval. Complete that in the owner's terminal; do not send tokens or one-time codes in chat. Registry authorization, name availability, and successful CI are independent requirements. A dry run does not publish anything.

After publication, verify `npm view nodedots version`, then run the registry-installed command outside the source checkout with `npx --yes nodedots@VERSION --version` and `npx --yes nodedots@VERSION check --cwd REPOSITORY --staged --format json`.

## Subsequent releases with trusted publishing

Configure the npm package's **Trusted Publisher** settings for GitHub Actions:

- Repository owner: `0x-Sigmoid`
- Repository: `nodedots`
- Workflow filename: `cli-publish.yml`
- Environment: `npm`

The **Publish CLI** workflow is manual. It requires main, exact version agreement, all nine validation jobs, then rebuilds and checks the archive before publishing. It uses OIDC and provenance rather than a stored npm token. Configure required reviewers on the GitHub `npm` environment if your release process needs human review. Do not dispatch it until the trusted-publisher binding is configured.

Reference: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) and [npm provenance](https://docs.npmjs.com/generating-provenance-statements/).

## After release

Update the in-app CLI guide, public product facts, and README with the registry installation command. Preserve source-build instructions for contributors. Keep the CLI out of the hero unless the product design explicitly changes. Do not call the package released until the registry installation has been verified.

## First candidate validation

Version 0.1.0 passed all nine jobs in [CLI release checks](https://github.com/0x-Sigmoid/nodedots/actions/runs/38246473950) at commit f9293d94a3d4d8be3d93dc11da36987d3d7e6247. The Linux Node 24 artifact is retained locally at .wrangler/cli-ci-artifact/nodedots-0.1.0.tgz. Its bundled executable SHA-256 is 92a76b1f5b06e5dfbf922376f7ea674b496ddbfad31ef9bdf2a1628c4352d7bd. npm published version 0.1.0 on 12 October 2026. Registry tarball SHA-1: c85dee1bd249fe327d79d25467d3576a57f48663. Run npm run cli:verify-registry to download from a fresh cache and repeat the installed-command repository checks.

## Public-repository validation

The released CLI also completed direct commit comparisons on two public projects without checking out or executing repository code:

| Repository | Base | Head | Supported changes analyzed | Coverage |
| --- | --- | --- | --- | --- |
| sindresorhus/p-limit | 8907801ffa0252b51490a2c9efbb388d0c83391f | a8a6fbec4e0e866d6d779b10889bb4f5567e70eb | 4 | Partial: three changed files outside supported source scope |
| jakearchibald/idb | 74fd25b141443677ed31f5c9838b1113193e61af | 654c746bef13f9fe7f5871e03ac58015cebace5a | 8 | Partial: six changed files outside supported scope or generated/binary content |

These are execution and coverage checks, not proof that every real-world defect was found. Golden engine tests and known-finding fixtures assess expected observations separately. The final main-branch matrix also passed all nine jobs: https://github.com/0x-Sigmoid/nodedots/actions/runs/38248423874.
