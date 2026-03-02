import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={toggleOpen} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-1 w-40 rounded-lg bg-[#1c1c1c] border border-[#282828] shadow-lg focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          tabIndex="-1"
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "block w-full text-left px-3 py-2 text-sm text-[#c4c4c4] hover:bg-[#282828] hover:text-[#f1f1f1] transition-colors",
      className
    )}
    role="menuitem"
    tabIndex="-1"
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuItem };
