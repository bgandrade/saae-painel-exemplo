/** Ícones de traço, 24×24, herdando `currentColor`. */

const ICONES = {
  alerta: 'M12 2 1 21h22L12 2Zm0 6v6m0 3v.5',
  info: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-14v.5m0 3V17',
  ok: 'M20 6 9 17l-5-5',
  bomba: 'M12 3v6m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM3 9h6M12 3H8',
  gota: 'M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z',
  sol: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m11.32 0 1.42 1.42M4.92 4.92l1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  lua: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  tela: 'M3 5h18v11H3zM8 20h8M12 16v4',
  x: 'M18 6 6 18M6 6l12 12',
  mais: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  cadeado: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  play: 'M6 4l14 8-14 8V4Z',
  pausa: 'M7 4v16M17 4v16',
  raio: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  impressora: 'M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8v-7Z',
  baixar: 'M12 3v12m0 0 4-4m-4 4-4-4M4 19h16',
  seta: 'M5 12h14m0 0-6-6m6 6-6 6',
  engrenagem:
    'M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm8.4-3a8.4 8.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a8.4 8.4 0 0 0-2-1.2L15.5 2h-4l-.4 2.6a8.4 8.4 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a8.4 8.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a8.4 8.4 0 0 0 2 1.2l.4 2.6h4l.4-2.6a8.4 8.4 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2Z',
  relatorio:
    'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h4',
  mapa: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  rede: 'M12 2v6m0 8v6M4.9 4.9l4.2 4.2m5.8 5.8 4.2 4.2M2 12h6m8 0h6M4.9 19.1l4.2-4.2m5.8-5.8 4.2-4.2',
};

export default function Icone({ nome, tamanho = 14, ...resto }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...resto}
    >
      <path d={ICONES[nome] ?? ICONES.info} />
    </svg>
  );
}
