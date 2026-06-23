declare module 'json2csv' {
  export class Parser {
    constructor(opts?: { fields?: string[] });
    parse(data: object[]): string;
  }
}

declare module 'archiver' {
  import { Transform } from 'stream';
  interface ArchiverOptions { zlib?: { level?: number } }
  interface Archiver extends Transform {
    append(source: string | NodeJS.ReadableStream, name: { name: string }): this;
    finalize(): Promise<void>;
    pipe(dest: NodeJS.WritableStream): NodeJS.WritableStream;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
  function archiver(format: 'zip', opts?: ArchiverOptions): Archiver;
  export = archiver;
}
