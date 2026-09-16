import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { getDashboardSummary } from "@/lib/dashboard";

export async function GET() {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
