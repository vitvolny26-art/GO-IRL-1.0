# Activity Chat Access Rules

Status: contract baseline for beta. This document does not authorize a production RLS or schema rollout.

## Identity boundary

Every decision is scoped to one activity chat. The actor activity identifier must match the chat activity identifier. Cross-activity access is denied before role or membership evaluation.

## Eligible actors

- `active` participants, organizers, co-organizers and moderators may read and write while the chat is open.
- `muted` members may read but may not send, update, delete or moderate.
- `left` and `removed` members have no access.
- missing membership is denied.

## Lifecycle

| Launch state | Read | Send/update/delete/moderate |
| --- | --- | --- |
| `not_started` | allowed for eligible members | denied as read-only |
| `open` | allowed | evaluated by role and ownership |
| `read_only` | allowed for eligible members | denied |
| `closed` | denied | denied |

## Message mutation

Update and author-requested delete require:

1. an open chat;
2. active membership;
3. a visible message;
4. exact message authorship.

The existing minimal-release edit and delete windows remain separate temporal checks. This authorization contract does not replace them.

## Moderation

Only organizer, co-organizer and moderator roles may perform moderation actions. Participant authorship does not grant moderation authority.

## Enforcement order

1. same-activity boundary;
2. membership presence;
3. left/removed denial;
4. chat lifecycle;
5. read exception for muted members;
6. write or moderation role checks;
7. message visibility and authorship.

## Deferred implementation

Production enforcement requires a separately approved Supabase Steward plan. No RLS, SQL, migrations, auth, secrets or production data are changed by this contract.
