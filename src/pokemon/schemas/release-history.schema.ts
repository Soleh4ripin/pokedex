import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ReleaseHistory extends Document {
  @Prop({ required: true })
  pokemonName: string;

  @Prop()
  nickname: string;

  @Prop()
  imageUrl: string;

  @Prop()
  pokeId: number;

  @Prop()
  releaseDate: Date;
}

export const ReleaseHistorySchema = SchemaFactory.createForClass(ReleaseHistory);