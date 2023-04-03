export const findElementsDiff = (
  existingIds: Array<string>,
  requestIds: Array<string>
): Array<string> => {
  return existingIds.filter((existingId) => requestIds.indexOf(existingId) === -1)
}