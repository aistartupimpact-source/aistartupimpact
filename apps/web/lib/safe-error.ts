export function safeError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${context}]`, error instanceof Error ? error.message : 'Unknown error');
  } else {
    console.error(`[${context}]`, error);
  }
}
