import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { Pokemon, PokemonSchema } from './schemas/pokemon.schema';
import { ReleaseHistory, ReleaseHistorySchema } from './schemas/release-history.schema';
import { HttpModule } from '@nestjs/axios';
import { AllPokemon, AllPokemonSchema } from './schemas/pokemons.schema'; 

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: AllPokemon.name, schema: AllPokemonSchema },
      { name: Pokemon.name, schema: PokemonSchema },
      { name: ReleaseHistory.name, schema: ReleaseHistorySchema },
    ]),
  ],
  controllers: [PokemonController],
  providers: [PokemonService],
  exports: [PokemonService],
  
})
export class PokemonModule {}
