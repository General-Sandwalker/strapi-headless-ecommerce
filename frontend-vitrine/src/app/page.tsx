import Image from 'next/image';

// Function to fetch products from Strapi
async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?populate=*`, {
    cache: 'no-store' // Disables cache for the assignment (SSR)
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

export default async function Home() {
  const { data: products } = await getProducts();

  return (
    <main className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
        Accessories Store
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white p-5 rounded-lg shadow-md">
            {/* Handle image (if it exists) */}
            {product.attributes.image?.data && (
              <div className="relative w-full h-48 mb-4">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}${product.attributes.image.data.attributes.url}`} 
                  alt={product.attributes.title} 
                  className="object-cover w-full h-full rounded" 
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              {product.attributes.title}
            </h2>
            <p className="text-blue-600 font-bold text-lg">
              {product.attributes.price} €
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
