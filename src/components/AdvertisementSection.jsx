import { useState, useEffect } from "react";
import { getBanners } from "../utils/api";

function AdvertisementSection() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getBanners();
        if (Array.isArray(data) && data.length > 0) {
          const activeBanners = data
            .filter((banner) => banner.is_active !== false)
            .sort((a, b) => (a.priority || 0) - (b.priority || 0))
            .map((banner) => ({
              title: banner.title,
              image_url: banner.image_url,
              destination_code: banner.destination_code,
            }));
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <section className="pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-800">
          Popular Destinations
        </h2>
        <p className="mt-2 text-slate-500">
          Discover the world&apos;s most loved travel destinations
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {banners.map((item) => (
            <div
              key={item.destination_code || item.title}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-md"
            >
              <img
                src={item.image_url}
                alt={item.title}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1523428461295-92770e70d7ae?auto=format&fit=crop&w=800&q=80";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdvertisementSection;