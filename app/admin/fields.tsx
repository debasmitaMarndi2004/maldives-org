"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { heroImages, homeSections, type SiteContent } from "@/lib/site-content";
import styles from "./admin.module.css";

export function Submit({ children, className, disabled, name, value, confirm, label, formNoValidate }: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  confirm?: string;
  label?: string;
  formNoValidate?: boolean;
}) {
  const { pending } = useFormStatus();
  return <button className={className ?? styles.button} type="submit" disabled={disabled || pending} name={name} value={value}
    aria-label={label} formNoValidate={formNoValidate} onClick={event => { if (confirm && !window.confirm(confirm)) event.preventDefault(); }}>
    {pending && !name ? "Working…" : children}
  </button>;
}

export function HeroImageField({ image }: { image: SiteContent["hero"]["image"] }) {
  const [selected, setSelected] = useState(image);
  return <label className={styles.field}>
    <span>Hero image</span>
    <span className={styles.imageField}>
      <span className={styles.imageSwatch} style={{ backgroundImage: `url(${heroImages[selected].path})` }} aria-hidden="true" />
      <select name="image" value={selected} onChange={event => setSelected(event.target.value as typeof image)}>
        {Object.entries(heroImages).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
      </select>
    </span>
  </label>;
}

export function HomeSectionFields({ initial }: { initial: SiteContent["homeSections"] }) {
  const [order, setOrder] = useState(initial);
  const move = (index: number, target: number) => setOrder(current => {
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  return <>
    <input type="hidden" name="sectionOrder" value={order.map(section => section.key).join(",")} />
    <ul className={styles.sections}>
      {order.map(({ key }, index) => <li key={key} className={styles.sectionRow}>
        <strong>{homeSections[key]}</strong>
        <label className={styles.check}>
          <input type="checkbox" name={`show-${key}`} defaultChecked={initial.find(section => section.key === key)?.visible} />
          <span>Display<span className="sr-only"> {homeSections[key]}</span></span>
        </label>
        <div className={styles.reorder}>
          <button className={styles.iconButton} type="button" disabled={index === 0} aria-label={`Move ${homeSections[key]} up`} onClick={() => move(index, index - 1)}>↑</button>
          <button className={styles.iconButton} type="button" disabled={index === order.length - 1} aria-label={`Move ${homeSections[key]} down`} onClick={() => move(index, index + 1)}>↓</button>
        </div>
      </li>)}
    </ul>
  </>;
}
