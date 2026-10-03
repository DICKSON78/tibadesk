import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';

/**
 * Which overlay the site is showing, if any.
 *
 * Both flows open over the page the visitor is reading, so what is open is
 * carried in the URL: /packages?modal=register. That keeps the overlay
 * shareable and deep-linkable, and makes the browser's back button close it,
 * which is what people expect from something that covers the page.
 *
 * /register and /login stay as real routes so the addresses that were
 * advertised still work, but they are treated as the same thing and closing from
 * one returns to the front page rather than a dead end.
 */
export default function SiteModals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const onOwnRoute = pathname === '/register' ? 'register' : pathname === '/login' ? 'login' : null;
  const requested = searchParams.get('modal');
  const open = requested === 'register' || requested === 'login' ? requested : onOwnRoute;

  const show = useCallback(
    (which) => {
      const next = new URLSearchParams(searchParams);
      next.set('modal', which);

      if (onOwnRoute) {
        navigate({ pathname: '/', search: next.toString() });
        return;
      }

      setSearchParams(next);
    },
    [navigate, onOwnRoute, searchParams, setSearchParams]
  );

  const close = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('modal');

    if (onOwnRoute) {
      navigate({ pathname: '/', search: next.toString() }, { replace: true });
      return;
    }

    setSearchParams(next, { replace: true });
  }, [navigate, onOwnRoute, searchParams, setSearchParams]);

  if (open === 'register') {
    return <RegisterModal onClose={close} onSwitchToLogin={() => show('login')} />;
  }

  if (open === 'login') {
    return <LoginModal onClose={close} onSwitchToRegister={() => show('register')} />;
  }

  return null;
}
