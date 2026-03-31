import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString({ message: 'İş ID metin formatında olmalıdır.' })
  @IsNotEmpty({ message: 'İş ID boş olamaz.' })
  jobId: string;

  @IsNumber({}, { message: 'Puan sayısal bir değer olmalıdır.' })
  @Min(1, { message: 'Puan en az 1 olmalıdır.' })
  @Max(10, { message: 'Puan en fazla 10 olmalıdır.' })
  score: number;

  @IsString({ message: 'Yorum metin formatında olmalıdır.' })
  @IsNotEmpty({ message: 'Yorum boş olamaz.' })
  comment: string;
}
