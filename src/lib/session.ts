import { EventEmitter } from 'events';

class SessionManager extends EventEmitter {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  emitBlock(block: any) {
    this.emit('data', {
      type: 'block',
      block,
    });
  }

  updateBlock(blockId: string, patch: any[]) {
    this.emit('data', {
      type: 'updateBlock',
      blockId,
      patch,
    });
  }

  getAllBlocks(): any[] {
    return [];
  }

  getBlock(id: string): any | null {
    return null;
  }

  removeAllListeners(): this {
    super.removeAllListeners();
    return this;
  }

  static sessions: Map<string, SessionManager> = new Map();

  static createSession(): SessionManager {
    const id = crypto.randomUUID();
    const session = new SessionManager(id);
    this.sessions.set(id, session);
    return session;
  }

  static getSession(id: string): SessionManager | undefined {
    return this.sessions.get(id);
  }
}

export default SessionManager;
