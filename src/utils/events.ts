export type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) {
      return false;
    }
    this.events[event].forEach(callback => callback(...args));
    return true;
  }

  removeListener(event: string, callback: EventCallback): this {
    if (!this.events[event]) {
      return this;
    }
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    return this;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  once(event: string, callback: EventCallback): this {
    const onceCallback = (...args: any[]) => {
      this.removeListener(event, onceCallback);
      callback.apply(this, args);
    };
    return this.on(event, onceCallback);
  }

  listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }

  listeners(event: string): EventCallback[] {
    return this.events[event] || [];
  }
}