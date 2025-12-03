declare module 'sql.js' {
  export interface StatementIterator {
    step(): boolean;
    get(): any[];
    getAsObject(): any;
    bind(values?: any[]): boolean;
    free(): void;
  }

  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): any[];
    prepare(sql: string): StatementIterator;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer) => Database;
  }

  export default function initSqlJs(): Promise<SqlJsStatic>;
}
