import BackLink from '@/components/BackLink';
import { Skeleton } from '@/components/Skeleton';
import { SuspendedItem } from '@/components/SuspendedItem';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { JobInfoTable } from '@/drizzle/schema';
import { getJobInfoIdTag } from '@/features/jobInfos/dbCache';
import { formatExperienceLevel } from '@/features/jobInfos/lib/formatters';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import { and, eq } from 'drizzle-orm';
import { ArrowRight } from 'lucide-react';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

const options = [
  {
    label: 'Answer Technical Questions',
    description:
      'Challenge yourself with practice questions tailored to your job description.',
    href: 'questions',
  },
  {
    label: 'Practice Interviewing',
    description: 'Simulate a real interview with AI-powered mock interviews.',
    href: 'interviews',
  },
  {
    label: 'Refine Your Resume',
    description:
      'Get expert feedback on your resume and improve your chances of landing an interview.',
    href: 'resume',
  },
  {
    label: 'Update Job Description',
    description: 'This should only be used for minor updates.',
    href: 'edit',
  },
];

const JobInfosPage = async ({ params }: Props) => {
  const { jobInfoId } = await params;

  const jobInfo = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobInformation = await getJobInfo(jobInfoId, userId);
      if (jobInformation == null) return notFound();
      return jobInformation;
    }
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href="/app">Dashboard</BackLink>

      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl">
              <SuspendedItem
                fallback={<Skeleton className="w-2/3" />}
                item={jobInfo}
                result={(j) => j.name}
              />
            </h1>
            <div className="flex gap-2">
              <SuspendedItem
                fallback={<Skeleton className="w-32" />}
                item={jobInfo}
                result={(j) => (
                  <Badge variant="secondary">
                    {formatExperienceLevel(j.experienceLevel)}
                  </Badge>
                )}
              />
              <SuspendedItem
                fallback={null}
                item={jobInfo}
                result={(j) => {
                  return (
                    j.title && <Badge variant="secondary">{j.title}</Badge>
                  );
                }}
              />
            </div>
          </div>
          <p className="text-muted-foreground line-clamp-3">
            <SuspendedItem
              fallback={
                <>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </>
              }
              item={jobInfo}
              result={(j) => j.description}
            />
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {options.map((option) => (
            <Link
              key={option.href}
              href={`/app/job-infos/${jobInfoId}/${option.href}`}
              className="hover:scale-[1.02] transition-[transform_opacity]"
            >
              <Card className="hover:shadow-lg group flex flex-row items-start justify-between h-full">
                <CardHeader className="flex-grow">
                  <CardTitle>{option.label}</CardTitle>
                  <CardDescription className="max-w-4/5">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ArrowRight className="size-6 group-hover:text-primary transition" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobInfosPage;

export async function getJobInfo(id: string, userId: string) {
  'use cache';
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
