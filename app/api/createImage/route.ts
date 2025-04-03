"use server";

import GenerateImage from "@/lib/database/models/generate.model";
import Image from "@/lib/database/models/image.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/actions/image.actions"; // Import Cloudinary function

// Define request body type
interface GenerateRequest {
  prompt: string;
  userId?: string; // Optional user ID
}

// Define response type
interface GenerateResponse {
  text: string;
  images: string[]; // Cloudinary image URLs
}

// Extend the types to include responseModalities
interface ExtendedGenerationConfig {
  responseModalities?: string[];
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

interface ExtendedModelParams {
  model: string;
  generationConfig?: ExtendedGenerationConfig;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<GenerateResponse | { error: string }>> {
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, userId } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Configure AI model
    const modelParams: ExtendedModelParams = {
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        responseModalities: ["Text", "Image"],
        temperature: 1.0,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
    };

    // Type assertion to bypass strict TypeScript checks
    const model = genAI.getGenerativeModel(modelParams as any);

    // Generate content based on the prompt
    const response = await model.generateContent(prompt);

    if (!response.response?.candidates || response.response.candidates.length === 0) {
      return NextResponse.json({ error: "No candidates found in the response" }, { status: 400 });
    }

    // Extract text and images from the response
    const responseParts = response.response.candidates[0].content.parts;
    let text = "";
    const images: string[] = [];
    const cloudinaryUrls: string[] = [];

    for (const part of responseParts) {
      if ("text" in part && part.text) {
        text += part.text + "\n";
      } else if ("inlineData" in part && part.inlineData?.mimeType && part.inlineData?.data) {
        // Convert base64 image
        const base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        images.push(base64Image);
      }
    }

    // Ensure at least one image was generated
    if (images.length === 0) {
      return NextResponse.json({ error: "No images were generated" }, { status: 400 });
    }

    // Upload images to Cloudinary and get secure URLs
    let cloudinaryRes;
    for (const base64Img of images) {
      try {
        cloudinaryRes = await uploadImageToCloudinary(base64Img);
        if (cloudinaryRes?.secureURL) {
          cloudinaryUrls.push(cloudinaryRes.secureURL);
        }
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
      }
    }

    console.log("cloudinaryUrls: ", cloudinaryUrls);

    // Connect to database
    await connectToDatabase();
    
    // Store generated image in MongoDB
    await Image.create({
      title: prompt,
      transformationType: "generate",
      publicId: cloudinaryRes?.publicId, // Ensure correct format
      width: 1000,
      height: 1778,
      secureURL: cloudinaryUrls[0] || "", // Store the first image
      prompt,
      author: userId || null, // If no user is provided, store as anonymous
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json(
      {
        text: text.trim(),
        images: cloudinaryUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
