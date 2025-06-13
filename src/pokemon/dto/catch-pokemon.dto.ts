import { IsNotEmpty, IsString } from 'class-validator';

export class CatchPokemonDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
  