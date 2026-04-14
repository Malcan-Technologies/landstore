"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

import Modal from "@/components/common/Modal";

const PropertyGallery = ({ images = [], moreImagesLabel = "+15 more" }) => {
  const fallbackImage = "/Land.jpg";
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedImageMap, setFailedImageMap] = useState({});

  const hasSecondaryImages = images.length > 1;

  const resolveImageSrc = useCallback(
    (source) => {
      if (!source || failedImageMap[source]) {
        return fallbackImage;
      }

      return source;
    },
    [failedImageMap]
  );

  const markImageAsFailed = useCallback((source) => {
    if (!source || source === fallbackImage) {
      return;
    }

    setFailedImageMap((previous) => {
      if (previous[source]) {
        return previous;
      }

      return {
        ...previous,
        [source]: true,
      };
    });
  }, []);

  const handleOpenGallery = useCallback((index) => {
    setActiveImageIndex(index);
    setIsGalleryOpen(true);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const handlePreviousImage = useCallback(() => {
    if (images.length < 2) {
      return;
    }

    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    if (images.length < 2) {
      return;
    }

    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid items-stretch gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleOpenGallery(0)}
          className={`relative h-60 w-full rounded-t-xl text-left sm:h-100 ${
            hasSecondaryImages ? "sm:col-span-2 sm:rounded-l-xl sm:rounded-tr-none" : "sm:col-span-3 sm:rounded-xl"
          }`}
        >
          <Image
            src={resolveImageSrc(images[0])}
            alt="Main property view"
            fill
            className={`object-cover ${
              hasSecondaryImages ? "rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none" : "rounded-xl"
            }`}
            sizes="(min-width: 1024px) 66vw, 100vw"
            onError={() => markImageAsFailed(images[0])}
            unoptimized
          />
        </button>

        {hasSecondaryImages ? (
          <div className="flex h-30 gap-2 sm:h-auto sm:flex-col">
            {images[1] ? (
              <button
                type="button"
                onClick={() => handleOpenGallery(1)}
                className="relative flex-1 rounded-r-none rounded-bl-xl text-left sm:h-49 sm:w-full sm:flex-none sm:rounded-bl-none sm:rounded-tr-xl"
              >
                <Image
                  src={resolveImageSrc(images[1])}
                  alt="Property gallery image 2"
                  fill
                  className="rounded-r-none rounded-bl-xl object-cover sm:rounded-bl-none sm:rounded-tr-xl"
                  sizes="(min-width: 1024px) 24vw, 80vw"
                  onError={() => markImageAsFailed(images[1])}
                  unoptimized
                />
              </button>
            ) : null}

            {images[2] ? (
              <button
                type="button"
                onClick={() => handleOpenGallery(2)}
                className="relative flex-1 rounded-r-xl text-left sm:h-49 sm:w-full sm:flex-none sm:rounded-br-xl"
              >
                <Image
                  src={resolveImageSrc(images[2])}
                  alt="Property gallery image 3"
                  fill
                  className="rounded-br-xl object-cover sm:rounded-br-xl"
                  sizes="(min-width: 1024px) 24vw, 80vw"
                  onError={() => markImageAsFailed(images[2])}
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-r-xl bg-black/30 text-white sm:rounded-br-xl">
                  {moreImagesLabel}
                </div>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <Modal
        open={isGalleryOpen}
        onClose={handleCloseGallery}
        panelClassName="w-full max-w-[1100px] overflow-visible bg-transparent px-4 py-4 text-left shadow-none md:px-5 md:py-5"
        overlayClassName="bg-black/70"
        containerClassName="flex min-h-full items-center justify-center p-4"
        closeButtonClassName="absolute right-5 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-[34px] leading-none text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
        closeLabel="Close gallery"
      >
        <div className="relative space-y-4 rounded-[28px] bg-[#0D0D0D] p-4 shadow-2xl md:p-5">
          <div className="relative z-10 overflow-hidden rounded-[22px] bg-black/50">
            <div className="relative h-[70vh] min-h-105 w-full">
              <Image
                src={resolveImageSrc(images[activeImageIndex])}
                alt={`Property gallery image ${activeImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                onError={() => markImageAsFailed(images[activeImageIndex])}
                unoptimized
              />
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Previous image"
                >
                  <span className="text-[22px] leading-none">‹</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Next image"
                >
                  <span className="text-[22px] leading-none">›</span>
                </button>
              </>
            ) : null}
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3 text-sm text-white/80">
            <span>
              Image {activeImageIndex + 1} of {images.length}
            </span>
          </div>

          <div className="relative z-10 flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {images.map((image, index) => {
              const isActive = activeImageIndex === index;

              return (
                <button
                  key={`${image || "placeholder"}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    isActive ? "border-green-secondary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Open image ${index + 1}`}
                >
                  <Image
                    src={resolveImageSrc(image)}
                    alt={`Property thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                    onError={() => markImageAsFailed(image)}
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PropertyGallery;