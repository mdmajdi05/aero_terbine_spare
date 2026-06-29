'use client';

import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardViewItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  data: Record<string, unknown>;
  cardConfig?: Record<string, unknown>;
}

interface CardViewProps {
  items: CardViewItem[];
  cardConfig?: Record<string, unknown>;
}

export default function CardView({ items, cardConfig }: CardViewProps) {
  const showImage = cardConfig?.showImage !== false;
  const gridCols = (cardConfig?.gridCols as number) || 3;
  const placeholder = (cardConfig?.placeholder as string) || '';
  const showTitle = cardConfig?.showTitle !== false;
  const showDescription = cardConfig?.showDescription !== false;
  const showButton = cardConfig?.showButton !== false;
  const buttonLabel = (cardConfig?.buttonLabel as string) || 'View Details';
  const fields = (cardConfig?.fields as string[]) || [];
  const titleField = cardConfig?.titleField as string | undefined;
  const descField = cardConfig?.descField as string | undefined;
  const imageField = cardConfig?.imageField as string | undefined;

  const gridClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
  }[gridCols] || 'sm:grid-cols-2 lg:grid-cols-3';

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p>No items to display.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 gap-5', gridClass)}>
      {items.map((item) => {
        const cardTitle = titleField ? String(item.data?.[titleField] ?? '') : item.title;
        const cardDesc = descField ? String(item.data?.[descField] ?? '') : item.description;
        const cardImage = imageField ? String(item.data?.[imageField] ?? '') : item.image;

        return (
        <div
          key={item.id}
          className="bg-white border border-silver rounded-xl overflow-hidden hover:shadow-md hover:border-orange/30 transition-all duration-200 flex flex-col"
        >
          {showImage && cardImage && (
            <div className="aspect-video bg-bg overflow-hidden">
              <img
                src={cardImage}
                alt={cardTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="aspect-video bg-bg hidden items-center justify-center">
                <ImageOff className="w-8 h-8 text-silver-dark" />
              </div>
            </div>
          )}
          {showImage && !cardImage && placeholder && (
            <div className="aspect-video bg-bg flex items-center justify-center">
              <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
            </div>
          )}

          <div className="p-4 flex-1 flex flex-col">
            {showTitle && (
              <h3 className="font-semibold text-text mb-1 line-clamp-2">{cardTitle}</h3>
            )}
            {showDescription && cardDesc && (
              <p className="text-xs text-text-muted line-clamp-3 mb-3 flex-1">{cardDesc}</p>
            )}

            {fields.length > 0 && (
              <div className="space-y-1 mb-3">
                {fields.map((field) => {
                  const val = item.data?.[field];
                  if (val === undefined || val === null) return null;
                  return (
                    <div key={field} className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-text-muted capitalize">{field}:</span>
                      <span className="text-text">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {showButton && (
              <div className="mt-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-navy hover:bg-navy-dark rounded-lg px-3.5 py-2 transition-colors text-center">
                {buttonLabel}
              </div>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
}
