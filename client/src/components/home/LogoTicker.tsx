"use client";
import AcmeLogo from '../../../public/logo-acme.png';
import ApexLogo from '../../../public/logo-apex.png';
import CelestialLogo from '../../../public/logo-celestial.png';
import QuantumLogo from '../../../public/logo-quantum.png';
import PulseLogo from '../../../public/logo-pulse.png';
import EchoLogo from '../../../public/logo-echo.png';
import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  AcmeLogo,
  PulseLogo,
  EchoLogo,
  CelestialLogo,
  ApexLogo,
  QuantumLogo,
];

export const LogoTicker = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-blue-500 via-purple-400 to-blue-100 dark:bg-gradient-to-b dark:from-black  dark:to-yellow-950 px-20">
      <div className="container">
        <div className="flex items-center gap-5">
        
          <div className="flex flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div
              initial={{ translateX: "-50%" }}
              animate={{ translateX: "0" }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex flex-none gap-14 pr-14 -translate-x-1/2"
            >
              {[...logos, ...logos].map((logo, index) => (
                <Image
                  key={index}
                  src={logo.src}
                  width={logo.width}
                  height={logo.height}
                  alt="Logo Ticker"
                  className="h-6 w-auto"
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};