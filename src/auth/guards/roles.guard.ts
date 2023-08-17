import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; // No roles defined, access allowed

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Provided by JwtAuthGuard

    return roles.includes(user.role); // Check if user role is allowed
  }
}
