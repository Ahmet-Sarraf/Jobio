import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get('freelancer/:freelancerId')
  findByFreelancer(@Param('freelancerId') freelancerId: string) {
    return this.reviewsService.findByFreelancer(freelancerId);
  }
}
