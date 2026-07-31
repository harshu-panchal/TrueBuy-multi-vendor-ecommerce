import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCatalogBrands } from '../../data/catalogData';

const BrandLogosScroll = ({ brands = null }) => {
    const navigate = useNavigate();
    const fallbackBrands = getCatalogBrands().slice(0, 10);
    const displayBrands = Array.isArray(brands) && brands.length > 0
        ? brands.slice(0, 10)
        : fallbackBrands;

    return (
        <section className="bg-transparent w-full overflow-hidden px-4 mt-6 mb-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-[#FDFBF7] rounded-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 py-3 px-6 overflow-hidden">
                    <div className="w-full overflow-x-auto scrollbar-hide flex items-center gap-8 min-w-max" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {displayBrands.map((brand, index) => (
                            <motion.div
                                key={brand.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className="flex-shrink-0 flex items-center justify-center cursor-pointer group hover:scale-110 transition-transform"
                                onClick={() => navigate(`/brand/${brand.id}`)}
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="h-8 md:h-10 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 mix-blend-multiply"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                    loading="lazy"
                                />
                                {/* Fallback text if logo fails, using before pseudoelement via JS isn't easy, so we just hide it as it's a decorative brand scroll */}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandLogosScroll;
