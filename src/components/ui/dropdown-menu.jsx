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
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={toggleOpen}
        >
          {trigger}
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md bg-white focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex="-1"
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
      "text-gray-700 block w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100",
      className
    )}
    role="menuitem"
    tabIndex="-1"
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuItem };