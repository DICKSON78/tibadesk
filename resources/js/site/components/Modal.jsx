import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './icons';

/**
 * An overlay panel for the sign-in and registration flows.
 *
 * Both used to be whole pages of their own, sitting outside the site shell with
 * their own navbar and footer. They are short, self-contained tasks that people
 * start from deep inside the site, so making them pages meant a visitor lost
 * their place and the browser's back button walked away from where they were.
 * As an overlay they open over whatever they were reading and the page behind is
 * still there when they close it.
 *
 * It renders into document.body rather than in place. The panel has to sit above
 * the navbar, which is position:fixed and carries its own z-50, and a modal
 * rendered inside <main> would be trapped under it in the stacking order.
 *
 * Escape closes, the backdrop closes, and the page behind stops scrolling while
 * the panel is open — otherwise a touch-scrolling finger drags the page out from
 * under a panel the visitor is still reading.
 */
export default function Modal({
  labelledBy,
  onClose,
  width = 'max-w-2xl',
  children,
}) {
  const panel = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Move focus into the panel so a keyboard visitor is not left behind on the
  // page underneath, and keep Tab inside the dialog. Without the trap, tabbing
  // off the last control lands on whatever is behind the overlay, which is
  // invisible and unreachable by eye.
  useEffect(() => {
    panel.current?.focus();

    function onTab(event) {
      if (event.key !== 'Tab' || !panel.current) {
        return;
      }

      const focusable = panel.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel.current)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onTab);

    return () => document.removeEventListener('keydown', onTab);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center overflow-y-auto bg-ink/70 px-4 py-6 sm:py-10 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`card relative w-full ${width} max-h-[92vh] overflow-y-auto p-6 outline-none md:p-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-ink"
        >
          <IconClose className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}
