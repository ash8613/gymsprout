import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const bgColor = type === 'success' ? 'bg-primary' : type === 'pr' ? 'bg-accent' : 'bg-primary';

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`${bgColor} text-white px-4 py-3 rounded-2xl shadow-lg text-center text-sm font-medium max-w-md mx-auto`}>
        {type === 'pr' && '🏆 '}{message}
      </div>
    </div>
  );
}
