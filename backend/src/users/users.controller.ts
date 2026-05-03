import { Controller, Get, Patch, Body, Req, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @Get('freelancers')
  getAllFreelancers(@Req() req: any) {
    return this.usersService.getAllFreelancers(req.query);
  }

  @Get('freelancer/:id')
  getFreelancerProfile(@Param('id') id: string) {
    return this.usersService.getFreelancerProfile(id);
  }
}
