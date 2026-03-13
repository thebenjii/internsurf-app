import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Feature cards data
const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Real Opportunities',
    description:
      'Browse thousands of verified internship listings from top companies, startups, and nonprofits — all in one place.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Live Updates',
    description:
      'New listings are added daily from multiple sources including Adzuna, Remotive, and The Muse. Never miss an opportunity.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Easy Application',
    description:
      'Apply directly through InternSurf with your profile and cover letter. Track every application status in real time.',
  },
];

const STUDENT_STEPS = [
  { step: '01', title: 'Create your profile', description: 'Sign up as a student and fill out your academic background and skills.' },
  { step: '02', title: 'Browse & filter', description: 'Search by category, location, or keyword to find the right internship.' },
  { step: '03', title: 'Apply in seconds', description: 'Submit your cover letter directly through InternSurf and track status.' },
];

const ORG_STEPS = [
  { step: '01', title: 'Register your organization', description: 'Sign up, verify your organization, and set up your company profile.' },
  { step: '02', title: 'Post a listing', description: 'Add internship details including role, requirements, and deadline.' },
  { step: '03', title: 'Review applications', description: 'Manage applicants, shortlist candidates, and update statuses easily.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium tracking-wide">
              Your career starts here
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Find Your Perfect
              <br />
              <span className="text-blue-200">Internship</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 mb-10 leading-relaxed">
              InternSurf connects ambitious students with real internship opportunities at companies that care. Search, filter, and apply — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/internships"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold text-base hover:bg-blue-50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Internships
              </Link>
              <Link
                href="/signup?role=organization"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/60 text-white font-semibold text-base hover:bg-white/10 transition-colors"
              >
                Post an Internship
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
              {[
                { value: '10,000+', label: 'Listings' },
                { value: '500+', label: 'Companies' },
                { value: '50+', label: 'Categories' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-blue-200 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to land the role</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                InternSurf brings together the best internship listings with powerful tools to help you succeed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How InternSurf works</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Whether you are a student looking for opportunities or an organization looking for talent, we have you covered.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Students */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">For Students</h3>
                </div>

                <div className="space-y-6">
                  {STUDENT_STEPS.map((item, i) => (
                    <div key={item.step} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {item.step}
                        </div>
                        {i < STUDENT_STEPS.length - 1 && (
                          <div className="w-0.5 flex-1 bg-blue-100 mt-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Get started as a student
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Organizations */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">For Organizations</h3>
                </div>

                <div className="space-y-6">
                  {ORG_STEPS.map((item, i) => (
                    <div key={item.step} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {item.step}
                        </div>
                        {i < ORG_STEPS.length - 1 && (
                          <div className="w-0.5 flex-1 bg-blue-100 mt-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup?role=organization"
                  className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Register your organization
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to launch your career?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students already finding their dream internships on InternSurf.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/internships"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold text-base hover:bg-blue-50 transition-colors shadow-lg"
              >
                Browse Internships
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-white/60 text-white font-semibold text-base hover:bg-white/10 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
