import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from './schemas/pokemon.schema';
import { ReleaseHistory } from './schemas/release-history.schema';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CatchPokemonDto } from './dto/catch-pokemon.dto';
import { AllPokemon } from './schemas/pokemons.schema';

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  images: {
    front_default: string;
  };
  types: { slot: number; type: { name: string; url: string } }[];
  abilities: { ability: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string; url: string } }[];
  moves: { move: { name: string; url: string } }[];
}
@Injectable()
export class PokemonService {
  private allPokemonList: { name: string; url: string }[] = [];

  private pokemonDetailCache: Record<string, PokemonDetail> = {};


  constructor(
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
    @InjectModel(ReleaseHistory.name) private historyModel: Model<ReleaseHistory>,
    @InjectModel(AllPokemon.name) private allPokemonModel: Model<AllPokemon>,
    private readonly httpService: HttpService,) { }


  async preloadAllPokemonData() {
    if (this.allPokemonList.length > 0) {
      console.log('✔️ Pokémon sudah pernah dipreload. Skip.');
      return;
    }

    console.log('🔄 Mengambil daftar Pokémon dari PokeAPI...');

    const response = await lastValueFrom(
      this.httpService.get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
    );

    this.allPokemonList = response.data.results;
    console.log(`📥 Jumlah Pokémon ditemukan: ${this.allPokemonList.length}`);

    const detailedPokemonList = await Promise.all(
      this.allPokemonList.map(async (pokemon, index) => {
        try {
          const detail = await lastValueFrom(this.httpService.get(pokemon.url));
          const data = detail.data;

          const formatted = {
            pokeId: data.id,
            name: data.name,
            imageUrl: data.sprites.front_default,
            types: data.types.map(t => t.type.name),
            height: data.height / 10,
            weight: data.weight / 10,
            abilities: data.abilities.map(a => a.ability.name),
            experience: data.base_experience,
            stats: Object.fromEntries(data.stats.map(s => [s.stat.name, s.base_stat])),
            moves: data.moves.map(m => m.move.name),
          };

          this.pokemonDetailCache[data.name] = {
            ...data,
            images: {
              front_default: data.sprites.front_default,
            },
          };

          if ((index + 1) % 100 === 0) {
            console.log(`✅ ${index + 1} Pokémon berhasil diproses`);
          }

          return formatted;
        } catch (err) {
          console.warn(`⚠️ Gagal mengambil detail Pokémon: ${pokemon.name}`);
          return null;
        }
      })
    );


    const filtered = detailedPokemonList.filter(p => p !== null);
    console.log(`📦 Total Pokémon siap disimpan: ${filtered.length}`);

    try {
      await this.allPokemonModel.insertMany(filtered, { ordered: false });
      console.log('✅ Semua Pokémon berhasil disimpan ke database');
    } catch (error) {
      console.error('❌ Gagal menyimpan ke database:', error.message);
    }
  }


  async findAll(page: number = 1, limit: number = 21) {
    await this.preloadAllPokemonData();

    const offset = (page - 1) * limit;
    const paginated = this.allPokemonList.slice(offset, offset + limit);

    const detailedPokemons = await Promise.all(
      paginated.map(async (poke) => {
        const key = poke.name.toLowerCase();
        let data = this.pokemonDetailCache[key];
        if (!data) {
          try {
            const response = await lastValueFrom(this.httpService.get(poke.url));
            const apiData = response.data;
            // simpan ke cache dengan key lowercase dan gambar dari sprites.front_default
            this.pokemonDetailCache[apiData.name.toLowerCase()] = {
              ...apiData,
              images: { front_default: apiData.sprites.front_default },
            };
            data = this.pokemonDetailCache[apiData.name.toLowerCase()];
          } catch {
            return null;
          }
        }

        return {
          pokeId: data.id,
          name: data.name,
          types: data.types.map(t => t.type.name),
          height: data.height / 10,
          weight: data.weight / 10,
          abilities: data.abilities.map(a => a.ability.name),
          experience: data.base_experience,
          imageUrl: data.images.front_default,
          stats: Object.fromEntries(data.stats.map(s => [s.stat.name, s.base_stat])),
          moves: data.moves.map(m => m.move.name),
        };
      }),
    );

    return {
      count: this.allPokemonList.length,
      data: detailedPokemons.filter(p => p !== null),
    };
  }

  async findAllWithOffset(offset: number, limit: number) {
    return this.allPokemonModel.find()
      .skip(offset)
      .limit(limit)
      .select('name imageUrl')
      .exec();
  }



  async findOne(name: string) {
    await this.preloadAllPokemonData();

    const key = name.toLowerCase();
    console.log('Looking for Pokemon:', key);
    console.log('Cache keys:', Object.keys(this.pokemonDetailCache).slice(0, 10));

    const data = this.pokemonDetailCache[key];
    if (!data) {
      throw new NotFoundException(`Pokemon '${name}' not found in cache`);
    }

    return {
      pokeId: data.id,
      name: data.name,
      imageUrl: data.images.front_default,
      about: {
        types: data.types.map(t => t.type.name),
        height: data.height / 10,
        weight: data.weight / 10,
        abilities: data.abilities.map(a => a.ability.name),
        experience: data.base_experience,
      },
      stats: Object.fromEntries(data.stats.map(s => [s.stat.name, s.base_stat])),
      moves: data.moves.map(m => m.move.name),
    };
  }


  // 🔹 Fungsi hanya untuk percobaan menangkap
  // pokemon.service.ts
  async tryCatchPokemon(name: string): Promise<boolean> {
    const chance = Math.random(); // 0.0 - 1.0
    const success = chance < 0.5; // 50% chance
    if (!success) throw new Error(`${name} berhasil kabur!`);
    return true;
  }

  async saveCaughtPokemon(name: string, dto: CatchPokemonDto) {
    const existing = await this.pokemonModel.findOne({ nickname: dto.nickname });
    if (existing) {
      throw new BadRequestException(`Nickname '${dto.nickname}' sudah digunakan.`);
    }

    const pokeData = await this.findOne(name);

    const created = new this.pokemonModel({
      pokeId: pokeData.pokeId,
      name: pokeData.name,
      nickname: dto.nickname,
      imageUrl: pokeData.imageUrl,
      about: pokeData.about,
      stats: {
        hp: pokeData.stats.hp,
        attack: pokeData.stats.attack,
        defense: pokeData.stats.defense,
        specialAttack: pokeData.stats['special-attack'],
        specialDefense: pokeData.stats['special-defense'],
        speed: pokeData.stats.speed,
      },
      moves: pokeData.moves,
      isOwned: true,
    });

    await created.save();

    return {
      message: `${pokeData.name} berhasil disimpan dengan nama '${dto.nickname}'!`,
      pokemon: created,
    };
  }



  async catchPokemon(name: string, nickname: string) {
    const pokemon = await this.allPokemonModel.findOne({ name });

    if (!pokemon) throw new NotFoundException('Pokemon not found');

    const newPokemon = new this.pokemonModel({
      pokemonName: name,
      nickname,
      imageUrl: pokemon.imageUrl,
      pokemonNumber: pokemon.pokeId,
      isOwned: true,
      captureIndex: Date.now(), // atau logic lain untuk urutan
    });

    return newPokemon.save();
  }

  async isPokemonOwned(name: string): Promise<boolean> {
    const owned = await this.pokemonModel.findOne({ name });
    return !!owned;
  }
  async getPokemonByName(name: string): Promise<AllPokemon> {
    await this.preloadAllPokemonData();
    // Cari dari collection preload (semua data Pokémon dari PokeAPI yang sudah disimpan)
    const pokemon = await this.allPokemonModel.findOne({ name: name.toLowerCase() });

    if (!pokemon) {
      throw new NotFoundException(`Pokemon dengan nama "${name}" tidak ditemukan.`);
    }

    return pokemon;
  }

  //🔹 Fungsi untuk menyimpan Pokémon yang sudah berhasil ditangkap
  // async saveCaught(name: string, dto: CatchPokemonDto) {
  //   // 🔍 Cek jika nickname sudah digunakan
  //   const existing = await this.pokemonModel.findOne({ nickname: dto.nickname });
  //   if (existing) {
  //     throw new BadRequestException(`Nickname '${dto.nickname}' sudah digunakan.`);
  //   }

  //   const pokeData = await this.findOne(name);

  //   const created = new this.pokemonModel({
  //     pokeId: pokeData.pokeId,
  //     name: pokeData.name,
  //     nickname: dto.nickname,
  //     imageUrl: pokeData.imageUrl,
  //     about: pokeData.about,
  //     stats: {
  //       hp: pokeData.stats.hp,
  //       attack: pokeData.stats.attack,
  //       defense: pokeData.stats.defense,
  //       specialAttack: pokeData.stats['special-attack'],
  //       specialDefense: pokeData.stats['special-defense'],
  //       speed: pokeData.stats.speed,
  //     },
  //     moves: pokeData.moves,
  //     isOwned: true,
  //   });

  //   await created.save();

  //   return {
  //     message: `${pokeData.name} berhasil disimpan dengan nama '${dto.nickname}'!`,
  //     pokemon: created,
  //   };
  // }


  async getMyPokemons() {
    return this.pokemonModel.find({ isOwned: true });
  }


  // 🔹 Hapus berdasarkan nickname
  async releasePokemonByNickname(nickname: string) {
    const pokemon = await this.pokemonModel.findOne({ nickname, isOwned: true });

    if (!pokemon) {
      throw new NotFoundException(`Pokemon dengan nickname '${nickname}' tidak ditemukan atau belum dimiliki`);
    }

    await this.historyModel.create({
      pokemonName: pokemon.name,
      nickname: pokemon.nickname,
      imageUrl: pokemon.imageUrl,
      pokeId: pokemon.pokeId,
      releaseDate: new Date(),
    });

    await pokemon.deleteOne();

    return { message: `Pokemon '${nickname}' berhasil dilepas dan dicatat ke riwayat.` };
  }


  async getReleaseHistory() {
    return this.historyModel.find().sort({ createdAt: -1 });

  }
  async getPokemonByNickname(nickname: string): Promise<Pokemon | null> {
    return this.pokemonModel.findOne({ nickname, isOwned: true });}
}
