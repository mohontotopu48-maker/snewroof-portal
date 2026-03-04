This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Vercel Workflow (Durable Execution)

This project uses [Vercel Workflow](https://vercel.com/docs/functions/workflows) (via the `workflow` package) for durable, resumable functions.

- **Example Workflow:** `src/app/actions/workflow.ts`
- **Local Dashboard:** `npm run workflow:web`

To trigger a workflow, you can use the `trigger` method from `@workflow/next`.

## Development with Vercel Sandbox

This project is configured to work with [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox). You can run the development server, build, or admin scripts in an isolated Node 24 environment using the following commands:

- **Run Dev Server in Sandbox:** `npm run sandbox:dev`
- **Build in Sandbox:** `npm run sandbox:build`
- **Lint in Sandbox:** `npm run sandbox:lint`
- **Open Sandbox Shell:** `npm run sandbox:shell`
- **Run Admin Scripts:**
  - `npm run sandbox:bulk-users`
  - `npm run sandbox:create-user`
  - `npm run sandbox:fix-passwords`
  - `npm run sandbox:test-logins`

Ensure you have the `sandbox` CLI installed:
```bash
npm install -g sandbox
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
