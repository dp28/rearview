# Prepping Changes for Rearview Review

Use this skill when creating or revising code changes that will be reviewed in Rearview. The goal is to make the change easy to understand as a story, easy to split into review sections, and easy for humans or AI reviewers to verify.

## Core principle

Prepare the change as a coherent narrative. Each commit should represent one meaningful review section where practical, and the full sequence should explain the change in the order a reviewer should read it.

## Before coding

1. Identify the review story in 2-6 sections.
2. Prefer a flow that mirrors how the system works, such as data model + tests -> domain logic + tests -> API + tests -> UI + tests -> observability.
3. Note risky areas early: migrations, security boundaries, public APIs, performance-sensitive code, concurrency, data deletion, and rollback behavior.
4. Decide what context belongs in code comments, commit messages, PR notes, or review comments.

## While coding

1. Keep unrelated changes out of the branch.
2. Separate mechanical changes from behavioral changes.
3. Keep generated files in their own commit or clearly label them.
4. Include the relevant tests in the same commit and story section as the behavior they validate. If a commit changes behavior, it should normally include the tests that prove that behavior.
5. Prefer small, reviewable commits over one large commit, but do not split changes so finely that the story becomes fragmented.
6. Leave durable code comments for surprising decisions, not for obvious implementation details.
7. Capture temporary reviewer notes as structured self-review comments or in the PR body, not as code comments.

## Commit structure

Each commit should have:

1. A subject that describes the story section.
2. The implementation change and its relevant tests, so reviewers can evaluate behavior and coverage together.
3. A body that explains why the section exists, what tests were included, and what reviewers should focus on.
4. Rearview trailers so the app can infer review structure.

Example commit message:

```text
Add widget persistence model

Introduces the database table, migration, and migration tests needed before the
API can create widgets. Reviewers should focus on backward compatibility,
rollback behavior, test coverage, and whether the uniqueness constraints match
product expectations.

Rearview-Section: persistence
Rearview-Section-Title: Add widget persistence model and migration
Rearview-Review-Schema: rearview.review.v1
```

## Recommended section patterns

### Web feature

1. Data model, migration, and their tests.
2. Domain logic, validation, and their tests.
3. API route, integration behavior, and their tests.
4. UI flow, copy, and their tests.
5. Observability, cleanup, and any tests specific to those changes.

### Refactor

1. Characterize existing behavior with tests in the first commit that depends on that behavior.
2. Introduce new structure without behavior changes, including tests or test updates that prove equivalence.
3. Move callers to the new structure, with caller-specific tests in the same commit.
4. Remove old structure and compatibility shims, with tests updated in the same commit.
5. Validate performance and edge cases, with benchmark or regression coverage where practical.

### Bug fix

1. Fix root cause and include the regression test or reproduction in the same commit.
2. Add edge-case handling together with edge-case coverage.
3. Document operational or migration impact in the commit that changes that behavior.

### AI-generated change

1. Keep prompts and important AI decisions available in session metadata when possible.
2. Review generated code before committing.
3. Split broad AI output into human-readable story commits.
4. Add self-review notes for areas where the agent made assumptions.

## Self-review checklist

Before handing off the change:

- [ ] The commit order tells the intended review story.
- [ ] Each commit is independently understandable.
- [ ] Risky sections are called out explicitly.
- [ ] Every behavior-changing commit includes the relevant tests for that behavior.
- [ ] Mechanical/generated changes are separated or labeled.
- [ ] Commit messages explain why, not only what.
- [ ] Rearview trailers are present for story sections.
- [ ] Any AI session metadata is linked without exposing secrets.

## Avoid

- Mixing formatting-only changes with behavior changes.
- Hiding critical decisions only in ephemeral chat transcripts.
- Creating commits that only make sense after reading later commits.
- Splitting tests into a final standalone test commit when those tests belong with earlier behavior changes.
- Letting filesystem order define the review story.
- Sending secrets, private credentials, or unnecessary proprietary context to AI tools.
