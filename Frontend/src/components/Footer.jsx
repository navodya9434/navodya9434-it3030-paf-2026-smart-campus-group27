import React from 'react';
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import assets from '../assets/assets';

const Footer = () => {
  const productLinks = ['Scheduling', 'Analytics', 'Automation', 'Integrations'];
  const companyLinks = ['About', 'Careers', 'Blog', 'Contact'];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_90%_78%,rgba(20,184,166,0.18),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-md">
              <img src={assets.logo} alt="CampusOpsHub logo" className="h-9 w-auto rounded bg-white p-1" />
              <div>
                <p className="text-sm font-semibold text-white">CampusOpsHub</p>
                <p className="text-xs text-slate-300">One platform for modern campus operations.</p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
              Transform administration, facilities, and student services with a single, intelligent system built for speed, security, and clarity.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-200 transition hover:border-cyan-300 hover:text-cyan-300">
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-200 transition hover:border-cyan-300 hover:text-cyan-300">
                <FaTwitter className="h-4 w-4" />
              </a>
              <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-200 transition hover:border-cyan-300 hover:text-cyan-300">
                <FaInstagram className="h-4 w-4" />
              </a>
              <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-200 transition hover:border-cyan-300 hover:text-cyan-300">
                <FaLinkedinIn className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">Product</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              {productLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="transition hover:text-cyan-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="transition hover:text-cyan-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-cyan-300" />
                Colombo, Sri Lanka
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-300" />
                +94 776 957 704
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-300" />
                info@campusopshub.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-white/20 bg-white/8 p-4 backdrop-blur-md sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">Stay in the loop</p>
              <p className="text-xs text-slate-300">Get product updates and campus operations insights monthly.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
              Subscribe Newsletter
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CampusOpsHub. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-cyan-300">Privacy Policy</a>
            <a href="#" className="transition hover:text-cyan-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
