import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Geçersiz veya eksik token. Lütfen Bearer token gönderiniz.');
    }

    const token = authHeader.split(' ')[1];
    
    // Supabase .getUser() otomatik olarak ES256 token doğrulamasını kendi public key'leri ile yapar.
    const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token geçersiz veya süresi dolmuş.');
    }

    // Controller'larda kullanılacak `req.user` objesini oluştur
    request.user = {
      id: user.id,
      email: user.email,
      // Metadata içerisine register sırasında eklediğimiz "user_role" bilgisi
      role: user.user_metadata?.user_role || 'FREELANCER',
    };

    return true;
  }
}
