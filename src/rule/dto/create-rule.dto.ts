import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRuleDto {
  @IsOptional()
  @ApiProperty()
  @IsUUID()
  seedType: string;
  @IsNotEmpty()
  @ApiProperty()
  @IsUUID()
  fertilizerType: string;
  @IsOptional()
  @ApiProperty()
  @IsNumber()
  seedPerAcre: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  fertilizerPerAcre: number;
}
