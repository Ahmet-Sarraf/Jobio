import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString({ message: 'İş başlığı metin formatında olmalıdır.' })
  @IsNotEmpty({ message: 'İş başlığı boş olamaz.' })
  title: string;

  @IsString({ message: 'İş açıklaması metin formatında olmalıdır.' })
  @IsNotEmpty({ message: 'İş açıklaması boş olamaz.' })
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'Bütçe sayısal bir değer olmalıdır.' })
  budget?: number;
}
