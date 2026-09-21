import React from 'react';

interface LoadingExperienceProps {
  label?: string;
  className?: string;
}

export const LoadingExperience: React.FC<LoadingExperienceProps> = ({
  label = 'LOADING...',
  className = 'py-16'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      <div className="mb-3">
        <span className="text-xs tracking-[0.25em] font-semibold text-[var(--color-gold)] uppercase select-none font-heading opacity-90">
          {label}
        </span>
      </div>
      <div className="w-48 sm:w-64 h-[2px] bg-[rgba(212,175,55,0.15)] rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 bg-[var(--color-gold)] opacity-80 w-1/3 rounded-full"
          style={{
            animation: 'goldLoadingSweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes goldLoadingSweep {
          0% { left: -35%; width: 30%; }
          50% { width: 50%; }
          100% { left: 105%; width: 30%; }
        }
      `}</style>
    </div>
  );
};
