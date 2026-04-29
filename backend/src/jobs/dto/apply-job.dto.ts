import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ApplyJobDto {
  @IsString({ message: 'Ön yazı metin formatında olmalıdır.' })
  @IsNotEmpty({ message: 'Ön yazı boş olamaz.' })
  @MinLength(10, { message: 'Ön yazı en az 10 karakter olmalıdır.' })
  coverLetter: string;
}
