# Activity Chat Acceptance Scenarios

Status: Draft acceptance baseline for the minimal working release.

## Scope

These scenarios validate the contracts from `src/chat/contracts.ts` and the Activity Chat minimal release contract layer. They do not authorize production rollout, schema changes, RLS changes, realtime wiring, attachments, mentions, direct messages, or permanent team chat.

## AC-01 Confirmed participant can open an active chat

Given an activity chat is active and not expired
And the user has an active participant membership
When the user opens the activity chat
Then access is allowed
And the message list is returned newest-first with a stable cursor
And the composer is enabled for text messages.

## AC-02 Organizer roles can post announcements

Given the chat is active
And the user is an organizer, co-organizer, or moderator with active membership
When the user submits an announcement
Then the command is accepted once for the supplied client idempotency key
And the created message kind is `announcement`.

## AC-03 Participant cannot post announcements

Given the chat is active
And the user is an active participant
When the user attempts to submit an announcement
Then the command is rejected with a role-safe denial
And no message is created.

## AC-04 Non-member has no access

Given the user has no membership for the activity chat
When the user requests the chat, messages, unread state, or composer access
Then access is denied
And no message metadata, member list, unread count, or existence-sensitive detail is exposed.

## AC-05 Removed user has no access

Given the user membership status is `removed`
When the user requests chat data or submits any command
Then access is denied
And previously cached write commands fail safely without creating or mutating messages.

## AC-06 Left member cannot write

Given the user membership status is `left`
When the user submits a text, edit, delete, announcement, or mark-read command
Then write access is denied
And no state changes occur.

## AC-07 Empty chat state

Given the user has read access
And the chat contains no visible messages
When the message page is requested
Then an empty item list is returned
And the next cursor is absent
And unread and mention counters are zero
And the composer state still follows lifecycle and membership rules.

## AC-08 Text message idempotency

Given an active member submits the same text command twice with the same client idempotency key
When both requests are processed
Then exactly one message identity is produced
And the second result resolves to the original command outcome.

## AC-09 Stable pagination

Given multiple messages share close timestamps
When pages are requested with the returned cursor
Then every visible message appears at most once
And no visible message is skipped
And ordering is deterministic by creation time plus message identity.

## AC-10 Edit within window

Given the user authored a visible text message
And the edit window has not elapsed
When the user submits a valid edit
Then the body is updated
And `editedAt` is set
And message identity, author, chat, and creation time remain unchanged.

## AC-11 Edit after window

Given the edit window has elapsed
When the author submits an edit
Then the command is rejected
And the original body and edit metadata remain unchanged.

## AC-12 Delete within window

Given the user authored a visible text message
And the delete window has not elapsed
When the user deletes the message
Then the message becomes non-visible according to the release projection
And the identity remains available for moderation and reply integrity.

## AC-13 Delete after window

Given the delete window has elapsed
When the author attempts deletion
Then the command is rejected
And no message state changes occur.

## AC-14 Expired chat is read-only

Given the chat expiry time has passed or status is `expired`
And the user is an eligible existing member
When the user opens the chat
Then permitted historical messages may be read according to lifecycle policy
And composer, edit, delete, and announcement commands are disabled
And mark-read remains safe and idempotent where supported.

## AC-15 Archived chat behavior

Given the chat status is `archived`
When an eligible member opens it
Then access follows the archive retention policy
And no writes are permitted
And absent or removed retained content is represented without leaking moderation details.

## AC-16 Read state advances monotonically

Given the user can read the chat
When `mark-read` is submitted for a newer visible message
Then the read cursor advances
And unread count does not increase
When an older message is subsequently submitted as read
Then the stored cursor does not move backwards.

## AC-17 Hidden or deleted message safety

Given a message is deleted, hidden by moderation, or held for review
When a normal member requests a page
Then the release projection does not expose restricted body content
And pagination and unread calculations remain stable.

## AC-18 Safe failure on stale commands

Given membership, chat lifecycle, or message status changed after the client loaded the screen
When a stale write command is submitted
Then the server re-evaluates current authorization and lifecycle state
And rejects the command without partial mutation
And returns a non-sensitive recoverable error category.

## AC-19 Cross-activity isolation

Given a valid member of activity A knows an identifier from activity B
When the user requests or mutates activity B chat resources
Then access is denied
And no cross-activity existence or metadata is disclosed.

## AC-20 Unsupported features remain unavailable

Given the minimal release is active
When a client attempts attachments, mentions, voice, files, images, direct messages, or permanent team chat operations
Then the operation is rejected as unsupported
And no placeholder storage or partial records are created.

## Release gate

The minimal Activity Chat release is acceptance-ready only when all scenarios have automated or recorded QA evidence against the same commit, with lint, typecheck, build, and test gates green. Production schema, RLS, realtime, auth, and deployment still require separate explicit approvals.