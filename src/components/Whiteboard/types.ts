export type DrawingLine = {
  path: number[];
  color: string;
  isEraser: boolean;
  strokeWidth: number;
  id: string;
};

export type WhiteboardState = {
  lines: DrawingLine[];
};
