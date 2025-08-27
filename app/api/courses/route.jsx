import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req){
    const {searchParams}=new URL(req.url);
    const courseId=searchParams?.get("courseId");
    const user=await currentUser();
    if(courseId)
    {
        const result=await db.select().from(coursesTable).where(eq(coursesTable.cid, courseId));

    console.log(result)

    return NextResponse.json(result[0]);
    }
    else{
        const result=await db.select().from(coursesTable).
        where(eq(coursesTable.userEmail, user?.primaryEmailAddress.emailAddress))
        .orderBy(coursesTable.cid, "desc");

    console.log(result)

    return NextResponse.json(result);
    }
    
}