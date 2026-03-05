"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader } from "lucide-react";

import img_1 from "@/assets/ramadan_1.jpg";
import img_2 from "@/assets/ramadan_2.jpg";
import img_3 from "@/assets/ramadan_3.jpg";
import img_4 from "@/assets/ramadan_2.jpg";

const images = [img_1, img_2, img_3, img_4];

const RamadanDialog = () => {
  const [open, setOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State to track loading for each image index
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {},
  );

  useEffect(() => {
    const isClosedToday = localStorage.getItem("ramadanDialogClosed");
    const today = new Date().toDateString();

    if (isClosedToday !== today) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const isCurrentLoading = !loadedImages[currentIndex];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100%" }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-secondary/50"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg max-h-150 overflow-hidden rounded-4xl border border-white/10 bg-secondary shadow-2xl"
          >
            <button
              onClick={() => {
                setOpen(false);
                localStorage.setItem(
                  "ramadanDialogClosed",
                  new Date().toDateString(),
                );
              }}
              className="absolute right-5 top-5 z-20 flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl transition-all hover:bg-primary hover:text-secondary"
            >
              <X className="size-4 sm:size-5" />
            </button>

            {/* Slider Section */}
            <div className="relative h-80 w-full overflow-hidden bg-white/2">
              {/* Image Loader Spinner */}
              {isCurrentLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-primary opacity-40" />
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  onClick={() => setFullscreenIndex(currentIndex)}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="h-full w-full cursor-zoom-in"
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`Ramadan Dua ${currentIndex + 1}`}
                    fill
                    priority
                    onLoad={() => handleImageLoad(currentIndex)}
                    className={`object-cover rounded-t-4xl transition-opacity duration-500 ${isCurrentLoading ? "opacity-0" : "opacity-100"}`}
                  />
                </motion.div>
              </AnimatePresence>

              {fullscreenIndex !== null && (
                <motion.div
                  key="fullscreen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                  onClick={() => setFullscreenIndex(null)}
                >
                  <Image
                    src={images[fullscreenIndex]}
                    alt={`Full View ${fullscreenIndex + 1}`}
                    width={1920}
                    height={1080}
                    className="max-h-screen max-w-screen object-contain"
                  />
                </motion.div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-secondary to-transparent pointer-events-none" />

              <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between px-2">
                <button
                  onClick={prevSlide}
                  className="group rounded-full bg-black/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-primary hover:text-secondary"
                >
                  <ChevronLeft className="size-4 sm:size-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="group rounded-full bg-black/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-primary hover:text-secondary"
                >
                  <ChevronRight className="size-4 sm:size-5" />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 pt-2 text-center">
              <h3 className="style-font text-xl font-bold tracking-[0.15em] text-primary uppercase italic">
                Daily <span className="text-white">Dua</span>
              </h3>

              <div className="mt-5 flex justify-center gap-2.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentIndex === i
                        ? "w-8 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-8 w-full rounded-2xl bg-primary py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary transition-all hover:opacity-90 active:scale-95"
              >
                Explore More
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RamadanDialog;
