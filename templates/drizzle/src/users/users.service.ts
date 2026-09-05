import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { InjectDatabase } from '../database/database.decorators';
import type { DrizzleDatabase } from '../database/database.types';
import {
  users,
  type NewUser,
} from '../database/schema';
import { Role } from '../common/constants/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectDatabase()
    private readonly database: DrizzleDatabase,
  ) { }

  async create(
    dto: CreateUserDto,
  ): Promise<UserEntity> {
    const [existing] = await this.database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    await this.database.insert(users).values({
      id,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? Role.USER,
    });

    return this.findOne(id);
  }

  async findAll(query: FindUsersQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
    } = query;

    const filters: SQL[] = [];

    if (role) {
      filters.push(eq(users.role, role));
    }

    if (search) {
      const searchValue = `%${search}%`;

      const searchCondition = or(
        sql<boolean>`
            lower(${users.name})
            like lower(${searchValue})
          `,
        sql<boolean>`
            lower(${users.email})
            like lower(${searchValue})
          `,
      );

      if (searchCondition) {
        filters.push(searchCondition);
      }
    }

    const where =
      filters.length > 0
        ? and(...filters)
        : undefined;

    const [data, totalResult] = await Promise.all([
      this.database
        .select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),

      this.database
        .select({
          value: count(),
        })
        .from(users)
        .where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return {
      data: data.map(
        (user) => new UserEntity(user),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserEntity> {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return new UserEntity(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserEntity> {
    await this.findOne(id);

    const {
      password,
      ...updateFields
    } = dto;

    const data: Partial<NewUser> = {
      ...updateFields,
      updatedAt: new Date(),
    };

    if (password) {
      data.passwordHash = await bcrypt.hash(
        password,
        10,
      );
    }

    await this.database
      .update(users)
      .set(data)
      .where(eq(users.id, id));

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.database
      .delete(users)
      .where(eq(users.id, id));

    return {
      message: 'User deleted successfully',
    };
  }

  async updateAvatar(
    id: string,
    avatarUrl: string,
  ): Promise<UserEntity> {
    await this.findOne(id);

    await this.database
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return this.findOne(id);
  }
}
