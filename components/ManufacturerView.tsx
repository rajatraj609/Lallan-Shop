import React, { useState, useEffect } from 'react';
import { User, Product, UserRole } from '../types';
import { getUsersByRole, saveProduct, getProductsForManufacturer, generateId } from '../services/storage';

interface Props {
  user: User;
}

const ManufacturerView: React.FC<Props> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    quantity: 10,
    manufacturingDate: new Date().toISOString().split('T')[0],
    dateSentToSeller: new Date().toISOString().split('T')[0],
    sellerId: '',
  });

  useEffect(() => {
    refreshData();
  }, [user.id]);

  const refreshData = () => {
    setProducts(getProductsForManufacturer(user.id));
    setSellers(getUsersByRole(UserRole.SELLER));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sellerId) return;

    const selectedSeller = sellers.find(s => s.id === formData.sellerId);

    const newProduct: Product = {
      id: generateId(),
      name: formData.name,
      serialNumber: formData.serialNumber,
      quantity: Number(formData.quantity),
      manufacturingDate: formData.manufacturingDate,
      manufacturerId: user.id,
      sellerId: formData.sellerId,
      sellerName: selectedSeller?.name || 'Unknown',
      dateSentToSeller: formData.dateSentToSeller
    };

    saveProduct(newProduct);
    setFormData({
      name: '',
      serialNumber: '',
      quantity: 10,
      manufacturingDate: new Date().toISOString().split('T')[0],
      dateSentToSeller: new Date().toISOString().split('T')[0],
      sellerId: ''
    });
    refreshData();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Creation Panel - Bento Item 1 */}
      <div className="lg:col-span-4 bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 h-fit sticky top-24">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-white mb-2">Production Line</h2>
          <p className="text-neutral-500 text-sm">Register new inventory units and assign to authorized retailers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium ml-1">Product Identity</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 focus:ring-0 outline-none transition"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Noir Chronograph"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium ml-1">Batch / Serial ID</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 focus:ring-0 outline-none transition font-mono text-sm"
              value={formData.serialNumber}
              onChange={e => setFormData({...formData, serialNumber: e.target.value})}
              placeholder="SN-2024-X01"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium ml-1">Quantity</label>
               <input
                 type="number"
                 min="1"
                 required
                 className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 focus:ring-0 outline-none transition"
                 value={formData.quantity}
                 onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium ml-1">Mfg Date</label>
               <input
                 type="date"
                 required
                 className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 focus:ring-0 outline-none transition [color-scheme:dark]"
                 value={formData.manufacturingDate}
                 onChange={e => setFormData({...formData, manufacturingDate: e.target.value})}
               />
             </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
             <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium ml-1">Distribution Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 focus:ring-0 outline-none transition [color-scheme:dark]"
                  value={formData.dateSentToSeller}
                  onChange={e => setFormData({...formData, dateSentToSeller: e.target.value})}
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium ml-1">Authorized Seller</label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/40 focus:ring-0 outline-none transition appearance-none"
                    value={formData.sellerId}
                    onChange={e => setFormData({...formData, sellerId: e.target.value})}
                  >
                    <option value="" className="bg-neutral-900 text-neutral-500">Select Partner...</option>
                    {sellers.map(s => (
                      <option key={s.id} value={s.id} className="bg-neutral-900">{s.name} — {s.email}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
                {sellers.length === 0 && <p className="text-[10px] text-orange-400 mt-1 pl-1">No seller partners onboarded.</p>}
             </div>
          </div>
          
          <button type="submit" className="w-full py-4 bg-white text-black font-display font-bold rounded-xl hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] mt-2">
            Dispatch Inventory
          </button>
        </form>
      </div>

      {/* List Panel - Bento Item 2 */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6">
           <div>
             <h2 className="text-xl font-display font-bold text-white">Dispatched Units</h2>
             <p className="text-neutral-500 text-sm">Real-time tracking of manufactured goods.</p>
           </div>
           <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-xs font-mono text-white">
             Total: {products.reduce((acc, curr) => acc + curr.quantity, 0)} Units
           </div>
        </div>

        {products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-neutral-600 bg-black/20">
            <span className="font-display text-lg mb-2">No Records Found</span>
            <span className="text-sm">Initiate production to see data here.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, idx) => (
              <div 
                key={product.id} 
                className="group bg-neutral-900/30 border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:bg-neutral-900/60"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-neutral-950 border border-white/5 px-3 py-1 rounded-md">
                     <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">SN: {product.serialNumber}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                
                <h3 className="text-lg font-display font-medium text-white mb-1 group-hover:text-neutral-200">{product.name}</h3>
                <p className="text-neutral-500 text-sm mb-6">Assigned to <span className="text-white">{product.sellerName}</span></p>
                
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-4">
                   <div>
                      <p className="text-neutral-600 uppercase tracking-wider mb-0.5">Quantity</p>
                      <p className="text-white font-mono">{product.quantity}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-neutral-600 uppercase tracking-wider mb-0.5">Dispatched</p>
                      <p className="text-white font-mono">{product.dateSentToSeller}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturerView;