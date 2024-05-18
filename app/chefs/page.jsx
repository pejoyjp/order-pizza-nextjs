import React from 'react'

const data = [
   {    name:"Shijie Zhang",
        des:`Hi, my name is Shijie Zhang, a bachelor degree student 
            studying the field of the information technology who will be
            graduated.  During the last four years, what programing languages 
            and frameworks I have learned, e.g. HTML, CSS, JavaScript, js.  
            Additionally, I have some exposure to database management and can 
            operate with Oracle SQL and other databases correctly.  Dedication on 
            learning how to marry function with appeal to provide the users with a 
            better-than-good experience.  In my previous pas endeavors, where I took 
            part in different types of website creation, I got the knowledge of 
            visualization and user experience, and I was trying to develop the interfaces
            that are easy to use and visually attractive.  I do parallel code quality and
            performance optimization to provide the website with a good stability and 
            scalability at the moment. Thank you!`,
        img:'/chefs/user1.jpg'
    },
   
]

const Chefs = () => {
    return (
        <div className="flex flex-col gap-4">
            {data.map((chef, index) => (
                <div key={index} className="flex items-center flex-col md:flex-row p-2">
                    <img className="w-full h-72 object-cover" src={chef.img} alt={chef.name} />
                    <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">{chef.name}</div>
                        <p className="text-gray-700 text-base">
                            {chef.des}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Chefs