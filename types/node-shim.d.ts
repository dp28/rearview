declare module "node:fs" {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
  export function readFileSync(path: string | URL, encoding: string): string;
  export function existsSync(path: string): boolean;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
}
declare module "node:child_process" {
  export function execFileSync(command: string, args?: string[], options?: { encoding?: BufferEncoding; maxBuffer?: number }): string;
}
declare module "node:http" {
  export interface IncomingMessage { url?: string; headers: Record<string, string | string[] | undefined>; method?: string; }
  export interface ServerResponse { setHeader(name: string, value: string): void; end(data?: string): void; }
  export interface Server { listen(port: number): void; }
  export function createServer(listener: (req: IncomingMessage, res: ServerResponse) => void): Server;
}
declare module "node:test" { export default function test(name: string, fn: () => void | Promise<void>): void; }
declare module "node:assert/strict" { const assert: any; export default assert; }
type BufferEncoding = "utf8" | string;
declare const Buffer: { from(input: string, encoding?: string): { toString(encoding?: string): string } };
declare const process: { argv: string[]; cwd(): string; exitCode?: number; env: Record<string, string | undefined> };
declare namespace NodeJS { interface ProcessEnv { [key: string]: string | undefined; } }
