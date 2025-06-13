import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class About {
  @Prop([String])
  types: string[];

  @Prop()
  weight: number;

  @Prop()
  height: number;

  @Prop([String])
  abilities: string[];

  @Prop()
  experience: number;
}

@Schema({ _id: false })
export class Stats {
  @Prop()
  hp: number;

  @Prop()
  attack: number;

  @Prop()
  defense: number;

  @Prop()
  specialAttack: number;

  @Prop()
  specialDefense: number;

  @Prop()
  speed: number;
}

export const AboutSchema = SchemaFactory.createForClass(About);
export const StatsSchema = SchemaFactory.createForClass(Stats);

@Schema()
export class Pokemon extends Document {
  @Prop()
  pokeId: number;

  @Prop()
  name: string;

  @Prop()
  nickname: string;

  @Prop()
  imageUrl: string;

  // Perbaiki tipe di sini, pakai @Prop({ type: AboutSchema })
  @Prop({ type: AboutSchema })
  about: About;

  @Prop({ type: StatsSchema })
  stats: Stats;

  @Prop([String])
  moves: string[];

  @Prop({ default: false })
  isOwned: boolean;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
