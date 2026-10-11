import Link from 'next/link';

export default function Logo({linked=true,className=''}:{linked?:boolean;className?:string}){
  const mark=<span className={`brand-lockup ${className}`} aria-label="FixWise home diagnostics">
    <svg className="brand-symbol" viewBox="0 0 28 28" aria-hidden="true">
      <path className="brand-frame" d="M9 2H2v7M19 2h7v7M26 19v7h-7M9 26H2v-7"/>
      <path className="brand-letter" d="M9 20V8h10M9 13h8"/>
      <rect className="brand-point" x="19" y="18" width="4" height="4"/>
    </svg>
    <span className="brand-type"><b>Fix</b><span>Wise</span></span>
  </span>;
  return linked?<Link href="/" className="brand-link">{mark}</Link>:mark;
}
