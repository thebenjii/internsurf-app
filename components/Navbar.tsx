'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data ?? null);
      setLoading(false);
    }

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const isStudent = profile?.role === 'student';
  const isOrg = profile?.role === 'organization';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight"
          >
            <svg
              className="w-7 h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
            InternSurf
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {/* Logged out */}
                {!profile && (
                  <>
                    <Link
                      href="/internships"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Browse Internships
                    </Link>
                    <Link
                      href="/login"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {/* Student */}
                {isStudent && (
                  <>
                    <Link
                      href="/internships"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Browse Internships
                    </Link>
                    <Link
                      href="/student/dashboard"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/student/profile"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                )}

                {/* Organization */}
                {isOrg && (
                  <>
                    <Link
                      href="/org/listings"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/org/applications"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Applications
                    </Link>
                    <Link
                      href="/org/dashboard"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && !loading && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-3">
          {!profile && (
            <>
              <Link
                href="/internships"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Browse Internships
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link
                href="/internships"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Browse Internships
              </Link>
              <Link
                href="/student/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/student/profile"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-left hover:bg-blue-700 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}

          {isOrg && (
            <>
              <Link
                href="/org/listings"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                My Listings
              </Link>
              <Link
                href="/org/applications"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Applications
              </Link>
              <Link
                href="/org/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-left hover:bg-blue-700 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
