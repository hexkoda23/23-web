
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: formState.name.trim(),
        email: formState.email.trim().toLowerCase(),
        message: formState.message.trim(),
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to send message', err);
      setStatus('error');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-8">Get in Touch</h1>
            <p className="text-gray-600 mb-12 leading-relaxed">
              Have a question about an order, product, or collaboration? 
              Fill out the form and our team will get back to you within 24 hours.
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Email</h3>
                <p className="text-gray-600">twentythreepreppy@gmail.com</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Instagram</h3>
                <p className="text-gray-600">twentythreepreppy</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Whatsapp</h3>
                <p className="text-gray-600">08107869063</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Headquarters</h3>
                <p className="text-gray-600">
                  Coming Soon<br />
                  Lagos<br />
                  Nigeria
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Name</label>
                <input 
                  type="text" 
                  required
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Email</label>
                <input 
                  type="email" 
                  required
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">Message</label>
                <textarea 
                  required
                  rows="4"
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors resize-none"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-green-600 text-sm text-center">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-sm text-center">Could not send message. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
