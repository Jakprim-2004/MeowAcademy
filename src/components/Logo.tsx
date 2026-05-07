"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const textClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all group-hover:scale-110`}>
        <img 
          src="/images/cat-icons/logo_cat.png" 
          alt="MeowAcademy Logo - บริการเก็บชั่วโมงจิตอาสา กยศ." 
          className="w-full h-full object-contain drop-shadow-md" 
        />
      </div>
      {showText && (
        <span className={`${textClasses[size]} font-bold text-gradient`}>
          MeowAcademy
        </span>
      )}
    </Link>
  );
};

export default Logo;
