export function formatJson(input: string): any {
  // 移除多行注释和单行注释，但保留字符串中的注释
  const removeComments = (str: string): string => {
    let inString = false;
    let inMultilineComment = false;
    let inSinglelineComment = false;
    let newStr = '';
    let prev = '';
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const next = str[i + 1] || '';

      if (!inMultilineComment && !inSinglelineComment) {
        if (char === '"' && prev !== '\\') {
          inString = !inString;
        }
      }

      if (!inString) {
        if (!inMultilineComment && !inSinglelineComment) {
          if (char === '/' && next === '*') {
            inMultilineComment = true;
            i++;
            continue;
          } else if (char === '/' && next === '/') {
            inSinglelineComment = true;
            i++;
            continue;
          }
        } else if (inMultilineComment) {
          if (char === '*' && next === '/') {
            inMultilineComment = false;
            i++;
            continue;
          }
        } else if (inSinglelineComment && (char === '\n' || char === '\r')) {
          inSinglelineComment = false;
        }
      }

      if (!inMultilineComment && !inSinglelineComment) {
        newStr += char;
      }
      
      prev = char;
    }
    
    return newStr.trim();
  };

  // 处理特殊的 JS 语法
  const processJsSpecialSyntax = (str: string): string => {
    // 处理 undefined
    str = str.replace(/:\s*undefined\b/g, ': null');
    // 处理属性名没有引号的情况
    str = str.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    // 处理单引号字符串
    str = str.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    return str;
  };

  // 尝试将输入解析为 JS 对象
  const parseJsObject = (str: string): any => {
    try {
      // 首先尝试直接解析 JSON
      return JSON.parse(str);
    } catch (e) {
      try {
        // 处理 JS 对象特殊语法并重试
        const processedStr = processJsSpecialSyntax(str);
        return JSON.parse(processedStr);
      } catch (e2) {
        try {
          // 如果上述方法都失败，使用 Function 构造器
          // eslint-disable-next-line no-new-func
          return (new Function(`return ${str}`))();
        } catch (e3) {
          throw new Error('无法解析输入内容');
        }
      }
    }
  };

  try {
    if (!input.trim()) {
      return null;
    }

    // 移除注释
    const cleanInput = removeComments(input);
    
    // 尝试解析
    return parseJsObject(cleanInput);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`解析错误: ${error.message}`);
    }
    throw new Error('无法解析输入内容');
  }
}
