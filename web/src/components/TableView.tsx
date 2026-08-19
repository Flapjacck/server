export type Column<T> = {
  key: keyof T & string;
  label: string;
  format?: (value: T[keyof T], row: T) => string;
};

type Props<T extends object> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
};

export function TableView<T extends object>({ columns, rows, rowKey }: Props<T>) {
  if (rows.length === 0) {
    return <p className="empty">no rows in bay</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row)} style={{ animationDelay: `${index * 40}ms` }}>
              {columns.map((column) => {
                const raw = row[column.key];
                const text = column.format ? column.format(raw, row) : String(raw ?? "");
                return <td key={column.key}>{text}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
