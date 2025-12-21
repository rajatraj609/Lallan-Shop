import React from 'react';
import { CartItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  isManufacturer?: boolean;
}

const CartDrawer: React.FC<Props> = ({ isOpen, onClose, cartItems, onRemoveItem, onCheckout, isManufacturer }) => {
  if (!isOpen) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-neutral-900 border-l border-white/10 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transform transition-transform">
         
         {/* Close Button Absolute */}
         <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 p-2 bg-neutral-800 text-neutral-400 hover:bg-white hover:text-black rounded-full shadow-lg border border-white/10 transition-colors"
            aria-label="Close Cart"
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>

         {/* Header */}
         <div className="p-6 pt-8 border-b border-white/5 bg-neutral-900 sticky top-0 z-10">
            <h2 className="text-xl font-display font-bold text-white pr-10">
               {isManufacturer ? 'Dispatch Stage' : 'Your Cart'}
            </h2>
         </div>

         {/* Items */}
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <p>Your cart is empty.</p>
               </div>
            ) : (
               cartItems.map(item => (
                  <div key={item.id} className="bg-neutral-800/50 border border-white/5 rounded-2xl p-4 flex gap-4 relative group">
                      {/* Product Icon/Image Placeholder */}
                      <div className="w-20 h-20 bg-black/40 rounded-xl flex items-center justify-center text-white/20 font-display font-bold text-2xl shrink-0">
                          {item.productName.charAt(0)}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 pr-6">{item.productName}</h3>
                              </div>
                              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">
                                {item.isSerialized ? 'Serialized' : 'Bulk Stock'}
                              </p>
                              {item.unitIds && item.unitIds.length > 0 && (
                                  <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                                      {item.unitIds.length} SNs Selected
                                  </p>
                              )}
                          </div>
                          <div className="flex justify-between items-end">
                              <span className="text-sm text-neutral-300">Qty: <span className="font-mono text-white text-base">{item.quantity}</span></span>
                          </div>
                      </div>

                      {/* Remove Button Absolute */}
                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="absolute top-2 right-2 p-1.5 text-neutral-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                      </button>
                  </div>
               ))
            )}
         </div>

         {/* Footer */}
         <div className="p-6 border-t border-white/5 bg-neutral-900 space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-10">
             <div className="flex justify-between items-center text-sm text-neutral-400">
                 <span>Total Items</span>
                 <span className="text-white font-mono text-lg">{totalItems}</span>
             </div>
             <button 
                onClick={onCheckout}
                disabled={cartItems.length === 0}
                className="w-full py-4 bg-white disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-display font-bold rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
             >
                {isManufacturer ? 'Select Recipient & Dispatch' : 'Place Order'}
             </button>
         </div>
      </div>
    </>
  );
};

export default CartDrawer;