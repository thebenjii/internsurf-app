'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import InternshipCard from '@/components/InternshipCard';
import type { Internship, InternshipCategory } from '@/lib/types';

const CATEGORIES: InternshipCategory[] = [
  'Technology',
  'Business & Finance',
  'Marketing',
  'Healthcare',
  'Engineering',
  'Design',
  'Education',
  'Other',
];

interface InternshipsClientProps {
  internships: Internship[];
  initialSearch: string;
  initialCategory: string;
}

export default function InternshipsClient({
  internships,
  initialSearch,
  initialCategory,
}: InternshipsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  function updateParams(newSearch: string, newCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    updateParams(value, category);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    updateParams(search, value);
  }

  function handleClear() {
    setSearch('');
    setCategory('');
    router.replace(pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    let result = internships;
    const q = search.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.company_name?.toLowerCase().includes(q) ?? false) ||
          (i.organization?.name.toLowerCase().includes(q) ?? false) ||
          i.description.toLowerCase().includes(q) ||
          (i.location?.toLowerCase().includes(q) ?? false),
      );
    }

    if (category) {
      result = result.filter((i) => i.category === category);
    }

    return result;
  }, [internships, search, category]);

  const hasFilters = search || category;

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, company, or keyword..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Category filter */}
        <div className="sm:w-56">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={handleClear}
            className="sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'internship' : 'internships'} found
          {hasFilters && (
            <span className="text-gray-400"> (filtered from {internships.length} total)</span>
          )}
        </p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No internships found</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
