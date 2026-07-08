# GO IRL Health Audit

Generated: 2026-07-07T14:01:02.642Z

## Checks

| Check | Result |
|---|---|
| lint | FAIL |
| build | PASS |
| test | PASS |

## Feature indicators

- coach: missing
- chat: missing
- weather: missing
- mockMode: missing
- share: missing
- profile: missing
- registry: missing

## Git

```
 M README.md
 M ROADMAP.md
?? GO_IRL_DOCUMENTATION.md
?? docs/DEVELOPMENT_PROTOCOL.md
?? docs/MVP_STABILIZATION_PLAN.md
?? project-audit/
?? scripts/

```

## Recent commits

```
83f252a fix: remove broken coach and chat panels causing black screen on card open
a577f1d Add detailed weather forecasts for outdoor events
2e333e5 Improve notification system and update sharing link
ff57f0a Update project to use correct pnpm version for deployments
2df9e07 Saved progress at the end of the loop
32af3ba Merge pull request #5 from vitvolny26-art/fix/toast-feedback-v2
1ae62a0 fix(vercel): restore root vite build
b3b1565 Merge pull request #4 from vitvolny26-art/fix/toast-feedback-v2
5aa2cbf fix(vercel): build only go irl app
cc4750c fix: remove map preview and link address

```

## Failed outputs

### lint

```

> go-irl-miniapp@0.1.0 lint C:\Users\lenovo\Documents\Codex\2026-05-28\go irl 0.9
> eslint .


C:\Users\lenovo\Documents\Codex\2026-05-28\go irl 0.9\patch-weather.cjs
    1:12  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
    1:12  error  'require' is not defined                 no-undef
  157:1   error  'console' is not defined                 no-undef

C:\Users\lenovo\Documents\Codex\2026-05-28\go irl 0.9\scripts\go-irl-health-audit.cjs
   1:12  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
   1:12  error  'require' is not defined                 no-undef
   2:14  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
   2:14  error  'require' is not defined                 no-undef
   3:12  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
   3:12  error  'require' is not defined                 no-undef
   5:14  error  'process' is not defined                 no-undef
  61:1   error  'console' is not defined                 no-undef

C:\Users\lenovo\Documents\Codex\2026-05-28\go irl 0.9\src\App.tsx
  64:7  error  'BOT_USERNAME' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\lenovo\Documents\Codex\2026-05-28\go irl 0.9\weather-sheet.cjs
   1:12  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
   1:12  error  'require' is not defined                 no-undef
  56:1   error  'console' is not defined                 no-undef

✖ 15 problems (15 errors, 0 warnings)

 ELIFECYCLE  Command failed with exit code 1.

```