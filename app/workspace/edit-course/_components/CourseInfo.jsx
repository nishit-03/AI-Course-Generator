import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Book, Clock, Loader2Icon, Settings, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

function CourseInfo({course}) {
    const courseLayout=course?.courseJson?.course;
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const GenerateCourseContent = async () => {
    setLoading(true);
    try{
    const result = await axios.post('/api/generate-course-content', {
        courseJson: courseLayout,
        courseTitle: course?.name,
        courseId: course?.cid
    });
    console.log(result.data);
    setLoading(false);
    router.replace('/workspace')
    toast.success('Course Generated Successfully!');
    }
    catch(e){
        setLoading(false);
        console.log(e);
        toast.error('Server Side Error, Try Again!');
    }
}

    return (
    // <div className='flex flex-row gap-5 justify-between p-5 rounded-2xl shadow' >
    //     <div className='flex flex-col gap-3'>
    //         <h2 className='font-bold text-3xl'>
    //             {courseLayout?.name}
    //         </h2>
    //         <p className='line-clamp-2 text-gray-600'>
    //             {courseLayout?.description}
    //         </p>
    //         <div  className='grid grid-cols-1 md:grid-cols-3 gap-5'>
    //             <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
    //                 <Clock className='text-blue-500'/>
    //                 <section>
    //                     <h2 className='font-bold'>Duration</h2>
    //                     <h2>2 Hours</h2>
    //                 </section>
    //             </div>
    //             <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
    //                 <Book className='text-green-500'/>
    //                 <section>
    //                     <h2 className='font-bold'>Chapters</h2>
    //                     <h2></h2>
    //                 </section>
    //             </div>
    //             <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
    //                 <TrendingUp className='text-red-500'/>
    //                 <section>
    //                     <h2 className='font-bold'>Difficulty Level</h2>
    //                     <h2>{courseLayout?.level}</h2>
    //                 </section>
    //             </div>

    //         </div>
    //     </div>
    //     <Image
    //     src={course?.bannerImageUrl || "/default-banner.png"}
    //     alt="banner"
    //     width={400}
    //     height={400}
    //     className="rounded-2xl aspect-[16/9] w-[400px] h-[240px]"
    //     />


    // </div>
    <div className="md:flex items-center gap-5 p-5 rounded-2xl shadow">
  {/* Left section */}
  <div className="flex-1 flex flex-col gap-4">
    <h2 className="font-bold text-4xl">{courseLayout?.name}</h2>
    <p className="text-lg text-gray-600">{courseLayout?.description}</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex gap-3 items-center p-4 rounded-lg shadow">
        <Clock className="text-blue-500" size={28} />
        <section>
          <h2 className="font-bold">Duration</h2>
          <h2>2 Hours</h2>
        </section>
      </div>
      <div className="flex gap-3 items-center p-4 rounded-lg shadow">
        <Book className="text-green-500" size={28} />
        <section>
          <h2 className="font-bold">Chapters</h2>
          <h2></h2>
        </section>
      </div>
      <div className="flex gap-3 items-center p-4 rounded-lg shadow">
        <TrendingUp className="text-red-500" size={28} />
        <section>
          <h2 className="font-bold">Difficulty Level</h2>
          <h2>{courseLayout?.level}</h2>
        </section>
      </div>
    </div>
    <Button className={'max-w-lg mt-5'} onClick={GenerateCourseContent} 
    disabled={loading}>{loading ? <Loader2Icon className='animate-spin'/> : <Settings/>}Generate Content</Button>
  </div>

  {/* Right image */}
  <Image
    src={course?.bannerImageUrl || "/default-banner.png"}
    alt="banner"
    width={400}
    height={400}
    className=" md:rounded-3xl mt-0 object-cover aspect-auto"
  />
</div>

  )
}

export default CourseInfo