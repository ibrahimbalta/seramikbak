export default function RootLoading() {
  return (
    <div 
      aria-hidden="true" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 999999,
        background: 'rgba(212, 175, 55, 0.2)',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <div 
        style={{
          height: '100%',
          width: '45%',
          background: 'linear-gradient(90deg, #b38e47, #d4af37, #fef08a)',
          borderRadius: '3px',
          animation: 'sbTopLoader 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
        }} 
      />
      <style>{`
        @keyframes sbTopLoader {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </div>
  );
}
