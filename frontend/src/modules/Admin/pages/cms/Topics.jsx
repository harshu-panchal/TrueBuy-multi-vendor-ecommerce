import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus,
    FiTrash2,
    FiEdit3,
    FiFilter,
    FiCheck,
    FiArrowLeft,
    FiSave,
    FiLayout,
    FiGlobe,
    FiUsers,
    FiCalendar,
    FiFileText,
    FiCode,
    FiMessageSquare,
    FiSettings,
    FiSearch,
    FiEye,
    FiLock,
    FiMap,
    FiType,
    FiInfo
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const TopicForm = ({ onBack, onSave, initialData = null }) => {
    const isEdit = !!initialData;
    const [activeTab, setActiveTab] = useState('General');
    const [formData, setFormData] = useState({
        systemName: '',
        published: true,
        priority: 0,
        passwordProtected: false,
        includeInSitemap: true,
        limitedToStores: 'All',
        limitedToRoles: 'All',
        renderAsHtmlWidget: false,
        htmlId: '',
        bodyCssClass: '',
        shortTitle: '',
        title: '',
        intro: '',
        body: '',
        seoTitleTag: '',
        seoMetaDescription: '',
        seoMetaKeywords: '',
        seoUrlAlias: '',
        attributes: [],
        ...(initialData || {}),
    });

    const tabs = ['General', 'Search engines (SEO)', 'Attributes'];

    const [isAddingAttribute, setIsAddingAttribute] = useState(false);
    const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });

    const [editingAttributeIndex, setEditingAttributeIndex] = useState(null);
    const [editAttributeData, setEditAttributeData] = useState({ name: '', value: '' });

    const [selectedAttrIndices, setSelectedAttrIndices] = useState(new Set());

    const handleToggle = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-primary-600 shadow-sm"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isEdit ? `Edit topic details - ${initialData.systemName}` : 'Add a new topic'}
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                            Content Management & Distribution
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-[#6b2bd9]">
                    <button
                        onClick={() => onSave(formData, true)}
                        className="px-6 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                        <FiSave />
                        <span>Save and Continue Edit</span>
                    </button>
                    <button
                        onClick={() => onSave(formData, false)}
                        className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
                    >
                        <FiCheck />
                        <span>Save</span>
                    </button>

                    {isEdit && (
                        <button
                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
                        >
                            <FiTrash2 />
                            <span>Delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-0.5">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#6b2bd9]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#6b2bd9] rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 lg:p-12 space-y-12">
                    {activeTab === 'General' ? (
                        <>
                            {/* Section: Basic Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiCode className="text-gray-300" /> System Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.systemName}
                                        onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiSettings className="text-gray-300" /> Priority
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Section: Toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { id: 'published', label: 'Published', icon: <FiEye /> },
                                    { id: 'passwordProtected', label: 'Password Protected', icon: <FiLock /> },
                                    { id: 'includeInSitemap', label: 'Include in SiteMap', icon: <FiMap /> },
                                    { id: 'renderAsHtmlWidget', label: 'HTML Widget', icon: <FiCode /> }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleToggle(item.id)}
                                        className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all group ${formData[item.id]
                                                ? 'bg-purple-50 border-purple-100 ring-2 ring-primary-50/50 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl w-fit transition-all ${formData[item.id] ? 'bg-[#6b2bd9] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <div className="text-left">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${formData[item.id] ? 'text-[#6b2bd9]' : 'text-gray-400'
                                                }`}>
                                                {item.label}
                                            </span>
                                            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter mt-0.5">
                                                {formData[item.id] ? 'Currently Enabled' : 'Currently Disabled'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Section: Targeting */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiGlobe className="text-gray-300" /> Limited to Stores
                                    </label>
                                    <select
                                        value={formData.limitedToStores}
                                        onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value })}
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Stores</option>
                                        <option value="Main Store">Main Store</option>
                                        <option value="Secondary Store">Secondary Store</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiUsers className="text-gray-300" /> Limited to Customer Roles
                                    </label>
                                    <select
                                        value={formData.limitedToRoles}
                                        onChange={(e) => setFormData({ ...formData, limitedToRoles: e.target.value })}
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Roles</option>
                                        <option value="Registered">Registered</option>
                                        <option value="Vendor">Vendor</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            {isEdit && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">URL</label>
                                        <div className="px-5 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 group border-dashed hover:border-[#6b2bd9]/50 transition-colors">
                                            <FiGlobe size={14} className="text-[#6b2bd9]" />
                                            <a href={`https://www.trubuy.com/topic/${formData.systemName.toLowerCase()}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#6b2bd9] hover:underline truncate">
                                                https://www.trubuy.com/topic/{formData.systemName.toLowerCase()}/
                                            </a>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Menu Items</label>
                                        <div className="px-5 py-3 bg-white border border-gray-100 rounded-2xl space-y-2 border-dashed">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Footer — Company — About Us</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Service — About Us</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="h-px bg-gray-100" />

                            {/* Section: Content Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Html ID</label>
                                    <input
                                        type="text"
                                        value={formData.htmlId}
                                        onChange={(e) => setFormData({ ...formData, htmlId: e.target.value })}
                                        className="w-full px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Body CSS Class</label>
                                    <input
                                        type="text"
                                        value={formData.bodyCssClass}
                                        onChange={(e) => setFormData({ ...formData, bodyCssClass: e.target.value })}
                                        className="w-full px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Short Title</label>
                                    <input
                                        type="text"
                                        value={formData.shortTitle}
                                        onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                                        className="w-full px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiType className="text-gray-300" /> Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-base font-black focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiInfo className="text-gray-300" /> Intro
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.intro}
                                        onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                                        className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#6b2bd9]/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FiMessageSquare className="text-gray-300" /> Body
                                    </label>
                                    <div className="border border-gray-200 rounded-[2rem] overflow-hidden focus-within:ring-2 focus-within:ring-[#6b2bd9]/10 focus-within:border-[#6b2bd9] transition-all">
                                        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-4">
                                            <span className="text-[10px] font-black text-gray-401 uppercase tracking-widest">Visual Editor</span>
                                            <div className="h-4 w-px bg-gray-200" />
                                            <button className="text-xs font-bold text-[#6b2bd9] hover:underline">Click to edit HTML...</button>
                                        </div>
                                        <textarea
                                            rows={12}
                                            value={formData.body}
                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                            className="w-full px-8 py-8 text-sm font-medium text-gray-700 outline-none resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'Search engines (SEO)' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12 max-w-4xl"
                        >
                            <div className="p-8 bg-amber-50/20 border border-dashed border-amber-200 rounded-[2rem] flex items-center gap-6 group">
                                <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm border border-amber-50 group-hover:rotate-12 transition-transform">
                                    <FiSearch size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-amber-900/80 uppercase tracking-widest">SEO Configuration</h3>
                                    <p className="text-[10px] font-bold text-amber-900/40 leading-relaxed uppercase tracking-widest">
                                        Optimize how this topic appears in search engine results to improve discoverability.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Title Tag</label>
                                        <input
                                            type="text"
                                            placeholder="The title shown in browser tabs and search results"
                                            value={formData.seoTitleTag}
                                            onChange={(e) => setFormData({ ...formData, seoTitleTag: e.target.value })}
                                            className="w-full px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meta Description</label>
                                        <textarea
                                            rows={4}
                                            placeholder="A brief summary of the content for search engines..."
                                            value={formData.seoMetaDescription}
                                            onChange={(e) => setFormData({ ...formData, seoMetaDescription: e.target.value })}
                                            className="w-full px-6 py-4 bg-white border border-gray-200 rounded-3xl text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#6b2bd9]/10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meta Keywords</label>
                                        <input
                                            type="text"
                                            placeholder="Comma-separated keywords for legacy SEO..."
                                            value={formData.seoMetaKeywords}
                                            onChange={(e) => setFormData({ ...formData, seoMetaKeywords: e.target.value })}
                                            className="w-full px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">URL Alias</label>
                                        <div className="relative">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs select-none">
                                                trubuy.com/topic/
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="custom-url-slug"
                                                value={formData.seoUrlAlias}
                                                onChange={(e) => setFormData({ ...formData, seoUrlAlias: e.target.value })}
                                                className="w-full pl-36 pr-6 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'Attributes' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Table Actions */}
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    {!isAddingAttribute ? (
                                        <button
                                            onClick={() => setIsAddingAttribute(true)}
                                            className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95"
                                        >
                                            <FiPlus />
                                            <span>Add New Attribute</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    if (newAttribute.name && newAttribute.value) {
                                                        setFormData({ ...formData, attributes: [newAttribute, ...formData.attributes] });
                                                        setNewAttribute({ name: '', value: '' });
                                                        setIsAddingAttribute(false);
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-[11px] font-black text-[#6b2bd9] uppercase tracking-widest hover:bg-purple-50 px-3 py-2 rounded-lg transition-all"
                                            >
                                                <FiCheck />
                                                <span>Save changes</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingAttribute(false);
                                                    setNewAttribute({ name: '', value: '' });
                                                }}
                                                className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 px-3 py-2 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => {
                                           if (selectedAttrIndices.size > 0 && window.confirm(`Delete ${selectedAttrIndices.size} attributes?`)) {
                                              const updated = formData.attributes.filter((_, idx) => !selectedAttrIndices.has(idx));
                                              setFormData({ ...formData, attributes: updated });
                                              setSelectedAttrIndices(new Set());
                                           }
                                        }}
                                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                                           selectedAttrIndices.size > 0 ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                      >
                                         <FiTrash2 />
                                         <span>Delete Selected ({selectedAttrIndices.size})</span>
                                      </button>
                                </div>

                                {/* Attributes Table */}
                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-12 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
                                                        checked={formData.attributes.length > 0 && selectedAttrIndices.size === formData.attributes.length}
                                                        onChange={(e) => {
                                                           if (e.target.checked) setSelectedAttrIndices(new Set(formData.attributes.map((_, idx) => idx)));
                                                           else setSelectedAttrIndices(new Set());
                                                        }}
                                                    />
                                                </th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Value</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isAddingAttribute && (
                                                <motion.tr
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-primary-50/20 border-b border-primary-100/50 group"
                                                >
                                                    <td className="px-8 py-3">
                                                        <div className="w-4 h-4 rounded border-gray-200" />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Name"
                                                            value={newAttribute.name}
                                                            onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Value"
                                                            value={newAttribute.value}
                                                            onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    if (newAttribute.name && newAttribute.value) {
                                                                        setFormData({ ...formData, attributes: [newAttribute, ...formData.attributes] });
                                                                        setNewAttribute({ name: '', value: '' });
                                                                        setIsAddingAttribute(false);
                                                                    }
                                                                }}
                                                                className="p-1 text-[#6b2bd9] hover:bg-purple-100 rounded transition-colors"
                                                            >
                                                                <FiCheck size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setIsAddingAttribute(false);
                                                                    setNewAttribute({ name: '', value: '' });
                                                                }}
                                                                className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <FiPlus className="rotate-45" size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}

                                            {formData.attributes.length === 0 && !isAddingAttribute ? (
                                                <tr>
                                                    <td colSpan={4} className="py-24 text-center">
                                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                                            <FiSettings size={32} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">No Attributes Defined</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                formData.attributes.map((attr, idx) => (
                                                    <motion.tr
                                                        key={idx}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className={`${editingAttributeIndex === idx ? 'bg-primary-50/20' : 'hover:bg-gray-50/50'} border-b border-gray-50 transition-colors group`}
                                                    >
                                                        <td className="px-8 py-4 text-center">
                                                            <input 
                                                                type="checkbox" 
                                                                className="rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
                                                                checked={selectedAttrIndices.has(idx)}
                                                                onChange={() => {
                                                                    const next = new Set(selectedAttrIndices);
                                                                    if (next.has(idx)) next.delete(idx);
                                                                    else next.add(idx);
                                                                    setSelectedAttrIndices(next);
                                                                }}
                                                            />
                                                        </td>

                                                        {editingAttributeIndex === idx ? (
                                                            <>
                                                                <td className="px-6 py-4">
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        value={editAttributeData.name}
                                                                        onChange={(e) => setEditAttributeData({ ...editAttributeData, name: e.target.value })}
                                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <input
                                                                        type="text"
                                                                        value={editAttributeData.value}
                                                                        onChange={(e) => setEditAttributeData({ ...editAttributeData, value: e.target.value })}
                                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                if (editAttributeData.name && editAttributeData.value) {
                                                                                    const updated = [...formData.attributes];
                                                                                    updated[idx] = editAttributeData;
                                                                                    setFormData({ ...formData, attributes: updated });
                                                                                    setEditingAttributeIndex(null);
                                                                                }
                                                                            }}
                                                                            className="p-1.5 text-[#6b2bd9] hover:bg-purple-100 rounded-lg transition-colors"
                                                                        >
                                                                            <FiCheck size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingAttributeIndex(null)}
                                                                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                                                        >
                                                                            <FiArrowLeft size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="px-6 py-4">
                                                                    <span className="font-bold text-gray-700 text-sm tracking-tight">{attr.name}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-gray-500 text-sm font-medium">{attr.value}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingAttributeIndex(idx);
                                                                            setEditAttributeData(attr);
                                                                        }}
                                                                        className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95 shadow-sm"
                                                                    >
                                                                        <FiEdit3 size={12} />
                                                                    </button>
                                                                </td>
                                                            </>
                                                        )}
                                                    </motion.tr>
                                                )))}
                         
                         </tbody>
                                    </table>
                                </div>

                                {/* Footer Info */}
                                <div className="p-4 bg-gray-50/10 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        <span>Displaying items 0-0 of 0</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">25 per page</span>
                                        <FiSettings className="text-gray-200" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4"
                        >
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                                <FiSettings size={48} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No attributes found</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">This topic currently has no custom attributes defined</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Topics = () => {
    // UI State
    const [view, setView] = useState('list'); // 'list' or 'add'
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [editingTopic, setEditingTopic] = useState(null);

    // Filter States
    const [filters, setFilters] = useState({
        store: 'All',
        systemName: '',
        title: '',
        renderAsHtmlWidget: 'All',
        widgetZone: 'All'
    });

    // Mock Data
    const [topics, setTopics] = useState([]);

    // Filtering Logic
    const filteredTopics = useMemo(() => {
        return topics.filter(topic => {
            const matchesStore = filters.store === 'All' || topic.limitedToStores === filters.store;
            const matchesSystemName = !filters.systemName || topic.systemName.toLowerCase().includes(filters.systemName.toLowerCase());
            const matchesTitle = !filters.title || topic.title.toLowerCase().includes(filters.title.toLowerCase());
            const matchesWidget = filters.renderAsHtmlWidget === 'All' ||
                (filters.renderAsHtmlWidget === 'Yes' && topic.renderAsHtmlWidget) ||
                (filters.renderAsHtmlWidget === 'No' && !topic.renderAsHtmlWidget);
            const matchesZone = filters.widgetZone === 'All' || topic.widgetZone === filters.widgetZone;

            return matchesStore && matchesSystemName && matchesTitle && matchesWidget && matchesZone;
        });
    }, [topics, filters]);

    // Actions
    const handleSaveTopic = (data, continueEditing) => {
        if (editingTopic) {
            setTopics(topics.map(t => t.id === editingTopic.id ? { ...data, id: t.id, createdOn: t.createdOn } : t));
        } else {
            const newTopic = {
                ...data,
                id: Date.now().toString(),
                createdOn: new Date().toISOString().split('T')[0],
            };
            setTopics([newTopic, ...topics]);
        }

        if (!continueEditing) {
            setView('list');
            setEditingTopic(null);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Permanently delete this topic?')) {
            setTopics(topics.filter(t => t.id !== id));
            const newSelected = new Set(selectedIds);
            newSelected.delete(id);
            setSelectedIds(newSelected);
        }
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Delete ${selectedIds.size} selected topics?`)) {
            setTopics(topics.filter(t => !selectedIds.has(t.id)));
            setSelectedIds(new Set());
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(new Set(filteredTopics.map(t => t.id)));
        else setSelectedIds(new Set());
    };

    const handleSelectRow = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const columns = [
        {
            key: 'checkbox',
            label: (
                <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTopics.length && filteredTopics.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#7e3af2] focus:ring-[#7e3af2]"
                />
            ),
            sortable: false,
            render: (_, row) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#7e3af2] focus:ring-[#7e3af2]"
                />
            )
        },
        {
            key: 'systemName',
            label: 'System Name',
            render: (v) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#7e3af2] transition-colors shadow-sm">
                        <FiCode size={12} />
                    </div>
                    <span className="font-bold text-gray-800 tracking-tight">{v}</span>
                </div>
            )
        },
        {
            key: 'title',
            label: 'Title',
            render: (v) => (
                <div className="flex items-center gap-2">
                    <FiFileText size={12} className="text-gray-300" />
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{v}</span>
                </div>
            )
        },
        {
            key: 'createdOn',
            label: 'Created on',
            render: (v) => (
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <FiCalendar size={10} />
                    {v}
                </div>
            )
        },
        {
            key: 'stores',
            label: 'Limited to stores',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <FiGlobe size={12} className="text-gray-300" />
                    <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 rounded px-2.5 py-1 uppercase tracking-widest">
                        {row.limitedToStores}
                    </span>
                </div>
            )
        },
        {
            key: 'roles',
            label: 'Limited to customer roles',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <FiUsers size={12} className="text-gray-300" />
                    <span className="text-[10px] font-black text-[#7e3af2] bg-primary-50/50 border border-primary-50 rounded px-2.5 py-1 uppercase tracking-widest">
                        {row.limitedToRoles}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Action',
            render: (_, row) => (
                <div className="flex items-center gap-2 justify-start pl-2">
                    <button
                        onClick={() => {
                            setEditingTopic(row);
                            setView('add');
                        }}
                        className="p-1.5 bg-primary-50 text-[#7e3af2] rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
                    >
                        <FiEdit3 size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    if (view === 'add') {
        return (
            <TopicForm
                onBack={() => {
                    setView('list');
                    setEditingTopic(null);
                }}
                onSave={handleSaveTopic}
                initialData={editingTopic}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-20"
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
                {/* Action Bar */}
                <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
                            <div className="p-2 bg-primary-50 text-[#7e3af2] rounded-lg shadow-sm">
                                <FiLayout />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-gray-600 tracking-tight">Topics</h1>
                            </div>
                        </div>

                        <button
                            className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
                            onClick={() => setView('add')}
                        >
                            <FiPlus size={18} />
                            <span>Add New</span>
                        </button>

                        <AnimatePresence>
                            {selectedIds.size > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={handleDeleteSelected}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
                                >
                                    <FiTrash2 size={14} />
                                    <span>Delete Selected ({selectedIds.size})</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => {
                            setShowFilters(!showFilters);
                            if (showFilters) {
                                setFilters({ store: 'All', systemName: '', title: '', renderAsHtmlWidget: 'All', widgetZone: 'All' });
                            }
                        }}
                        className={`px-8 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border active:scale-95 shadow-lg ${showFilters
                                ? 'bg-[#6b2bd9] border-[#6b2bd9] text-white shadow-purple-100'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FiFilter className={showFilters ? 'text-white' : 'text-gray-400'} />
                        <span>Filter</span>
                    </button>
                </div>

                {/* Filter Overlay */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b border-gray-100 bg-gray-50/50"
                        >
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Limited to Store</label>
                                    <select
                                        value={filters.store}
                                        onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#7e3af2]/20 focus:border-[#7e3af2] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Stores</option>
                                        <option value="Main Store">Main Store</option>
                                        <option value="Secondary Store">Secondary Store</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">System Name</label>
                                    <input
                                        type="text"
                                        placeholder="Search by system name..."
                                        value={filters.systemName}
                                        onChange={(e) => setFilters({ ...filters, systemName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#7e3af2]/20 focus:border-[#7e3af2] outline-none transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Search by title..."
                                        value={filters.title}
                                        onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#7e3af2]/20 focus:border-[#7e3af2] outline-none transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Render as HTML Widget</label>
                                    <select
                                        value={filters.renderAsHtmlWidget}
                                        onChange={(e) => setFilters({ ...filters, renderAsHtmlWidget: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#7e3af2]/20 focus:border-[#7e3af2] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="All">All</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Widget Zone</label>
                                    <select
                                        value={filters.widgetZone}
                                        onChange={(e) => setFilters({ ...filters, widgetZone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#7e3af2]/20 focus:border-[#7e3af2] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Zones</option>
                                        <option value="Home Page">Home Page</option>
                                        <option value="Footer">Footer</option>
                                        <option value="None">None</option>
                                    </select>
                                </div>

                                <div className="flex items-end pb-1 gap-2">
                                    <button
                                        onClick={() => setFilters({ store: 'All', systemName: '', title: '', renderAsHtmlWidget: 'All', widgetZone: 'All' })}
                                        className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#7e3af2] transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table View */}
                <div className="p-0 overflow-x-auto min-h-[400px]">
                    <DataTable
                        data={filteredTopics}
                        columns={columns}
                        pagination={true}
                        itemsPerPage={10}
                        className="border-none shadow-none rounded-none"
                    />

                    {filteredTopics.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                                <FiFileText size={48} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No topics found</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust filters or create a new content topic</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Topics;
