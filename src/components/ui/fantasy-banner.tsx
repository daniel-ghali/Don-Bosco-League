import React from "react";

 const FantasyBanner = () => {
    return (
      <div className="relative w-full overflow-hidden min-h-[45px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-03-01/g2Kn0DUkPT.png)",
          }}
          aria-hidden="true"
        />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-1 min-h-[45px]">
          <p className="font-jakarta text-[14px] md:text-[14px] font-bold text-white tracking-tight uppercase text-center md:text-left max-w-3xl">
            Think you know the best players in Don Bosco? Soon… you'll have to prove it.
          </p>
          <span className="font-nabla text-[12px] md:text-[14px] font-normal md:font-bold text-white tracking-tight uppercase whitespace-nowrap shrink-0">
            fantasy coming soon
          </span>
        </div>
      </div>
    );
  }

export default FantasyBanner;