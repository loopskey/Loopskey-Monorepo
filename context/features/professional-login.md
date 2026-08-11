# Feature: Professional Profile Onboarding

## Status

Draft

## Objective

Introduce a post-login onboarding flow for users with the Professional role that captures the professional context needed to personalize their Loopskey experience. The onboarding must use and populate the existing Professional Profile data model and contracts rather than introducing duplicate tables or parallel representations of roles, skills, or certifications.

After completing onboarding, the user is taken to the Professional Profile tab where the collected information is displayed using the existing profile functionality. The same information must remain editable from the Professional Profile so that onboarding is only the initial data-entry experience and not a separate source of truth.

## User Value

As a `Professional` user, I want to quickly tell Loopskey what I want help with, my current role, the skills I want to develop, and, when relevant, the certification I maintain so that Loopskey can personalize my recommendations and keep my Professional Profile up to date.

## Scope

- Add a post-login Professional onboarding wizard using a stepper-based UI.
- Capture the user's professional goal, current role, desired skills, and, when applicable, certification information.
- Reuse the existing Professional Profile backend models, fields, queries, mutations, types, and frontend components wherever applicable.
- Synchronize onboarding data with the existing Professional Profile.
- Make onboarding-collected data visible and editable from the Professional Profile tab.
- Support different onboarding step counts depending on the selected professional goal.
- Load roles, skills, and certifications from the backend rather than hard-coding them as a second source of truth.
- Preserve the existing Professional Profile behavior and existing profile data.

## Non-goals

- Do not create a separate onboarding profile table that duplicates Professional Profile data.
- Do not create separate role, skill, or certification tables when equivalent existing domain models already exist.
- Do not redesign the entire Professional Profile page.
- Do not redesign unrelated user roles or their onboarding flows.
- Do not introduce certification credit/CPD tracking as part of this feature.
- Do not require the user to enter certification details when they select `I don't have one yet`.
- Do not replace the existing Professional Profile editing experience; onboarding should feed into it.
- Do not hard-code backend-owned role, skill, or certification entities as persistent frontend/domain data.

## Functional Requirements

1. When an authenticated user with the `Professional` role enters the application after initial registration/login and has not completed the required Professional onboarding, the system presents the Professional onboarding wizard.

2. The first onboarding step asks:

   **What would you like Loopskey to help you with?**

   Supporting text:

   `This shapes everything we recommend. You can change it later.`

3. The first step presents four selectable cards:
   - `Stay on track with my certification`
     - `Manage your CPD requirements and prepare for renewal`

   - `Grow in my current role`
     - `Build the skills you need to perform and progress at work`

   - `Prepare for my next role`
     - `Develop the capabilities required for your next career move`

   - `Explore my professional path`
     - `Discover relevant skills, roles, and learning opportunities`

4. The selected goal is persisted against the existing Professional Profile/domain representation.

5. Selecting `Stay on track with my certification` creates a four-step onboarding flow:
   1. Professional goal
   2. Current role
   3. Skills
   4. Certification

6. Selecting any of the other three goals creates a three-step onboarding flow:
   1. Professional goal
   2. Current role
   3. Skills

7. The Current Role step asks:

   **What is your current role?**

   Supporting text:

   `Search, pick a suggestion, or type your own title`

8. The Current Role step provides a search field for searching available professional roles.

9. Role suggestions are loaded from the existing backend Professional/Profile role data or existing role catalog. The implementation must first audit the existing backend and frontend Professional Profile implementation to identify the existing source of truth.

10. The following roles are expected to be available as suggestions when supported by the existing backend data:

- Project Manager
- Product Manager
- Software Engineer
- Data Analyst
- Business Analyst
- Accountant
- Financial Analyst
- HR Manager
- Marketing Manager
- UX Designer
- Nurse
- Civil Engineer
- Consultant
- Teacher
- IT Security Analyst
- Operations Manager

11. Role suggestion cards/options must support active and inactive/selected states.

12. The Current Role step provides:

- `Back`
- `Next`

13. The Skills step asks:

**Which skills would you like to develop?**

Supporting text:

`Pick up to 3 skills you want to grow - not ones you already have.`

14. The Skills step provides a search field with:

`Find or add a skill`

15. Skills must be loaded from the existing backend/domain skill source where available.

16. The following skills should be available as initial expected suggestions when supported by the existing backend:

- Risk Management
- Stakeholder Communication
- Agile Delivery
- Budgeting & Cost Control
- Leadership
- Scheduling

17. The user can select up to three skills.

18. The system must prevent selecting more than three skills.

19. The user must be able to remove/deselect a previously selected skill.

20. The Skills step provides the alternative action:

`I'm not sure - suggest skills for me`

21. Selecting `I'm not sure - suggest skills for me` allows the user to continue without manually selecting skills. The system may use the existing recommendation/profile mechanism to populate suggestions if such a mechanism already exists.

22. The Skills step provides:

- `Back`
- `Next`

23. When the selected professional goal is `Stay on track with my certification`, the final step asks:

**Which certification are you maintaining?**

Supporting text:

`Just the credential for now - you can set up credit tracking later`

24. The Certification step provides a search field:

`Search certification, licence, or issuer...`

25. Certification options must be loaded from the existing backend certification/licence/issuer data source used by the Professional Profile.

26. The Certification information collected during onboarding must be represented by the existing Professional Profile/domain model.

27. The Certification step provides:

- `I can't find my certification`
- `I don't have one yet`

28. Selecting `I don't have one yet` completes the certification step without requiring a certification record.

29. Selecting `I can't find my certification` opens an inline/manual certification form within the same onboarding flow.

30. The manual certification form contains:

- `Certification or licence name` — required
- `Issuing organization` — optional

31. The manual certification form provides a way to return to the certification selection state.

32. Manually entered certification data must use the existing Professional Profile certification representation if one exists.

33. If the selected goal is not certification-related, the certification step must not be shown.

34. On completion of the final applicable step, all collected information is persisted using the existing Professional Profile/domain APIs.

35. After successful completion, the user is redirected/navigated to the Professional Profile tab.

36. The Professional Profile must display the information collected during onboarding in its existing corresponding sections.

37. If the user later edits any of these values from the Professional Profile, the updated values must be reflected wherever the onboarding/profile data is subsequently consumed.

38. Re-entering or reopening onboarding must not create duplicate Professional Profile records.

39. The onboarding completion state must be persisted so that an already-completed Professional user is not repeatedly forced through onboarding.

40. If a user partially completes onboarding and leaves before completion, the system must follow the existing application persistence/session behavior. No duplicate temporary profile entity should be introduced solely for the wizard.

## Roles and Permissions

| Actor                       | Allowed                                           | Forbidden                                                        |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `Professional`              | Read and update their own onboarding/profile data | Access or modify another user's Professional Profile             |
| `Admin`                     | Existing profile permissions only                 | Bypass existing ownership/security rules                         |
| `Other authenticated roles` | Existing role-specific behavior                   | Access Professional onboarding data unless explicitly authorized |

- Authentication: authenticated users with the `Professional` role.
- Ownership rule: the backend derives the authenticated user/profile identity from the authenticated request and must not trust a client-supplied owner/user ID for ownership.
- Sensitive data: certification/profile information must not be unnecessarily exposed in logs, analytics, or error messages.

## UX Requirements

- Entry point: post-login Professional onboarding flow.
- Layout: stepper-based full-page onboarding experience.
- Step 1: four selectable goal cards with clear active/selected state.
- Current Role: searchable backend-backed role suggestions.
- Skills: searchable backend-backed skill selection with a maximum of three selections.
- Certification: searchable certification selection with manual-entry fallback.
- Loading: show an appropriate loading state while role, skill, or certification data is being fetched.
- Empty: show a safe empty state when no matching backend results exist and provide the relevant manual/add action where supported.
- Error: show a recoverable, user-safe error and allow retry without losing already-entered information.
- Success: persist the Professional Profile and navigate to the Professional Profile tab.
- Back: preserve selections already made when moving to a previous step.
- Next: disabled until the current step satisfies its required validation.
- Responsive behavior: cards, search fields, selections, and step controls must work on desktop, tablet, and mobile layouts.
- Keyboard behavior: all cards, selections, inputs, and navigation controls must be keyboard accessible with visible focus states.
- Accessibility: use semantic controls, labels, accessible selected states, and appropriate announcements for validation/errors.
- Internationalization: all user-visible strings must use the project's existing i18n/localization approach. Do not introduce hard-coded user-facing strings into components.

## Contract Changes

- Transport: reuse the existing Professional Profile GraphQL queries/mutations wherever they already provide the required data. Add GraphQL operations only where an existing contract does not support the required behavior.
- Input:
  - Professional goal selection.
  - Current role/profile role.
  - Up to three desired skills.
  - Optional certification.
  - Optional manually entered certification/licence name.
  - Optional issuing organization.
  - Onboarding completion state, only if an equivalent existing field does not already exist.

- Output:
  - Existing Professional Profile fields representing the selected goal, current role, desired skills, and certification.
  - Existing backend role/skill/certification entities and identifiers where applicable.

- Stable error/message codes: reuse existing codes where possible. Introduce new shared error codes only when an existing code cannot represent the failure.
- Compatibility: all existing Professional Profile queries, mutations, frontend profile screens, and existing consumers must remain valid.

GraphQL is code-first. Do not hand-edit `schema.gql` or generated TypeScript files. Any schema change must flow through the existing code-first schema and code-generation process.

Before adding a new contract, audit the existing Professional Profile queries, mutations, DTOs/types, resolvers, services, and frontend hooks/components to determine whether the required data already exists.

## Data and Domain Rules

- Owning module: existing Professional Profile/domain module in `apps/api`.
- Models/relations affected:
  - Existing Professional Profile model/record.
  - Existing professional role representation/catalog.
  - Existing skill representation/catalog.
  - Existing certification/licence representation/catalog.
  - Existing user/profile-to-role/skill/certification relations.
  - Existing onboarding/completion state if already present.

- No duplicate onboarding-specific role, skill, certification, or profile tables should be introduced.
- The implementation must identify the existing Prisma models and relations before any migration is proposed.
- Invariants:
  - A Professional user can only modify their own Professional Profile.
  - A maximum of three desired skills can be selected.
  - Certification is required only for the certification-maintenance goal when the user chooses to provide one.
  - `I don't have one yet` must not create an empty/placeholder certification record unless the existing domain explicitly requires such a representation.
  - Manual certification data must not create a second certification system separate from the existing Professional Profile model.

- Concurrency: profile updates must use the existing transactional/ownership behavior and must avoid duplicate relation records when the same onboarding request is retried.
- Migration/backfill: none unless the audit identifies a genuine missing field required by the existing Professional Profile model.
- Delete/retention behavior: follow existing Professional Profile and relation deletion/retention rules. The onboarding flow must not introduce independent retention rules.

## Dependencies and Side Effects

- Cross-domain interaction: use existing Professional Profile/domain interfaces and existing public ports/contracts. Do not introduce direct module-to-module access that violates the project's modular-monolith architecture.
- External provider/object storage: none expected.
- Outbox event: none required unless the existing Professional Profile update workflow already emits a relevant versioned event.
- Retry/idempotency:
  - Repeated submission must not create duplicate role/skill/certification relations.
  - Existing idempotent update/create patterns should be reused.
  - Partial network failures must not leave duplicate profile data.

- Profile synchronization:
  - Onboarding is an entry point into the existing Professional Profile data.
  - Professional Profile remains the source of truth after onboarding.
  - Profile edits must update the same records consumed by onboarding/profile views.

## Observability and Operations

- Structured logs/metrics:
  - onboarding started
  - onboarding completed
  - onboarding abandoned/failed where meaningful
  - profile update failures
  - role/skill/certification lookup failures
  - include correlation ID where supported
  - redact profile-sensitive values

- Operational failure handling:
  - API errors must be inspectable through existing structured logging.
  - Frontend lookup failures must allow retry.
  - Profile persistence failures must not falsely display onboarding as completed.

- Rollout/feature flag: use the project's existing feature-flag mechanism if Professional onboarding is already behind a staged rollout. Otherwise, no additional flag is required.

## Acceptance Criteria

- [ ] Given a newly authenticated Professional user who has not completed onboarding, the Professional onboarding wizard is displayed.
- [ ] The first step displays exactly four professional-goal cards with the specified labels and descriptions.
- [ ] Selecting `Stay on track with my certification` produces four total steps.
- [ ] Selecting any of the other three goals produces three total steps.
- [ ] The selected goal is persisted using the existing Professional Profile/domain representation.
- [ ] The Current Role step loads role suggestions from the existing backend source of truth.
- [ ] Existing Professional Profile role data/models are reused rather than duplicated.
- [ ] The user can search for and select a current role.
- [ ] Role selections have clear selected/active states.
- [ ] The Skills step loads skills from the existing backend source of truth.
- [ ] The user can select a maximum of three desired skills.
- [ ] The user cannot select a fourth skill.
- [ ] The user can deselect a previously selected skill.
- [ ] `I'm not sure - suggest skills for me` allows the user to continue without manually selecting skills.
- [ ] For the certification-maintenance goal, the Certification step loads existing backend certification data.
- [ ] `I don't have one yet` completes the certification step without creating an invalid placeholder certification.
- [ ] `I can't find my certification` opens the inline manual certification form.
- [ ] Manual certification requires a certification/licence name and allows an optional issuing organization.
- [ ] Manual certification data is stored using the existing Professional Profile certification representation.
- [ ] Back/Next navigation preserves entered selections.
- [ ] Invalid input prevents persistence and displays safe validation feedback.
- [ ] API authorization prevents a user from modifying another user's Professional Profile.
- [ ] Repeated submission does not create duplicate profile, role, skill, or certification records.
- [ ] On successful completion, the user is taken to the Professional Profile tab.
- [ ] The Professional Profile displays the values captured by onboarding in the existing relevant sections.
- [ ] Editing the values from Professional Profile updates the same source of truth used by the onboarding/profile experience.
- [ ] A completed Professional user is not repeatedly forced through the onboarding wizard.
- [ ] Existing Professional Profile functionality remains compatible.
- [ ] No duplicate onboarding-specific tables are introduced.
- [ ] No duplicate role, skill, or certification source of truth is introduced.
- [ ] Relevant loading, empty, error, success, responsive, keyboard, and accessibility states are covered.
- [ ] Relevant automated tests and project scope verification gates pass.

## Verification

### Focused checks

- Audit existing Professional Profile frontend components, hooks, queries, mutations, types, and routes before implementation.
- Audit existing `apps/api` Professional Profile modules, resolvers, services, Prisma models, relations, and GraphQL contract before implementation.
- Verify that roles, skills, and certifications are sourced from existing backend entities.
- Verify that no duplicate Prisma models/tables are introduced.
- Verify onboarding-to-Profile synchronization.
- Verify Profile-to-onboarding/source-of-truth consistency after editing.
- Unit test goal-dependent step generation.
- Unit/component test role selection and search.
- Unit/component test maximum-three-skill behavior.
- Unit/component test certification branching and manual certification form.
- API tests for ownership and persistence.
- API tests for duplicate submission/idempotency.
- Integration tests for onboarding completion and Profile synchronization.
- Playwright test covering a Professional user completing the complete onboarding journey.
- Playwright test covering the certification-maintenance path.
- Playwright test covering the non-certification path.
- Playwright test covering subsequent editing from Professional Profile.

### Scope gate

- Front: lint, type-check, tests, build, GraphQL codegen/browser checks when affected.
- API: lint, type-check, tests, build, Prisma/codegen/E2E when affected.
- Full/shared: root lint, type-check, tests, build plus relevant frontend and API checks.
- Run `git diff --check` before completion.
- Verify generated GraphQL artifacts are up to date.
- Verify no unrelated files or domains are changed.

## Risks and Decisions

- Risk: duplicate data models may be introduced because onboarding needs role, skill, and certification data.
  - Mitigation: perform an explicit backend and frontend Professional Profile audit before implementation. Reuse existing models, relations, contracts, hooks, and components wherever possible.

- Risk: onboarding and Professional Profile could become two sources of truth.
  - Mitigation: Professional Profile/domain data remains the source of truth. Onboarding only provides the initial data-entry workflow.

- Risk: existing Professional Profile structures may not support all requested fields.
  - Mitigation: identify missing fields only after the audit. Add the smallest required extension to the existing model/contract rather than creating an onboarding-specific structure.

- Risk: duplicate relation records may be created when users retry onboarding.
  - Mitigation: reuse existing unique constraints, upsert/idempotency patterns, and transactional behavior.

- Risk: role/skill/certification labels may differ between the requested UX and existing backend catalog.
  - Mitigation: map the UX to existing backend entities and identifiers rather than creating hard-coded domain entities. Only add missing catalog entries through the existing domain mechanism if they genuinely do not exist.

- Risk: users may change their profile after onboarding and see stale onboarding data.
  - Mitigation: both experiences must read/write the same Professional Profile source of truth.

- Risk: conditional certification step may create inconsistent completion logic.
  - Mitigation: derive the step sequence directly from the selected professional goal and test both the four-step and three-step paths.

- Decision needed: confirm the exact existing Professional Profile fields/entities that represent:
  - professional goal
  - current role
  - desired/development skills
  - certification/licence
  - onboarding completion state

  These must be identified from the existing implementation before introducing any schema or migration.

## References

- Existing implementation: `apps/api` Professional Profile domain and corresponding frontend Professional Profile tab/components — exact paths to be identified during audit.
- Existing frontend: Professional Profile route, components, hooks, GraphQL queries/mutations, generated types.
- Existing API: Professional Profile resolver/service/model/relation implementation.
- Architecture decision: `context/architecture/adr-001-modular-monolith.md`
- Architecture decision: `context/architecture/adr-007-ai-service-communication.md` (only where relevant to boundary rules)
- Feature location: `context/features/<domain>/professional-profile-onboarding.md`
- Issue/design: None
