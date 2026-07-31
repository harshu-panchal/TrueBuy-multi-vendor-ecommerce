import { useState, useEffect } from "react";
import { FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../../../shared/store/settingsStore";
import toast from "react-hot-toast";

const FooterSettings = () => {
  const { settings, updateSettings, initialize } = useSettingsStore();
  const [columns, setColumns] = useState([]);
  const [bottomInfo, setBottomInfo] = useState({
    country: "English",
    currency: "INR - Indian Rupee",
    countryFlag: "United States", 
    logoText: "amazon"
  });

  useEffect(() => {
    initialize();
    if (settings && settings.footer_config) {
      if (settings.footer_config.columns) {
        setColumns(settings.footer_config.columns);
      }
      if (settings.footer_config.bottomInfo) {
        setBottomInfo(settings.footer_config.bottomInfo);
      }
    }
  }, []);

  useEffect(() => {
    if (settings && settings.footer_config) {
      if (settings.footer_config.columns) {
        setColumns(settings.footer_config.columns);
      }
      if (settings.footer_config.bottomInfo) {
        setBottomInfo(settings.footer_config.bottomInfo);
      }
    }
  }, [settings]);

  const handleAddColumn = () => {
    setColumns([...columns, { id: Date.now().toString(), title: "New Column", links: [] }]);
  };

  const handleRemoveColumn = (colId) => {
    setColumns(columns.filter(col => col.id !== colId));
  };

  const handleColumnTitleChange = (colId, newTitle) => {
    setColumns(columns.map(col => col.id === colId ? { ...col, title: newTitle } : col));
  };

  const handleAddLink = (colId) => {
    setColumns(columns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          links: [...col.links, { id: Date.now().toString(), label: "New Link", url: "/" }]
        };
      }
      return col;
    }));
  };

  const handleRemoveLink = (colId, linkId) => {
    setColumns(columns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          links: col.links.filter(link => link.id !== linkId)
        };
      }
      return col;
    }));
  };

  const handleLinkChange = (colId, linkId, field, value) => {
    setColumns(columns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          links: col.links.map(link => link.id === linkId ? { ...link, [field]: value } : link)
        };
      }
      return col;
    }));
  };

  const handleBottomInfoChange = (e) => {
    setBottomInfo({ ...bottomInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings("footer_config", {
      columns,
      bottomInfo
    });
    toast.success("Footer settings saved successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-full overflow-x-hidden">
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Footer Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Configure dynamic footer content and links
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-8">
        
        {/* Columns Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Footer Columns</h3>
            <button
              type="button"
              onClick={handleAddColumn}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-semibold"
            >
              <FiPlus /> Add Column
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {columns.map(col => (
              <div key={col.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => handleColumnTitleChange(col.id, e.target.value)}
                    className="font-semibold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-2/3 focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(col.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  {col.links.map(link => (
                    <div key={link.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        placeholder="Label"
                        onChange={(e) => handleLinkChange(col.id, link.id, 'label', e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-500"
                      />
                      <input
                        type="text"
                        value={link.url}
                        placeholder="URL"
                        onChange={(e) => handleLinkChange(col.id, link.id, 'url', e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(col.id, link.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLink(col.id)}
                  className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <FiPlus size={14} /> Add Link
                </button>
              </div>
            ))}
            {columns.length === 0 && (
              <p className="text-sm text-gray-500 col-span-full">No columns added yet. Click "Add Column" to start building your footer.</p>
            )}
          </div>
        </div>

        {/* Bottom Bar Info */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bottom Bar Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Text</label>
              <input
                type="text"
                name="logoText"
                value={bottomInfo.logoText || ''}
                onChange={handleBottomInfoChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Language Setting Text</label>
              <input
                type="text"
                name="country"
                value={bottomInfo.country || ''}
                onChange={handleBottomInfoChange}
                placeholder="e.g. English"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Setting Text</label>
              <input
                type="text"
                name="currency"
                value={bottomInfo.currency || ''}
                onChange={handleBottomInfoChange}
                placeholder="e.g. INR - Indian Rupee"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Region Text</label>
              <input
                type="text"
                name="countryFlag"
                value={bottomInfo.countryFlag || ''}
                onChange={handleBottomInfoChange}
                placeholder="e.g. United States"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
          >
            <FiSave /> Save Settings
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FooterSettings;
