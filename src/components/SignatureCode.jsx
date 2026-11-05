import { useEffect, useState } from 'react';
import { signatureRef } from '../../server/profile-model';
import { downloadSignature, signatureImage } from '../lib/signature';

export default function SignatureCode({ profile, imageClass = 'w-32 h-32', buttonClass = 'underline text-sm', label = 'Save my signature' }) {
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    signatureImage(profile).then(image => { if (live) setSrc(image); }).catch(() => {});
    return () => { live = false; };
  }, [profile]);
  const save = () => { setFailed(false); downloadSignature(profile).catch(() => setFailed(true)); };
  return <>
    {src ? <img src={src} alt={`Digital signature for ${profile.name || 'this wearer'}, reference ${signatureRef(profile.id)}`} className={imageClass} /> : <div className={imageClass} />}
    <button type="button" onClick={save} className={buttonClass}>{label}</button>
    {failed && <p role="alert" className="text-sm text-red-700">Could not save it. Please try again.</p>}
  </>;
}
