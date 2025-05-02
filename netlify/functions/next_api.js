import { createRequestHandler } from "@netlify/next"

export const handler = createRequestHandler({
  // API routes only
  type: "api",
})
