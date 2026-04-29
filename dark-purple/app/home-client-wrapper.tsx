'use client';

export function HomeClientWrapper() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button onClick={() => scrollToSection('purpose-section')} className="celestial-button">
        Explore by Purpose
      </button>
      <button onClick={() => scrollToSection('tradition-section')} className="celestial-button">
        Explore by Tradition
      </button>
    </div>
  );
}
