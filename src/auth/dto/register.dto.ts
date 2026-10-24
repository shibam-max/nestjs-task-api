import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsEmail()
  email: string;

  @ApiProperty() @IsString() @MinLength(2) @MaxLength(60)
  name: string;

  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(72)
  password: string;
}
