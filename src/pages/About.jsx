
import PageTransition from '../components/PageTransition';

export default function About() {
  return (
    <PageTransition>
      <div className="w-full">
        <section className="relative w-full text-white">
          <div className="absolute inset-0 h-[60vh]">
            <img
              src="/lookbook/6.jpg"
              alt="About"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 flex items-end justify-center h-[60vh] text-center px-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">Our Story</h1>
              <p className="text-xs md:text-sm text-gray-300 uppercase tracking-[0.3em]">Luxury. Identity. Exclusivity.</p>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto max-w-4xl space-y-12">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                23 is luxury streetwear, personalized for you. Born from the bold spirit of Preppy Nigga, we craft exclusive pieces where style meets identity.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Every item carries a unique barcode, making it truly yours — because at 23, you don’t just wear fashion, you own it.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Our designs are a fusion of culture and modern luxury, created for those who value individuality, expression, and exclusivity. Each piece tells a story, reflects personality, and connects you to a community that celebrates style as identity.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                At 23, fashion isn’t just what you wear — it’s a statement, a signature, and a personal experience.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-8">About Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                  Adeleke Kehinde, our visionary founder, turned a bold idea into a personalized luxury brand. With unmatched creativity and a passion for redefining luxury wear, Adeleke sets the standard for style, individuality, and exclusivity.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                  Guiding this vision is Ashibogwu Chukwudi Hilary, our brand manager. Through strategic brilliance and meticulous attention to detail.
                </p>
                <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                  Bringing the brand to life in the digital world is Christiana Obidare, our social media manager. With exceptional creativity and deep community engagement, she transforms every post into an experience that connects, inspires, and elevates the 23 lifestyle.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                  Together, we don’t just create clothes — we craft moments, celebrate individuality, and redefine modern luxury. Welcome to 23, where every piece tells a story, and every story is yours.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-6">Personalized Barcode / Your Signature Code</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="text-sm md:text-base">• Words You Live By</li>
              <li className="text-sm md:text-base">• Your Soundtrack</li>
            </ul>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
