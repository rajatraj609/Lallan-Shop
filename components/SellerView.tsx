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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Alert Section */}
      {pendingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/20 to-neutral-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <div className="px-8 py-6 border-b border-amber-500/10 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Pending Approvals</h3>
                  <p className="text-amber-200/60 text-sm">Require immediate attention ({pendingOrders.length})</p>
                </div>
             </div>
          </div>
          <div className="divide-y divide-white/5">
            {pendingOrders.map(order => (
              <div key={order.id} className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <div>
                        <h4 className="font-medium text-white text-lg">{order.productName}</h4>
                        <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
                            <span>Qty: <span className="text-white">{order.quantity}</span></span>
                            <span>•</span>
                            <span>Client: {order.buyerName}</span>
                        </div>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleConfirmOrder(order)}
                   className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors"
                 >
                    Confirm Order
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Inventory Column */}
        <div className="bg-neutral-900/40 backdrop-blur border border-white/5 rounded-3xl p-8 flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-white">Inventory</h2>
              <span className="bg-neutral-800 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-neutral-300">
                {products.reduce((acc, curr) => acc + curr.quantity, 0)} Items
              </span>
           </div>
           
           {products.length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm border border-dashed border-white/5 rounded-2xl p-8">No stock available.</div>
           ) : (
             <div className="space-y-3">
               {products.map(p => (
                 <div key={p.id} className="group bg-neutral-950 border border-white/5 p-5 rounded-2xl flex justify-between items-center hover:border-white/20 transition-all">
                    <div>
                       <h4 className="font-medium text-white mb-1 group-hover:text-neutral-200">{p.name}</h4>
                       <p className="text-xs text-neutral-500 font-mono">IN: {p.dateSentToSeller}</p>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-display font-bold text-white">{p.quantity}</span>
                       <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Available</span>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Sales History Column */}
        <div className="bg-neutral-900/40 backdrop-blur border border-white/5 rounded-3xl p-8 flex flex-col h-full">
           <h2 className="text-2xl font-display font-bold text-white mb-8">Sales Ledger</h2>
           {pastOrders.length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm border border-dashed border-white/5 rounded-2xl p-8">No transaction history.</div>
           ) : (
             <div className="space-y-3">
               {pastOrders.map(order => (
                 <div key={order.id} className="relative overflow-hidden bg-neutral-950 border border-white/5 p-5 rounded-2xl group">
                    <div className="flex justify-between items-start mb-3 relative z-10">
                       <h4 className="font-medium text-white">{order.productName}</h4>
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                         order.status === 'Delivered' 
                           ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                           : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                       }`}>
                         {order.status}
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                       <div>
                         <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Client</span>
                         <p className="text-neutral-300">{order.buyerName}</p>
                       </div>
                       <div className="text-right">
                         <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Volume</span>
                         <p className="text-white font-mono">{order.quantity}</p>
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