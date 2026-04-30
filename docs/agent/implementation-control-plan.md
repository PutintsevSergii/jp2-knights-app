# Implementation Control Plan

## Human Owner Controls

After each phase, review:

- what files changed;
- whether phase acceptance criteria are met;
- whether public/private separation still holds;
- whether V2 or out-of-scope work was proposed, approved, and documented before implementation;
- whether tests cover roles and visibility;
- whether docs were updated for behavior changes.
- whether OpenAPI/generated clients, migrations, seeds, and traceability were updated where needed;
- whether the pipeline is green and which commands prove it.

## Questions to Ask the Agent

- Which phase did you implement?
- Which V1 requirements are now satisfied?
- Which tests prove permissions and visibility?
- Which quality gates did you run?
- Did OpenAPI, generated clients, migrations, seeds, or traceability need updates?
- Did any public endpoint touch private content?
- Did you add any feature not listed in V1? If yes, where is the human approval and doc update?
- What remains before the next phase?

## When to Stop the Agent

Stop if the agent:

- starts implementing V2 or out-of-scope features before human-owner approval and doc updates;
- creates broad unrelated refactors;
- weakens privacy rules;
- bypasses API authorization;
- edits critical official content without approval;
- leaves the app unrunnable.
- duplicates shared enums, validation schemas, API clients, or permission logic instead of reusing existing code;
- marks work complete with a red pipeline.

## Files Expected per Phase

Phase work should mostly touch apps/libs/tests/docs related to that phase. Database migrations should appear only when the phase needs schema changes.
