export class Observable {
    listeners = new Set();
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.unsubscribe(listener);
    }
    unsubscribe(listener) {
        this.listeners.delete(listener);
    }
    notify(data) {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}
