import { z } from "zod";

/**
 * Who contributes. Today a local identity (a pseudonym on this device); with
 * the login (see docs/adr/0002-comptes-et-contributions.md) the same shape
 * comes from the auth provider and `provider` says which.
 */
export const accountSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().trim().min(2).max(32),
  provider: z.enum(["local"]),
  createdAt: z.string(),
});

export type Account = z.infer<typeof accountSchema>;
