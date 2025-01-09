# test-changing-dot-reserve

A script to test runtime changes.

To install dependencies:

```bash
bun install
```

Copy the example environment file and fill it:

```bash
cp .env.example .env
```

Make sure to have the "before" and "after" runtimes ready, you can put them in the "runtimes" folder.

To run the tests:

```bash
bun test before.test.ts
bun test after.test.ts
```
