import Image from "next/image";
import { ServiceOrderStatusBadge } from "@/components/service-orders/status-badge";
import type { ServiceOrderStatus } from "@/generated/prisma/enums";

type TimelineEvent = {
  id: string;
  status: ServiceOrderStatus;
  note: string | null;
  photos: string[];
  createdAt: Date | string;
  author: { name: string };
};

export function ServiceOrderTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay eventos registrados.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {[...events].reverse().map((event) => (
        <li key={event.id} className="rounded-md border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ServiceOrderStatusBadge status={event.status} />
            <span className="text-xs text-muted-foreground">
              {new Date(event.createdAt).toLocaleString("es-CO", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {event.author.name}
            </span>
          </div>
          {event.note && <p className="mt-2 text-sm">{event.note}</p>}
          {event.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.photos.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={url}
                    alt="Foto de la orden de servicio"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-md border border-border object-cover"
                    unoptimized
                  />
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
