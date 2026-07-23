import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant/30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <Link to="/" className="font-display-lg text-3xl text-primary mb-8 block tracking-tighter">
            LUMINA
          </Link>
          <p className="text-on-surface-variant font-body-md leading-loose">
            Defining the gold standard of holistic wellness and luxury rituals since 2024.
          </p>
        </div>

        <div>
          <h4 className="font-label-md tracking-[0.2em] text-on-surface mb-8 uppercase">Rituals</h4>
          <ul className="space-y-5 font-body-md text-on-surface-variant">
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Body Therapy
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Facial Artistry
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Hair Restoration
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Meditation Suites
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-label-md tracking-[0.2em] text-on-surface mb-8 uppercase">Connect</h4>
          <ul className="space-y-5 font-body-md text-on-surface-variant">
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-primary transition-colors">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-label-md tracking-[0.2em] text-on-surface mb-8 uppercase">Location</h4>
          <p className="text-on-surface-variant font-body-md mb-8 leading-loose">
            1221 Serenity Blvd,
            <br />
            Gold Coast, QLD 4217
          </p>
          <div className="flex space-x-4">
            <a
              href="https://lumina-spa.com"
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-full text-on-surface hover:border-primary hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined font-light text-xl">public</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-full text-on-surface hover:border-primary hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined font-light text-xl">camera</span>
            </a>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-8 border-t border-outline-variant/20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-label-sm tracking-widest uppercase text-on-surface-variant/60 gap-4">
        <p>© 2024 Lumina Spa. All rights reserved.</p>
        <div className="flex gap-8">
          <span>Melbourne</span>
          <span>Sydney</span>
          <span>Bali</span>
        </div>
      </div>
    </footer>
  );
};
