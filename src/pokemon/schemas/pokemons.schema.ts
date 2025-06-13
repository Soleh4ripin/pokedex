import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AllPokemon extends Document {
  @Prop()
  pokeId: number;

  @Prop()
  name: string;

  @Prop()
  imageUrl: string;

  @Prop([String])
  types: string[];

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop([String])
  abilities: string[];

  @Prop()
  experience: number;

  @Prop({ type: Object })
  stats: Record<string, number>;

  @Prop([String])
  moves: string[];
}

export const AllPokemonSchema = SchemaFactory.createForClass(AllPokemon);
