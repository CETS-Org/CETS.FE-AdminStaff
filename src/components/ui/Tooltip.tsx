import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

export default function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      // Position will be updated in useEffect after render
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Use viewport coordinates since we're using position: fixed
    let top = 0;
    let left = 0;

    switch (side) {
      case "top":
        top = triggerRect.top - tooltipRect.height - 8;
        if (align === "start") {
          left = triggerRect.left;
        } else if (align === "end") {
          left = triggerRect.right - tooltipRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        }
        break;
      case "bottom":
        top = triggerRect.bottom + 8;
        if (align === "start") {
          left = triggerRect.left;
        } else if (align === "end") {
          left = triggerRect.right - tooltipRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        }
        break;
      case "left":
        left = triggerRect.left - tooltipRect.width - 8;
        if (align === "start") {
          top = triggerRect.top;
        } else if (align === "end") {
          top = triggerRect.bottom - tooltipRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        }
        break;
      case "right":
        left = triggerRect.right + 8;
        if (align === "start") {
          top = triggerRect.top;
        } else if (align === "end") {
          top = triggerRect.bottom - tooltipRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        }
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      // Use double requestAnimationFrame to ensure tooltip is fully rendered and measured
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updatePosition();
        });
      });
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen, side, align]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Simple approach: wrap children in a div
  const trigger = React.isValidElement(children) ? (
    <div
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}
    </div>
  ) : children;

  return (
    <>
      {trigger}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[100] px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg shadow-xl pointer-events-none max-w-sm"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              visibility: position.top === 0 && position.left === 0 ? 'hidden' : 'visible',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {content}
            <div
              className={`absolute w-2 h-2 bg-white border border-gray-200 transform rotate-45 ${
                side === "top"
                  ? align === "start"
                    ? "bottom-[-4px] left-3"
                    : align === "end"
                    ? "bottom-[-4px] right-3"
                    : "bottom-[-4px] left-1/2 -translate-x-1/2"
                  : side === "bottom"
                  ? align === "start"
                    ? "top-[-4px] left-3"
                    : align === "end"
                    ? "top-[-4px] right-3"
                    : "top-[-4px] left-1/2 -translate-x-1/2"
                  : side === "left"
                  ? align === "start"
                    ? "right-[-4px] top-3"
                    : align === "end"
                    ? "right-[-4px] bottom-3"
                    : "right-[-4px] top-1/2 -translate-y-1/2"
                  : align === "start"
                  ? "left-[-4px] top-3"
                  : align === "end"
                  ? "left-[-4px] bottom-3"
                  : "left-[-4px] top-1/2 -translate-y-1/2"
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export function TooltipTrigger({ children, asChild, ...props }: any) {
  return children;
}

export function TooltipContent({ children, className = "", ...props }: any) {
  return <div className={className}>{children}</div>;
}

