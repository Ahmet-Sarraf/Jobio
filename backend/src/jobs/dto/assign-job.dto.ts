import { IsNotEmpty, IsString } from 'class-validator';

export class AssignJobDto {
  @IsString({ message: 'Freelancer ID metin formatında olmalıdır.' })
  @IsNotEmpty({ message: 'Freelancer ID boş olamaz.' })
  freelancerId: string;
}
