import Store from "@/components/Store";
import { toProduct, type Product } from "@/lib/product";

// Server component: fetches products from Strapi on every request (SSR)
async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?populate=*`, {
    cache: "no-store", // Disables cache for the assignment (SSR)
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const { data } = await res.json();
  return data.map(toProduct);
}

export default async function Home() {
  const products = await getProducts();
  return <Store products={products} />;
}
