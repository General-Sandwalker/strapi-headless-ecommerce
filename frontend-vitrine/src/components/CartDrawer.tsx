"use client";

import { formatPrice, type Product } from "@/lib/product";

export type CartLine = { product: Product; qty: number };

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.87 12.14A2 2 0 0 1 16.14 21H7.86a2 2 0 0 1-2-1.86L5 7m5 4v6m4-6v6m4-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
    </svg>
  );
}

export default function CartDrawer({
  open,
  lines,
  onClose,
  onQty,
  onRemove,
  onCheckout,
}: {
  open: boolean;
  lines: CartLine[];
  onClose: () => void;
  onQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.product.price, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            Your cart{" "}
            <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-sm font-semibold text-indigo-700">
              {lines.reduce((n, l) => n + l.qty, 0)}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <svg className="mb-3 h-14 w-14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <p className="font-medium text-slate-500">Your cart is empty</p>
              <p className="mt-1 text-sm">Add some accessories to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lines.map((line) => (
                <li key={line.product.id} className="flex gap-4 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {line.product.imageUrl && (
                      <img
                        src={line.product.imageUrl}
                        alt={line.product.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{line.product.title}</p>
                      <button
                        type="button"
                        onClick={() => onRemove(line.product.id)}
                        aria-label={`Remove ${line.product.title}`}
                        className="text-slate-300 transition hover:text-rose-500"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">{line.product.category}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onQty(line.product.id, line.qty - 1)}
                          aria-label="Decrease quantity"
                          className="px-2.5 py-1 text-slate-500 transition hover:text-indigo-600"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-medium">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => onQty(line.product.id, line.qty + 1)}
                          aria-label="Increase quantity"
                          className="px-2.5 py-1 text-slate-500 transition hover:text-indigo-600"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {formatPrice(line.qty * line.product.price)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5">
            <div className="mb-1 flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mb-4 flex justify-between text-sm text-slate-500">
              <span>Shipping</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            <div className="mb-4 flex justify-between text-lg font-bold text-slate-800">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
