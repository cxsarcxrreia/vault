# Projects Feature

This folder owns project domain code: draft setup, activation state, project queries, project mutations, and project-specific validators.

Projects must preserve the pre-activation versus activated split. Draft records can exist internally before clients receive a portal. Activation happens only after the team confirms payment.

Do not put deliverable revision logic here. Revision loops belong in `features/deliverables`.
