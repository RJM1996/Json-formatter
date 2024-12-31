import React, { useState, useEffect, useCallback } from "react";
import { Layout, Button, message, Space } from "antd";
import Editor from "@monaco-editor/react";
import { formatJson } from "./utils";
import "./App.css";

const { Header, Content } = Layout;

interface FoldingRange {
  start: number;
  end: number;
  expanded: boolean;
}

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [foldingRanges, setFoldingRanges] = useState<FoldingRange[]>([]);

  const formatWithIndent = useCallback((obj: any, comments: { [key: string]: string } = {}) => {
    const addComments = (str: string) => {
      const lines = str.split("\n");
      let depth = 0;
      const result = lines.map((line) => {
        // 计算当前行的缩进深度
        const matches = line.match(/^[\s]*/);
        if (matches) {
          depth = matches[0].length / 2;
        }

        // 检查是否有对应深度的注释
        const comment = comments[depth];
        if (comment) {
          return `${line} // ${comment}`;
        }
        return line;
      });
      return result.join("\n");
    };

    try {
      const formatted = JSON.stringify(obj, null, 2);
      return addComments(formatted);
    } catch (error) {
      console.error("Formatting error:", error);
      return "";
    }
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      setFoldingRanges([]);
      return;
    }

    try {
      const parsed = formatJson(input);
      const formatted = formatWithIndent(parsed);
      setOutput(formatted);

      // 更新折叠范围的计算方法
      if (editorInstance) {
        const model = editorInstance.getModel();
        if (model) {
          // 使用 Monaco 的内置折叠范围提供器
          const ranges = model.getLinesContent().reduce((acc: FoldingRange[], line: string, index: number) => {
            // 检测开始的大括号
            if (line.includes('{')) {
              const startLine = index + 1;
              // 寻找匹配的结束大括号
              let depth = 1;
              let endLine = startLine;
              
              for (let i = index + 1; i < model.getLineCount(); i++) {
                const currentLine = model.getLineContent(i + 1);
                if (currentLine.includes('{')) depth++;
                if (currentLine.includes('}')) depth--;
                
                if (depth === 0) {
                  endLine = i + 1;
                  acc.push({
                    start: startLine,
                    end: endLine,
                    expanded: true
                  });
                  break;
                }
              }
            }
            return acc;
          }, []);
          
          setFoldingRanges(ranges);
        }
      }
    } catch (error) {
      console.error("Parsing error:", error);
      setOutput("");
    }
  }, [input, editorInstance, formatWithIndent]);

  const handleEditorDidMount = (editor: any) => {
    console.log("Editor mounted:", editor);
    setEditorInstance(editor);
  };

  const expandAll = () => {
    if (editorInstance) {
      editorInstance.getAction("editor.unfoldAll").run();
    }
  };

  const collapseAll = () => {
    if (editorInstance) {
      editorInstance.getAction("editor.foldAll").run();
    }
  };

  const addComment = () => {
    if (!editorInstance) return;

    const selection = editorInstance.getSelection();
    const model = editorInstance.getModel();
    if (!selection || !model) return;

    const lineContent = model.getLineContent(selection.startLineNumber);
    const lineWithComment = `${lineContent} // 添加注释`;

    model.pushEditOperations(
      [],
      [
        {
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: lineContent.length + 1,
          },
          text: lineWithComment,
        },
      ],
      () => null
    );
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      message.success("已复制到剪贴板！");
    });
  };

  const addJsObjectExample = () => {
    const example = `{
    // 这是一个注释
    name: 'test',
    value: undefined,
    /* 这是多行注释
       第二行 */
    data: {
      test: "value"
    }
  }`;
    setInput(example);
  };

  const addJsoncExample = () => {
    const example = `{
    // 这是一个 JSONC 示例
    "name": "example",
    "description": "这是一个带注释的 JSON", // 行尾注释
    /* 多行注释
       支持嵌套对象 */
    "config": {
      "enabled": true,
      "items": [
        "item1",
        "item2"  // 数组元素注释
      ],
      "options": {
        "debug": false,  // 调试模式
        "timeout": 1000  // 超时时间
      }
    }  // 支持尾随逗号
  }`;
    setInput(example);
  };

  return (
    <Layout className="layout">
      <Content className="content">
        <div className="editors-wrapper">
          <div className="editor-panel input-panel">
            <div className="panel-header">
              <h3>输入（支持 JSON、JSONC 和 JS 对象）</h3>
              <Space>
                <Button onClick={addJsObjectExample}>JS对象示例</Button>
                <Button onClick={addJsoncExample}>JSONC示例</Button>
              </Space>
            </div>
            <Editor
              height="calc(100vh - 64px)"
              defaultLanguage="json"
              value={input}
              onChange={(value) => setInput(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                wordWrap: "on",
                automaticLayout: true,
                folding: true,
              }}
            />
          </div>
          <div className="editor-panel output-panel">
            <div className="panel-header">
              <h3>格式化结果</h3>
              <Space>
                <Button onClick={expandAll}>展开全部</Button>
                <Button onClick={collapseAll}>折叠全部</Button>
                
                <Button onClick={copyToClipboard} disabled={!output}>
                  复制
                </Button>
              </Space>
            </div>
            <Editor
              height="calc(100vh - 64px)"
              defaultLanguage="json"
              value={output}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                wordWrap: "on",
                automaticLayout: true,
                folding: true,
                foldingStrategy: "indentation",
              }}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
