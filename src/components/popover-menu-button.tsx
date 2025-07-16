import React, { useRef, useState, useEffect, ReactElement, cloneElement } from 'react';
import { createPortal } from 'react-dom';

interface PopoverMenuButtonProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
  popoverClassName?: string;
  popoverAlign?: 'left' | 'right' | 'center';
  popoverWidth?: number | string;
}

const PopoverMenuButton: React.FC<PopoverMenuButtonProps> = ({
  trigger,
  children,
  className = '',
  popoverClassName = '',
  popoverAlign = 'left',
  popoverWidth = 320,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const triggerWrapperRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerWrapperRef.current) {
      const rect = triggerWrapperRef.current.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      if (popoverAlign === 'center') {
        left = left + rect.width / 2 - (typeof popoverWidth === 'number' ? popoverWidth : 320) / 2;
      } else if (popoverAlign === 'right') {
        left = left + rect.width - (typeof popoverWidth === 'number' ? popoverWidth : 320);
      }
      setPopoverPos({
        top: rect.bottom + window.scrollY + 8,
        left,
      });
    }
  }, [isOpen, popoverAlign, popoverWidth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerWrapperRef.current &&
        !triggerWrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const triggerNode = cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen((v: boolean) => !v);
      if (
        trigger.props &&
        typeof trigger.props === 'object' &&
        'onClick' in trigger.props &&
        typeof (trigger.props as any).onClick === 'function'
      ) {
        (trigger.props as any).onClick(e);
      }
    },
    'aria-expanded': isOpen,
  } as any);

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <span ref={triggerWrapperRef} style={{ display: 'inline-block' }}>{triggerNode}</span>
      {isOpen && popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            className={popoverClassName}
            style={{
              top: popoverPos.top,
              left: popoverPos.left,
              position: 'absolute',
              zIndex: 9999,
              width: typeof popoverWidth === 'number' ? popoverWidth : popoverWidth,
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
};

export default PopoverMenuButton; 