import { db } from '@/drizzle/db';
import { QuestionTable } from '@/drizzle/schema';
import { asc, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobInfoIdTag } from '../jobInfos/dbCache';
import {
  getQuestionIdTag,
  getQuestionJobInfoTag,
  revalidateQuestionCache,
} from './dbCache';

export async function getQuestions(jobInfoId: string) {
  'use cache';
  cacheTag(getQuestionJobInfoTag(jobInfoId));

  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  });
}
export async function getQuestion(questionId: string, userId: string) {
  'use cache';
  cacheTag(getQuestionIdTag(questionId));

  const question = await db.query.QuestionTable.findFirst({
    where: eq(QuestionTable.id, questionId),
    with: { jobInfo: { columns: { userId: true, id: true } } },
  });

  if (question == null) return null;
  cacheTag(getJobInfoIdTag(question.jobInfo.id));

  if (question.jobInfo.userId !== userId) return null;

  return question;
}

export async function insertQuestion(
  question: typeof QuestionTable.$inferInsert
) {
  const [newQuestion] = await db
    .insert(QuestionTable)
    .values(question)
    .returning({
      id: QuestionTable.id,
      jobInfoId: QuestionTable.jobInfoId,
    });

  revalidateQuestionCache({
    id: newQuestion.id,
    jobInfoId: newQuestion.jobInfoId,
  });

  return newQuestion;
}
