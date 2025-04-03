'use client'

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { navLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import { SignedOut } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { ModeToggle } from './ToggleTheme';
Button
  

const MobileNav = () => {

    const pathname = usePathname();

    return (
        <header className='header'>
           <Link href="/" className='flex items-center gap-2 md:py-2'>
           <Image
           src="/assets/images/logo-text.svg"
           alt='logo'
           width={180}
           height={28}
           />
           </Link>
           <nav className='flex gap-2'>
            <SignedIn>
                <UserButton  afterSignOutUrl='/'/>
            
            <Sheet>
            <SheetTrigger>
            <Image
            src="/assets/icons/menu.svg"
            alt='menu'
            width={32}
            height={32}
            className='cursor-pointer'
            />
            
            </SheetTrigger>
             <SheetContent className='sheet-content sm:w-64'>
               <>
               <Image
                src="assets/images/logo-text.svg"
                alt='logo'
                width={152}
                height={23}
               />
                <ul className='header-nav_elements '>
                          {
                            navLinks.map((link) => {
                                const isActive = link.route === pathname;

                                return (
                                    <li
                                    key={link.route} className={`${isActive && 'gradient-text'} p-18 whitespace-nowrap text-dark-700`}>
                                    <Link className='sidebar-link'
                                    href={link.route}
                                    >
                                    <Image
                                    src={link.icon}
                                    width={24}
                                    height={24}
                                    alt='icon'
                                    className={`${isActive && 'brightness-400'}`}
                                    />
                                    {
                                        link.label
                                    }
                                    </Link>
                                    </li>
                                )
                            })
                          }
                          <ModeToggle />
                         </ul>
               </>
             </SheetContent>
           </Sheet>
           
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
        </header>

    );
};

export default MobileNav;