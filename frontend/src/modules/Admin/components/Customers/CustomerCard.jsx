import { FiMail, FiPhone, FiShoppingBag, FiDollarSign, FiEye } from 'react-icons/fi';
import Badge from '../../../../shared/components/Badge';
import { formatCurrency } from '../../utils/adminHelpers';
import { useCustomerStore } from '../../../../shared/store/customerStore';

const CustomerCard = ({ customer, onView }) => {
  const { toggleCustomerStatus, isLoading } = useCustomerStore();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1 truncate" title={customer.name}>
            {customer.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FiMail className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiPhone className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCustomerStatus(customer.id);
          }}
          disabled={isLoading}
          title={`Click to ${customer.status === 'active' ? 'block' : 'activate'} customer`}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm border ${customer.status === 'active'
            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600'
            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md active:scale-95'}`}
        >
          {customer.status}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FiShoppingBag className="text-sm" />
            <span className="text-xs">Orders</span>
          </div>
          <p className="font-bold text-gray-800">{customer.orders || 0}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FiDollarSign className="text-sm" />
            <span className="text-xs">Total Spent</span>
          </div>
          <p className="font-bold text-gray-800">
            {formatCurrency(customer.totalSpent || 0)}
          </p>
        </div>
      </div>

      <button
        onClick={() => onView(customer)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
      >
        <FiEye />
        View Details
      </button>
    </div>
  );
};

export default CustomerCard;

