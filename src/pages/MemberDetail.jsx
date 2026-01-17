import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition.jsx";
import { MEMBERS } from "../data/members.js";

function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = MEMBERS.find((m) => m.id === parseInt(id));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!member) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center">
            <h2 className="text-2xl font-medium mb-4">Member not found</h2>
            <button
              onClick={() => navigate("/portfolio")}
              className="text-sm text-neutral-400 hover:text-white underline"
            >
              Back to Portfolio
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-neutral-100">
        <main>
          {/* Back Button */}
          <section className="mx-auto max-w-6xl px-6 pt-8">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate("/portfolio")}
              className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to Portfolio
            </motion.button>
          </section>

          {/* Member Header */}
          <section className="mx-auto max-w-6xl px-6 pt-12 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl overflow-hidden relative">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image doesn't exist
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center ${member.image ? 'hidden' : ''}`}>
                    <div className="text-9xl opacity-50">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                    {member.role}
                  </p>
                  <h1 className="text-5xl sm:text-6xl font-medium text-white">
                    {member.name}
                  </h1>
                  <p className="text-base leading-relaxed text-neutral-300 max-w-xl">
                    {member.bio}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 pt-8 border-t border-neutral-800">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                      Contact
                    </p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-sm text-neutral-300 hover:text-white transition-colors block"
                    >
                      {member.email}
                    </a>
                    <a
                      href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-300 hover:text-white transition-colors block mt-2"
                    >
                      {member.instagram}
                    </a>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
                      Expertise
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs border border-neutral-700 rounded-full text-neutral-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                      Experience
                    </p>
                    <p className="text-sm text-neutral-300">{member.years} years</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Additional Content Section */}
          <section className="mx-auto max-w-6xl px-6 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl space-y-6"
            >
              <h2 className="text-xl font-medium text-neutral-50">
                About {member.name.split(" ")[0]}
              </h2>
              {member.about ? (
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                  {member.about}
                </p>
              ) : (
                <>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {member.name} brings a unique perspective to the 23 team, contributing
                    to the brand's vision through {member.role.toLowerCase()}. With
                    {member.years} of experience, they've helped shape what 23 represents
                    today — a blend of street culture, high fashion, and intentional design.
                  </p>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Every piece in the 23 collection reflects the collaborative spirit of
                    our team, where each member's expertise comes together to create
                    something greater than the sum of its parts.
                  </p>
                </>
              )}
            </motion.div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}

export default MemberDetail;
