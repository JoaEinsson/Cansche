export type Listener<T> = (data: T) => void;

export class Observable<T> {
  private listeners: Set<Listener<T>> = new Set();

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  public unsubscribe(listener: Listener<T>): void {
    this.listeners.delete(listener);
  }

  public notify(data: T): void {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}
