import { Field, Int, ObjectType } from 'type-graphql';
import { Column, PrimaryGeneratedColumn, BaseEntity, Entity } from 'typeorm';

@ObjectType()
@Entity()
export class Photo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => String)
  @Column()
  src!: string;

  @Field(()=> String)
  @Column()
  title!: string;

  @Field(()=> String)
  @Column()
  description!: string;
}