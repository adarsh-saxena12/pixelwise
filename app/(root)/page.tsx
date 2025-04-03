import { Collection } from "@/components/shared/Collection"
import { navLinks } from "@/constants"
import { getAllImages } from "@/lib/actions/image.actions"
import Image from "next/image"
import Link from "next/link"

const Home = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';

  const images = await getAllImages({ page, searchQuery})

  console.log(`from home: ${images}`);
  
  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1> 
         {/* <ul className="flex-center w-full gap-10">
          {navLinks.slice(1, 6).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2 border-indigo-600"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image 
                src={link.icon} 
                alt="image" 
                width={24} 
                height={24}
               />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul> */}
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 w-full max-w-6xl mx-auto p-4">
            {navLinks.slice(1, 7).map((link) => (
              <Link
                key={link.route}
                href={link.route}
                className="group flex flex-col items-center justify-center h-40 lg:h-30 w-full rounded-xl bg-white/10 backdrop-blur-sm dark:bg-gray-900/30 shadow-sm hover:shadow-md transition-all duration-300 border dark:border-gray-800/50 hover:border-indigo-600/30 dark:hover:border-indigo-500/30"
              >
               
    
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200/20 backdrop-blur-sm dark:bg-gray-800/40 mb-4 group-hover:bg-gray-300/30 dark:group-hover:bg-gray-800/60 transition-colors duration-300 border border-gray-300/30 dark:border-gray-700/50">
                  <Image
                    src={link.icon}
                    alt={link.label}
                    width={24}
                    height={24}
                    className="dark:text-white group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <p className="text-center font-medium text-gray-600 dark:text-gray-400 relative z-10 px-3 dark:group-hover:text-indigo-400 group-hover:text-indigo-600 transition-colors duration-300">{link.label}</p>
              </Link>
            ))}
          </ul>
      </section>


      <section className="sm:mt-12">
        <Collection 
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPage} 
          page={page}
        />
      </section>
    </>
  )
}

export default Home