require('dotenv').config();
import { Arg, Field, InputType, Mutation, Resolver } from 'type-graphql';
import cloudinary from 'cloudinary';

@InputType()
class PhotoInput {
  @Field()
  photo: string;
}

@Resolver()
export class PhotoResolver {
  @Mutation(() => String)
  async uploadPhoto(
    @Arg('options') options: PhotoInput,
  ): Promise<cloudinary.UploadApiResponse | string> {
    const { photo } = options;

    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    try {
      const result = await cloudinary.v2.uploader.upload(photo, {
        allowed_formats: ['jpg', 'png'],
        public_id: '',
        folder: 'images'
      });

      return `Successful photo URL ${result.url}`;
    } catch (err) {
      return `Image could not be uploaded: ${err.message}`;
    }
  }
}