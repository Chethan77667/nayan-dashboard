import dns from "dns/promises";

const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1"] as const;

/**
 * Atlas `mongodb+srv://` needs SRV DNS. Some ISP resolvers return ECONNREFUSED.
 * Resolve SRV with public DNS, then connect with a standard `mongodb://` URI.
 */
export async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const withoutScheme = uri.slice("mongodb+srv://".length);
  // Last @ separates user:pass from host (password may contain %40, not raw @)
  const at = withoutScheme.lastIndexOf("@");
  if (at === -1) {
    return uri;
  }

  const credentials = withoutScheme.slice(0, at);
  const afterAt = withoutScheme.slice(at + 1);
  const slash = afterAt.indexOf("/");
  const clusterHost = slash === -1 ? afterAt : afterAt.slice(0, slash);
  const pathAndQuery = slash === -1 ? "" : afterAt.slice(slash);

  dns.setServers([...PUBLIC_DNS]);
  const records = await dns.resolveSrv(`_mongodb._tcp.${clusterHost}`);
  const hosts = records.map((r) => `${r.name}:${r.port}`).join(",");

  const query = pathAndQuery.includes("?")
    ? `${pathAndQuery}&ssl=true&authSource=admin`
    : `${pathAndQuery}?ssl=true&authSource=admin`;

  return `mongodb://${credentials}@${hosts}${query}`;
}
