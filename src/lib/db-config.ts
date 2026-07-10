import path from "node:path";

export type LibSqlConfig = {
  url: string;
  authToken?: string;
};

/** Config for Prisma LibSQL adapter — local file or Turso */
export function getLibSqlConfig(): LibSqlConfig {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (raw.startsWith("file:")) {
    let filePath = raw.replace(/^file:/, "");
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }
    return { url: `file:${filePath}` };
  }

  let url = raw;
  let authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

  if (raw.includes("authToken=")) {
    try {
      const parsed = new URL(raw);
      const fromUrl = parsed.searchParams.get("authToken");
      if (fromUrl) {
        authToken = authToken ?? fromUrl;
        parsed.searchParams.delete("authToken");
        url = parsed.toString();
      }
    } catch {
      // use raw url
    }
  }

  if (url.startsWith("libsql:") && !authToken) {
    console.warn(
      "[db] Turso/libsql URL detected but no auth token. Set TURSO_AUTH_TOKEN or add ?authToken= to DATABASE_URL."
    );
  }

  return authToken ? { url, authToken } : { url };
}
