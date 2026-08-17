import { resolveImage } from '../api';

export default function AdCarousel({ ads }) {
  if (!ads || ads.length === 0) return null;
  return (
    <div className="mt-4 px-3">
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x-mandatory pb-1">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="snap-start shrink-0 w-[86%] max-w-sm aspect-[16/8] rounded-xl2 overflow-hidden shadow-card bg-forest-100"
          >
            <img src={resolveImage(ad.imageUrl)} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
