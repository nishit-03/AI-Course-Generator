// "use client"
// import { Button } from '@/components/ui/button';
// import Image from 'next/image';
// import React, { useEffect, useState } from 'react'
// import AddNewCourseDialog from './AddNewCourseDialog';
// import axios from 'axios';
// import { useUser } from '@clerk/nextjs';

// function CourseList() {
//     const [courseList, setCourseList] = useState([]);
//     const {user}=useUser();

//     const GetCourseList=async()=>{

//         useEffect(()=>{
//             user && GetCourseList();
//         },[user])
//         const result=await axios.get('/api/courses');
//         console.log(result.data);
//         setCourseList(result.data);

//     }
//     return (
//         <div className='mt-10'>
//             <h2 className='font-bold text-3xl'>Course List</h2>

//             {courseList?.length == 0 ?
//             <div className='flex p-7 justify-center items-center flex-col borfer rounded-xl mt-2 bg-secondary'>
//                 <Image src={'/online-education.png'} alt='edu' width={80} height={80}/>
//                 <h2 className='my-2 text-xl font-bold'>Look like you have not created any course yet!</h2>
//                 <AddNewCourseDialog>
//                     <Button className={'mt-2'}>+ Create your first course</Button>
//                 </AddNewCourseDialog>
//             </div> :
//             <div>
//                 List of Courses
//             </div>}
//         </div>
//     )
// }

// export default CourseList



"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import AddNewCourseDialog from './AddNewCourseDialog';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import CourseCard from './CourseCard';

function CourseList() {
    const [courseList, setCourseList] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        const GetCourseList = async () => {
            if (!user) return; // wait until Clerk loads the user
            try {
                const result = await axios.get('/api/courses');
                console.log("Courses:", result.data);
                setCourseList(result.data);
            } catch (err) {
                console.error("Error fetching courses", err);
            }
        };

        GetCourseList();
    }, [user]); // runs whenever user changes

    return (
        <div className='mt-10'>
            <h2 className='font-bold text-3xl mb-5'>Course List</h2>

            {courseList?.length === 0 ?
                <div className='flex p-7 justify-center items-center flex-col border rounded-xl mt-2 bg-secondary'>
                    <Image src={'/online-education.png'} alt='edu' width={80} height={80}/>
                    <h2 className='my-2 text-xl font-bold'>Looks like you have not created any course yet!</h2>
                    <AddNewCourseDialog>
                        <Button className={'mt-2'}>+ Create your first course</Button>
                    </AddNewCourseDialog>
                </div>
                :
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5'>
                    {/* Render your courses */}
                    {courseList.map((course, idx) => (
                        <CourseCard key={idx} course={course} />
                    ))}
                </div>}
        </div>
    )
}

export default CourseList;
