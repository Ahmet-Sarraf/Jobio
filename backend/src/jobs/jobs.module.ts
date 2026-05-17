import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule, AiModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
