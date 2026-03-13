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

// ─── Adzuna types ─────────────────────────────────────────────────────────────

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  company: { display_name: string };
  location: { display_name: string };
  category: { label: string };
  redirect_url: string;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
}

// ─── Arbeitnow types ──────────────────────────────────────────────────────────

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

// ─── Jobicy types ─────────────────────────────────────────────────────────────

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobIndustry: string | string[];
  jobType: string | string[];
  jobGeo: string;
  jobLevel: string;
  jobExcerpt: string;
  jobDescription: string;
  pubDate: string;
}

interface JobicyResponse {
  jobs: JobicyJob[];
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
  let adzunaAdded = 0;
  let arbeitnowAdded = 0;
  let jobicyAdded = 0;
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

  // ── Adzuna ───────────────────────────────────────────────────────────────────
  const adzunaAppId = process.env.ADZUNA_APP_ID;
  const adzunaAppKey = process.env.ADZUNA_APP_KEY;

  if (adzunaAppId && adzunaAppKey) {
    try {
      const adzunaRes = await fetch(
        `https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=50&what=intern&content-type=application/json`,
        { next: { revalidate: 0 } },
      );

      if (adzunaRes.ok) {
        const data: AdzunaResponse = await adzunaRes.json();
        const jobs = data.results ?? [];

        for (const job of jobs) {
          const externalId = `adzuna-${job.id}`;

          const record = {
            title: job.title?.slice(0, 255) ?? 'Untitled',
            description: job.description ?? '',
            category: mapCategory(job.category?.label ?? ''),
            company_name: job.company?.display_name ?? null,
            location: job.location?.display_name ?? null,
            is_remote: false,
            is_active: true,
            source: 'adzuna' as const,
            external_url: job.redirect_url ?? null,
            external_id: externalId,
            deadline: null,
            organization_id: null,
          };

          const { error } = await supabase
            .from('internships')
            .upsert(record, { onConflict: 'source,external_id', ignoreDuplicates: false })
            .select('id');

          if (error) {
            errors.push(`Adzuna job ${job.id}: ${error.message}`);
          } else {
            adzunaAdded++;
          }
        }
      } else {
        errors.push(`Adzuna API returned ${adzunaRes.status}`);
      }
    } catch (err) {
      errors.push(`Adzuna fetch error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ── Arbeitnow ────────────────────────────────────────────────────────────────
  try {
    const arbeitnowRes = await fetch(
      'https://www.arbeitnow.com/api/job-board-api',
      { next: { revalidate: 0 } },
    );

    if (arbeitnowRes.ok) {
      const data: ArbeitnowResponse = await arbeitnowRes.json();
      // Filter to internship-related jobs by tag or job_types
      const jobs = (data.data ?? []).filter((j) =>
        j.tags?.some((t) => t.toLowerCase().includes('intern')) ||
        j.job_types?.some((t) => t.toLowerCase().includes('intern')) ||
        j.title.toLowerCase().includes('intern')
      );

      for (const job of jobs) {
        const externalId = `arbeitnow-${job.slug}`;

        const record = {
          title: job.title?.slice(0, 255) ?? 'Untitled',
          description: job.description ?? '',
          category: mapCategory(job.tags?.join(' ') ?? ''),
          company_name: job.company_name ?? null,
          location: job.location || null,
          is_remote: job.remote ?? false,
          is_active: true,
          source: 'arbeitnow' as const,
          external_url: job.url ?? null,
          external_id: externalId,
          deadline: null,
          organization_id: null,
        };

        const { error } = await supabase
          .from('internships')
          .upsert(record, { onConflict: 'source,external_id', ignoreDuplicates: false })
          .select('id');

        if (error) {
          errors.push(`Arbeitnow job ${job.slug}: ${error.message}`);
        } else {
          arbeitnowAdded++;
        }
      }
    } else {
      errors.push(`Arbeitnow API returned ${arbeitnowRes.status}`);
    }
  } catch (err) {
    errors.push(`Arbeitnow fetch error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Jobicy ────────────────────────────────────────────────────────────────────
  try {
    const jobicyRes = await fetch(
      'https://jobicy.com/api/v2/remote-jobs?count=50&tag=intern',
      { next: { revalidate: 0 } },
    );

    if (jobicyRes.ok) {
      const data: JobicyResponse = await jobicyRes.json();
      const jobs = data.jobs ?? [];

      for (const job of jobs) {
        const externalId = `jobicy-${job.id}`;
        const industry = Array.isArray(job.jobIndustry)
          ? job.jobIndustry[0] ?? ''
          : job.jobIndustry ?? '';

        const record = {
          title: job.jobTitle?.slice(0, 255) ?? 'Untitled',
          description: job.jobDescription ?? job.jobExcerpt ?? '',
          category: mapCategory(industry),
          company_name: job.companyName ?? null,
          location: job.jobGeo || null,
          is_remote: true,
          is_active: true,
          source: 'jobicy' as const,
          external_url: job.url ?? null,
          external_id: externalId,
          deadline: null,
          organization_id: null,
        };

        const { error } = await supabase
          .from('internships')
          .upsert(record, { onConflict: 'source,external_id', ignoreDuplicates: false })
          .select('id');

        if (error) {
          errors.push(`Jobicy job ${job.id}: ${error.message}`);
        } else {
          jobicyAdded++;
        }
      }
    } else {
      errors.push(`Jobicy API returned ${jobicyRes.status}`);
    }
  } catch (err) {
    errors.push(`Jobicy fetch error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const summary = {
    success: true,
    syncedAt: new Date().toISOString(),
    remotive: { processed: remotiveAdded + remotiveUpdated },
    themuse: { processed: themuseAdded + themuseUpdated },
    adzuna: { processed: adzunaAdded },
    arbeitnow: { processed: arbeitnowAdded },
    jobicy: { processed: jobicyAdded },
    totalProcessed: remotiveAdded + remotiveUpdated + themuseAdded + themuseUpdated + adzunaAdded + arbeitnowAdded + jobicyAdded,
    errors: errors.length > 0 ? errors : undefined,
  };

  return NextResponse.json(summary, { status: 200 });
}
