"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

type Vehicle = { id: string; brand: string; model: string; year: number; plate: string };

export function VehiclesList({
  initialVehicles,
  createEndpoint,
  basePath,
  customerId,
  listTitle = "Vehículos",
  emptyMessage = "Todavía no hay vehículos registrados.",
}: {
  initialVehicles: Vehicle[];
  createEndpoint: string;
  basePath: string;
  customerId?: string;
  listTitle?: string;
  emptyMessage?: string;
}) {
  const [vehicles, setVehicles] = useState(initialVehicles);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            endpoint={createEndpoint}
            customerId={customerId}
            onCreated={(vehicle) => setVehicles((list) => [vehicle as Vehicle, ...list])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{listTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id} className="py-3">
                  <Link
                    href={`${basePath}/${vehicle.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {vehicle.brand} {vehicle.model} ({vehicle.year}) — {vehicle.plate}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
