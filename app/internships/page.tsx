import { Suspense } from 'react';
import Footer from '@/components/Footer';
import InternshipsClient from './InternshipsClient';
import type { Internship } from '@/lib/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://hwwkbrifairouslfeplt.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3d2ticmlmYWlyb3VzbGZlcGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzIxOTYsImV4cCI6MjA4ODk0ODE5Nn0.Du_4d85Y5qMxvR7rCe7WkE7SbIU3Ciprc3m-YuYQ9ic';

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

async function fetchInternships(): Promise<Internship[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/internships?select=*,organization:organizations(id,user_id,name,description,website,created_at)&is_active=eq.true&order=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('fetchInternships failed:', res.status, await res.text());
      return [];
    }
    return res.json();
  } catch (err) {
    console.error('fetchInternships error:', err);
    return [];
  }
}

export default async function InternshipsPage({ searchParams }: PageProps) {
  const [internships, params] = await Promise.all([
    fetchInternships(),
    searchParams,
  ]);

  const initialSearch = params.search ?? '';
  const initialCategory = params.category ?? '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Internships</h1>
            <p className="text-gray-500 text-base">
              Explore {internships.length.toLocaleString()} active internship opportunities from top organizations.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-48 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          }>
            <InternshipsClient
              internships={internships}
              initialSearch={initialSearch}
              initialCategory={initialCategory}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
