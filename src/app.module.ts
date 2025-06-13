import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonModule } from './pokemon/pokemon.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/pokedex'),
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
