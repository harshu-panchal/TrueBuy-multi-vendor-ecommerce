import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiEye, FiSearch } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import Badge from "../../../../shared/components/Badge";
import AnimatedSelect from "../../components/AnimatedSelect";
import { assignDeliveryBoy, getAllDeliveryBoys, getAllSubOrders } from "../../services/adminService";
import { formatCurrency } from "../../utils/adminHelpers";
import RoutePreviewMap from "../../components/Map/RoutePreviewMap";

const ASSIGNABLE_STATUSES = ["pending", "processing", "shipped"];

const AssignDelivery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState(searchParams.get("search") || "");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const itemsPerPage = 20;

  const formatAddress = (addr) => {
    if (!addr) return "";
    return [addr.address || addr.street, addr.city, addr.state, addr.zipCode, addr.country]
      .filter(Boolean)
      .join(", ");
  };

  const selectedBoy = useMemo(() => {
    if (!selectedDeliveryBoyId) return null;
    return deliveryBoys.find(b => String(b._id || b.id) === selectedDeliveryBoyId);
  }, [selectedDeliveryBoyId, deliveryBoys]);

  const mapData = useMemo(() => {
    if (!selectedOrder || !selectedBoy) return null;
    
    // Delivery Boy location (fallback to false if not available)
    const origin = selectedBoy.currentLocation?.lat && selectedBoy.currentLocation?.lng 
      ? selectedBoy.currentLocation 
      : null;
      
    // Vendor address (origin of shipment)
    const firstVendorAddr = selectedOrder.vendorId?.address || selectedOrder.vendorId?.vendorProfile?.storeAddress;
    const waypoint = formatAddress(firstVendorAddr);
    
    // Customer shipping address
    const destination = formatAddress(selectedOrder.dropoffAddress || selectedOrder.parentOrderId?.shippingAddress);
    
    return { origin, waypoint, destination };
  }, [selectedOrder, selectedBoy]);

  const fetchAllActiveDeliveryBoys = async () => {
    const first = await getAllDeliveryBoys({
      page: 1,
      limit: 100,
      status: "active",
      applicationStatus: "approved",
      availableOnly: true,
    });
    const firstRows = first?.data?.deliveryBoys || [];
    const totalPages = Number(first?.data?.pagination?.pages || 1);
    if (totalPages <= 1) return firstRows;

    const requests = [];
    for (let page = 2; page <= totalPages; page += 1) {
      requests.push(
        getAllDeliveryBoys({
          page,
          limit: 100,
          status: "active",
          applicationStatus: "approved",
          availableOnly: true,
        })
      );
    }
    const results = await Promise.all(requests);
    return firstRows.concat(results.flatMap((res) => res?.data?.deliveryBoys || []));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orderParams = {
        page: currentPage,
        limit: itemsPerPage,
        assignableOnly: true,
      };
      if (statusFilter !== "all") {
        orderParams.status = statusFilter;
      } else {
        orderParams.onlyUnassigned = true;
      }
      if (searchFilter) {
        orderParams.search = searchFilter;
      }

      const [ordersRes, boyRows] = await Promise.all([
        getAllSubOrders(orderParams),
        fetchAllActiveDeliveryBoys(),
      ]);

      const orderRows = ordersRes?.data?.subOrders || ordersRes?.data?.orders || [];

      setOrders(orderRows);
      setPagination({
        total: Number(ordersRes?.data?.total || 0),
        page: Number(ordersRes?.data?.page || 1),
        limit: itemsPerPage,
        pages: Number(ordersRes?.data?.pages || 1),
      });
      setDeliveryBoys(boyRows);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleSearchChange = (e) => {
    setSearchFilter(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchFilter) {
      setSearchParams({ search: searchFilter });
    } else {
      setSearchParams({});
    }
  };

  const assignableOrders = useMemo(() => {
    return orders.filter((order) =>
      ASSIGNABLE_STATUSES.includes(String(order.status || "").toLowerCase())
    );
  }, [orders]);

  const handleOpenAssign = (order) => {
    setSelectedOrder(order);
    setSelectedDeliveryBoyId(String(order?.deliveryBoyId?._id || order?.deliveryBoyId || ""));
  };

  const handleAssign = async () => {
    if (!selectedOrder || !selectedDeliveryBoyId) return;
    setIsAssigning(true);
    try {
      await assignDeliveryBoy(selectedOrder.subOrderId || selectedOrder._id, selectedDeliveryBoyId);
      setSelectedOrder(null);
      setSelectedDeliveryBoyId("");
      await fetchData();
    } finally {
      setIsAssigning(false);
    }
  };

  const columns = [
    {
      key: "subOrderId",
      label: "Order",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-800">{value || row.orderId || row._id}</p>
          <p className="text-xs text-gray-500">{row?.dropoffAddress?.name || row?.parentOrderId?.shippingAddress?.name || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => <Badge variant={value}>{String(value || "pending").toUpperCase()}</Badge>,
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      render: (value) => <span className="font-semibold text-gray-800">{formatCurrency(value || 0)}</span>,
    },
    {
      key: "deliveryBoyId",
      label: "Assigned To",
      sortable: false,
      render: (value) => {
        const name = value?.name || "Unassigned";
        const phone = value?.phone || "";
        return (
          <div>
            <p className="font-medium text-gray-800">{name}</p>
            {phone ? <p className="text-xs text-gray-500">{phone}</p> : null}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/orders/${row.parentOrderId?.orderId || row.orderId || row._id}`);
            }}
            className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenAssign(row)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            {row.deliveryBoyId ? "Reassign" : "Assign"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Assign Delivery</h1>
        <p className="text-sm sm:text-base text-gray-600">Assign or reassign orders to delivery partners</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
          <div className="w-full sm:w-auto min-w-[200px]">
            <AnimatedSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Unassigned (All status)" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
              ]}
            />
          </div>
          
          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={searchFilter}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold whitespace-nowrap"
            >
              Search
            </button>
          </div>

          <div className="flex w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setSearchFilter("");
                setSearchParams({});
                fetchData();
              }}
              className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading assignment data...</p>
          </div>
        ) : (
          <>
            <DataTable data={assignableOrders} columns={columns} pagination={false} />
            <Pagination
              currentPage={pagination.page || currentPage}
              totalPages={pagination.pages || 1}
              totalItems={pagination.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[10000]"
              onClick={() => {
                if (isAssigning) return;
                setSelectedOrder(null);
                setSelectedDeliveryBoyId("");
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-5 pointer-events-auto max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {selectedOrder?.deliveryBoyId ? "Reassign Delivery" : "Assign Delivery"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a delivery partner for order{" "}
                  <span className="font-semibold text-gray-800">{selectedOrder?.subOrderId || selectedOrder?.orderId || selectedOrder?._id}</span>.
                </p>
                <AnimatedSelect
                  name="deliveryBoyId"
                  value={selectedDeliveryBoyId}
                  onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
                  options={[
                    { value: "", label: "Select Delivery Boy" },
                    ...deliveryBoys.map((boy) => ({
                      value: String(boy.id || boy._id),
                      label: `${boy.name} (${boy.phone || "N/A"})`,
                    })),
                  ]}
                />
                
                {mapData && mapData.origin && mapData.waypoint && mapData.destination && (
                  <div className="mt-4 mb-2">
                    <RoutePreviewMap 
                      origin={mapData.origin}
                      waypoint={mapData.waypoint}
                      destination={mapData.destination}
                    />
                  </div>
                )}
                
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(null);
                      setSelectedDeliveryBoyId("");
                    }}
                    disabled={isAssigning}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={isAssigning || !selectedDeliveryBoyId}
                    className="px-4 py-2 rounded-lg gradient-green text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? "Assigning..." : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssignDelivery;
