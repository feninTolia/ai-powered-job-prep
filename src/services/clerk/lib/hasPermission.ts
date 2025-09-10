import { auth } from '@clerk/nextjs/server';

type Permission =
  | 'unlimited_resume_analysis'
  | 'unlimited_questions'
  | 'unlimited_interviews'
  | '5_questions'
  | '1_interview';

export async function hasPermission(permission: Permission) {
  const { has } = await auth();
  return has({ feature: permission });
}
