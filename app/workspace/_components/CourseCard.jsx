import { Button } from '@/components/ui/button';
import { Book, PlayCircle, Settings } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

function CourseCard({course}) {
    const courseJson=course?.courseJson?.course;
  return (
    
    <div className='bg-white shadow rounded-xl'>
        <Image src={course?.bannerImageUrl} alt={course?.name} width={400} height={300} 
        className='w-full aspect-video object-cover rounded-t-xl'/>
        <div className='p-3 flex flex-col gap-3'>
            <h2 className='font-bold text-xl'>{courseJson?.name}</h2>
            <p className='line-clamp-3 text-gray-400 text-sm'>{courseJson?.description}</p>
            <div className='flex justify-between items-center mt-auto pt-4'>
                <h2 className='flex items-center text-sm gap-2'><Book className='text-primary h-5 w-5 '/>{courseJson?.noOfChapters} Chapters</h2>
                {course?.courseContent?.length ? <Button size={'sm'}><PlayCircle/> Start Learning</Button>:
                <Link href={'/workspace/edit-course/'+course?.cid}><Button size={'sm'} variant={'outline'}><Settings/> Generate Course</Button></Link>}
            </div>
        </div>
    </div>
  )
}

export default CourseCard