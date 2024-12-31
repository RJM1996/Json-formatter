import React from 'react';
import { Space, Input, Tooltip } from 'antd';
import { CaretRightOutlined, CaretDownOutlined, CommentOutlined } from '@ant-design/icons';
import { CommentNode } from '../types';
import './JsonTreeNode.css';

interface JsonTreeNodeProps {
  node: CommentNode;
  onToggle: (path: string) => void;
  onCommentChange: (path: string, comment: string) => void;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
  node,
  onToggle,
  onCommentChange
}) => {
  const isObject = typeof node.value === 'object' && node.value !== null;
  const hasChildren = isObject && Array.isArray(node.value) && node.value.length > 0;

  const renderValue = () => {
    if (!isObject) {
      return <span className="json-value">{JSON.stringify(node.value)}</span>;
    }
    return null;
  };

  return (
    <div className="json-node" style={{ marginLeft: node.level * 20 }}>
      <Space>
        {hasChildren && (
          <span className="toggle-icon" onClick={() => onToggle(node.path)}>
            {node.isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </span>
        )}
        <span className="json-key">{node.key}:</span>
        {renderValue()}
        <Tooltip title="添加注释">
          <Input
            prefix={<CommentOutlined />}
            placeholder="添加注释"
            value={node.comment}
            onChange={(e) => onCommentChange(node.path, e.target.value)}
            className="comment-input"
          />
        </Tooltip>
      </Space>
      {hasChildren && node.isExpanded && (
        <div className="json-children">
          {node.value.map((child: CommentNode) => (
            <JsonTreeNode
              key={child.path}
              node={child}
              onToggle={onToggle}
              onCommentChange={onCommentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JsonTreeNode;
