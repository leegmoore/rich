/**
 * A null file object that discards all writes.
 * Useful for testing or when you want to suppress output.
 */
export class NullFile {
  write(_data: string): void {
    // Discard all writes
  }

  flush(): void {
    // No-op
  }

  close(): void {
    // No-op
  }
}

/**
 * Singleton instance of NullFile.
 */
export const NULL_FILE = new NullFile();

