import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/products/AddToCartButton";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const product = await prisma.product.findFirst({
    where: {
      active: true,
      OR: [{ slug }, { id: slug }],
    },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  const mainImage = product.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-700 mb-6"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به محصولات
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🕯️</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-stone-200"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || ""}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <span className="text-sm text-amber-600">{product.category.name}</span>
          )}
          <h1 className="text-3xl font-bold text-stone-900 mt-1 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <p className="text-stone-600 leading-relaxed mb-6 whitespace-pre-line">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {product.scent && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-500">رایحه</p>
                <p className="font-medium text-stone-800">{product.scent}</p>
              </div>
            )}
            {product.burnTime && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-500">زمان سوخت</p>
                <p className="font-medium text-stone-800">{product.burnTime}</p>
              </div>
            )}
            {product.weight && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-500">وزن</p>
                <p className="font-medium text-stone-800">{product.weight}</p>
              </div>
            )}
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-500">موجودی</p>
              <p className={`font-medium ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}
              </p>
            </div>
          </div>

          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>
    </div>
  );
}
