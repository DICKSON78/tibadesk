import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken, isAuthenticated } from '../lib/session';

/**
 * Decides where a user lands when they open this application.
 *
 * TibaDesk signs a user in before the frame is created and writes the token
 * this application reads. So arriving here does not necessarily mean "not
 * signed in" — it can equally mean "signed in by someone else", and the only
 * way to tell the difference is to ask the server who the token belongs to.
 *
 * That question is asked once, on the way in, rather than assumed. Assuming it
 * would send a user who arrived through TibaDesk to a login screen they had
 * already satisfied elsewhere, which is the exact thing the mount exists to
 * prevent. Assuming the opposite would send a user with no token to a blank
 * dashboard that silently fails to load its data.
 */
export default function SessionGate() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data } = await window.axios.get('/api/auth/user');

        if (cancelled) return;

        const user = data?.data?.user ?? data?.data;
        const privileges = user?.privileges ?? {};

        // The same landing rule the login page applies, so a user who signs in
        // normally and a user who arrives through TibaDesk end up in the same
        // place rather than one of them getting a dashboard the other cannot
        // open.
        const home = privileges.dashboard
          ? '/dashboard'
          : Object.keys(privileges).length > 0
            ? `/${firstModule(privileges)}/dashboard`
            : null;

        // A real account with no privileges is not a session problem, so it is
        // not answered with a login screen — the user is signed in, there is
        // simply nothing here for them yet.
        navigate(home ?? '/no-access', { replace: true });
      } catch {
        // The token is stale or was revoked. Cleared under this
        // application's own key only; the other applications TibaDesk mounts
        // share the origin and must keep their sessions.
        clearToken();
        navigate('/login', { replace: true });
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    resolveSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="size-6 animate-spin text-azure-600"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v3m0 9v3M4.5 12h3m9 0h3M6.7 6.7l2.1 2.1m6.4 6.4 2.1 2.1m0-10.6-2.1 2.1m-6.4 6.4-2.1 2.1" />
      </svg>
      <p className="text-sm text-mist-500">Checking your session…</p>
    </div>
  );
}

/**
 * Order matters here: the first module a user holds is the one they land in,
 * and it has to be the same order the rest of the application uses, or a user
 * can be sent to a dashboard they then immediately get bounced off.
 */
function firstModule(privileges) {
  const order = [
    'reception',
    'consultation_room',
    'dental_lab',
    'medicine_center',
    'dispensing',
    'inventory_management',
    'financial_management',
  ];

  return order.find((module) => privileges[module]) ?? Object.keys(privileges)[0];
}
