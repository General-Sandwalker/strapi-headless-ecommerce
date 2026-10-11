/**
 * Data layer: maps the Strapi v4 API response (`populate=*`) to a clean
 * Product shape used by the showcase UI.
 */

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  publishedAt: string | null;
};

type StrapiProduct = {
  id: number;
  attributes: {
    title: string;
    description?: unknown;
    price: number;
    image?: { data?: { attributes?: { url?: string } } | null };
    category?: { data?: { attributes?: { name?: string } } | null };
    publishedAt?: string;
  };
};

/** Rich Text (Blocks) fields come back as nested JSON — flatten to plain text. */
function flattenDescription(description: unknown): string {
  if (typeof description === "string") return description;
  if (!Array.isArray(description)) return "";
  return description
    .map((block) => {
      const children = (block as { children?: Array<{ text?: string }> }).children;
      return children?.map((child) => child.text ?? "").join("") ?? "";
    })
    .filter(Boolean)
    .join(" ");
}

export function toProduct(raw: StrapiProduct): Product {
  const url = raw.attributes.image?.data?.attributes?.url;
  return {
    id: raw.id,
    title: raw.attributes.title,
    description: flattenDescription(raw.attributes.description),
    price: Number(raw.attributes.price),
    imageUrl: url ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : null,
    category: raw.attributes.category?.data?.attributes?.name ?? "Uncategorized",
    publishedAt: raw.attributes.publishedAt ?? null,
  };
}

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-EN", { minimumFractionDigits: 2 }).format(price) + " €";

/** Deterministic pseudo-random rating so cards look like a real catalog. */
export const ratingFor = (id: number): number => (id % 3 === 0 ? 4.5 : id % 2 === 0 ? 4 : 5);
export const reviewsFor = (id: number): number => 37 + (id * 13) % 118;
