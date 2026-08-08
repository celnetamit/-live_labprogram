import prisma from "@/lib/prisma";
import ApiKeysClient from "./ApiKeysClient";

export const dynamic = "force-dynamic";

export default async function AdminApiKeysSettings() {
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } });
  const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return <ApiKeysClient keys={keys} baseUrl={baseUrl} />;
}
