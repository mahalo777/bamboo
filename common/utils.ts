/**
 * @description: 生成不重复随机id
 * @param {Number} n 需生成的长度
 * @return: {String} 随机id
 */
export const getNonDuplicateId = (n: number): string => {
  const str = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < n; i += 1) {
    result += str[Math.floor(Math.random() * str.length)];
  }
  return result;
};


