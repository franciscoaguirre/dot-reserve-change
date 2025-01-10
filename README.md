# Testing change DOT reserve

A script to test changing the DOT reserve from the Relay Chain to Asset Hub as part of the
greater [Asset Hub Migration](https://docs.google.com/document/d/1SCT2WB6P8HzlLFZx4eEMPtb3GZkE4Ve7yTo8EsYkvVI).

More information can be found [in the hackmd](https://hackmd.io/@n9QBuDYOQXG-nWCBrwx8YQ/HkYVQFS8ke).

## Setup

Install dependencies:

```bash
bun install
```

Get the metadata for your parachain:

```bash
bun papi add para -w <YOUR_PARA_WEBSOCKET_ENDPOINT>
```

Copy the example environment file and fill it:

```bash
cp .env.example .env
```

Make sure to have the "before" and "after" runtimes ready, you can put them in the "runtimes" folder.

NOTE: You might need to change some aspects of the code, like how your parachain represents the relay
native token (DOT/KSM/WND).

WARNING: Tests are flaky and sometimes fail because of timeouts. Don't worry and rerun them.
Sometimes it's better to run each test individually.
You can do this by changing the `test` function in each test for `test.only`.
More information [in the bun test runner docs](https://bun.sh/docs/test/writing#test-only).

## Run

To run the tests:

```bash
bun test before.test.ts
bun test after.test.ts
```
