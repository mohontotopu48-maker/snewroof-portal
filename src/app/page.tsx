import Link from 'next/link';
import { ArrowRight, Shield, Clock, MousePointer2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          min-height: 100vh;
          background: radial-gradient(circle at top right, var(--navy-800), var(--navy-950));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
        }
        .hero {
          max-width: 800px;
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .badge-premium {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 100px;
          color: var(--orange-400);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .hero h1 {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          margin-bottom: 20px;
          background: linear-gradient(135deg, #fff 0%, var(--slate-400) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero p {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: var(--slate-400);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-group {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          max-width: 1000px;
          margin-top: 80px;
          width: 100%;
          animation: fadeIn 1.2s ease;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 24px;
          border-radius: var(--radius-lg);
          transition: var(--transition);
          text-align: left;
        }
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--orange-500);
          transform: translateY(-4px);
        }
        .feature-icon {
          width: 40px; height: 40px;
          background: rgba(249, 115, 22, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--orange-400);
          margin-bottom: 16px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <main className="hero">
        <div className="badge-premium">
          <Shield size={14} /> Premium Roofing Services
        </div>
        <h1>Elevate Your Roof <span className="gradient-text">Management</span></h1>
        <p>Experience the future of roofing with Snewroof&apos;s intelligent customer portal. Track project progress, manage quotes, and book inspections in real-time.</p>

        <div className="cta-group">
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Access Portal <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Login Now
          </Link>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon"><Clock size={20} /></div>
          <h3>Real-time Tracking</h3>
          <p>Monitor your roofing project from start to finish with live updates and photo documentation.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Shield size={20} /></div>
          <h3>Secure Payments</h3>
          <p>Review quotes and pay invoices securely through our encrypted customer dashboard.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><MousePointer2 size={20} /></div>
          <h3>One-click Booking</h3>
          <p>Schedule inspections and maintenance instantly with our automated coordination system.</p>
        </div>
      </section>
    </div>
  );
}
