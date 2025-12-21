import React, { useEffect, useState } from 'react';

interface Props {
  password: string;
  onValidationChange: (isValid: boolean) => void;
}

const PasswordStrength: React.FC<Props> = ({ password, onValidationChange }) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length > 6) score++;
    if (/[A-Za-z]/.test(password)) score++; // Has alphabet
    if (/[0-9]/.test(password)) score++; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score++; // Has symbol

    // Normalize for the UI logic
    // We want 3 levels: Weak, Medium, Strong
    // Requirements: >6 chars AND mix of types.
    
    // Let's refine the score for the "Tower":
    // 0: Empty/Very short
    // 1: Weak (Short or missing complexity)
    // 2: Medium (Good length, missing some complexity OR good complexity, short)
    // 3: Strong (Length > 6 + Mixed types)
    
    let uiScore = 0;
    if (password.length > 0) uiScore = 1;
    if (password.length > 6 && score >= 3) uiScore = 2; // Length + 2 types
    if (password.length > 6 && score >= 4) uiScore = 3; // Length + 3 types (alpha, num, sym)

    setStrength(uiScore);
    onValidationChange(uiScore >= 1 && password.length > 6); // Basic validation: length > 6 is hard requirement usually, but let's say "Weak" is valid but not recommended. Prompt said >6 chars is a warning.
    
  }, [password, onValidationChange]);

  const getColor = (index: number) => {
    if (strength === 0) return 'bg-slate-600';
    if (strength === 1) return index === 0 ? 'bg-red-500' : 'bg-slate-600';
    if (strength === 2) return index <= 1 ? 'bg-orange-500' : 'bg-slate-600';
    if (strength === 3) return 'bg-green-500';
    return 'bg-slate-600';
  };

  const getLabel = () => {
    if (password.length === 0) return '';
    if (password.length <= 6) return 'Too short (Min 7 chars)';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Medium';
    if (strength === 3) return 'Strong';
    return '';
  };

  return (
    <div className="mt-2">
      <div className="flex items-end gap-1 mb-1 h-6">
        {/* Tower Bars */}
        <div className={`w-2 h-2 rounded-sm transition-colors duration-300 ${getColor(0)}`}></div>
        <div className={`w-2 h-3 rounded-sm transition-colors duration-300 ${getColor(1)}`}></div>
        <div className={`w-2 h-4 rounded-sm transition-colors duration-300 ${getColor(2)}`}></div>
        
        <span className="ml-2 text-xs font-medium text-slate-300">{getLabel()}</span>
      </div>
      <p className="text-xs text-slate-400">
        Use 7+ chars with letters, numbers & symbols.
      </p>
    </div>
  );
};

export default PasswordStrength;