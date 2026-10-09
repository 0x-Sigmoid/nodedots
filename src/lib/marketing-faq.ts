// One source for visible answers and matching machine-readable FAQ facts.
export const marketingFaq = [
  ["What does NodeDots do?", "NodeDots checks a pull request against the rest of your codebase. It reports affected code, missing work, conflicts, and tests to review before you merge."],
  ["Does it replace code review, tests, or my linter?", "No. It complements them by checking the work around a change, including API assumptions, database migrations, and missing tests."],
  ["Which languages and Git hosts?", "The first version starts with GitHub pull requests. Supported languages and frameworks: To be announced."],
  ["Does it change or run my code?", "Code execution and repository permission details: To be announced before early access. The planned workflow is a review report for you to act on."],
  ["How is my code handled?", "Code processing, storage, retention, providers, and security policy: To be announced before you connect a repository. This waitlist does not connect to or read your code."],
  ["When does it launch and what does it cost?", "Launch date and pricing: To be announced. The waitlist gets first access; we will send one email when early access opens."],
] as const;
