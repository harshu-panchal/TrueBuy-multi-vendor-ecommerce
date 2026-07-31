import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiArrowRight } from "react-icons/fi";
import ProductCard from "../../../../shared/components/ProductCard";
import { getRecommendedProducts } from "../../data/catalogData";

const RecommendedSection = ({ products = null }) => {
  const recommended = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) {
      return products.slice(0, 6);
    }
    return getRecommendedProducts(6);
  }, [products]);

  if (recommended.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 my-6 mx-4 sm:mx-6 bg-white/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1a202c] rounded-full shadow-sm">
            <FiThumbsUp className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1a202c] leading-tight">
              Recommended for You
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Curated just for you</p>
          </div>
        </div>
        <Link
          to="/search"
          className="flex items-center gap-1 text-xs text-[#1a202c] font-semibold hover:text-black transition-colors bg-white/60 hover:bg-white px-3 py-1.5 rounded-full border border-white shadow-sm">
          <span>See All</span>
          <FiArrowRight className="text-sm" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {recommended.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={index === 5 ? "xl:hidden" : ""}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedSection;
