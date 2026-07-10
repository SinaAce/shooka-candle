import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    scent?: string | null;
    images: { url: string; alt?: string | null }[];
    category?: { name: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group scroll-reveal scroll-reveal-up candle-card overflow-hidden hover:border-[var(--primary)] transition-all duration-300 hover-lift block"
    >
      <div className="relative aspect-square bg-[var(--surface-alt)] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.images[0]?.alt || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--primary-light)]">
            <span className="text-4xl">🕯️</span>
          </div>
        )}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {Math.round(
              ((product.comparePrice - product.price) / product.comparePrice) *
                100
            )}
            % تخفیف
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {product.category && (
          <p className="text-xs text-[var(--primary)] mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1 text-sm sm:text-base">
          {product.name}
        </h3>
        {product.scent && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            رایحه: {product.scent}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-[var(--foreground)] text-sm sm:text-base">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs sm:text-sm text-[var(--text-muted)] line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
