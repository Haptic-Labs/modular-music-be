export const chunkArray = <T>(array: T[], size = 1): T[][] => {
  const result: T[][] = [];
  const intSize = Math.floor(size);

  if (!array.length || intSize < 1) return result;

  for (let i = 0; i < array.length; i += intSize) {
    result.push(array.slice(i, i + intSize));
  }
  return result;
};
