import type { ProductStatus, ProductType } from "@/types/database";

const STATUS_LABEL: Record<ProductStatus, string> = {
  disponible: "Disponible",
  emprunte: "Emprunté",
  donne: "Donné",
};

const STATUS_CLASSES: Record<ProductStatus, string> = {
  disponible: "bg-green/12 text-green",
  emprunte: "bg-yellow/15 text-yellow",
  donne: "bg-concrete/15 text-concrete",
};

const TYPE_CLASSES: Record<ProductType, string> = {
  don: "bg-green/18 text-green border border-green/40",
  pret: "bg-orange/18 text-orange border border-orange/40",
};

export interface ProductCardData {
  id: string;
  title: string;
  description: string | null;
  categories: string[];
  type: ProductType;
  status: ProductStatus;
  photo_url: string | null;
  ownerLabel: string;
}

export function ProductCard({
  product,
  actions,
}: {
  product: ProductCardData;
  actions?: React.ReactNode;
}) {
  return (
    <div className="card-pin relative rounded-[3px] border border-card-border bg-card-bg p-3.5 pb-4 transition-transform hover:-translate-y-[3px] hover:rotate-[-0.4deg] hover:border-orange">
      {product.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.photo_url}
          alt={product.title}
          className="mb-2.5 block aspect-[4/3] w-full rounded-[2px] bg-[#1c3862] object-cover"
        />
      ) : (
        <div className="mb-2.5 flex aspect-[4/3] w-full items-center justify-center rounded-[2px] bg-[#1c3862] font-mono text-[11px] text-concrete">
          Pas de photo
        </div>
      )}

      <div className="mb-2 flex flex-wrap gap-1.5">
        <span
          className={`rounded-[2px] px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-wide ${TYPE_CLASSES[product.type]}`}
        >
          {product.type === "don" ? "Don" : "Prêt"}
        </span>
        <span
          className={`rounded-[2px] px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASSES[product.status]}`}
        >
          {STATUS_LABEL[product.status]}
        </span>
      </div>

      <p className="mb-1 text-[15px] leading-tight font-bold">{product.title}</p>
      <p className="mb-2 font-mono text-[10.5px] tracking-wide text-concrete uppercase">
        {(product.categories.length ? product.categories : ["Autre"]).join(" · ")}
      </p>
      {product.description && (
        <p className="mb-2.5 text-[12.5px] leading-relaxed text-ink-dim">
          {product.description}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-dashed border-card-border pt-2 text-[11.5px] text-concrete">
        <span>{product.ownerLabel}</span>
        {actions}
      </div>
    </div>
  );
}
