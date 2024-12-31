import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, message, Space } from 'antd';
import Editor from '@monaco-editor/react';
import { formatJson } from './utils';
import './App.css';

const { Header, Content } = Layout;

interface FoldingRange {
  start: number;
  end: number;
  expanded: boolean;
}

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [foldingRanges, setFoldingRanges] = useState<FoldingRange[]>([]);
  
  const formatWithIndent = useCallback((obj: any, comments: { [key: string]: string } = {}) => {
    const addComments = (str: string) => {
      const lines = str.split('\n');
      let depth = 0;
      const result = lines.map(line => {
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
      return result.join('\n');
    };

    try {
      const formatted = JSON.stringify(obj, null, 2);
      return addComments(formatted);
    } catch (error) {
      console.error('Formatting error:', error);
      return '';
    }
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput('');
      setFoldingRanges([]);
      return;
    }

    try {
      const parsed = formatJson(input);
      const formatted = formatWithIndent(parsed);
      setOutput(formatted);
      
      // 计算折叠范围
      if (editorInstance) {
        const model = editorInstance.getModel();
        if (model) {
          const ranges = model.computeDecorationRanges();
          const newFoldingRanges = ranges
            .filter((range: any) => range.type === 'delimiter.bracket.json')
            .map((range: any) => ({
              start: range.startLineNumber,
              end: range.endLineNumber,
              expanded: true
            }));
          setFoldingRanges(newFoldingRanges);
        }
      }
    } catch (error) {
      console.error('Parsing error:', error);
    }
  }, [input, editorInstance, formatWithIndent]);

  const handleEditorDidMount = (editor: any) => {
    setEditorInstance(editor);
  };

  const expandAll = () => {
    if (editorInstance) {
      editorInstance.getAction('editor.unfoldAll').run();
    }
  };

  const collapseAll = () => {
    if (editorInstance) {
      editorInstance.getAction('editor.foldAll').run();
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
      [{
        range: {
          startLineNumber: selection.startLineNumber,
          startColumn: 1,
          endLineNumber: selection.startLineNumber,
          endColumn: lineContent.length + 1
        },
        text: lineWithComment
      }],
      () => null
    );
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      message.success('已复制到剪贴板！');
    });
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <h1>JSON 格式化工具</h1>
      </Header>
      <Content className="content">
        <div className="editors-wrapper">
          <div className="editor-panel">
            <div className="panel-header">
              <h3>输入（支持 JSON、JSONC 和 JS 对象）</h3>
            </div>
            <Editor
              height="calc(100vh - 200px)"
              defaultLanguage="json"
              value={input}
              onChange={(value) => setInput(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                folding: true
              }}
            />
          </div>
          <div className="editor-panel">
            <div className="panel-header">
              <h3>格式化结果</h3>
              <Space>
                <Button onClick={expandAll}>展开全部</Button>
                <Button onClick={collapseAll}>折叠全部</Button>
                <Button onClick={addComment}>添加注释</Button>
                <Button onClick={copyToClipboard} disabled={!output}>
                  复制
                </Button>
              </Space>
            </div>
            <Editor
              height="calc(100vh - 200px)"
              defaultLanguage="json"
              value={output}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                folding: true,
                foldingStrategy: 'indentation'
              }}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
