import { User } from '../entities/User';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { MyContext } from 'src/types';
import argon2 from 'argon2';

@InputType()
class UserInput {
  @Field()
  username: string;
  
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserInput,
    @Ctx() { req }: any
  ): Promise<UserResponse> {
    const { username, password } = options;

    const hashedPassword = await argon2.hash(password);
    
    const possibleUser = await User.findOne({ where: { username } });
    if (possibleUser?.username == username) {
      return {
        errors: [{
          field: 'username',
          message: 'nazwa jest zajęta',
        }] 
      }
    }

    const user = await User.create({ username, password: hashedPassword  }).save();
    
    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UserInput,
    @Ctx() { req }: any,
  ): Promise<UserResponse> {
    const { username, password } = options;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'użytkownik nie istnieje',
        }]
      }
    };

    const verifiedPassword = await argon2.verify(user.password, password);
    if (!verifiedPassword) {
      return {
        errors: [{
          field: 'password',
          message: 'błędne hasło',
        }]
      }
    };

    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ): Promise<Boolean> {
    return new Promise(resolve => req.session?.destroy((err: any) => {
      res.clearCookie('qid');

      if (err) {
        console.log(err);
        resolve(false);
        return;
      }

      resolve(true);
    }))
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await User.find({});
  }

  @Query(() => User, { nullable: true })
  async getCurrentUser(
    @Ctx() { req }: MyContext
  ): Promise<User | undefined> {
    if (!req.session!.userId) {
      return undefined;
    }

    return await User.findOne(req.session!.userId);
  }
}