# GO IRL 1.1 Stabilization

Goal: stabilize GO IRL MVP for closed beta without architecture rewrite.

Scope:
1. Health Audit - DONE
2. Restore Coach + Chat - DONE
3. Browser Mock Mode
4. Event Card Time Fix
5. Profile Fix
6. Bug Report Fix
7. Weather Widget
8. Share Fix
9. Documentation

Rules:
- one task at a time
- minimal patches only
- no .env/secrets/RLS/destructive SQL without explicit approval
- only pnpm
- after each patch: lint, build, test
- commit and push only when green

Current status:
- Task 1 committed: 0e053dd docs: add task 1 health audit
- Task 2 verified: CoachRequestPanel and ActivityChatPanel restored, no patch needed
- Next task: Task 3 Browser Mock Mode

New chat prompt:
Work by GO IRL protocol. Project: GO IRL Telegram Mini App. Stack: React, TypeScript, Vite, pnpm, Supabase, Telegram Mini Apps, Vercel. Repo: vitvolny26-art/GO-IRL. Branch: main. Goal: stabilize MVP to version 1.1 for closed beta. Continue from docs/GO_IRL_1_1_STABILIZATION.md. Start next task only. Give short PowerShell commands. No big refactors.
