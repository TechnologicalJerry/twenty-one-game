import { HttpError } from '../../lib/http-error';
import { hashPassword } from '../../lib/password';
import type { AuthUser } from '../../types/hono';
import {
  createUser,
  deleteUser,
  findByEmail,
  findById,
  listUsers,
  updateUser
} from './user.repository';
import type { CreateUserInput, UpdateUserInput } from './user.schemas';
import { ROLE_HIERARCHY, type UserRole } from './user.roles';

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
};

function toUserResponse(user: {
  _id: { toString(): string } | string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}): UserResponse {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function hasRoleAtLeast(currentRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === 'admin') {
    return true;
  }

  if (actorRole === 'manager') {
    return targetRole === 'lead' || targetRole === 'user';
  }

  return false;
}

export async function registerUser(input: CreateUserInput): Promise<UserResponse> {
  const existingUser = await findByEmail(input.email.toLowerCase());

  if (existingUser) {
    throw new HttpError(409, 'Email address is already in use');
  }

  const hashedPassword = await hashPassword(input.password);
  const createdUser = await createUser({
    ...input,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    role: input.role ?? 'user'
  });

  return toUserResponse(createdUser);
}

export async function createUserByAdmin(input: CreateUserInput, actor: AuthUser): Promise<UserResponse> {
  if (!hasRoleAtLeast(actor.role, 'manager')) {
    throw new HttpError(403, 'Insufficient permissions to create users');
  }

  const requestedRole = input.role ?? 'user';

  if (!canManageRole(actor.role, requestedRole)) {
    throw new HttpError(403, 'You cannot assign this role');
  }

  return registerUser({
    ...input,
    role: requestedRole
  });
}

export async function getUserById(userId: string): Promise<UserResponse> {
  const user = await findById(userId);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return toUserResponse(user);
}

export async function getUsers(page: number, limit: number) {
  const result = await listUsers({ page, limit });

  return {
    ...result,
    data: result.data.map((user) => toUserResponse(user))
  };
}

export async function patchUser(
  userId: string,
  actor: AuthUser,
  input: UpdateUserInput
): Promise<UserResponse> {
  const targetUser = await findById(userId);

  if (!targetUser) {
    throw new HttpError(404, 'User not found');
  }

  const isSelf = actor.sub === userId;
  const isPrivileged = hasRoleAtLeast(actor.role, 'manager');

  if (!isSelf && !isPrivileged) {
    throw new HttpError(403, 'You can only update your own account');
  }

  if (!isSelf && isPrivileged && !canManageRole(actor.role, targetUser.role)) {
    throw new HttpError(403, 'You cannot update this user');
  }

  const payload: Partial<{ name: string; email: string; password: string; role: UserRole }> = {
    ...input
  };

  if (input.role) {
    if (!isPrivileged) {
      throw new HttpError(403, 'You are not allowed to change roles');
    }

    if (!canManageRole(actor.role, input.role)) {
      throw new HttpError(403, 'You cannot assign this role');
    }

    payload.role = input.role;
  }

  if (input.email) {
    const normalizedEmail = input.email.toLowerCase();
    const userWithEmail = await findByEmail(normalizedEmail);

    if (userWithEmail && String(userWithEmail._id) !== userId) {
      throw new HttpError(409, 'Email address is already in use');
    }

    payload.email = normalizedEmail;
  }

  if (input.password) {
    payload.password = await hashPassword(input.password);
  }

  const updatedUser = await updateUser(userId, payload);

  if (!updatedUser) {
    throw new HttpError(404, 'User not found');
  }

  return toUserResponse(updatedUser);
}

export async function removeUser(userId: string, actor: AuthUser): Promise<void> {
  const targetUser = await findById(userId);

  if (!targetUser) {
    throw new HttpError(404, 'User not found');
  }

  const isSelf = actor.sub === userId;

  if (isSelf) {
    const deleted = await deleteUser(userId);
    if (!deleted) {
      throw new HttpError(404, 'User not found');
    }
    return;
  }

  if (!hasRoleAtLeast(actor.role, 'manager')) {
    throw new HttpError(403, 'You can only delete your own account');
  }

  if (!canManageRole(actor.role, targetUser.role)) {
    throw new HttpError(403, 'You cannot delete this user');
  }

  const deleted = await deleteUser(userId);

  if (!deleted) {
    throw new HttpError(404, 'User not found');
  }
}
