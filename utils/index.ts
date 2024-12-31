export function formatJson(input: string): any {
  // 移除多行注释和单行注释，但保留字符串中的注释
  const removeComments = (str: string): string => {
    let inString = false;
    let inMultilineComment = false;
    let inSinglelineComment = false;
    let newStr = '';
    let prev = '';
    let lastNonWhitespace = '';
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const next = str[i + 1] || '';

      // 处理字符串
      if (!inMultilineComment && !inSinglelineComment) {
        if ((char === '"' || char === "'") && prev !== '\\') {
          if (!inString) {
            inString = true;
            lastNonWhitespace = char;
          } else if (char === lastNonWhitespace) {
            inString = false;
          }
        }
      }

      if (!inString) {
        // 处理注释
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
            // 添加换行符以保持格式
            newStr += '\n';
            continue;
          }
        } else if (inSinglelineComment && (char === '\n' || char === '\r')) {
          inSinglelineComment = false;
          // 保留换行符
          newStr += char;
          continue;
        }
      }

      if (!inMultilineComment && !inSinglelineComment) {
        newStr += char;
        if (!/\s/.test(char)) {
          lastNonWhitespace = char;
        }
      }
      
      prev = char;
    }
    
    return newStr.trim();
  };

  // 处理特殊的 JS/JSONC 语法
  const processJsSpecialSyntax = (str: string): string => {
    // 处理尾随逗号
    str = str.replace(/,(\s*[}\]])/g, '$1');
    
    // 处理 undefined
    str = str.replace(/:\s*undefined\b/g, ': null');
    
    // 处理属性名没有引号的情况
    str = str.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    
    // 处理单引号字符串
    str = str.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    
    return str;
  };

  // 尝试将输入解析为对象
  const parseInput = (str: string): any => {
    // 移除 BOM 标记如果存在
    str = str.replace(/^\uFEFF/, '');
    
    try {
      // 首先尝试直接解析 JSON
      return JSON.parse(str);
    } catch (e1) {
      try {
        // 处理 JS/JSONC 特殊语法并重试
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

    // 移除注释并保持格式
    const cleanInput = removeComments(input);
    
    // 尝试解析
    return parseInput(cleanInput);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`解析错误: ${error.message}`);
    }
    throw new Error('无法解析输入内容');
  }
} 