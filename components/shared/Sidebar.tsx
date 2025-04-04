'use client'

import { navLinks } from '@/constants';
import { SignedOut } from '@clerk/clerk-react';
import { SignedIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Button } from "@/components/ui/button"
import { UserButton } from '@clerk/nextjs';
import { ModeToggle } from './ToggleTheme';

const Sidebar = () => {

    const pathname = usePathname();

    return (
        <aside className='sidebar bg-background text-foreground dark:bg-background dark:text-foreground'>
            <div className='flex size-full flex-col gap-4'>
               <Link href="/" className='sidebar-logo'>
               <Image
                src="/assets/images/logo-text.svg"
                alt='logo'
                width={180}
                height={28}
               />
               </Link>
               <nav  className='sidebar-nav'>
                    
                    <SignedIn>
                        
                        <ul className='sidebar-nav_elements'>
                          {
                            navLinks.slice(0, 7).map((link) => {
                                const isActive = link.route === pathname;

                                return (
                                    <li
                                    key={link.route} 
                                    className={`sidebar-nav_element group ${isActive ? 'bg-purple-gradient text-white':'text-gray-700 dark:text-gray-300'} dark:hover:text-gray-200`}>
                                    <Link className='sidebar-link'
                                    href={link.route}
                                    >
                                    <Image
                                    src={link.icon}
                                    width={24}
                                    height={24}
                                    alt='icon'
                                    className={`${isActive && 'brightness-200'}`}
                                    />
                                    {
                                        link.label
                                    }
                                    </Link>
                                    </li>
                                )
                            })
                          }
                         </ul>

                        <ul className='sidebar-nav_elements'>
                        
                          {
                            navLinks.slice(7).map((link) => {
                                const isActive = link.route === pathname;

                                return (
                                    <li
                                    key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-purple-gradient text-white':'text-gray-700 dark:text-gray-300'}`}>
                                    <Link className='sidebar-link'
                                    href={link.route}
                                    >
                                    <Image
                                    src={link.icon}
                                    width={24}
                                    height={24}
                                    alt='icon'
                                    className={`${isActive && 'brightness-200'}`}
                                    />
                                    {
                                        link.label
                                    }
                                    </Link>
                                    </li>
                                )
                            })
                          }    
                        <li className='flex-center cursor-pointer gap-2 p-4'>
                          <UserButton afterSignOutUrl='/'/>
                        </li>
                        <ModeToggle />
                        </ul>
                    
                    </SignedIn>
                     
                    <SignedOut>
                    <Button 
                    variant="outline"
                    asChild
                    className='button bg-purple-gradient text-white bg-cover'
                    >
                    <Link href="/sign-in">
                        LogIn
                    </Link>
                    </Button>

                    </SignedOut>
               </nav>
            </div>
        </aside>
    );
};

export default Sidebar;