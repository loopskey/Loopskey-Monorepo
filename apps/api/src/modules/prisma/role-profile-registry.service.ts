import { Injectable } from "@nestjs/common";

export type RoleProfileHandler = {
  provision(userId: string, atomicContext?: object): Promise<void>;
  project(userId: string): Promise<Record<string, unknown> | null>;
};

@Injectable()
export class RoleProfileRegistry {
  private readonly handlers = new Map<string, RoleProfileHandler>();

  register(role: string, handler: RoleProfileHandler) {
    this.handlers.set(role, handler);
  }

  async provision(role: string, userId: string, atomicContext?: object) {
    await this.handlers.get(role)?.provision(userId, atomicContext);
  }

  project(role: string, userId: string) {
    return this.handlers.get(role)?.project(userId) ?? Promise.resolve(null);
  }
}
