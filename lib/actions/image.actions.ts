"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'


// ✅ Upload Image to Cloudinary
export async function uploadImageToCloudinary(imageData: string) {
  try {

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const result = await cloudinary.uploader.upload(imageData, {
      folder: "pixelwise",
      resource_type: "image",
    });

    return {
      publicId: result.public_id,
      secureURL: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
}

const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
})

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    })
    
    revalidatePath(path);
    
    return JSON.parse(JSON.stringify(newImage));
    
  } catch (error) {
    handleError(error)
  }
}

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    )

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error)
  }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error)
  } finally{
    redirect('/')
  }
}

// GET IMAGE
// export async function getImageById(imageId: string) {
//   try {
//     await connectToDatabase();

//     const image = await populateUser(Image.findById(imageId));

//     if(!image) throw new Error("Image not found");

//     return JSON.parse(JSON.stringify(image));
//   } catch (error) {
//     handleError(error)
//   }
// }

// // GET IMAGES
// export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
//   limit?: number;
//   page: number;
//   searchQuery?: string;
// }) {
//   try {
//     await connectToDatabase();
   
//     cloudinary.config({
//       cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//       secure: true,
//     })

//     let expression = 'folder=pixelwise';

//     if (searchQuery) {
//       expression += ` AND ${searchQuery}`
//     }

//     const { resources } = await cloudinary.search
//       .expression(expression)
//       .execute();

//     const resourceIds = resources.map((resource: any) => resource.public_id);

//     let query = {};

//     if(searchQuery) {
//       query = {
//         publicId: {
//           $in: resourceIds
//         }
//       }
//     }

//     const skipAmount = (Number(page) -1) * limit;

//     const images = await populateUser(Image.find(query))
//       .sort({ updatedAt: -1 })
//       .skip(skipAmount)
//       .limit(limit);
    
//     const totalImages = await Image.find(query).countDocuments();
//     const savedImages = await Image.find().countDocuments();

//     return {
//       data: JSON.parse(JSON.stringify(images)),
//       totalPage: Math.ceil(totalImages / limit),
//       savedImages,
//     }
//   } catch (error) {
//     handleError(error)
//   }
// }


// GET IMAGES
export async function getAllImages({ 
  limit = 9, 
  page = 1, 
  searchQuery = '' 
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();
    
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    let expression = 'folder=pixelwise';
    
    // CHANGE 1: Enhanced Cloudinary search expression for more sensitivity
    // Now using prefix matching to catch partial word matches and adding support for tags
    if (searchQuery) {
      // Escape special characters to prevent search syntax errors
      const sanitizedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, '\\$&');
      
      // Search in resource_type, filename, tags, and context data with prefix matching
      expression += ` AND (filename:${sanitizedQuery}* OR tags:${sanitizedQuery}* OR context.alt:${sanitizedQuery}* OR context.caption:${sanitizedQuery}*)`;
    }
    
    const { resources } = await cloudinary.search
      .expression(expression)
      .max_results(500) // CHANGE 2: Increased max results to ensure we catch more potential matches
      .execute();
    
    const resourceIds = resources.map((resource: any) => resource.public_id);
    
    let query = {};
    
    if(searchQuery) {
      // CHANGE 3: Enhanced MongoDB query to search across multiple fields
      // Using text index search + regex for partial matching
      query = {
        $or: [
          { publicId: { $in: resourceIds } },
          // Add text search on any text fields in your Image model
          { title: { $regex: searchQuery, $options: 'i' } },
          { altText: { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } }
          // Add any other fields you want to search
        ]
      };
    }
    
    const skipAmount = (Number(page) -1) * limit;
    
    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);
      
    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();
    
    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    }
  } catch (error) {
    handleError(error)
  }
}



// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();
    
    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };

  } catch (error) {
    handleError(error);
  }
}
