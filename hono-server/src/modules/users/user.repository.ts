import { UserModel, type UserDocument } from './user.model';
import type { UserRole } from './user.roles';

type PaginationOptions = {
  page: number;
  limit: number;
};

type UserListResult = {
  data: UserDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<UserDocument> {
  const user = await UserModel.create(data);
  return user.toObject() as UserDocument;
}

export async function findByEmail(email: string): Promise<UserDocument | null> {
  const user = await UserModel.findOne({ email }).lean<UserDocument | null>();
  return user;
}

export async function findById(userId: string): Promise<UserDocument | null> {
  const user = await UserModel.findById(userId).lean<UserDocument | null>();
  return user;
}

export async function listUsers({ page, limit }: PaginationOptions): Promise<UserListResult> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean<UserDocument[]>(),
    UserModel.countDocuments()
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function updateUser(
  userId: string,
  data: Partial<{ name: string; email: string; password: string; role: UserRole }>
): Promise<UserDocument | null> {
  return UserModel.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true
  }).lean<UserDocument | null>();
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await UserModel.findByIdAndDelete(userId);
  return Boolean(result);
}
