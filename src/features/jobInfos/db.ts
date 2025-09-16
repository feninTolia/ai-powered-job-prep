import { db } from '@/drizzle/db';
import { JobInfoTable } from '@/drizzle/schema';
import { getJobInfoIdTag, revalidateJobInfoCache } from './dbCache';
import { and, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

export async function insertJobInfo(jobInfo: typeof JobInfoTable.$inferInsert) {
  const [newJobInfo] = await db.insert(JobInfoTable).values(jobInfo).returning({
    id: JobInfoTable.id,
    userId: JobInfoTable.userId,
  });

  revalidateJobInfoCache(newJobInfo);

  return newJobInfo;
}

export async function updateJobInfo(
  id: string,
  jobInfo: Partial<typeof JobInfoTable.$inferInsert>
) {
  const [updatedJobInfo] = await db
    .update(JobInfoTable)
    .set(jobInfo)
    .where(eq(JobInfoTable.id, id))
    .returning({
      id: JobInfoTable.id,
      userId: JobInfoTable.userId,
    });

  revalidateJobInfoCache(updatedJobInfo);

  return updatedJobInfo;
}

export async function getJobInfo(id: string, userId: string) {
  'use cache';
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
