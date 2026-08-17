import Link from "next/link";
import { Img } from "@/components/Img";
import type { PopulatedService } from "@/lib/data";

export function ServiceCard({ service }: { service: PopulatedService }) {
  return (
    <Link href={`/services/${service.slug}`} className="catalog-card group block">
      <div className="image-frame relative aspect-[4/3]">
        {service.image ? (
          <Img
            src={service.image}
            alt={service.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.045]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-navy text-white">
            <span className="font-display text-lg">Service</span>
          </div>
        )}
      </div>
      <div className="px-3.5 py-3.5">
        <p className="kicker">Technical service</p>
        <h3 className="mt-1.5 font-display text-[15px] font-bold uppercase leading-snug tracking-wide text-navy transition group-hover:text-orange">
          {service.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-steel">
          {service.shortDescription}
        </p>
      </div>
    </Link>
  );
}
