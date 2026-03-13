import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-blue-600 font-bold text-lg tracking-tight">
              InternSurf
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Connecting ambitious students with meaningful internship opportunities.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/internships" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Browse Internships
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Post an Internship
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            &copy; 2025 <span className="text-blue-600 font-medium">InternSurf</span>. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Built for students, by students.
          </p>
        </div>
      </div>
    </footer>
  );
}
