# Deploy key decoding

- Scope: `full`
- Branch: `fix/deploy-key-decoding`
- Base: `97f72b6add2da6b756b17c7d8081f624c6ae1d43`
- Status: `Ready`

## Acceptance

- [x] A deployment key carrying Windows line endings loads instead of failing
      with `error in libcrypto` and `Permission denied (publickey)`. Copying a
      key out of a terminal on Windows is the ordinary way to fill the secret,
      and it introduced them.
- [x] A key that cannot be loaded at all stops the job with a message naming the
      cause, rather than an SSH permission error that points at the server.

## Verification

- Generated a key, rewrote it with CRLF endings, and confirmed the three cases:
  the mangled key reproduces `error in libcrypto`; the same input through
  `tr -d '\r'` loads; a key flattened to one line still fails and is caught by
  the guard.
- `npx prettier --check .github/workflows/release.yml` — pass

## Submission

- Commit:
- PR:
- CI:
