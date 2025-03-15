export interface RecordedNote {
  id: string;
  name: string;
  duration: number;
  timeStamp: number;
  startTime: number;
}

export interface NoteRecord {
  title: string | null;
  description: string | null;
  record: RecordedNote[] | null;
  position: { x: number; y: number } | null;
  createTime: string | null;
}

export interface DialogInput {
  title: string;
  description: string;
}
