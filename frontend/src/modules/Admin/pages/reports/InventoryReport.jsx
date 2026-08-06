import { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiAlertCircle, FiTrendingDown, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../components/DataTable';
import ExportButton from '../../components/ExportButton';
import { formatPrice } from '../../../../shared/utils/helpers';
import * as adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const InventoryReport = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, activeProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
  const [productsLoading, setProductsLoading] = useState(true);
  const [restockModal, setRestockModal] = useState({ isOpen: false, product: null, newQuantity: '' });
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const allProducts = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const response = await adminService.getInventoryReport({ page, limit: 200 });
        const payload = response?.data || {};
        
        const pageProducts = Array.isArray(payload)
          ? payload
          : (payload.products || []);
          
        allProducts.push(...pageProducts);
        
        if (page === 1) {
          setSummary(payload.summary || { totalProducts: 0, activeProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
        }
        totalPages = Number(payload.pages || 1);
        page += 1;
      }

      setProducts(
        allProducts.map((p) => ({
          ...p,
          id: p._id || p.id,
          stockQuantity: p.stockQuantity || 0,
          price: p.price || 0,
          image: p.image || p.images?.[0] || 'https://via.placeholder.com/50x50?text=Product',
        }))
      );
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleOpenRestock = (product) => {
    setRestockModal({
      isOpen: true,
      product,
      newQuantity: String(product.stockQuantity || 0),
    });
  };

  const handleSaveStock = async () => {
    if (!restockModal.product) return;
    const qty = Number.parseInt(restockModal.newQuantity, 10);
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error('Please enter a valid non-negative stock quantity');
      return;
    }

    setIsUpdatingStock(true);
    try {
      await adminService.updateProductStock(restockModal.product.id, qty);
      toast.success(`Stock for '${restockModal.product.name}' updated to ${qty}`);
      setRestockModal({ isOpen: false, product: null, newQuantity: '' });
      await fetchAllProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const stats = useMemo(() => {
    const threshold = 10;
    const inStock = products.filter(p => (p.stockQuantity || 0) > threshold).length;
    return { ...summary, inStock };
  }, [products, summary]);

  const lowStockProducts = useMemo(() =>
    products.filter(p => {
      const threshold = p.lowStockThreshold || 10;
      return (p.stockQuantity || 0) <= threshold || p.stock === 'low_stock' || p.stock === 'out_of_stock';
    }),
    [products]);

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={value}
            className="w-10 h-10 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50x50?text=Product';
            }}
          />
          <div>
            <span className="font-medium text-gray-800 block text-sm">{value}</span>
            <span className="text-[11px] text-gray-400">Threshold: {row.lowStockThreshold || 10} units</span>
          </div>
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      label: 'Stock Qty',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-bold text-sm text-gray-800">
          {(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'stockStatus',
      label: 'Status',
      sortable: true,
      render: (_, row) => {
        const qty = row.stockQuantity || 0;
        const threshold = row.lowStockThreshold || 10;
        const status = qty === 0 ? 'OUT_OF_STOCK' : qty <= threshold ? 'LOW_STOCK' : 'IN_STOCK';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
            status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'price',
      label: 'Unit Price',
      sortable: true,
      render: (value) => formatPrice(value),
    },
    {
      key: 'totalValue',
      label: 'Total Valuation',
      sortable: true,
      render: (_, row) => formatPrice((row.price || 0) * (row.stockQuantity || 0)),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => handleOpenRestock(row)}
          className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          title="Quick Restock"
        >
          <FiRefreshCw size={12} />
          <span>Restock</span>
        </button>
      ),
    },
  ];

  if (productsLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Inventory Report</h1>
        <p className="text-sm sm:text-base text-gray-600">View inventory status and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Products</p>
            <FiPackage className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Products</p>
            <FiPackage className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.activeProducts || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Low Stock / Out</p>
            <FiAlertCircle className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStock || 0} / {stats.outOfStock || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Inventory Value</p>
            <FiTrendingDown className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatPrice(stats.totalValue || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex justify-end">
          <ExportButton
            data={products}
            headers={[
              { label: 'Product Name', accessor: (row) => row.name },
              { label: 'Stock', accessor: (row) => row.stockQuantity },
              { label: 'Price', accessor: (row) => formatPrice(row.price) },
            ]}
            filename="inventory-report"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Low Stock Alert</h3>
        {lowStockProducts.length > 0 ? (
          <DataTable
            data={lowStockProducts}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No low stock products</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">All Products</h3>
        <DataTable
          data={products}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      </div>

      {/* Quick Restock Modal */}
      <AnimatePresence>
        {restockModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2 text-primary-600">
                  <FiRefreshCw size={18} />
                  <h3 className="text-lg font-bold text-gray-800">Quick Restock Product</h3>
                </div>
                <button
                  onClick={() => setRestockModal({ isOpen: false, product: null, newQuantity: '' })}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              {restockModal.product && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <img
                      src={restockModal.product.image}
                      alt={restockModal.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{restockModal.product.name}</h4>
                      <p className="text-xs text-gray-500">Current Stock: <span className="font-mono font-bold text-gray-700">{restockModal.product.stockQuantity || 0}</span> | Low Threshold: <span className="font-mono text-gray-700">{restockModal.product.lowStockThreshold || 10}</span></p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      New Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={restockModal.newQuantity}
                      onChange={(e) => setRestockModal({ ...restockModal, newQuantity: e.target.value })}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setRestockModal({ isOpen: false, product: null, newQuantity: '' })}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStock}
                      disabled={isUpdatingStock}
                      className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <FiCheck size={14} />
                      <span>{isUpdatingStock ? 'Saving...' : 'Update Stock'}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InventoryReport;

