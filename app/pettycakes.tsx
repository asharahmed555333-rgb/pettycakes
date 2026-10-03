'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  AlertCircle,
  CakeSlice,
  CheckCircle2,
  LoaderCircle,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { CURRENCY, cakes, type CakeId } from '@/lib/cakes';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type FormStatus = { type: 'idle' | 'loading' | 'success' | 'error'; message: string };

function localDateString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
}

export default function PettyCakes() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<CakeId>('chocolate-fudge');
  const [activeCakeIndex, setActiveCakeIndex] = useState(0);
  const [status, setStatus] = useState<FormStatus>({ type: 'idle', message: '' });
  const cakesSectionRef = useRef<HTMLElement>(null);
  const cakesTrackRef = useRef<HTMLDivElement>(null);
  const activeCakeIndexRef = useRef(0);
  const minDate = localDateString();
  const activeCake = cakes[activeCakeIndex];

  useGSAP(() => {
    const section = cakesSectionRef.current;
    const track = cakesTrackRef.current;
    if (!section || !track) return;

    const viewport = section.querySelector<HTMLElement>('.cake-viewport');
    const cards = gsap.utils.toArray<HTMLElement>('.menu-cake-card', section);
    if (!viewport || cards.length === 0) return;

    const setFocusedCake = (index: number) => {
      const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
      if (activeCakeIndexRef.current !== nextIndex) {
        activeCakeIndexRef.current = nextIndex;
        setActiveCakeIndex(nextIndex);
      }
    };

    const getCenteredX = (card: HTMLElement) => (
      (viewport.clientWidth / 2) - (card.offsetLeft + card.offsetWidth / 2)
    );

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const horizontalTween = gsap.fromTo(
        track,
        { x: () => getCenteredX(cards[0]) },
        {
          x: () => getCenteredX(cards[cards.length - 1]),
          ease: 'none',
          scrollTrigger: {
            id: 'pettycakes-menu',
            trigger: section,
            start: 'top top',
            end: () => {
              const travel = Math.abs(getCenteredX(cards[cards.length - 1]) - getCenteredX(cards[0]));
              return `+=${Math.max(window.innerHeight * 3.6, travel * 1.7)}`;
            },
            pin: true,
            pinSpacing: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setFocusedCake(Math.round(self.progress * (cards.length - 1))),
          },
        },
      );

      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => horizontalTween.kill();
    });

    media.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(track, { clearProps: 'transform' });
      setFocusedCake(0);
    });

    return () => media.revert();
  }, { scope: cakesSectionRef });

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.14 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function focusCake(index: number) {
    activeCakeIndexRef.current = index;
    setActiveCakeIndex(index);
  }

  function orderCake(cakeId: CakeId) {
    setSelectedCake(cakeId);
    setStatus({ type: 'idle', message: '' });
    document.querySelector('#order')?.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => document.getElementById('cake')?.focus(), 500);
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setStatus({ type: 'loading', message: 'Sending your order…' });
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Your order could not be sent. Please try again.');

      setStatus({ type: 'success', message: result.message || 'Thank you! Your order has been sent to our team.' });
      form.reset();
      setSelectedCake('chocolate-fudge');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Your order could not be sent. Please try again.',
      });
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="PettyCakes home" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true"><CakeSlice /></span>
          <span>PettyCakes</span>
        </a>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="menu-button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>

        <nav id="primary-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Primary navigation">
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#cakes" onClick={closeMenu}>Cakes</a>
          <a className="nav-order" href="#order" onClick={closeMenu}>Order</a>
        </nav>
      </header>

      <section className="hero section-shell" id="home">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">Freshly baked for your sweetest moments</p>
          <h1>Make every celebration a little more delicious.</h1>
          <p className="hero-text">
            Thoughtfully baked cakes, joyful flavours, and custom details made especially for your table.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#cakes">Explore Cakes</a>
            <a className="button button-secondary" href="#order">Order Now</a>
          </div>
        </div>
        <div className="hero-visual" data-reveal>
          <img src={cakes[3].image} alt={cakes[3].alt} />
          <div className="hero-note"><Sparkles aria-hidden="true" /><span><strong>Baked fresh</strong><small>Made to celebrate</small></span></div>
        </div>
      </section>

      <section className="about section-shell" id="about" data-reveal>
        <div className="about-heading">
          <p className="eyebrow">A little about us</p>
          <h2>Small-batch cakes.<br />Big celebration energy.</h2>
        </div>
        <div className="about-copy">
          <p>
            PettyCakes makes freshly prepared cakes for birthdays, milestones, and all the moments worth sharing.
            Choose a favourite, then tell us how you&apos;d like to make it yours.
          </p>
          <p className="about-accent">Flavours, colours, messages, and finishing touches can all be customized.</p>
        </div>
      </section>

      <section className="cakes-section" id="cakes" ref={cakesSectionRef} aria-labelledby="cakes-heading">
        <div className="cakes-pin section-shell">
          <div className="cakes-details" aria-live="polite" aria-atomic="true">
            <p className="eyebrow">The Menu</p>
            <p className="cake-count"><span>{String(activeCakeIndex + 1).padStart(2, '0')}</span> / {String(cakes.length).padStart(2, '0')}</p>
            <div className="active-cake-copy" key={activeCake.id}>
              <h2 id="cakes-heading">{activeCake.name}</h2>
              <p className="active-cake-price">From {CURRENCY}{activeCake.price} <span>sample price</span></p>
              <p>{activeCake.description}</p>
            </div>
            <Button type="button" className="active-cake-order" onClick={() => orderCake(activeCake.id)}>
              Order {activeCake.name}
            </Button>
            <p className="menu-scroll-hint">Scroll to discover every cake</p>
          </div>

          <div className="cake-viewport" aria-label="PettyCakes menu">
            <div className="cake-track" ref={cakesTrackRef}>
              {cakes.map((cake, index) => (
                <button
                  className={`menu-cake-card ${index === activeCakeIndex ? 'is-active' : ''}`}
                  key={cake.id}
                  type="button"
                  aria-label={`View ${cake.name} details`}
                  aria-pressed={index === activeCakeIndex}
                  onClick={() => focusCake(index)}
                  onFocus={() => focusCake(index)}
                  onMouseEnter={() => focusCake(index)}
                >
                  <img src={cake.image} alt={cake.alt} loading={index < 2 ? 'eager' : 'lazy'} />
                  <span><strong>{cake.name}</strong><small>{CURRENCY}{cake.price}</small></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="order-section" id="order">
        <div className="section-shell order-layout">
          <div className="order-intro" data-reveal>
            <p className="eyebrow">Let&apos;s make something lovely</p>
            <h2>Your cake starts here.</h2>
            <p>Share the basics and any special ideas. We&apos;ll send every detail straight to the PettyCakes team.</p>
            <div className="order-promise">
              <CheckCircle2 aria-hidden="true" />
              <p><strong>Confirmation you can trust</strong><span>You&apos;ll only see a success message after your order notification is delivered.</span></p>
            </div>
          </div>

          <form className="order-form" onSubmit={submitOrder} data-reveal>
            <div className="field field-full">
              <label htmlFor="cake">Choose your cake</label>
              <NativeSelect className="form-select" id="cake" name="cake" value={selectedCake} onChange={(event) => setSelectedCake(event.target.value as CakeId)} required>
                {cakes.map((cake) => <NativeSelectOption key={cake.id} value={cake.id}>{cake.name} — {CURRENCY}{cake.price}</NativeSelectOption>)}
              </NativeSelect>
            </div>
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <Input id="quantity" name="quantity" type="number" min="1" max="20" defaultValue="1" inputMode="numeric" required />
            </div>
            <div className="field">
              <label htmlFor="orderDate">Preferred order date</label>
              <Input id="orderDate" name="orderDate" type="date" min={minDate} required />
            </div>
            <div className="field field-full">
              <label htmlFor="fullName">Full name</label>
              <Input id="fullName" name="fullName" type="text" autoComplete="name" placeholder="Your full name" maxLength={100} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={160} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" maxLength={40} required />
            </div>
            <div className="field field-full">
              <label htmlFor="details">Customization details or special requests</label>
              <Textarea id="details" name="details" rows={5} maxLength={1500} placeholder="Colours, message, dietary notes, theme, or anything else we should know…" />
            </div>
            <div className="honey" aria-hidden="true">
              <label htmlFor="website">Website</label><Input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <Button type="submit" size="lg" className="submit-button" disabled={status.type === 'loading'}>
              {status.type === 'loading' ? <><LoaderCircle className="spin" /> Sending Order…</> : 'Submit Order'}
            </Button>
            <div className={`form-status ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite" aria-atomic="true">
              {status.type === 'success' && <CheckCircle2 aria-hidden="true" />}
              {status.type === 'error' && <AlertCircle aria-hidden="true" />}
              {status.message && <span>{status.message}</span>}
            </div>
          </form>
        </div>
      </section>

      <footer>
        <div className="section-shell footer-inner">
          <a className="brand footer-brand" href="#home"><span className="brand-mark" aria-hidden="true"><CakeSlice /></span><span>PettyCakes</span></a>
          <p>“Life is short. Make it sweet.”</p>
          <p>© {new Date().getFullYear()} PettyCakes. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
