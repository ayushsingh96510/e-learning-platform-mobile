/**
 * Batch id of the logged-in student. It is used to load the classmates who
 * can be invited to a new study room (on the web app this is
 * user.roleInfo.batch.id).
 *
 * Connect this to the place where the mobile app keeps the logged-in user.
 * Until then it returns undefined, and rooms can be created without inviting
 * anyone.
 */
export function useStudentBatchId(): string | undefined {
  return undefined;
}
