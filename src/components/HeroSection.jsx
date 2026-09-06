import { useState, useEffect } from "react";
import { getBackground } from "../utils/api";

const HeroSection = () => {
  const [backgroundImage, setBackgroundImage] = useState(
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"
  );

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const data = await getBackground();
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        console.error("Failed to fetch background:", error);
      }
    };

    fetchBackground();
  }, []);

  return (
    <section
      className="relative h-[250px] md:h-[320px] bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(44, 74, 145, 0.72), rgba(44, 74, 145, 0.6)), url('${backgroundImage}')`,
      }}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-white text-4xl md:text-5xl font-bold">
          Find Your Perfect Flight
        </h1>
        <p className="mt-4 text-white/90 text-base md:text-lg">
          Search and compare flights from hundreds of airlines
        </p>
      </div>
    </section>
  );
};

export default HeroSection;