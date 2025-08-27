// import { NextResponse } from "next/server";
// import { ai } from "../generate-course-layout/route";
// import axios from "axios";
// import { db } from "@/config/db";
// import { coursesTable } from "@/config/schema";
// import { eq } from "drizzle-orm";

// const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML 
// and give response in JSON format. 
// Schema:{
// chapterName:<>,
// {
// topic:<>,
// content:<>
// }
// }
// : User Input:
// `

// export async function POST(req) {
//   const { courseJson, courseTitle, courseId } = await req.json();

//   const promises=courseJson?.chapters?.map(async(chapter)=>{
//     const config = {
//     thinkingConfig: {
//       thinkingBudget: -1,
//     },
//   };
//   const model = 'gemini-2.5-pro';
//   const contents = [
//     {
//       role: 'user',
//       parts: [
//         {
//           text: PROMPT+JSON.stringify(chapter),
//         },
//       ],
//     },
//   ];

//   const response = await ai.models.generateContent({
//     model,
//     config,
//     contents,
//   });
//     console.log(response.candidates[0].content.parts[0].text);

//     const RawResp = response.candidates[0].content.parts[0].text;
//     const RawJson = RawResp.replace('```json', '').replace('```', '').trim();
//     const JSONResp = JSON.parse(RawJson);


//   //GET YT vid
//   const youtubeData = await getYoutubeVideo(chapter?.chapterName);
//   return{
//     youtubeVideo:youtubeData,
//     courseData:JSONResp
//   }

  

//   })
//   const CourseContent = await Promise.all(promises);

//   //Save to DB
//   const dbResp=await db.update(coursesTable).set({
//     courseContent:CourseContent
//   }).where(eq(coursesTable.cid,courseId));


//   return NextResponse.json({
//     courseName: courseTitle,
//     CourseContent: CourseContent
//   });
// }


// const YOUTUBE_BASE_URL="https://www.googleapis.com/youtube/v3/search"

// const getYoutubeVideo=async(topic)=>{
//   const params=
//   {
//     part:"snippet",
//     maxResults:1,
//     q:topic,
//     type:"video",
//     key:process.env.YOUTUBE_API_KEY
//   }

//   const resp=await axios.get(YOUTUBE_BASE_URL,{params});
//   const youtubeVideoListResp=resp.data.items;
//   const youtubeVideoList=[];
//   youtubeVideoListResp.forEach((item)=>{
//     const data={
//       videoId:item.id?.videoId,
//       title:item?.snippet?.title,
//     }
//     youtubeVideoList.push(data);
//   })
//   return youtubeVideoList
// }




import { NextResponse } from "next/server";
import { ai } from "../generate-course-layout/route";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { jsonrepair } from "jsonrepair"; // <— install this with `npm i jsonrepair`

const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML 
and give response in JSON format. 
Schema:{
chapterName:<>,
{
topic:<>,
content:<>
}
}
Respond ONLY with valid JSON, no markdown fences or explanations.
: User Input:
`;

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    if (!courseJson?.chapters?.length) {
      return NextResponse.json({ error: "No chapters provided" }, { status: 400 });
    }

    const promises = courseJson.chapters.map(async (chapter) => {
      let JSONResp = {};
      try {
        const config = { thinkingConfig: { thinkingBudget: -1 } };
        const model = "gemini-2.5-pro";
        const contents = [
          {
            role: "user",
            parts: [{ text: PROMPT + JSON.stringify(chapter) }],
          },
        ];

        const response = await ai.models.generateContent({ model, config, contents });

        const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty AI response");

        // Sanitize AI output
        let rawJson = rawText.replace(/```json|```/g, "").trim();
        rawJson = rawJson.replace(/[\u0000-\u001F]+/g, ""); // remove control chars

        try {
          JSONResp = JSON.parse(rawJson);
        } catch (err) {
          // Attempt repair if parsing fails
          JSONResp = JSON.parse(jsonrepair(rawJson));
        }
      } catch (err) {
        console.error("AI JSON parse failed:", err);
        JSONResp = { error: "Invalid JSON from AI" };
      }

      // Get YouTube video safely
      let youtubeVideo = [];
      try {
        youtubeVideo = await getYoutubeVideo(chapter?.chapterName);
      } catch (err) {
        console.error("YouTube fetch failed:", err);
      }

      return { youtubeVideo, courseData: JSONResp };
    });

    const CourseContent = await Promise.all(promises);

    // Save to DB
    await db
      .update(coursesTable)
      .set({ courseContent: CourseContent })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      courseName: courseTitle,
      CourseContent,
    });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

const getYoutubeVideo = async (topic) => {
  const params = {
    part: "snippet",
    maxResults: 1,
    q: topic,
    type: "video",
    key: process.env.YOUTUBE_API_KEY,
  };

  const resp = await axios.get(YOUTUBE_BASE_URL, { params });
  return resp.data.items.map((item) => ({
    videoId: item.id?.videoId,
    title: item?.snippet?.title,
  }));
};
