import { Controller, Get, Param, Render } from '@nestjs/common';
import { PokemonService } from './pokemon/pokemon.service';

@Controller()
export class AppController {
  constructor(private readonly pokemonService: PokemonService) {}

  // @Get()
  // @Render('home')
  // async home() {
  //   return await this.pokemonService.findAll(1, 20); // bisa tambahkan pagination nanti
  // }

  // @Get('pokemon/:name')
  // @Render('detail')
  // async detail(@Param('name') name: string) {
  //   const detail = await this.pokemonService.findOne(name);
  //   return { pokemon: detail };
  // }

  // @Get('my-pokemons')
  // @Render('my-pokemons')
  // async myPokemons() {
  //   const pokemons = await this.pokemonService.getMyPokemons();
  //   return { pokemons };
  // }

  // @Get('release-history')
  // @Render('release-history')
  // async history() {
  //   const histories = await this.pokemonService.getReleaseHistory();
  //   return { histories };
  // }
}
