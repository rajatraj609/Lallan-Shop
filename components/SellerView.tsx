import React, { useState, useEffect } from 'react';
import { User, Product, Order } from '../types';
import { getProductsForSeller, getOrdersForSeller, saveOrder } from '../services/storage';

interface Props {
  user: User;
}

const SellerView: React.FC<Props> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    refreshData();
  }, [user.id]);

  const refreshData = () => {
    setProducts(getProductsForSeller(user.id));
    setOrders(getOrdersForSeller(user.id));
  };

  const handleConfirmOrder = (order: Order) => {
    const updatedOrder: Order = {
      ...order,
      status: 'Confirmed',
      dateConfirmed: new Date().toISOString().split('T')[0]
    };
    saveOrder(updatedOrder);
    refreshData();
  };

  const pendingOrders = orders.filter(o => o.status === 'Awaiting Confirmation');
  const pastOrders = orders.filter(o => o.status !== 'Awaiting Confirmation');

  return (
    <div className="space-y-8">
      {/* Alert Section for Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-yellow-100 border-b border-yellow-200 flex items-center gap-3">
             <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white animate-pulse">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
             </div>
             <div>
               <h3 className="text-lg font-bold text-yellow-900">Action Required</h3>
               <p className="text-sm text-yellow-800">You have {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''} to confirm.</p>
             </div>
          </div>
          <div className="divide-y divide-yellow-100">
            {pendingOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-yellow-50/50 transition-colors">
                 <div>
                    <h4 className="font-bold text-slate-800">{order.productName}</h4>
                    <p className="text-sm text-slate-600">Qty: <strong>{order.quantity}</strong> • Buyer: {order.buyerName}</p>
                    <p className="text-xs text-slate-400">{order.dateOrdered}</p>
                 </div>
                 <button 
                   onClick={() => handleConfirmOrder(order)}
                   className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm shadow-yellow-200 transition-colors flex items-center gap-2"
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Order
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Inventory & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Inventory */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Current Inventory</h2>
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-indigo-100">
                {products.reduce((acc, curr) => acc + curr.quantity, 0)} Items
              </span>
           </div>
           
           {products.length === 0 ? (
             <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">No stock available.</div>
           ) : (
             <div className="space-y-3">
               {products.map(p => (
                 <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                       <h4 className="font-bold text-slate-800">{p.name}</h4>
                       <p className="text-xs text-slate-500">Received: {p.dateSentToSeller}</p>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-bold text-indigo-600">{p.quantity}</span>
                       <span className="text-xs text-slate-400 uppercase tracking-wide">Available</span>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Order History */}
        <div>
           <h2 className="text-xl font-bold text-slate-800 mb-4">Order History</h2>
           {pastOrders.length === 0 ? (
             <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">No past orders.</div>
           ) : (
             <div className="space-y-3">
               {pastOrders.map(order => (
                 <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-slate-800">{order.productName}</h4>
                       <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                         order.status === 'Delivered' 
                           ? 'bg-green-50 text-green-700 border-green-200' 
                           : 'bg-blue-50 text-blue-700 border-blue-200'
                       }`}>
                         {order.status}
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                       <div>
                         <span className="text-slate-400 text-xs">Buyer</span>
                         <p className="font-medium text-slate-700">{order.buyerName}</p>
                       </div>
                       <div className="text-right">
                         <span className="text-slate-400 text-xs">Quantity</span>
                         <p className="font-medium text-slate-700">{order.quantity}</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default SellerView;