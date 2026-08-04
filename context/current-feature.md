# Current feature

Resolve current feature state by matching the checked-out branch to one file in
`context/feature-runs/active/`. This file intentionally stores no shared mutable
state; that avoids merge conflicts between parallel developers.
