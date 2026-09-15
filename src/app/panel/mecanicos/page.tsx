import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MechanicsManager } from "@/components/admin/mechanics-manager";

export default async function MechanicsPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const mechanics = await prisma.user.findMany({
    where: { role: "mechanic" },
    select: { id: true, name: true, email: true, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Mecánicos</h1>
      <MechanicsManager initialMechanics={mechanics} />
    </div>
  );
}
