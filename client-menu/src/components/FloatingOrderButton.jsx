export default function FloatingOrderButton({ count = 0 }) {
  return (
    <button
      className="fixed bottom-5 right-4 z-40 h-14 w-14 rounded-full bg-forest-500 text-cream shadow-float flex items-center justify-center active:scale-95 transition-transform animate-pulseRing"
      aria-label="Корзина заказа"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-amber-500 text-ink text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
