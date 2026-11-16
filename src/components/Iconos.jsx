const estilo = size => ({
  width: size,
  height: size,
  display: "block",
  flexShrink: 0
});

const props = size => ({
  viewBox: "0 0 24 24",
  style: estilo(size),
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round"
});

export function IconoArbol({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <path d="M12 2.1c.35 1.75 1.15 2.55 2.9 2.9-1.75.35-2.55 1.15-2.9 2.9-.35-1.75-1.15-2.55-2.9-2.9 1.75-.35 2.55-1.15 2.9-2.9z" fill="currentColor" stroke="none" />
      <path d="M12 6.4 6.2 12.6h11.6L12 6.4z" fill="currentColor" fillOpacity="0.14" />
      <path d="M12 6.4 6.2 12.6h11.6L12 6.4z" />
      <path d="M12 11.4 4.8 18.4h14.4L12 11.4z" fill="currentColor" fillOpacity="0.22" />
      <path d="M12 11.4 4.8 18.4h14.4L12 11.4z" />
      <path d="M12 18.4v2.6" />
      <path d="M9.6 21h4.8" />
    </svg>
  );
}

export function IconoIntercambio({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <path d="M3.6 8.6h14.2" />
      <path d="M14.9 5.6l3 3-3 3" />
      <path d="M20.4 15.4H6.2" />
      <path d="M9.1 12.4l-3 3 3 3" />
    </svg>
  );
}

export function IconoRegalo({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <path d="M4.4 10.6h15.2v8.6a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4v-8.6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M4.4 10.6h15.2v8.6a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4v-8.6z" />
      <path d="M3.4 7.2h17.2v3.4H3.4z" fill="currentColor" fillOpacity="0.12" />
      <path d="M3.4 7.2h17.2v3.4H3.4z" />
      <path d="M12 7.2v13.4" />
      <path d="M12 7.1C9.4 7.1 8.2 4 10 2.9c1.5-.9 2 4.2 2 4.2z" />
      <path d="M12 7.1c2.6 0 3.8-3.1 2-4.2-1.5-.9-2 4.2-2 4.2z" />
    </svg>
  );
}

export function IconoEstrella({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <path d="M12 3.2l2.7 5.4 6 .9-4.3 4.2 1 5.9L12 16.8l-5.4 2.8 1-5.9L3.3 9.5l6-.9L12 3.2z" fill="currentColor" fillOpacity="0.18" />
      <path d="M12 3.2l2.7 5.4 6 .9-4.3 4.2 1 5.9L12 16.8l-5.4 2.8 1-5.9L3.3 9.5l6-.9L12 3.2z" />
    </svg>
  );
}

export function IconoLlave({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <circle cx="8.3" cy="8.3" r="4.1" fill="currentColor" fillOpacity="0.12" />
      <circle cx="8.3" cy="8.3" r="4.1" />
      <path d="M11.2 11.2 20.4 20.4" />
      <path d="M17.4 17.4l2-2" />
      <path d="M14.9 14.9l2-2" />
    </svg>
  );
}

export function IconoGrupo({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <circle cx="9.2" cy="8.4" r="3.3" fill="currentColor" fillOpacity="0.14" />
      <circle cx="9.2" cy="8.4" r="3.3" />
      <path d="M3.4 19.6c0-3.2 2.6-5.3 5.8-5.3s5.8 2.1 5.8 5.3" />
      <path d="M15.9 5.6a3.1 3.1 0 0 1 0 6" />
      <path d="M17.6 14.6c2.2.6 3.6 2.4 3.6 4.6" />
    </svg>
  );
}

export function IconoFoco({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <path d="M12 2.9a6.2 6.2 0 0 0-3.7 11.2c.6.5 1 1.3 1 2v.9h5.4v-.9c0-.7.4-1.5 1-2A6.2 6.2 0 0 0 12 2.9z" fill="currentColor" fillOpacity="0.14" />
      <path d="M12 2.9a6.2 6.2 0 0 0-3.7 11.2c.6.5 1 1.3 1 2v.9h5.4v-.9c0-.7.4-1.5 1-2A6.2 6.2 0 0 0 12 2.9z" />
      <path d="M9.6 20.6h4.8" />
    </svg>
  );
}

export function IconoEtiqueta({ size = 24 }) {
  return (
    <svg {...props(size)}>
      <path d="M3.4 11.1V4.8a1.4 1.4 0 0 1 1.4-1.4h6.3c.4 0 .8.2 1 .4l8.5 8.5c.6.6.6 1.5 0 2.1l-6.3 6.3c-.6.6-1.5.6-2.1 0L3.8 12.1a1.4 1.4 0 0 1-.4-1z" fill="currentColor" fillOpacity="0.12" />
      <path d="M3.4 11.1V4.8a1.4 1.4 0 0 1 1.4-1.4h6.3c.4 0 .8.2 1 .4l8.5 8.5c.6.6.6 1.5 0 2.1l-6.3 6.3c-.6.6-1.5.6-2.1 0L3.8 12.1a1.4 1.4 0 0 1-.4-1z" />
      <circle cx="7.9" cy="7.9" r="1.5" fill="currentColor" />
    </svg>
  );
}
