import { useEffect, useState, useMemo, CSSProperties } from 'react';

interface BackgroundSkyProps {
  showStars: boolean;
  showClouds: boolean;
  showCityscape: boolean;
}

export default function BackgroundSky({ showStars, showClouds, showCityscape }: BackgroundSkyProps) {
  const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; delay: number; duration: number }[]>([]);

  // Generate random static/twinkling stars coordinates once on mount
  useEffect(() => {
    const starPool = [];
    for (let i = 0; i < 90; i++) {
      starPool.push({
        id: i,
        top: Math.random() * 85, // concentrate in top & mid sky
        left: Math.random() * 100,
        size: Math.random() * 1.5 + 0.8,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 2,
      });
    }
    setStars(starPool);
  }, []);

  // Compute City Lights paths to keep it static and performant
  const cityWindows = useMemo(() => {
    const windowsList = [];
    const seed = 42; // static seed
    let rand = () => {
      const x = Math.sin(seed + windowsList.length) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 50; i++) {
      windowsList.push({
        x: 10 + Math.floor(rand() * 80),
        y: 20 + Math.floor(rand() * 60),
        delay: Math.floor(rand() * 4),
        color: rand() > 0.45 ? 'bg-amber-400' : 'bg-teal-300'
      });
    }
    return windowsList;
  }, []);

  return (
    <div id="sky-scenery-container" className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
      
      {/* 1. Starry Sky Layer */}
      {showStars && (
        <div id="stars-overlay-box" className="absolute inset-0 z-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-pulse shadow-[0_0_4px_#fff]"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Drifting Lunar Clouds (High fidelity slow translation) */}
      {showClouds && (
        <div id="clouds-overlay-box" className="absolute inset-0 z-0 opacity-25">
          <div 
            className="absolute rounded-full filter blur-[40px] bg-slate-800/40 w-[350px] h-[120px] top-[15%] left-[5%] animate-cloud-drift-slow"
            style={{ '--drift-duration': '95s' } as CSSProperties}
          />
          <div 
            className="absolute rounded-full filter blur-[50px] bg-slate-800/30 w-[420px] h-[140px] top-[28%] left-[45%] animate-cloud-drift-slow"
            style={{ '--drift-duration': '140s' } as CSSProperties}
          />
          <div 
            className="absolute rounded-full filter blur-[45px] bg-slate-800/35 w-[280px] h-[100px] top-[8%] left-[70%] animate-cloud-drift-slow"
            style={{ '--drift-duration': '110s' } as CSSProperties}
          />
        </div>
      )}

      {/* 3. Gorgeous Minimal Vector City-Grid Silhouette at the bottom */}
      {showCityscape && (
        <div id="city-skyline-silhouette" className="absolute bottom-0 left-0 w-full h-[12vh] min-h-[80px] z-0 flex items-end justify-between opacity-85">
          {/* Silhouettes of high rises using SVG shapes */}
          <svg className="w-full h-full text-slate-950/90 fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {/* Detailed composite vector representation of modern skyscraper modules */}
            <path d="
              M 0,100 
              L 0,65 L 18,65 L 18,78 L 32,78 L 32,55 L 45,55 L 45,70 L 58,70 L 58,40 L 72,40 L 72,50 L 85,50 L 85,30 L 98,30 L 98,45 L 115,45 L 115,62 L 130,62 L 130,75 
              L 142,75 L 142,85 L 155,85 L 155,50 L 168,50 L 168,60 L 180,60 L 180,72 L 195,72 L 195,45 L 208,45 L 208,55 L 222,55 L 222,35 L 235,35 L 235,50 L 250,50 
              L 265,50 L 265,65 L 278,65 L 278,25 L 290,25 L 290,15 L 295,15 L 295,25 L 305,25 L 305,52 L 320,52 L 320,70 L 335,70 L 335,80 Q 345,60 355,80 L 360,80
              L 372,80 L 372,60 L 385,60 L 385,45 L 400,45 L 400,55 L 415,55 L 415,70 L 430,70 L 430,35 L 442,35 L 442,50 L 455,50 L 455,10 L 457,10 L 457,0 L 459,0 
              L 459,10 L 461,10 L 461,50 L 475,50 L 475,65 L 490,65 L 490,82 L 505,82 L 505,55 L 518,55 L 518,40 L 532,40 L 532,58 L 545,58 L 545,72 L 560,72 L 560,50 
              L 575,50 L 575,35 L 590,35 L 590,52 L 605,52 L 605,75 L 620,75 L 620,60 L 635,60 L 635,45 L 650,45 L 650,30 L 655,30 L 655,15 L 658,15 L 658,30 L 665,30 
              L 665,60 L 680,60 L 680,50 L 695,50 L 695,70 L 710,70 L 710,80 L 725,80 L 725,58 L 738,58 L 738,42 L 752,42 L 752,55 L 765,55 L 765,68 L 780,68 L 780,38 
              L 792,38 L 792,20 L 795,20 L 795,38 L 805,38 L 805,52 L 820,52 L 820,40 L 835,40 L 835,62 L 850,62 L 850,75 L 865,75 L 865,58 L 878,58 L 878,48 L 892,48 
              L 892,62 L 905,62 L 905,75 L 920,75 L 920,60 L 935,60 L 935,50 L 950,50 L 950,35 L 965,35 L 965,55 L 980,55 L 980,72 L 1000,72 L 1000,100 Z" 
            />
          </svg>

          {/* Tiny blinking lights embedded for cozy ambiance */}
          <div className="absolute inset-0 z-10 overflow-hidden opacity-50">
            {cityWindows.map((win, idx) => (
              <div
                key={idx}
                className={`absolute w-0.5 h-0.5 rounded-full ${win.color} animate-ping`}
                style={{
                  bottom: `${win.y}%`,
                  left: `${win.x}%`,
                  animationDuration: `${2.5 + idx % 3}s`,
                  animationDelay: `${win.delay}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Soft glowing atmospheric gradient at bottom to light up the horizon */}
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent z-0 pointer-events-none" />
    </div>
  );
}
