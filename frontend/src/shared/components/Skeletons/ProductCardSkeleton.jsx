const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden h-full flex flex-col border border-gray-100">
      {/* Image Skeleton - compact height */}
      <div className="relative h-44 lg:h-52 w-full bg-gray-100 rounded-t-xl overflow-hidden skeleton-group">
        <div className="absolute inset-0 shimmer opacity-50"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="space-y-2">
          {/* Category Skeleton */}
          <div className="h-2 bg-gray-100 rounded w-1/3 relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-50"></div>
          </div>
          
          {/* Title Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-50"></div>
          </div>
          
          {/* Rating Skeleton */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-100 rounded relative overflow-hidden">
                <div className="absolute inset-0 shimmer opacity-50"></div>
              </div>
            ))}
          </div>

          {/* Price Skeleton */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-5 bg-gray-200 rounded w-16 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-50"></div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-12 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="h-9 bg-gray-900/5 rounded-xl mt-auto relative overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

