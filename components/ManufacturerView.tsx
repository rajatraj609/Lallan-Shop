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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </span>
            Add Stock
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Wireless Headphones"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number / Batch ID</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.serialNumber}
                onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                placeholder="e.g. SN-2023-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturing Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={formData.manufacturingDate}
                  onChange={e => setFormData({...formData, manufacturingDate: e.target.value})}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Sent to Seller</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={formData.dateSentToSeller}
                  onChange={e => setFormData({...formData, dateSentToSeller: e.target.value})}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Send to Seller</label>
              <select
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sellerId}
                onChange={e => setFormData({...formData, sellerId: e.target.value})}
              >
                <option value="">Select a Seller</option>
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              {sellers.length === 0 && <p className="text-xs text-orange-500 mt-1">No registered sellers found.</p>}
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
              Send Stock
            </button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Stock Sent</h2>
        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            No stock sent yet.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                       <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded border border-slate-200">
                         SN: {product.serialNumber}
                       </span>
                       <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded border border-indigo-100">
                         Qty: {product.quantity}
                       </span>
                       <span className="text-xs text-slate-400">•</span>
                       <span className="text-xs text-slate-500">Mfg: {product.manufacturingDate}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sent
                  </span>
                </div>
                <div className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                   <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">Assigned Seller</p>
                   <p className="font-medium text-slate-700">{product.sellerName}</p>
                   <p className="text-xs text-slate-400">Sent on: {product.dateSentToSeller}</p>
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