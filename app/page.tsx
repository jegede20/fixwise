import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { ArrowRight, ShieldCheck, Upload } from 'lucide-react';

export default function Landing() {
  return <main className="landing">
    <nav className="site-nav"><div className="container nav-inner">
      <Logo/>
      <div className="nav-links"><a href="#how">How it works</a><Link href="/dashboard">My household</Link><Link href="/account">Sign in / Sign up</Link><Link className="nav-cta" href="/diagnose">Open FixWise <ArrowRight size={13}/></Link></div>
    </div></nav>

    <section className="container hero">
      <div className="hero-copy">
        <div className="eyebrow">Practical appliance intelligence</div>
        <h1>Know what’s wrong <em>before you pay</em> to fix it.</h1>
        <p>FixWise turns photos, symptoms, and a few focused answers into a clear assessment — including what’s safe to try and when to call a professional.</p>
        <Link className="btn primary" href="/diagnose">Start a diagnosis <ArrowRight size={16}/></Link>
        <div className="caption">Free to try · No account required</div>
        <div className="hero-proof"><span>01 Photo or description</span><span>02 Focused questions</span><span>03 Safe next step</span></div>
      </div>
      <div className="machine-art diagnostic-art">
        <Image src="/hero-diagnostic.svg" alt="FixWise analyzing several household appliances and identifying a safe next step" fill priority sizes="(max-width: 767px) 100vw, 42vw"/>
        <div className="image-caption"><span>FIXWISE / VISUAL TRIAGE</span><span>SAFE BY DESIGN</span></div>
      </div>
    </section>

    <section className="section container">
      <div className="section-head"><div><div className="eyebrow">Clarity before cost</div><h2>Stop guessing what the problem might be.</h2></div></div>
      <div className="problems">
        <article className="problem"><div className="eyebrow">01 / Understand</div><h3>Turn symptoms into likely causes.</h3><p>Small details about where, when, and how a problem appears can narrow the field quickly.</p></article>
        <article className="problem"><div className="eyebrow">02 / Decide</div><h3>Know whether it’s worth fixing.</h3><p>See likely complexity, time, tools, and alternatives before committing to a service call.</p></article>
        <article className="problem"><div className="eyebrow">03 / Stay safe</div><h3>Know exactly where DIY stops.</h3><p>Safe checks stay simple. Electrical, gas, refrigerant, and other hazardous work is escalated.</p></article>
      </div>
    </section>

    <section className="section container" id="how">
      <div className="section-head"><div><div className="eyebrow">How it works</div><h2>From symptom to next step.</h2></div><span className="eyebrow">About 3 minutes</span></div>
      <div className="step-row"><div className="step-copy"><div className="eyebrow">Step 01</div><h3>Show it.</h3><p>Upload a photo or describe the problem in your own words. Brand and model are useful, but never required.</p></div><div className="step-visual"><div className="upload-demo"><Upload size={28}/><div className="plus">+</div><b>Drop an appliance photo here</b><small>JPG, PNG, or WEBP</small></div></div></div>
      <div className="step-row reverse"><div className="step-copy"><div className="eyebrow">Step 02</div><h3>Narrow it down.</h3><p>FixWise asks two or three focused questions designed to eliminate possibilities — not generic follow-ups.</p></div><div className="step-visual"><div className="question-demo"><div className="eyebrow">Washing machine / Leaking</div><div className="mini-user">Water appears near the front during a wash.</div><b>Two details will help narrow this down.</b><div className="mini-q"><span>→</span> Is the water clean, soapy, or dark?</div><div className="mini-q"><span>→</span> Does it appear during fill or spin?</div></div></div></div>
      <div className="step-row"><div className="step-copy"><div className="eyebrow">Step 03</div><h3>Act with confidence.</h3><p>Get a plain-English assessment, safe checks, realistic complexity, and a clear line for when to call a professional.</p></div><div className="step-visual"><div className="diagnosis-demo"><div className="mini-badge">● DIY-SAFE</div><h3>Likely cause: door boot seal</h3><p style={{color:'#6b6b6b',fontSize:13}}>A small tear or trapped debris may be allowing water past the front seal.</p><div className="mini-q"><span>01</span> Unplug the washer</div><div className="mini-q"><span>02</span> Inspect the visible seal</div><div className="mini-q"><span>03</span> Clean trapped debris</div></div></div></div>
    </section>

    <section className="safety"><ShieldCheck size={28} style={{marginBottom:24}}/><blockquote>FixWise will never tell you to touch a gas line, open an electrical panel, or take on work that could put you in danger.</blockquote><p>If it isn’t safe for you, we’ll tell you to call a professional.</p></section>
    <section className="footer-cta container"><div className="eyebrow">Start with the evidence</div><h2>Get a clearer answer before the repair bill.</h2><Link className="btn primary" href="/diagnose">Start your first diagnosis <ArrowRight size={16}/></Link></section>
    <footer className="footer"><div className="container footer-inner"><span>FixWise © 2026</span><div className="footer-links"><a href="#how">How it works</a><Link href="/account">Account</Link><Link href="/diagnose">Launch app</Link></div></div></footer>
  </main>
}
