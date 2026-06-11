# Initial prompt: Rearview

I want to build out a spec for a code review tool. The aim of this tool is to make code review simpler, faster, and more effective. It is aimed at tiny to huge changes, by both humans and AI.

This will be a web app that could be run locally, or could be run through Cloudflare workers. A user can point it to a git repository locally, over SSH, in GitHub, or in GitLab, performing the same reviews on any source. The app will primarily be used on desktop, but should support mobile very well. I want to leave it open to possibly being a Chrome extension, too.

## Problems to solve

- Good code is boring. That makes review tedious, and makes it difficult to stay focused

- It is hard to maintain quality over a long review 

- review should operate at multiple levels - from architectural all the way down to syntax correctness 

- between people, review can cause friction (if the intent of a message isn't clear)

- Existing review tools present code to be reviewed in the order the file system presents, which is rarely an effective ordering for improving understanding

## Perspective 

We need to make code review engaging. It should be structured as telling a single story, following a clear pattern (eg changes to database models, then API, then UI) - whatever best tells the story of the change. It should call out areas that the reviewer likely should care about.

The code itself needs to fit into the story of the app. A developer reading the code should feel that it all makes sense together.

### Central philosophy

A good codebase is a well-structured story. A developer can follow the flow of information (eg API request in ->  data fetched -> processing -> response). A good pull request is a smaller story set within that larger story. It is well structured and easy to follow - both for someone familiar with the current state of the repo and for someone less clear (a new developer or a future developer looking for past bugs). A good pull request knows what context is necessary for a reviewer to understand the change, when to keep that in the review, and when that also needs to be in the code.

## Review types

There will be several main types of review. All of these will share a lot of functionality, but may have tailored UI.

1. Reviewing AI changes

This will be aimed at the iterative process of using AI to make changes to a codebase. Generally this will involve telling the AI to change something - from individual lines to the whole approach. This may also involve asking questions about particular lines.

I think the challenge here will be how to link this review with the original AI session that generated the code changes. Ideally that session would answer as it will have the most context.I want to be able to start conversations on particular sections of code and have the AI answer questions and/or make changes.

2. Reviewing other developers' changes

Other developers will have GitHub Pull Requests or GitLab Merge Requests. This view will let the reviewer see the change in a story structure, add comments with specific intents ("suggestion", "issue", "question", etc - see https://conventionalcomments.org/ for more). The comments should be saved directly to GitHub / GitLab. Typically, those platforms only allow markdown comments with some attachments. If this app has more structured inputs for comments (eg a dropdown to select the comment intent), then the values of those inputs should be included in the output markdown.

3. Self review

When putting something up for review in a pull request, it’s often useful for the developer to review their own code. This allows them to leave comments where they want to call something out to reviewers. The developer should also be able to give feedback on the story structure of the review, moving things around (they are the primary author, so in control of the story being told). All of this should affect the GitHub / GitLab review.

Similarly, if another developer has left comments on GitHub/GitLab, the original developer should be able to use this app to read and respond to those comments.

## Review structure - telling a story

When creating the review, this app should use an AI to decide on a structure to present the review in. For all but the smallest reviews, this should likely be a layered structure. 

For example, for a new API endpoint on a web app, this could be presented as multiple steps:

Add new database models and a migration 
Add domain logic and unit tests
Add API endpoint and integration tests

The review would then have a short description per section, with the files collapsed. The files could then be expanded. This might just be expanded to show the high-level structure (public interface or just function / test names), or could be expanded to show all the changed code. In all cases, there should be an option to expand to see the entire file.

The AI should have the first pass at showing this structure, but when self-reviewing the developer should have the option to change ordering and structure comments. These could be persisted in the app, but there should also be the option to rewrite the git commit history for the branch to use the story structure - eg one commit per layer, with the layer’s description per commit. This should be saved in a way that is easily human readable, but can also be detected by the app as the intended way to display a review.

## AI skill: prepping for review 

This repo should include a skill that can be given to agents to make their code easier to review. This should primarily tell the agent how to structure their commits and what to include in them so that this tool, when it runs, can quickly determine how best to structure the review.

## AI reviewer agents

When reviewing, there should be an option to have agents also review. The user should be able to customise those agents: giving them context and priorities to simulate the different potential audiences of a review. Adding these agents to a review should behave like having a conversation on the review with other human reviewers - they can start threads on particular sections of code, leave comments / suggestions, and reply to threads.

There should be several default agents, representing the core audiences of a review:

Maintainer: someone very familiar with the codebase. They know what patterns exist elsewhere that could be reused, the weird edge cases you may have missed, and intimately understand the vocabulary of the repo. They want the repo to be easy to maintain - implementations as simple and clearly worded as possible, test coverage high, edge cases covered.
Time traveler: A developer from the future looking back at old changes. They may have uncovered a bug, or may be building a feature that conflicts with part of the existing system. They care deeply about why each important decision was made. They want any new addition to be easy to extend, and any removals / migrations to be fully completed.
On-call engineer: They prize observability and performance. They want to be able to know when something is going to fail as soon as possible, work out why it failed, and how to put it right. They want performance to be optimized and complexity to be minimized.
