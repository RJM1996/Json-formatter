import React, { useState } from 'react';
import { Layout, Button, message, Space, Radio } from 'antd';
import Editor from '@monaco-editor/react';
import './App.css';

const { Header, Content } = Layout;

const App = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const formatJSON = () => {
    try {
      // 移除注释和多余空白
      const cleanInput = input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      // 尝试解析为JavaScript对象
      let parsed;
      try {
        // eslint-disable-next-line no-eval
        parsed = eval('(' + cleanInput + ')');
      } catch {
        // 如果eval失败，尝试作为JSON解析
        parsed = JSON.parse(cleanInput);
      }
      
      setOutput(JSON.stringify(parsed, null, collapsed ? 0 : 2));
      message.success('格式化成功！');
    } catch (error) {
      message.error('格式化失败：' + error.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      message.success('已复制到剪贴板！');
    });
  };

  const toggleCollapse = (e) => {
    const isCollapsed = e.target.value === 'collapsed';
    setCollapsed(isCollapsed);
    if (output) {
      try {
        const parsed = JSON.parse(output);
        setOutput(JSON.stringify(parsed, null, isCollapsed ? 0 : 2));
      } catch (error) {
        message.error('展开/收起失败：' + error.message);
      }
    }
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <h1>JSON 格式化工具</h1>
      </Header>
      <Content className="content">
        <div className="editor-container">
          <div className="editors-wrapper">
            <div className="editor-panel">
              <div className="panel-header">
                <h3>输入（支持 JSON、JSONC 和 JS 对象）</h3>
                <Button type="primary" onClick={formatJSON}>
                  格式化
                </Button>
              </div>
              <Editor
                height="calc(100vh - 200px)"
                defaultLanguage="json"
                value={input}
                onChange={setInput}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true
                }}
              />
            </div>
            <div className="editor-panel">
              <div className="panel-header">
                <h3>格式化结果</h3>
                <Space>
                  <Radio.Group value={collapsed ? 'collapsed' : 'expanded'} onChange={toggleCollapse}>
                    <Radio.Button value="expanded">展开</Radio.Button>
                    <Radio.Button value="collapsed">收起</Radio.Button>
                  </Radio.Group>
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
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true
                }}
              />
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
