export interface CommentNode {
  key: string;
  value: any;
  comment?: string;
  isExpanded?: boolean;
  level: number;
  path: string;
}

export interface TreeState {
  [path: string]: {
    isExpanded: boolean;
    comment?: string;
  };
}
