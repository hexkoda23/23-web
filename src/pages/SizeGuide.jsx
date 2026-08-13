import { Link } from 'react-router-dom';
import { MEASUREMENTS, SIZE_ORDER } from '../data/measurements';

const ORDER = ['trousers', 'shirt', 'button-up', 'hoodie', 'top'];

export default function SizeGuide() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link
          to="/shop"
          className="mb-8 inline-block text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors"
        >
          ← Back to Shop
        </Link>

        <h1 className="attention-product attention-heading text-4xl sm:text-5xl text-black mb-4">
          Size Guide
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-2xl mb-12">
          All measurements are garment measurements in inches, taken flat. Because
          every fabric and cut differs, use these as a guide and size up if you are
          between sizes or prefer a relaxed fit. For specific product numbers, open the
          product page and view its Garment Measurements section.
        </p>

        <div className="space-y-16">
          {ORDER.map((type) => {
            const table = MEASUREMENTS[type];
            if (!table) return null;
            const sizes = SIZE_ORDER.filter((s) => table.values[s]);
            return (
              <section key={type}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  {table.label}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4 font-medium">Measurement</th>
                        {sizes.map((s) => (
                          <th key={s} className="py-2 pr-4 font-medium text-center">
                            {s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row) => (
                        <tr key={row.key} className="border-t border-gray-100">
                          <td className="py-2 pr-4 text-gray-700">{row.label}</td>
                          {sizes.map((s) => (
                            <td
                              key={s}
                              className="py-2 pr-4 text-center text-gray-900 font-medium"
                            >
                              {table.values[s][row.key]}″
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
