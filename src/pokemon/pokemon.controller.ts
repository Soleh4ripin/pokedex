import {
  Controller, Get, Param, Post, Query, Body, Delete, Render, Redirect,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CatchPokemonDto } from './dto/catch-pokemon.dto';
import { Pokemon } from './schemas/pokemon.schema';
import { GetPokemonsDto } from './dto/get-pokemons.dto';


@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) { }

  //  endpoint manual untuk preload        
  @Get('init')
  initPreload() {
    return this.pokemonService.preloadAllPokemonData();
  }

  // Ambil semua Pokémon (dengan pagination)
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 21;
    const offset = (pageNum - 1) * limitNum;
    return this.pokemonService.findAllWithOffset(offset, limitNum);
  }

  @Get('views')
  @Render('pokemon-list')
  async getPokemonList(
    @Query('page') page = '1',
    @Query('limit') limit = '21',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 21;

    const result = await this.pokemonService.findAll(pageNum, limitNum);
    const myCaught = await this.pokemonService.getMyPokemons();
    const saveCaught = myCaught.length;


    return {
      pokemons: result.data.map(pokemon => ({
        ...pokemon,
        isOwned: myCaught.some(caught => caught.name === pokemon.name),
      })),
      totalCount: result.count,
      currentPage: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(result.count / limitNum),
      saveCaught,
    };
  }
  @Get('detail/:name')
  @Render('detail')
  async renderDetail(@Param('name') name: string) {
    const pokemon = await this.pokemonService.getPokemonByName(name);
    const isOwned = await this.pokemonService.isPokemonOwned(name);
    return { pokemon, isOwned };
  }

  // @Get('my-pokemons')
  // @Render('my-pokemons')
  // async testCount() {
  //   return {
  //     saveCaught: 99,
  //   };
  // }

  @Get('my-pokemons')
  @Render('my-pokemons')
  async renderMyPokemons() {

    const pokemons = await this.pokemonService.getMyPokemons();

    // mapping data
    const pokemonsWithIndex = pokemons.map((p, i) => ({
      pokemonNumber: p.pokeId.toString().padStart(4, '0'),
      pokemonName: p.name,
      nickname: p.nickname,
      captureIndex: i + 1,
      imageUrl: p.imageUrl,
      pokemonId: p.pokeId,
    }));

    return { pokemons: pokemonsWithIndex, saveCaught: pokemons.length };
  }

  // Render halaman form catch pokemon by name
  @Get('catch/:name/save')
  @Render('catch')
  async renderCatchPokemonForm(@Param('name') name: string) {
    return { name };
  }
  @Post('catch/:name')
  async tryCatch(@Param('name') name: string) {
    const escaped = Math.random() < 0.5; // Simulasi 50% chance untuk berhasil menangkap
    if (escaped) {
      return { escaped: true };
    }

    return { success: true };
  }

  //redirect buat db
  @Post('catch/:name/save')
  @Redirect('/pokemon/my-pokemons')
  async save(@Param('name') name: string, @Body() dto: CatchPokemonDto) {

    return await this.pokemonService.saveCaughtPokemon(name, dto);
  }


  // @Post('release/:nickname')
  // @Redirect('/pokemon/my-pokemons')
  // async releasePokemon(@Param('nickname') nickname: string) {
  //   try {
  //     await this.pokemonService.releasePokemonByNickname(nickname);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     // Kalau error lain, bisa kasih log atau lempar error lain
  //     throw new InternalServerErrorException('Gagal melepaskan Pokemon');
  //   }
  // }


  @Get('release-history')
  @Render('history')
  async renderReleaseHistory() {
    const history = await this.pokemonService.getReleaseHistory();

    // Ambil jumlah Pokémon yang sudah ditangkap
    // Misalnya, kita ambil dari service yang sudah ada
    const myCaught = await this.pokemonService.getMyPokemons();
    const saveCaught = myCaught.length;

    // Pagination untuk riwayat pelepasan
    // Misalnya, kita batasi 10 riwayat per halaman
    const limitNum = 10;
    const currentPage = 1;
    const totalPages = Math.ceil(history.length / limitNum);
    // Ambil data untuk halaman pertama
    // const offset = (currentPage - 1) * limitNum;
    return {
      history,
      currentPage,
      limit: limitNum,
      totalPages,
      saveCaught,
    };
  }

  // Ambil detail satu Pokémon berdasarkan nama
  @Get(':name')
  async findOne(@Param('name') name: string) {
    return this.pokemonService.findOne(name);
  }


  // Lihat semua Pokémon yang dimiliki
  @Get('/my-pokemons')
  async myPokemons() {
    return this.pokemonService.getMyPokemons();
  }

  // Lepaskan Pokémon berdasarkan nickname
  @Delete('/release/:nickname')
  release(@Param('nickname') nickname: string) {
    return this.pokemonService.releasePokemonByNickname(nickname);
  }

  // Lihat riwayat pelepasan Pokémon
  @Get('/release/history')
  async releaseHistory() {
    return this.pokemonService.getReleaseHistory();
  }

  @Get('api/pokemons')
  async getMorePokemons(@Query() query: GetPokemonsDto) {
    return this.pokemonService.findAllWithOffset(query.offset, query.limit);
  }
}

