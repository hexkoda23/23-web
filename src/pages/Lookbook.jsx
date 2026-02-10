import PageTransition from '../components/PageTransition';

const IMAGES = Array.from({ length: 20 }, (_, i) => `/lookbook/${i + 1}.jpg`);

export default function Lookbook() {
  return (
    <PageTransition>
      <div className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-12">Lookbook</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGES.map((src, idx) => (
              <div key={src} className="relative overflow-hidden">
                <div className="aspect-[3/4] bg-white flex items-center justify-center">
                  <img src={src} alt={`Look ${idx + 1}`} className="w-full h-full object-contain" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
