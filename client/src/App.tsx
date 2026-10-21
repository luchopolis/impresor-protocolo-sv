import { useEffect, useState } from 'react';
import { Icono } from './components/Icono';
import { MenuLateral, type Seccion } from './components/MenuLateral';
import { CSS } from './estilos';
import { Inicio } from './paginas/Inicio';

const TITULOS: Record<Seccion, { titulo: string; subtitulo: string }> = {
  inicio: {
    titulo: 'Inicio',
    subtitulo: 'Procese un instrumento, revíselo sobre la hoja de protocolo e imprímalo cara por cara.',
  },
};

type Tema = 'light' | 'dark';
const CLAVE_TEMA = 'protocolab:tema';
const consultaOscuro = () => window.matchMedia('(prefers-color-scheme: dark)');

function leerTemaGuardado(): Tema | null {
  try {
    const t = localStorage.getItem(CLAVE_TEMA);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

/** Tema elegido por el usuario; sin elección, sigue la preferencia del sistema. */
function useTema() {
  const [elegido, setElegido] = useState<Tema | null>(leerTemaGuardado);
  const [sistema, setSistema] = useState<Tema>(() => (consultaOscuro().matches ? 'dark' : 'light'));

  useEffect(() => {
    const mq = consultaOscuro();
    const alCambiar = (e: MediaQueryListEvent) => setSistema(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  const tema = elegido ?? sistema;

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
  }, [tema]);

  const cambiar = (t: Tema) => {
    setElegido(t);
    try {
      localStorage.setItem(CLAVE_TEMA, t);
    } catch {
      /* sin almacenamiento: el tema dura solo esta sesión */
    }
  };

  return { tema, cambiar };
}

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('inicio');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { tema, cambiar } = useTema();
  const { titulo, subtitulo } = TITULOS[seccion];

  return (
    <div className="shell">
      <style>{CSS}</style>

      <MenuLateral activa={seccion} onNavegar={setSeccion} abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <main className="principal">
        <header className="encabezado no-print">
          <button type="button" className="icono-btn encabezado__menu" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
            <Icono nombre="menu" />
          </button>
          <div className="encabezado__textos">
            <h1>{titulo}</h1>
            <p>{subtitulo}</p>
          </div>
          <div className="segmentado selector-tema" role="radiogroup" aria-label="Tema de color">
            <button
              type="button"
              role="radio"
              aria-checked={tema === 'light'}
              className={tema === 'light' ? 'activo' : ''}
              onClick={() => cambiar('light')}
              title="Modo claro"
            >
              <Icono nombre="sol" tamano={15} />
              <span className="selector-tema__texto">Claro</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tema === 'dark'}
              className={tema === 'dark' ? 'activo' : ''}
              onClick={() => cambiar('dark')}
              title="Modo oscuro"
            >
              <Icono nombre="luna" tamano={15} />
              <span className="selector-tema__texto">Oscuro</span>
            </button>
          </div>
        </header>

        {seccion === 'inicio' && <Inicio />}
      </main>
    </div>
  );
}
