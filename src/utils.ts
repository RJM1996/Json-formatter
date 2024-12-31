import { parse as parseJsonc } from 'jsonc-parser';

export const formatJson = (input: string): any => {
  try {
    // 首先尝试作为JSONC解析
    const parsed = parseJsonc(input);
    return parsed;
  } catch {
    try {
      // 如果JSONC解析失败，尝试作为JS对象解析
      // eslint-disable-next-line no-eval
      return eval('(' + input + ')');
    } catch {
      throw new Error('Invalid JSON or JavaScript object');
    }
  }
};
