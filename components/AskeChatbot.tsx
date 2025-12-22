import React, { useState, useEffect, useRef } from 'react';
import { verifyProductIdentity } from '../services/storage';

const AskeChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Animation State
  const [isRetracted, setIsRetracted] = useState(false);

  // Chat Logic State
  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string}[]>([]);
  const [step, setStep] = useState<'greet' | 'input-code' | 'scan' | 'verifying' | 'success' | 'fail'>('greet');
  const [inputCode, setInputCode] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Trigger Liquid Retraction after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRetracted(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-Greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      typewriterEffect("Welcome to Aske. Let's verify your product's soul.", 40);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typewriterEffect = (text: string, speed: number = 30) => {
    let i = 0;
    setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
    
    const interval = setInterval(() => {
      setMessages(prev => {
        const newArr = [...prev];
        const lastMsg = newArr[newArr.length - 1];
        lastMsg.text = text.substring(0, i + 1);
        return newArr;
      });
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
  };

  const handleStart = () => {
    setStep('input-code');
    setMessages(prev => [...prev, { sender: 'bot', text: "Please enter the unique Authentication Code found in your Order details." }]);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.length < 5) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: inputCode }]);
    setTimeout(() => {
       setStep('scan');
       setMessages(prev => [...prev, { sender: 'bot', text: "Code received. Now, please scan the QR code on the physical product to match the digital signature." }]);
    }, 500);
  };

  const simulateScan = () => {
    setStep('verifying');
    setMessages(prev => [...prev, { sender: 'user', text: "[Scanning QR Code...]" }]);
    
    setTimeout(() => {
        verifyProcess();
    }, 2000);
  };
  
  const verifyProcess = async () => {
     const serialFromQR = prompt("SIMULATION: Camera scanned a QR Code. What Serial Number did it read? (Copy from your manufacturer view for testing)");
     
     if (!serialFromQR) {
         setStep('scan');
         setMessages(prev => [...prev, { sender: 'bot', text: "Scan cancelled. Please try again." }]);
         return;
     }

     const result = await verifyProductIdentity(serialFromQR, inputCode);
     
     if (result.valid) {
         setStep('success');
         setMessages(prev => [...prev, { sender: 'bot', text: "Verification Complete. Product Identity Confirmed." }]);
     } else {
         setStep('fail');
         setMessages(prev => [...prev, { sender: 'bot', text: "WARNING: Verification Failed. The digital signature does not match the physical product." }]);
     }
  };

  // --- Liquid Branding Component ---
  const LiquidBranding = ({ collapsed }: { collapsed: boolean }) => {
    const fullText = "Asli and Fake";
    // Indices to KEEP: 0(A), 1(s), 11(k), 12(e)
    const keepIndices = [0, 1, 11, 12];
    
    return (
      <div className="flex items-center font-display font-bold text-sm tracking-tight h-8 select-none whitespace-nowrap">
        {fullText.split('').map((char, index) => {
          const isKept = keepIndices.includes(index);
          const isSpace = char === ' ';
          
          return (
            <span
              key={index}
              className={`
                inline-block overflow-hidden whitespace-pre
                transition-all duration-[1200ms] ease-[cubic-bezier(0.77,0,0.175,1)]
                will-change-[max-width,opacity,filter]
                ${isKept ? 'text-white' : 'text-neutral-500'}
              `}
              style={{
                  // High-end collapse logic:
                  maxWidth: collapsed && !isKept ? '0px' : isSpace ? '0.35em' : '0.7em',
                  opacity: collapsed && !isKept ? 0 : 1,
                  filter: collapsed && !isKept ? 'blur(8px)' : 'blur(0)',
                  
                  // Add a subtle glow to the kept letters when fully retracted
                  textShadow: collapsed && isKept 
                      ? '0 0 12px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,0.4)' 
                      : 'none'
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] group transition-all duration-500 hover:scale-105 pr-6 pl-1 py-1 overflow-hidden"
      >
        <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full mr-3 shrink-0 relative z-10 border border-white/20">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
           </svg>
        </div>
        
        {/* Liquid Retraction Branding */}
        <div className="bg-black px-4 py-1.5 rounded-full text-white border border-white/10 shadow-inner">
            <LiquidBranding collapsed={isRetracted} />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                </svg>
             </div>
             <div className="flex flex-col">
                <span className="font-display font-bold text-white tracking-widest text-lg leading-none">ASKE</span>
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest leading-none mt-1">Verification Engine</span>
             </div>
         </div>
         <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
         </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
         {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                     msg.sender === 'user' 
                     ? 'bg-white text-black rounded-tr-none' 
                     : 'bg-black/60 text-neutral-200 border border-white/10 rounded-tl-none font-mono backdrop-blur-sm'
                 }`}>
                     {msg.text}
                 </div>
             </div>
         ))}
         
         {step === 'verifying' && (
             <div className="flex justify-start">
                 <div className="p-3 bg-neutral-800 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                     <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                     <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                     <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                 </div>
             </div>
         )}
         
         {/* Success / Fail Visuals */}
         {step === 'success' && (
             <div className="my-4 p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-500">
                 <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                 </div>
                 <h3 className="text-emerald-400 font-display font-bold text-lg tracking-wide">VERIFIED AUTHENTIC</h3>
                 <p className="text-emerald-200/60 text-xs mt-1">Lallan Shop Guarantee</p>
             </div>
         )}
         
         {step === 'fail' && (
             <div className="my-4 p-6 bg-red-900/20 border border-red-500/30 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-500">
                 <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                 </div>
                 <h3 className="text-red-400 font-display font-bold text-lg tracking-wide">POSSIBLE COUNTERFEIT</h3>
                 <p className="text-red-200/60 text-xs mt-1">Please report this seller immediately.</p>
                 <button className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full shadow-lg transition-transform hover:scale-105">Report Incident</button>
             </div>
         )}

         <div ref={messagesEndRef} />
      </div>

      {/* Inputs Area */}
      <div className="p-4 bg-neutral-900 border-t border-white/5">
         {step === 'greet' && (
             <button onClick={handleStart} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                 Begin Verification
             </button>
         )}

         {step === 'input-code' && (
             <form onSubmit={handleCodeSubmit} className="flex gap-2">
                 <input 
                   type="text" 
                   value={inputCode}
                   onChange={(e) => setInputCode(e.target.value)}
                   placeholder="Paste Auth Code..."
                   className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30 font-mono transition-colors"
                   autoFocus
                 />
                 <button type="submit" className="px-4 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                     </svg>
                 </button>
             </form>
         )}

         {step === 'scan' && (
             <button onClick={simulateScan} className="w-full py-3 bg-neutral-800 text-white border border-white/10 rounded-xl hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 group">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                 </svg>
                 Open Camera
             </button>
         )}

         {(step === 'success' || step === 'fail') && (
             <button onClick={() => { setIsOpen(false); setStep('greet'); setMessages([]); setInputCode(''); }} className="w-full py-3 bg-neutral-800 text-neutral-400 font-medium rounded-xl hover:text-white transition-colors">
                 Close
             </button>
         )}
      </div>
    </div>
  );
};

export default AskeChatbot;