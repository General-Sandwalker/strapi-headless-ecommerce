"use client";

import { useState } from "react";
import { formatPrice, ratingFor, reviewsFor, type Product } from "@/lib/product";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.28 3.94a1 1 0 0 0 .95.69h4.15c.97 0 1.37 1.24.59 1.81l-3.36 2.44a1 1 0 0 0-.36 1.12l1.28 3.94c.3.92-.75 1.69-1.54 1.12l-3.35-2.44a1 1 0 0 0-1.18 0l-3.35 2.44c-.79.57-1.84-.2-1.54-1.12l1.28-3.94a1 1 0 0 0-.36-1.12L1.88 9.37c-.78-.57-.38-1.81.59-1.81h4.15a1 1 0 0 0 .95-.69l1.28-3.94Z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({
  product,
  isNew,
  onAdd,
}: {
  product: Product;
  isNew: boolean;
  onAdd: (product: Product) => void;
}) {
  const [justAdded, setJustAdded] = useState(false);
  const rating = ratingFor(product.id);
  const reviews = reviewsFor(product.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
              New
            </span>
          )}
          {rating === 5 && (
            <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-950 shadow">
              Best seller
            </span>
          )}
        </div>

        {/* Category chip */}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow backdrop-blur">
          {product.category}
        </span>

        {/* Quick add (desktop hover) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => {
              onAdd(product);
              setJustAdded(true);
              window.setTimeout(() => setJustAdded(false), 1600);
            }}
            className="w-full rounded-xl bg-slate-900/90 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-slate-900"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <Stars rating={rating} />
          <span className="text-xs text-slate-400">
            {rating.toFixed(1)} ({reviews})
          </span>
        </div>

        <h3 className="mb-1 text-base font-semibold leading-snug text-slate-800 group-hover:text-indigo-600">
          {product.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {product.description || "Premium phone accessory, engineered for everyday use."}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</p>
            <p className="flex items-center gap-1 text-xs text-emerald-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              In stock · Free shipping
            </p>
          </div>
          <button
            type="button"
            aria-label={`Add ${product.title} to cart`}
            onClick={() => {
              onAdd(product);
              setJustAdded(true);
              window.setTimeout(() => setJustAdded(false), 1600);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
              justAdded ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {justAdded ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
