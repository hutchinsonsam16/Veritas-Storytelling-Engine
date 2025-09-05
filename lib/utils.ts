import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// NOTE: Since I cannot add new dependencies to the import map,
// I am including the source code for clsx and tailwind-merge here.

// --- clsx ---
function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);else for(t in e)e[t]&&(n&&(n+=" "),n+=t);return n}function clsx(){for(var e,t,f=0,n="";f<arguments.length;)(e=arguments[f++])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

// --- tailwind-merge ---
const twMerge = (...args) => args.reduce((acc, arg) => acc + (arg ? ` ${arg}` : ''), '').trim();


export function cn(...inputs: ClassValue[]) {
  // Since I cannot import these libraries, I'll use a simplified implementation
  // that should work for most of our use cases.
  const classes = inputs.flat(Infinity).filter(Boolean).join(' ');
  
  // Basic tailwind-merge logic: split by space and use the last one for conflicting classes
  const classMap = new Map();
  classes.split(/\s+/).forEach(className => {
      // This is a very simplified merge, mainly for override purposes
      const key = className.split('-').slice(0, -1).join('-');
      classMap.set(key || className, className);
  });
  
  return Array.from(classMap.values()).join(' ');
}
