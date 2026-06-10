"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PawPrintIcon,
  ZoomInIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PetDetailImage } from "@/lib/services/pet.service"
import { cn } from "@/lib/utils"

type PetGalleryProps = {
  petName: string
  images: PetDetailImage[]
}

export function PetGallery({ petName, images }: PetGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const activeImage = images[activeIndex]
  const hasImages = images.length > 0

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) {
        return
      }

      const next = (index + images.length) % images.length
      setActiveIndex(next)
    },
    [images.length]
  )

  useEffect(() => {
    if (!lightboxOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        goTo(activeIndex - 1)
      }

      if (event.key === "ArrowRight") {
        goTo(activeIndex + 1)
      }

      if (event.key === "Escape") {
        setLightboxOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeIndex, goTo, lightboxOpen])

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => hasImages && setLightboxOpen(true)}
        disabled={!hasImages}
        aria-label={hasImages ? `View ${petName} photos` : "No photos available"}
      >
        {activeImage ? (
          <>
            <Image
              src={activeImage.url}
              alt={`${petName} photo ${activeIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
              unoptimized={activeImage.url.startsWith("/uploads/")}
            />
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
              <ZoomInIcon className="size-3.5" />
              Enlarge
            </span>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <PawPrintIcon className="size-12 opacity-50" />
            <span className="text-sm">Photos coming soon</span>
          </div>
        )}
      </button>

      {images.length > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label={`${petName} photo thumbnails`}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show photo ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:size-20",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent opacity-80 hover:opacity-100"
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={image.url.startsWith("/uploads/")}
              />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton
          className="max-w-4xl overflow-hidden border-0 bg-black/95 p-0 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">{petName} photo gallery</DialogTitle>
          {activeImage ? (
            <div className="relative flex min-h-[50vh] items-center justify-center p-4 sm:min-h-[70vh]">
              <Image
                src={activeImage.url}
                alt={`${petName} enlarged`}
                width={1200}
                height={900}
                className="max-h-[75vh] w-auto object-contain"
                unoptimized={activeImage.url.startsWith("/uploads/")}
              />
              {images.length > 1 ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 left-2 -translate-y-1/2"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="Previous photo"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 right-12 -translate-y-1/2"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label="Next photo"
                  >
                    <ChevronRightIcon />
                  </Button>
                  <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
                    {activeIndex + 1} / {images.length}
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
