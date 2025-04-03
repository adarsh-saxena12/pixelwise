import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    prompt: { type: String, required: true }, // Store the text prompt
    image: { type: [String], required: true }, // Store base64-encoded image
    createdAt: { type: Date, default: Date.now }, // Timestamp
});
  
  const GenerateImage = mongoose.models.Image || mongoose.model("Image", ImageSchema);
  export default GenerateImage;