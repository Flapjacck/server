export type StringRow = {
  id: number;
  value: string;
  created_at: string;
};

export type TableName = "strings";

export const TABLES: { name: TableName; path: string }[] = [
  { name: "strings", path: "/strings" },
];
