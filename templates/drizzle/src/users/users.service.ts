import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) { }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      ...(dto.role ? { role: dto.role } : {}),
    });

    const savedUser = await this.usersRepository.save(user);

    return new UserEntity(savedUser);
  }

  async findAll(query: FindUsersQueryDto) {
    const { page = 1, limit = 10, search, role } = query;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        `(
            LOWER(user.name) LIKE LOWER(:search)
            OR LOWER(user.email) LIKE LOWER(:search)
          )`,
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map((user) => new UserEntity(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return new UserEntity(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    const { password, ...data } = dto;

    Object.assign(user, data);

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.usersRepository.save(user);

    return new UserEntity(updatedUser);
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.usersRepository.remove(user);

    return { message: 'Usuário removido com sucesso' };
  }

  async updateAvatar(id: string, avatarUrl: string) {
    const user = await this.findOne(id);

    user.avatarUrl = avatarUrl;

    const updatedUser = await this.usersRepository.save(user);

    return new UserEntity(updatedUser);
  }
}