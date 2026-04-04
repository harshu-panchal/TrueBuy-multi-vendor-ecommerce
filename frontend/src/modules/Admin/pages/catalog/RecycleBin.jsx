import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiSearch,
  FiTrash2,
  FiRefreshCw,
  FiImage,
  FiBox,
  FiInfo,
  FiHash,
  FiCheck,
  FiDollarSign,
  FiCalendar,
  FiAlertTriangle,
  FiLayout,
  FiDatabase,
  FiLayers
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const RecycleBin = () => {
  // UI State
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showWarning, setShowWarning] = useState(true);

  // Table Settings State
  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    picture: true,
    id: true,
    sku: true,
    name: true,
    gtin: false,
    mpn: false,
    orders: true,
    price: true,
    comparePrice: false,
    specialPrice: false,
    stock: true,
    stores: false,
    customerOrders: false,
    created: true,
    updated: true,
    published: true,
    startDate: false,
    endDate: false,
  });

  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    type: 'All',
    published: 'Unspecified',
    showHome: 'Unspecified',
    noCategory: 'Unspecified',
    category: 'All Categories',
    noManufacturer: 'Unspecified',
    deliveryTime: '',
    store: ''
  });

  // Mock Data
  const [deletedProducts, setDeletedProducts] = useState([]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return deletedProducts.filter(item => {
      const matchName = item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchPublished = filters.published === 'Unspecified' 
        || (filters.published === 'Yes' && item.published)
        || (filters.published === 'No' && !item.published);
      return matchName && matchPublished;
    });
  }, [deletedProducts, filters]);

  const handleResetFilters = () => setFilters({
    name: '',
    type: 'All',
    published: 'Unspecified',
    showHome: 'Unspecified',
    noCategory: 'Unspecified',
    category: 'All Categories',
    noManufacturer: 'Unspecified',
    deliveryTime: '',
    store: ''
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(p => p.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleEmptyBin = () => {
    if (window.confirm('Are you sure you want to permanently delete ALL products in the recycle bin? This action cannot be undone.')) {
      setDeletedProducts([]);
      setSelectedIds(new Set());
    }
  };

  const handleRestore = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Restore ${selectedIds.size} selected products to catalog?`)) {
      setDeletedProducts(deletedProducts.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    }
  };

  const handleDeletePermanently = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Permanently delete ${selectedIds.size} selected products? This action cannot be undone.`)) {
      setDeletedProducts(deletedProducts.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    }
  };

  // Table Columns Mapping
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={selectedIds.size === filteredData.length && filteredData.length > 0} 
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      sortable: false,
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.has(row.id)} 
          onChange={() => handleSelectRow(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    { 
      key: 'picture', 
      label: 'Picture', 
      hidden: !visibleColumns.picture, 
      render: (v) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
          {v ? <img src={v} alt="Product" className="w-full h-full object-cover" /> : <FiImage className="text-gray-300" />}
        </div>
      ) 
    },
    { key: 'id', label: 'ID', hidden: !visibleColumns.id, render: (v) => <span className="font-mono text-[10px] font-black text-gray-400">{v}</span> },
    { key: 'sku', label: 'SKU', hidden: !visibleColumns.sku, render: (v) => <span className="text-[10px] font-bold text-gray-800">{v}</span> },
    { key: 'name', label: 'Product Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 break-words max-w-xs block">{v}</span> },
    { key: 'gtin', label: 'GTIN', hidden: !visibleColumns.gtin, render: (v) => <span className="text-[10px] text-gray-400">{v || '-'}</span> },
    { key: 'mpn', label: 'MPN', hidden: !visibleColumns.mpn, render: (v) => <span className="text-[10px] text-gray-400">{v || '-'}</span> },
    { key: 'orders', label: 'Orders', hidden: !visibleColumns.orders, render: (v) => <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500">{v}</span> },
    { key: 'price', label: 'Price', hidden: !visibleColumns.price, render: (v) => <span className="font-bold text-primary-600">${v.toFixed(2)}</span> },
    { key: 'comparePrice', label: 'Compare Price', hidden: !visibleColumns.comparePrice, render: (v) => <span className="text-gray-400 line-through text-[11px]">${v?.toFixed(2) || '-'}</span> },
    { key: 'specialPrice', label: 'Special Price', hidden: !visibleColumns.specialPrice, render: (v) => <span className="text-red-500 font-bold text-[11px]">${v?.toFixed(2) || '-'}</span> },
    { key: 'stock', label: 'Stock', hidden: !visibleColumns.stock, render: (v) => <span className={`font-mono text-[11px] font-black ${v === 0 ? 'text-red-500' : 'text-gray-500'}`}>{v}</span> },
    { key: 'stores', label: 'Stores', hidden: !visibleColumns.stores, render: (v) => <span className="text-[10px] text-gray-400 italic">{v}</span> },
    { key: 'customerOrders', label: 'Limited roles', hidden: !visibleColumns.customerOrders, render: (v) => <span className="text-[10px] text-gray-400">{v}</span> },
    { key: 'created', label: 'Created', hidden: !visibleColumns.created, render: (v) => <span className="text-[10px] text-gray-400">{v}</span> },
    { key: 'updated', label: 'Updated', hidden: !visibleColumns.updated, render: (v) => <span className="text-[10px] text-gray-400">{v}</span> },
    { 
      key: 'published', 
      label: 'Published', 
      hidden: !visibleColumns.published, 
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v ? 'Yes' : 'No'}
        </span>
      ) 
    },
    { key: 'startDate', label: 'Start Date', hidden: !visibleColumns.startDate, render: (v) => <span className="text-[10px] text-gray-400">{v || '-'}</span> },
    { key: 'endDate', label: 'End Date', hidden: !visibleColumns.endDate, render: (v) => <span className="text-[10px] text-gray-400">{v || '-'}</span> },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Recovery Warning Message */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 relative overflow-hidden group mb-4"
          >
            <div className="flex gap-4 items-start pr-10">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shadow-sm">
                <FiAlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest">Recovery Notice</h3>
                <p className="text-xs text-amber-700 leading-relaxed font-medium opacity-90">
                  A recovery of deleted products is intended for emergencies. Some data cannot be restored in the process. 
                  These include assignments to delivery times and quantity units, country of origin and the compare price label (e.g. RRP). 
                  Products that are assigned to orders are ignored during deletion, as they cannot be deleted permanently.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100/50 rounded-lg transition-all"
            >
              <FiX size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary-600 pr-4 border-r border-gray-100">
              <div className="p-2 bg-primary-50 rounded-lg"><FiTrash2 /></div>
              <span className="text-sm font-bold text-gray-600">Product Recycle Bin</span>
            </div>
            
            <button 
              onClick={handleEmptyBin}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
            >
              <FiTrash2 className="text-lg" />
              <span>Empty Recycle Bin</span>
            </button>

            <AnimatePresence>
               {selectedIds.size > 0 && (
                 <div className="flex items-center gap-2">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={handleRestore}
                      className="px-6 py-2.5 bg-white border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                      <FiRefreshCw size={14} />
                      <span>Restore ({selectedIds.size})</span>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={handleDeletePermanently}
                      className="px-6 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <FiTrash2 size={14} />
                      <span>Permanent Delete ({selectedIds.size})</span>
                    </motion.button>
                 </div>
               )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${
                showFilter 
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="text-xs" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Advanced Filter Overlay */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gray-50/50 border-b border-gray-100"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                {/* Text Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiSearch /> Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Search deleted items..."
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Dropdowns */}
                {[
                  { label: 'Product Type', key: 'type', options: ['All', 'Simple Product', 'Grouped Product', 'Bundled Product'], icon: <FiBox /> },
                  { label: 'Published', key: 'published', options: ['Unspecified', 'Yes', 'No'], icon: <FiCheck /> },
                  { label: 'Show on Home', key: 'showHome', options: ['Unspecified', 'Yes', 'No'], icon: <FiLayout /> },
                  { label: 'No Category Mapping', key: 'noCategory', options: ['Unspecified', 'Yes', 'No'], icon: <FiLayers /> },
                  { label: 'No Manufacturer Mapping', key: 'noManufacturer', options: ['Unspecified', 'Yes', 'No'], icon: <FiDatabase /> }
                ].map((input) => (
                  <div key={input.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                      {input.icon} {input.label}
                    </label>
                    <select
                      value={filters[input.key]}
                      onChange={(e) => setFilters({...filters, [input.key]: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm appearance-none"
                    >
                      {input.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}

                {/* Complex Hierarchical Category Dropdown */}
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiLayers /> Category Selection
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  >
                    <option>All Categories</option>
                    <optgroup label="Technology">
                      <option>Technology (Technology)</option>
                      <option>--Electronic (Electronic)</option>
                      <option>----Mobile (Mobile)</option>
                      <option>------Apple iPhone (Apple iPhone)</option>
                      <option>------Google Smart Phone (Google Smart Phone)</option>
                      <option>------Nokia Smart Phone (Nokia Smart Phone)</option>
                      <option>------Oppo Smart Phone (Oppo Smart Phone)</option>
                      <option>------Realme Smart Phone (Realme Smart Phone)</option>
                      <option>------Samsung Smart Phone (Samsung Smart Phone)</option>
                      <option>------Vivo Smart Phone (Vivo Smart Phone)</option>
                      <option>------Xiaomi Smart Phone (Xiaomi Smart Phone)</option>
                      <option>----Mobile Accessories (Mobile Accessories)</option>
                      <option>----Audio Systems (Audio Systems)</option>
                      <option>----Camera & Photography (Camera & Photography)</option>
                      <option>----CCTV (CCTV)</option>
                      <option>----Charger & Cables (Charger & Cables)</option>
                      <option>----Drone (Drone)</option>
                      <option>----Headphone & Earphone (Headphone & Earphone)</option>
                      <option>----Laptop & Computers (Laptop & Computers)</option>
                      <option>----LED-TV (LED-TV)</option>
                      <option>----Power Bank (Power Bank)</option>
                      <option>----Printer & Scanner (Printer & Scanner)</option>
                      <option>----Smart Watch (Smart Watch)</option>
                      <option>----Storage Devices (Storage Devices)</option>
                      <option>------Hard Disk (Hard Disk)</option>
                      <option>------Pen Drive (Pen Drive)</option>
                    </optgroup>
                    <optgroup label="Agriculture">
                      <option>Agriculture (Agriculture)</option>
                      <option>--Farming Seed (Farming Seed)</option>
                      <option>--Farming Tools (Farming Tools)</option>
                      <option>----Combine (Combine)</option>
                      <option>----Rotavator (Rotavator)</option>
                      <option>----Tractor (Tractor)</option>
                      <option>--Fertilizers (Fertilizers)</option>
                      <option>--Greenhouse Equipment (Greenhouse Equipment)</option>
                      <option>--Irrigation Equipment (Irrigation Equipment)</option>
                      <option>--Nursery (Nursery)</option>
                      <option>----Plants Nursery (Plants Nursery)</option>
                      <option>----Vegetable Nursery (Vegetable Nursery)</option>
                      <option>--Organic Farming (Organic Farming)</option>
                      <option>--Pesticides (Pesticides)</option>
                      <option>--Plant Nutrition (Plant Nutrition)</option>
                    </optgroup>
                    <optgroup label="Fashion & Beauty">
                      <option>Fashion & Beauty (Fashion & Beauty)</option>
                      <option>--Beauty (Beauty)</option>
                      <option>----Anti-aging Products (Anti-aging Products)</option>
                      <option>----Bath & Shower (Bath & Shower)</option>
                      <option>----Fragrances (Fragrances)</option>
                      <option>----Makeup kit (Makeup kit)</option>
                      <option>----Men's Grooming (Men's Grooming)</option>
                      <option>----Personal Care (Personal Care)</option>
                      <option>--Garments (Garments)</option>
                      <option>----Child's Clothing (Child's Clothing)</option>
                      <option>----Men's Clothing (Men's Clothing)</option>
                      <option>------Kot Paint (Kot Paint)</option>
                      <option>------Shirts (Shirts)</option>
                      <option>------T-Shirts (T-Shirts)</option>
                      <option>----Women's Clothing (Women's Clothing)</option>
                      <option>------Dresses (Dresses)</option>
                      <option>------Kurtis (Kurtis)</option>
                      <option>------Nighties (Nighties)</option>
                      <option>------Topwear (Topwear)</option>
                      <option>------Under Garments (Under Garments)</option>
                      <option>--Jewelry (Jewelry)</option>
                      <option>----Bangles (Bangles)</option>
                      <option>----Earrings (Earrings)</option>
                      <option>----Jewelry Set (Jewelry Set)</option>
                      <option>----Mangalsutra (Mangalsutra)</option>
                      <option>----Rings (Rings)</option>
                      <option>--Footware (Footware)</option>
                      <option>----Kids (Kids)</option>
                      <option>----Man Shoe's (Man Shoe's)</option>
                      <option>------Punjabi Juti (Punjabi Juti)</option>
                      <option>------Sports Shos's (Sports Shos's)</option>
                      <option>----Women Shoe's (Women Shoe's)</option>
                      <option>------Punjabi Juti (Punjabi Juti)</option>
                      <option>--Luggage Bags & Cases (Luggage Bags & Cases)</option>
                      <option>--Sunglasses (Sunglasses)</option>
                      <option>--Watches (Watches)</option>
                    </optgroup>
                    <optgroup label="Grocery">
                      <option>Grocery (Grocery)</option>
                      <option>--Bakery Products (Bakery Products)</option>
                      <option>--Breakfast Cereals (Breakfast Cereals)</option>
                      <option>--Cereal (Cereal)</option>
                      <option>--Dairy Products (Dairy Products)</option>
                      <option>--Dry Fruits (Dry Fruits)</option>
                      <option>--Frozen Foods (Frozen Foods)</option>
                      <option>--Fruit & Vegetable (Fruit & Vegetable)</option>
                      <option>--Oil & Ghee (Oil & Ghee)</option>
                      <option>--Organic Products (Organic Products)</option>
                      <option>--Pickels (Pickels)</option>
                      <option>--Snacks Beverages (Snacks Beverages)</option>
                      <option>--Spices Condiments (Spices Condiments)</option>
                      <option>--Sugar (Sugar)</option>
                      <option>--Sweets (Sweets)</option>
                      <option>-Tea Coffee (Tea Coffee)</option>
                    </optgroup>
                    <optgroup label="Health & Medical">
                      <option>Health & Medical (Health & Medical)</option>
                      <option>--Personal Hygiene (Personal Hygiene)</option>
                      <option>--Safety (Safety)</option>
                      <option>----Helmet & Riding Gear (Helmet & Riding Gear)</option>
                      <option>--Spa & Wellness (Spa & Wellness)</option>
                    </optgroup>
                    <optgroup label="Home & Kitchen">
                      <option>Home & Kitchen (Home & Kitchen)</option>
                      <option>--Bathroom Accessories (Bathroom Accessories)</option>
                      <option>--Cookers & Ovens (Cookers & Ovens)</option>
                      <option>--Handloom (Handloom)</option>
                      <option>----Bad Sheet (Bad Sheet)</option>
                      <option>----Carpet (Carpet)</option>
                      <option>----Curtains (Curtains)</option>
                      <option>--Home Cleaner (Home Cleaner)</option>
                      <option>--Kitchen Appliances (Kitchen Appliances)</option>
                    </optgroup>
                    <optgroup label="Sports & Fitness">
                      <option>Sports & Fitness (Sports & Fitness)</option>
                      <option>--Health Gym Equipment (Health Gym Equipment)</option>
                      <option>--Basketball (Basketball)</option>
                      <option>--Golf (Golf)</option>
                      <option>--Soccer (Soccer)</option>
                    </optgroup>
                    <optgroup label="Automobile">
                      <option>Automobile (Automobile)</option>
                      <option>--Air Filters (Air Filters)</option>
                      <option>--Battery & Charger (Battery & Charger)</option>
                      <option>--Brakes & Discs (Brakes & Discs)</option>
                      <option>--Engine Parts (Engine Parts)</option>
                      <option>--Lights & Indicators (Lights & Indicators)</option>
                      <option>--Mirrors & Accessories (Mirrors & Accessories)</option>
                      <option>--Two Wheelers (Two Wheelers)</option>
                      <option>----Motor Bike (Motor Bike)</option>
                      <option>--Tyre Tube (Tyre Tube)</option>
                      <option>--Wheels & Rims (Wheels & Rims)</option>
                      <option>--Lubricant (Lubricant)</option>
                    </optgroup>
                    <optgroup label="Ayurveda">
                      <option>Ayurveda (Ayurveda)</option>
                      <option>--Ashwadandha (Ashwadandha)</option>
                      <option>--Triphal (Triphal)</option>
                    </optgroup>
                    <optgroup label="Furniture & Building">
                      <option>Furniture & Building (Furniture & Building)</option>
                      <option>--Building Materials (Building Materials)</option>
                      <option>----Bricks (Bricks)</option>
                      <option>----Iron Steel (Iron Steel)</option>
                      <option>--Marble & Tiles (Marble & Tiles)</option>
                      <option>--Paint & Wallpaper (Paint & Wallpaper)</option>
                      <option>--Wall Art (Wall Art)</option>
                      <option>--Chairs Sofa Table (Chairs Sofa Table)</option>
                      <option>----Chairs (Chairs)</option>
                      <option>----Sofas (Sofas)</option>
                      <option>----Tables (Tables)</option>
                    </optgroup>
                    <optgroup label="Books & Office">
                      <option>Books & Office (Books & Office)</option>
                      <option>--Books (Books)</option>
                      <option>--Calendars & Planners (Calendars & Planners)</option>
                      <option>--Craft Materials (Craft Materials)</option>
                      <option>--E-Books (E-Books)</option>
                      <option>--Musical Instruments (Musical Instruments)</option>
                      <option>--Notebooks (Notebooks)</option>
                      <option>--Office Supplies (Office Supplies)</option>
                      <option>--Pen Pencils (Pen Pencils)</option>
                      <option>--School Suppliess (School Suppliess)</option>
                      <option>--Writing Pads (Writing Pads)</option>
                      <option>--SPIEGEL-Bestseller (SPIEGEL-Bestseller)</option>
                      <option>--Cook and enjoy (Cook and enjoy)</option>
                      <option>--Gift Cards (Gift Cards)</option>
                    </optgroup>
                    <optgroup label="Machinery">
                      <option>Machinery (Machinery)</option>
                      <option>--Construction & Building Machinery (Construction & Building Machinery)</option>
                      <option>--Industrial Machinery (Industrial Machinery)</option>
                    </optgroup>
                    <optgroup label="Gaming">
                      <option>Gaming (Gaming)</option>
                      <option>--Gaming Accessories (Gaming Accessories)</option>
                      <option>--Games (Games)</option>
                    </optgroup>
                    <optgroup label="Toys & Hobbies">
                      <option>Toys & Hobbies (Toys & Hobbies)</option>
                      <option>--Cycle (Cycle)</option>
                    </optgroup>
                    <optgroup label="Software Digital Products">
                      <option>Digital Products (Digital Products)</option>
                      <option>--On Demand Software (On Demand Software)</option>
                      <option>----Web Design (Web Design)</option>
                    </optgroup>
                    <optgroup label="Festival Item">
                      <option>Diwali (Diwali)</option>
                    </optgroup>
                    <optgroup label="Hardware Sanctuary">
                      <option>Pipes (Pipes)</option>
                    </optgroup>
                    <optgroup label="Property Sale Buy">
                      <option>Agriculture Land (Agriculture Land)</option>
                      <option>Commercial Land (Commercial Land)</option>
                      <option>Factory Buy Sale (Factory Buy Sale)</option>
                      <option>Flats (Flats)</option>
                      <option>Shops & Show Room (Shops & Show Room)</option>
                    </optgroup>
                    <option>Antique (Antique)</option>
                    <option>Service (Service)</option>
                    <option>Sale (Sale)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                      <FiCalendar /> Delivery Time
                   </label>
                   <input type="text" placeholder="e.g. 3-5 days" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm" />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">Matched Items: {filteredData.length}</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase tracking-widest">
                    <FiX size={14} /> Reset Complex Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={filteredData}
            columns={filteredColumns}
            pagination={true}
            itemsPerPage={10}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`rounded-none shadow-none border-none ${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        {/* Meta Dashboard Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Deleted Records: {deletedProducts.length}</span>
             </div>
             <div className="flex items-center gap-2 px-6 border-l border-gray-200">
                <FiDollarSign className="text-gray-300" size={12} />
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Lost Asset Value: ${deletedProducts.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600 shadow-sm' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
              >
                <FiSettings />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 pointer-events-auto"
                  >
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3 border-b border-gray-50 pb-2">Layout Config</h4>
                      
                      <div className="space-y-2.5">
                        {[
                          { label: 'Row lines', key: 'rowLines' },
                          { label: 'Column lines', key: 'columnLines' },
                          { label: 'Striped', key: 'striped' },
                          { label: 'Hover', key: 'hover' }
                        ].map(({ label, key }) => (
                          <label key={key} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-gray-600 group-hover:text-primary-600 transition-colors uppercase tracking-widest">{label}</span>
                            <div
                              onClick={() => setTableSettings(s => ({ ...s, [key]: !s[key] }))}
                              className={`w-8 h-4 rounded-full relative transition-colors ${tableSettings[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${tableSettings[key] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-50 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Column Manager</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-admin">
                          {Object.entries(visibleColumns).map(([key, isVisible]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                              <div
                                onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                              >
                                {isVisible && <FiCheck className="text-white text-[8px]" />}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                                {key.replace(/([A-Z])/g, ' $1')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecycleBin;
