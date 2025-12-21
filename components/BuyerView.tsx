import React, { useState, useEffect } from 'react';
import { User, Product, Order, OrderStatus } from '../types';
import { getProducts, updateProductQuantity, saveOrder, getOrdersForBuyer, generateId, cancelOrder } from '../services/storage';

interface Props {
  user: User;
}

const BuyerView: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  
  // Order Form State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  
  // Cancel Confirmation State
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, [user.id, activeTab]);

  const refreshData = () => {
    // Only show products with quantity > 0
    setProducts(getProducts().filter(p => p.quantity > 0));
    setMyOrders(getOrdersForBuyer(user.id).reverse()); // Newest first
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    // Safety check
    if (orderQty > selectedProduct.quantity) {
      alert("Quantity requested exceeds available stock.");
      return;
    }

    const success = updateProductQuantity(selectedProduct.id, orderQty);
    if (success) {
      const newOrder: Order = {
        id: generateId(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sellerId: selectedProduct.sellerId,
        buyerId: user.id,
        buyerName: user.name,
        quantity: orderQty,
        status: 'Awaiting Confirmation',
        dateOrdered: new Date().toISOString().split('T')[0]
      };
      
      saveOrder(newOrder);
      setSelectedProduct(null);
      setOrderQty(1);
      setActiveTab('orders'); // Switch to orders tab to show status
      refreshData();
    } else {
      alert("Failed to place order. Stock might have changed.");
    }
  };

  const handleConfirmDelivery = (order: Order) => {
    const updatedOrder: Order = {
      ...order,
      status: 'Delivered',
      dateDelivered: new Date().toISOString().split('T')[0]
    };
    saveOrder(updatedOrder);
    refreshData();
  };

  const performCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    setConfirmCancelId(null);
    refreshData();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Awaiting Confirmation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 w-fit mx-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'browse' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Browse Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'orders' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          My Orders
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              No products available in the marketplace right now.
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-100">In Stock</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Sold by {product.sellerName}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-slate-900">{product.quantity}</span>
                    <span className="text-sm text-slate-500">units available</span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() => { setSelectedProduct(product); setOrderQty(1); }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              You haven't placed any orders yet.
            </div>
          ) : (
            myOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                       {order.status}
                     </span>
                     <span className="text-xs text-slate-400">{order.dateOrdered}</span>
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 mb-1">{order.productName}</h3>
                   <p className="text-sm text-slate-600">Quantity: <strong>{order.quantity}</strong></p>
                 </div>
                 
                 {/* Status Flow Visualization */}
                 <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center w-full max-w-xs">
                       {/* Step 1 */}
                       <div className={`w-3 h-3 rounded-full ${['Awaiting Confirmation', 'Confirmed', 'Delivered'].includes(order.status) ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                       <div className={`flex-1 h-1 ${['Confirmed', 'Delivered'].includes(order.status) ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                       {/* Step 2 */}
                       <div className={`w-3 h-3 rounded-full ${['Confirmed', 'Delivered'].includes(order.status) ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                       <div className={`flex-1 h-1 ${['Delivered'].includes(order.status) ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                       {/* Step 3 */}
                       <div className={`w-3 h-3 rounded-full ${['Delivered'].includes(order.status) ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                    </div>
                 </div>

                 <div className="md:w-48 text-right flex justify-end">
                    {order.status === 'Confirmed' ? (
                      <button 
                        onClick={() => handleConfirmDelivery(order)}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                      >
                        Confirm Delivery
                      </button>
                    ) : order.status === 'Delivered' ? (
                      <div className="text-green-600 font-medium text-sm flex items-center justify-end gap-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Order Complete
                      </div>
                    ) : (
                      confirmCancelId === order.id ? (
                        <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-right-2">
                           <span className="text-xs text-red-600 text-center font-medium">Are you sure?</span>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setConfirmCancelId(null)}
                                className="flex-1 py-2 px-3 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                No
                              </button>
                              <button 
                                onClick={() => performCancelOrder(order.id)}
                                className="flex-1 py-2 px-3 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors"
                              >
                                Yes
                              </button>
                           </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmCancelId(order.id)}
                          className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium rounded-lg shadow-sm border border-red-200 transition-colors text-sm"
                        >
                          Cancel Order
                        </button>
                      )
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
               <h3 className="font-bold text-slate-800">Place Order</h3>
             </div>
             <form onSubmit={handleOrderSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-500 mb-1">Product</label>
                  <p className="font-bold text-lg text-slate-800">{selectedProduct.name}</p>
                </div>
                <div className="mb-6">
                   <label className="block text-sm font-medium text-slate-500 mb-1">Quantity (Max: {selectedProduct.quantity})</label>
                   <div className="flex items-center border border-slate-700 bg-slate-800 rounded-lg overflow-hidden">
                      <button 
                        type="button"
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border-r border-slate-600 text-slate-300"
                        onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        className="flex-1 text-center py-2 outline-none bg-slate-800 text-white"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Math.min(selectedProduct.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                      />
                      <button 
                        type="button"
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border-l border-slate-600 text-slate-300"
                        onClick={() => setOrderQty(Math.min(selectedProduct.quantity, orderQty + 1))}
                      >
                        +
                      </button>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button 
                     type="button"
                     onClick={() => setSelectedProduct(null)}
                     className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm"
                   >
                     Confirm
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerView;