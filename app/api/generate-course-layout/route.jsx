import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { v4 as uuidv4 } from 'uuid';
import * as fs from "node:fs";
import path from 'node:path';

import {
  GoogleGenAI,Modality
} from '@google/genai';

const PROMPT=`Genrate Learning Course depends on following details. In which Make sure to add Course Name, Description,Course Banner Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format Chapter Name, , Topic under each chapters , Duration for each chapters etc, in JSON format only

Schema:

{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",

"bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": [
          "string"
        ],
     
      }
    ]
  }
}

, User Input: 

`
export const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

export async function POST(req){
    const {courseId, ...formData}=await req.json();
    const user=await currentUser();


// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node


  
  const tools = [
    {
      googleSearch: {
      }
    },
  ];
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    tools,
  };
  const model = 'gemini-2.5-pro';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: PROMPT+JSON.stringify(formData),
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });
  console.log(response.candidates[0].content.parts[0].text);
  const RawResp=response?.candidates[0].content?.parts[0]?.text;
  const RawJson=RawResp.replace('```json','').replace('```','');
  const JSONResp = JSON.parse(RawJson);

  const ImagePrompt=JSONResp.course?.bannerImagePrompt;

  //generate Image
  const bannerImageUrl=await GenerateImage(ImagePrompt);
  
  //Save to Database
  const result= await db.insert(coursesTable).values({
    ...formData,
    courseJson:JSONResp,
    userEmail:user?.primaryEmailAddress?.emailAddress,
    cid:courseId,
    bannerImageUrl: bannerImageUrl
  }) 
  return NextResponse.json({courseId : courseId});
}


const GenerateImage=async(imagePrompt)=>
{
 const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_IMAGE_API_KEY,
 });

  const contents = [
    {
      role: "user",
      parts: [{ text: imagePrompt }]
    }
  ];

  // Set responseModalities to include "Image" so the model can generate  an image
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");

      // Save image in the public folder with a unique name
      const fileName = `course-banner-${Date.now()}.png`;
      const filePath = path.join(process.cwd(), "public", fileName);

      fs.writeFileSync(filePath, buffer);
      console.log(`Image saved to: ${filePath}`);

      // Return the public URL so frontend can load it
      return `/${fileName}`;
    }
  }
}




 