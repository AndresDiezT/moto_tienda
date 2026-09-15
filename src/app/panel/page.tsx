import { redirect, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { landingPathForRole } from "@/lib/roles";

export default async function PanelIndexPage() {
  const session = await auth();
  if (!session) unauthorized();
  redirect(landingPathForRole(session.user.role));
}
