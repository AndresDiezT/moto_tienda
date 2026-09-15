import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { signUploadSchema } from "@/lib/validation/uploads";
import { createSignedUpload, purposeAllowsRole } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = signUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { purpose, contentType } = parsed.data;

  if (!purposeAllowsRole(purpose, user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const signed = await createSignedUpload(purpose, contentType);
  return NextResponse.json(signed);
}
