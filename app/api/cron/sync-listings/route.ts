import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a service-role Supabase client that bypasses RLS
function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase service role environment variables');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ─── Remotive types ───────────────────────────────────────────────────────────

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  description: string;
  publication_date: string;
  candidate_required_location: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

// ─── The Muse types ───────────────────────────────────────────────────────────

interface TheMuseLocation {
  name: string;
}

interface TheMuseJob {
  id: number;
  name: string;
  company: { name: string };
  locations: TheMuseLocation[];
  categories: { name: string }[];
  short_name: string;
  refs: { landing_page: string };
  publication_date: string;
  contents?: string;
}

interface TheMuseResponse {
  results: TheMuseJob[];
}

// ─── Category mapper ─────────────────────────────────────────────────────────

function mapCategory(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('tech') || lower.includes('software') || lower.includes('engineer') || lower.includes('data') || lower.includes('dev')) {
    return 'Technology';
  }
  if (lower.includes('finance') || lower.includes('business') || lower.includes('accounting')) {
    return 'Business & Finance';
  }
  if (lower.includes('market') || lower.includes('content') || lower.includes('social')) {
    return 'Marketing';
  }
  if (lower.includes('health') || lower.includes('medical') || lower.includes('nurse')) {
    return 'Healthcare';
  }
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) {
    return 'Design';
  }
  if (lower.includes('educat') || lower.includes('teach') || lower.includes('tutor')) {
    return 'Education';
  }
  return 'Other';
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  let remotiveAdded = 0;
  let remotiveUpdated = 0;
  let themuseAdded = 0;
  let themuseUpdated = 0;
  const errors: string[] = [];

  // ── Remotive ────────────────────────────────────────────────────────────────
  try {
    const remotiveRes = await fetch(
      'https://remotive.com/api/remote-jobs?category=software-dev&limit=20',
      { next: { revalidate: 0 } },
    );

    if (remotiveRes.ok) {
      const data: RemotiveResponse = await remotiveRes.json();
      const jobs = data.jobs ?? [];

      for (const job of jobs) {
        const externalId = `remotive-${job.id}`;

        const record = {
          title: job.title?.slice(0, 255) ?? 'Untitled',
          description: job.description ?? '',
          category: mapCategory(job.category ?? ''),
          company_name: job.company_name ?? null,
          location: job.candidate_required_location || null,
          is_remote: true,
          is_active: true,
          source: 'remotive' as const,
          external_url: job.url ?? null,
          external_id: externalId,
          deadline: null,
          organization_id: null,
        };

        const { error, data: upserted } = await supabase
          .from('internships')
          .upsert(record, { onConflict: 'source,external_id', ignoreDuplicates: false })
          .select('id');

        if (error) {
          errors.push(`Remotive job ${job.id}: ${error.message}`);
        } else if (upserted && upserted.length > 0) {
          // Determine if it was an insert or update
          remotiveAdded++;
        }
      }
    } else {
      errors.push(`Remotive API returned ${remotiveRes.status}`);
    }
  } catch (err) {
    errors.push(`Remotive fetch error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── The Muse ─────────────────────────────────────────────────────────────────
  try {
    const themuseRes = await fetch(
      'https://www.themuse.com/api/public/jobs?level=Internship&page=1',
      { next: { revalidate: 0 } },
    );

    if (themuseRes.ok) {
      const data: TheMuseResponse = await themuseRes.json();
      const jobs = data.results ?? [];

      for (const job of jobs) {
        const externalId = `themuse-${job.id}`;
        const location =
          job.locations && job.locations.length > 0 ? job.locations[0].name : null;
        const category =
          job.categories && job.categories.length > 0
            ? mapCategory(job.categories[0].name)
            : 'Other';

        const record = {
          title: job.name?.slice(0, 255) ?? 'Untitled',
          description: job.contents ?? `${job.name} at ${job.company?.name ?? 'Company'}`,
          category,
          company_name: job.company?.name ?? null,
          location,
          is_remote: false,
          is_active: true,
          source: 'themuse' as const,
          external_url: job.refs?.landing_page ?? null,
          external_id: externalId,
          deadline: null,
          organization_id: null,
        };

        const { error } = await supabase
          .from('internships')
          .upsert(record, { onConflict: 'source,external_id', ignoreDuplicates: false })
          .select('id');

        if (error) {
          errors.push(`The Muse job ${job.id}: ${error.message}`);
        } else {
          themuseAdded++;
        }
      }
    } else {
      errors.push(`The Muse API returned ${themuseRes.status}`);
    }
  } catch (err) {
    errors.push(`The Muse fetch error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const summary = {
    success: true,
    syncedAt: new Date().toISOString(),
    remotive: { processed: remotiveAdded + remotiveUpdated },
    themuse: { processed: themuseAdded + themuseUpdated },
    totalProcessed: remotiveAdded + remotiveUpdated + themuseAdded + themuseUpdated,
    errors: errors.length > 0 ? errors : undefined,
  };

  return NextResponse.json(summary, { status: 200 });
}
