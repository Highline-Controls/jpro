"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";

/**
 * Lightweight, mobile-first horizontal carousel.
 * - Touch swipe left/right
 * - No vertical page scroll (parent should be overflow-hidden)
 */
export default function ThermostatCarousel({
  children,
}: {
  children: React.ReactNode;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    setSnapCount(emblaApi.scrollSnapList().length);
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnapCount(emblaApi.scrollSnapList().length);
      onSelect();
    });
  }, [emblaApi, onSelect]);

  const scrollTo = React.useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i);
    },
    [emblaApi]
  );

  const slides = React.Children.toArray(children);

  return (
    <div className="h-full w-full overflow-hidden">
      {/* viewport */}
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        {/* container */}
        <div className="flex h-full">
          {slides.map((child, idx) => (
            <div
              key={idx}
              className="flex-[0_0_100%] min-w-0 h-full px-1"
              aria-roledescription="slide"
              aria-label={`Thermostat ${idx + 1} of ${slides.length}`}
            >
              {/* Center the card and prevent the slide itself from creating vertical scroll */}
              <div className="h-full w-full flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-[520px]">{child as any}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* dots */}
      {snapCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to thermostat ${i + 1}`}
              className={
                "h-2 w-2 rounded-full transition-opacity " +
                (i === selectedIndex
                  ? "opacity-100 bg-zinc-900 dark:bg-zinc-100"
                  : "opacity-30 bg-zinc-900 dark:bg-zinc-100")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
