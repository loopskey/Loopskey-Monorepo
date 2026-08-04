# Professional Development dependency map

The `professional` Nest module remains one bounded context. Its services are
grouped by behavior rather than moved into empty directory layers.

## Capability ownership

| Capability | Services | Owned data |
| --- | --- | --- |
| Profile | `professional-profile`, `professional-profile-completion`, `professional-credential`, `professional-settings`, `certification-search` | Professional profile, terms, credentials, settings, taxonomy |
| PDU | `professional-pdu`, `professional-pdu-file` | PDU activities, targets, evidence metadata |
| CPD plan | `professional-cpd-plan` | CPD plans and plan categories |
| Certificate | `professional-certificate`, `professional-certificate-file` | Certificates and evidence metadata |
| Roadmap | `professional-roadmap` | Professional roadmap projections; enrollment is Engagement-owned |
| Course projection | `professional-courses` | Read-only professional catalog/course projections |
| Payments | `professional-payments` | Read-only payment projections; payments are Engagement-owned |
| Overview | `professional-overview` | Read-only aggregate projection |
| Calendar | `professional-calendar` | Professional-created calendar events; registration projection is Catalog-owned and read-only |
| Avatar | `professional-avatar` | Avatar evidence metadata; identity owns the user avatar reference |

External-learning behavior is represented by owned PDU activities rather than a
separate service or foreign write.

## Approved dependencies

```text
Professional profile --> Identity public API
Professional profile --> Engagement public API
Courses/roadmaps/calendar --> Catalog public API
Courses/roadmaps/overview/payments --> Engagement public API
Courses --> Provider projection API
Avatar/PDU/certificate evidence --> EvidenceStoragePort
```

The owner APIs return purpose-built projections and accept the authenticated
user ID supplied by the server-side resolver/controller. They do not expose a
foreign Prisma client or transaction implementation.

Allowed internal service edges are deliberately small:

- Certificate evidence -> certificate ownership checks
- PDU evidence -> PDU ownership checks
- Profile -> profile-completion calculation
- CPD plan -> certification search

No reverse edge is allowed. The architecture regression test checks this graph
for undeclared edges and cycles.

## Storage consistency

Evidence services write through `EvidenceStoragePort`. Metadata is created only
after storage succeeds, and a stored blob is removed when metadata persistence
fails. Deletes verify authenticated ownership before removing metadata and the
blob. `LocalEvidenceStorageAdapter` is the only local-filesystem implementation;
it can be replaced by the Phase 7 object-storage adapter without changing use
cases.

## Query rule

Overview and every foreign portion of calendar are read-only projections.
Calendar mutations affect only Professional-owned `CalendarEvent` records.
Foreign catalog, engagement, identity, and provider data is accessed only via
the public APIs above.
