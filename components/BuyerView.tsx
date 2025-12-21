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
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, [user.id, activeTab]);

  const refreshData = () => {
    setProducts(getProducts().filter(p => p.quantity > 0));
    setMyOrders(getOrdersForBuyer(user.id).reverse());
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    if (orderQty > selectedProduct.quantity) {
      alert("Exceeds available limited edition stock.");
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
      setActiveTab('orders');
      refreshData();
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

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Navigation Pills */}
      <div className="flex justify-center mb-12">
        <div className="bg-neutral-900/80 backdrop-blur border border-white/10 p-1 rounded-full inline-flex">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'browse' 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Collection
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'orders' 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            My Acquisitions
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-neutral-600 bg-neutral-900/20 border border-white/5 rounded-3xl">
              <h3 className="font-display text-xl mb-2">Collection Sold Out</h3>
              <p className="text-sm">Please check back for future drops.</p>
            </div>
          ) : (
            products.map((product, idx) => (
              <div 
                key={product.id} 
                className="group relative bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Abstract Product Representation since no images */}
                <div className="h-48 bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <h1 className="text-6xl font-display font-bold text-white/5 select-none scale-150 group-hover:scale-110 transition-transform duration-700">LALLAN</h1>
                   <div className="absolute bottom-4 right-4">
                      <span className="bg-white/10 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">IN STOCK</span>
                   </div>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Seller: {product.sellerName}</p>
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-neutral-200 transition-colors">{product.name}</h3>
                  </div>
                  
                  <div className="flex items-end justify-between border-t border-white/5 pt-6">
                    <div>
                      <span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Available Units</span>
                      <span className="text-xl font-mono text-white">{product.quantity}</span>
                    </div>
                    
                    <button
                      onClick={() => { setSelectedProduct(product); setOrderQty(1); }}
                      className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors"
                    >
                      Acquire
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.length === 0 ? (
             <div className="py-20 text-center text-neutral-600 bg-neutral-900/20 border border-white/5 rounded-3xl">
              <h3 className="font-display text-xl mb-2">No Acquisitions Yet</h3>
              <p className="text-sm">Explore our collection to start your journey.</p>
            </div>
          ) : (
            myOrders.map(order => (
              <div key={order.id} className="bg-neutral-900/40 backdrop-blur border border-white/5 rounded-3xl p-8 hover:bg-neutral-900/60 transition-colors group">
                 <div className="flex flex-col md:flex-row gap-8 items-center">
                    
                    {/* Order Info */}
                    <div className="flex-1 w-full">
                       <div className="flex items-center gap-3 mb-3">
                         <span className="text-xs font-mono text-neutral-500">{order.dateOrdered}</span>
                         <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                         <span className="text-xs text-neutral-400 uppercase tracking-wider">ID: {order.id.substring(0,8)}</span>
                       </div>
                       <h3 className="text-2xl font-display font-bold text-white mb-2">{order.productName}</h3>
                       <p className="text-neutral-400 text-sm">Quantity: <span className="text-white font-mono">{order.quantity}</span></p>
                    </div>
                    
                    {/* Minimal Timeline */}
                    <div className="flex-1 w-full flex items-center justify-center">
                       <div className="relative w-full max-w-sm flex items-center justify-between">
                          {/* Line */}
                          <div className="absolute top-1/2 left-0 w-full h-px bg-neutral-800 -z-10"></div>
                          
                          {/* Step 1 */}
                          <div className="flex flex-col items-center gap-2 bg-neutral-900 px-2">
                             <div className={`w-3 h-3 rounded-full border-2 ${['Awaiting Confirmation', 'Confirmed', 'Delivered'].includes(order.status) ? 'border-white bg-white' : 'border-neutral-700 bg-neutral-900'}`}></div>
                             <span className="text-[10px] uppercase tracking-wider text-neutral-500">Ordered</span>
                          </div>
                          {/* Step 2 */}
                          <div className="flex flex-col items-center gap-2 bg-neutral-900 px-2">
                             <div className={`w-3 h-3 rounded-full border-2 ${['Confirmed', 'Delivered'].includes(order.status) ? 'border-white bg-white' : 'border-neutral-700 bg-neutral-900'}`}></div>
                             <span className="text-[10px] uppercase tracking-wider text-neutral-500">Confirmed</span>
                          </div>
                          {/* Step 3 */}
                          <div className="flex flex-col items-center gap-2 bg-neutral-900 px-2">
                             <div className={`w-3 h-3 rounded-full border-2 ${['Delivered'].includes(order.status) ? 'border-white bg-white' : 'border-neutral-700 bg-neutral-900'}`}></div>
                             <span className="text-[10px] uppercase tracking-wider text-neutral-500">Delivered</span>
                          </div>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="md:w-48 text-right flex justify-end">
                       {order.status === 'Confirmed' ? (
                          <button 
                            onClick={() => handleConfirmDelivery(order)}
                            className="px-5 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-neutral-200 transition-colors"
                          >
                            Mark Received
                          </button>
                        ) : order.status === 'Delivered' ? (
                          <div className="px-4 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                            Complete
                          </div>
                        ) : (
                          confirmCancelId === order.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                               <button onClick={() => setConfirmCancelId(null)} className="text-xs text-neutral-400 hover:text-white px-2">Back</button>
                               <button 
                                onClick={() => performCancelOrder(order.id)}
                                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-500"
                               >
                                Confirm
                               </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmCancelId(order.id)}
                              className="px-5 py-2 border border-white/20 text-neutral-400 hover:text-white hover:border-white text-xs font-bold rounded-full transition-colors"
                            >
                              Cancel
                            </button>
                          )
                        )}
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* High-End Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
             
             <div className="p-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6 text-center">Confirm Acquisition</h3>
                
                <div className="text-center mb-8">
                   <h2 className="text-2xl font-display font-bold text-white mb-2">{selectedProduct.name}</h2>
                   <p className="text-sm text-neutral-400">Available Stock: {selectedProduct.quantity}</p>
                </div>

                <form onSubmit={handleOrderSubmit}>
                   <div className="flex items-center justify-center gap-4 mb-8">
                      <button 
                        type="button"
                        className="w-10 h-10 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-colors"
                        onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        className="w-16 text-center bg-transparent text-2xl font-mono text-white focus:outline-none"
                        value={orderQty}
                        readOnly
                      />
                      <button 
                        type="button"
                        className="w-10 h-10 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-colors"
                        onClick={() => setOrderQty(Math.min(selectedProduct.quantity, orderQty + 1))}
                      >
                        +
                      </button>
                   </div>
                   
                   <div className="space-y-3">
                      <button 
                        type="submit"
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                      >
                        Complete Order
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="w-full py-3 text-neutral-500 hover:text-white transition-colors text-sm"
                      >
                        Cancel
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerView;