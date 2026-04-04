import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import LazyImage from "../LazyImage";
import useSwipeGesture from "../../../modules/UserApp/hooks/useSwipeGesture";

const ImageGallery = ({ images, productName = "Product", children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  // Ensure images is an array
  const imageArray =
    Array.isArray(images) && images.length > 0
      ? images
      : [images].filter(Boolean);

  if (imageArray.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % imageArray.length);
  };

  const handlePrevious = () => {
    setSelectedIndex(
      (prev) => (prev - 1 + imageArray.length) % imageArray.length
    );
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
    setIsZoomedIn(false); // Reset zoom when opening
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomedIn(!isZoomedIn);
  };

  // Zoom logic for desktop
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${imageArray[selectedIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "200%", // 2x zoom
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Swipe gestures for image navigation
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 50,
  });

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        {/* Main Image Container */}
        <div
          className="relative w-full aspect-square bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group cursor-zoom-in group-hover:shadow-md transition-shadow duration-500"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
          data-gallery>
          
          {/* Main Display Image */}
          <motion.div
            key={selectedIndex}
            className="w-full h-full relative"
            onTouchStart={swipeHandlers.onTouchStart}
            onTouchMove={swipeHandlers.onTouchMove}
            onTouchEnd={swipeHandlers.onTouchEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}>
            <LazyImage
              src={imageArray[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/500x500?text=Product+Image";
              }}
            />
            
            {/* Desktop Hover Zoom Layer */}
            <div 
              className="absolute inset-0 z-20 pointer-events-none hidden lg:block bg-no-repeat transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{
                ...zoomStyle,
                backgroundSize: "250%", 
              }}
            />
          </motion.div>

          {/* Navigation Arrows (Mobile and Desktop Hover) */}
          {imageArray.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100">
                <FiChevronLeft className="text-gray-800 text-xl" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100">
                <FiChevronRight className="text-gray-800 text-xl" />
              </button>
            </>
          )}

          {/* Zoom Hint */}
          <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm pointer-events-none opacity-0 lg:group-hover:opacity-100 transition-opacity uppercase tracking-wider">
            Hover to zoom
          </div>
        </div>

        {/* Action Buttons / Badge Area (Injected via children) */}
        {children}

        {/* Thumbnails Row */}
        {imageArray.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {imageArray.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-14 h-14 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedIndex === index
                  ? "border-blue-500 ring-2 ring-blue-500/20 ring-offset-2 scale-95"
                  : "border-transparent hover:border-gray-200 bg-gray-50"
                  }`}>
                <LazyImage
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100x100?text=Thumbnail";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 lg:p-8"
            onClick={() => setIsLightboxOpen(false)}>
            
            {/* Header Controls */}
            <div className="absolute top-4 lg:top-8 left-0 right-0 px-6 flex items-center justify-between z-20">
              <span className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                {selectedIndex + 1} / {imageArray.length}
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleZoom}
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20 backdrop-blur-md">
                  <span className="text-sm font-bold">{isZoomedIn ? "1x" : "2x"}</span>
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20 backdrop-blur-md">
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full flex items-center justify-center">
              <motion.img
                key={selectedIndex + (isZoomedIn ? "-zoomed" : "-normal")}
                src={imageArray[selectedIndex]}
                alt={`${productName} - Full view`}
                drag={isZoomedIn}
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                className={`max-w-full max-h-[85vh] rounded-lg transition-all duration-300 ${
                  isZoomedIn ? "scale-[2.5] cursor-grab active:cursor-grabbing" : "object-contain"
                }`}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/800x800?text=Product+Image";
                }}
              />

              {/* Navigation in Lightbox */}
              {imageArray.length > 1 && !isZoomedIn && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4 lg:px-8 pointer-events-none">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                    className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20 backdrop-blur-md pointer-events-auto">
                    <FiChevronLeft className="text-3xl" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20 backdrop-blur-md pointer-events-auto">
                    <FiChevronRight className="text-3xl" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
