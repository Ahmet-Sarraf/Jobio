import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async register(email: string, password: string, role: Role, name?: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Sign up on Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_role: role,
        },
      },
    });

    if (authError) {
      throw new BadRequestException(authError.message);
    }

    if (!authData.user) {
      throw new BadRequestException('Kullanıcı oluşturulamadı.');
    }

    // 2. Insert into Prisma / PostgreSQL Database
    // Note: To make things reliable, if DB fails we should probably revert Supabase,
    // but for simplicity we will just do Prisma insert.
    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email as string,
          name: name,
          role: role,
          freelancerProfile: role === Role.FREELANCER ? { create: {} } : undefined,
          customerProfile: role === Role.CUSTOMER ? { create: {} } : undefined,
        },
        include: {
          freelancerProfile: true,
          customerProfile: true,
        },
      });

      return {
        message: 'Kayıt başarılı',
        user: newUser,
        session: authData.session,
      };
    } catch (error: any) {
      // Cleanup Supabase user on failure to maintain consistency (Best effort)
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => null);
      throw new BadRequestException('Veritabanına kayıt sırasında hata oluştu: ' + error.message);
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Giriş başarılı',
      session: data.session,
    };
  }
}
