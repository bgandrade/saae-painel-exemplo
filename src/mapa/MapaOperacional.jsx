/**
 * Mapa operacional.
 *
 * A versão anterior desenhava tudo em SVG à mão, e o preço apareceu nos
 * rótulos: <text> soltos, sem detecção de colisão, se sobrepondo em qualquer
 * zoom. A correção estrutural foi terminar com a lista própria de localidades
 * e deixar o basemap rotular — CARTO e Esri já trazem Japuíba, Jacuecanga,
 * Banqueta e Vila do Abraão com tipografia e colisão profissionais.
 *
 * As unidades viram divIcon com a sigla em caixa opaca, que é o que garante
 * legibilidade sobre qualquer fundo. E como o Leaflet trabalha em graus, o
 * raio dos setores passa a ser metros de verdade, sem a conversão aproximada
 * km→unidades-de-desenho que só valia na latitude de Angra.
 *
 * Se os tiles não carregarem, cai sozinho para o contorno do IBGE embutido.
 * O painel abre no auditório sem internet — só que agora com um basemap de
 * verdade quando houver rede.
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

import { BBOX, POLIGONOS } from '../data/angra-geo.js';
import { UNIDADES, LINHAS, SETORES, VISTAS, TIPOS } from '../data/topologia.js';
import { CAMADAS } from './camadas.js';
import { svgSimbolo, ROTULO_FORMA, FORMAS } from './simbolos.js';
import { useSim } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { num } from '../ui/formato.js';

const ESPERA_TILES_MS = 3500;

function bboxLeaflet(bb) {
  const b = bb ?? BBOX;
  return L.latLngBounds([b.minLat, b.minLon], [b.maxLat, b.maxLon]);
}

export default function MapaOperacional({ altura = 480, sistemaInicial = 'ambos' }) {
  const { sim, alarmes, tique } = useSim();
  const { abrirUnidade } = useUI();

  const div = useRef(null);
  const mapa = useRef(null);
  const refs = useRef({ marcadores: new Map(), linhas: new Map(), setores: new Map(), base: null });

  const [camada, setCamada] = useState('ruas');
  const [vista, setVista] = useState(VISTAS.find((v) => v.padrao)?.id ?? 'continente');
  const [sistema, setSistema] = useState(sistemaInicial);
  const [offline, setOffline] = useState(false);
  const tema = document.documentElement.dataset.theme;

  /* ── criação do mapa: uma vez só ── */
  useEffect(() => {
    const m = L.map(div.current, {
      // O controle de zoom padrão nasce no canto superior esquerdo, exatamente
      // onde ficam os seletores de camada e enquadramento. Vai para o canto
      // oposto ao da legenda.
      zoomControl: false,
      attributionControl: true,
      preferCanvas: false,
      // O município é largo e recortado; sem inércia o pan fica travado.
      inertia: true,
      worldCopyJump: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    m.fitBounds(bboxLeaflet(VISTAS.find((v) => v.padrao)?.bbox));
    mapa.current = m;

    // Contorno do IBGE: sempre presente, por baixo. Vira o basemap inteiro na
    // camada "sinóptico" e some sob os tiles nas demais.
    const terra = L.layerGroup().addTo(m);
    for (const poly of POLIGONOS) {
      L.polygon(
        poly.map(([lon, lat]) => [lat, lon]),
        {
          className: 'contorno-ibge',
          color: 'var(--mapa-costa)',
          weight: 1,
          fillColor: 'var(--mapa-terra)',
          fillOpacity: 1,
          interactive: false,
        },
      ).addTo(terra);
    }
    refs.current.terra = terra;

    return () => {
      m.remove();
      mapa.current = null;
    };
  }, []);

  /* ── troca de camada de base, com queda automática ── */
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const def = CAMADAS.find((c) => c.id === camada);
    if (refs.current.base) {
      m.removeLayer(refs.current.base);
      refs.current.base = null;
    }

    // Sinóptico: o contorno do IBGE É o mapa, com o mar como fundo.
    refs.current.terra
      .getLayers()
      .forEach((p) =>
        p.setStyle({ fillOpacity: def.online ? 0 : 1, opacity: def.online ? 0.35 : 1 }),
      );
    div.current.style.background = def.online ? '#000' : 'var(--mapa-mar)';

    if (!def.online) return;

    let carregou = false;
    const tl = L.tileLayer(def.url(tema), {
      attribution: def.atrib,
      subdomains: def.subdominios,
      maxZoom: def.zoomMax,
      detectRetina: true,
      crossOrigin: true,
    });
    tl.on('tileload', () => {
      carregou = true;
      setOffline(false);
    });
    tl.addTo(m);
    refs.current.base = tl;

    // Se nada carregar dentro da janela, cai para o sinóptico e avisa. É a
    // diferença entre uma apresentação que continua e uma que trava.
    const id = setTimeout(() => {
      if (!carregou) {
        setOffline(true);
        setCamada('sinoptico');
      }
    }, ESPERA_TILES_MS);

    return () => {
      clearTimeout(id);
      if (m.hasLayer(tl)) m.removeLayer(tl);
    };
  }, [camada, tema]);

  /* ── enquadramento ── */
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const v = VISTAS.find((x) => x.id === vista);
    m.flyToBounds(bboxLeaflet(v?.bbox), { padding: [24, 24], duration: 0.6 });
  }, [vista]);

  /* ── geometria estática que depende do filtro de sistema ── */
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const r = refs.current;

    for (const l of r.linhas.values()) m.removeLayer(l);
    for (const s of r.setores.values()) m.removeLayer(s);
    for (const mk of r.marcadores.values()) m.removeLayer(mk);
    r.linhas.clear();
    r.setores.clear();
    r.marcadores.clear();

    for (const s of SETORES) {
      if (!s.centro || sistema === 'esgoto') continue;
      const c = L.circle([s.centro[1], s.centro[0]], {
        radius: (s.raioKm ?? 2) * 1000,
        color: 'var(--ok)',
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.07,
        interactive: false,
      }).addTo(m);
      r.setores.set(s.id, c);
    }

    for (const l of LINHAS) {
      if (sistema !== 'ambos' && l.sistema !== sistema) continue;
      const pl = L.polyline(
        l.pontos.map(([lon, lat]) => [lat, lon]),
        {
          color: l.sistema === 'esgoto' ? 'var(--esgoto)' : 'var(--agua)',
          weight: Math.max(2, (l.diametroMm ?? 250) / 110),
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        },
      ).addTo(m);
      pl.bindTooltip(`${l.nome}<br><b>DN ${l.diametroMm} mm</b>`, { sticky: true });
      r.linhas.set(l.id, pl);
    }

    for (const u of UNIDADES) {
      const sist = TIPOS[u.tipo].sistema;
      if (sistema !== 'ambos' && sist !== sistema) continue;
      const mk = L.marker([u.lat, u.lon], {
        icon: L.divIcon({
          className: 'marcador-unidade',
          // O deslocamento do rótulo vem do cadastro. A Elevatória e o
          // Reservatório Banqueta ficam a 150 m um do outro, e a ETE Chácara
          // e a EEE Anil a 700 m: no enquadramento do continente as etiquetas
          // se sobreporiam sempre. Afastá-las em direções opostas resolve sem
          // esconder informação.
          html: `<div class="mu" data-un="${u.id}">
                   <div class="mu-simbolo">${svgSimbolo(u.tipo, sist)}</div>
                   <div class="mu-rot" style="--dx:${u.rotuloOffset?.[0] ?? 0}px;--dy:${u.rotuloOffset?.[1] ?? 0}px">${u.sigla} <span class="mu-valor"></span></div>
                 </div>`,
          iconSize: [0, 0],
        }),
        keyboard: true,
        title: u.nome,
      }).addTo(m);
      mk.on('click', () => abrirUnidade(u));
      r.marcadores.set(u.id, mk);
    }
  }, [sistema, abrirUnidade]);

  /* ── camada viva: só o que muda é tocado, e por mutação direta do DOM ──
   * Recriar 9 divIcon duas vezes por segundo destruiria e recriaria nós a cada
   * tique, com o custo de layout que vem junto. Mutar o texto de um <span> não. */
  useEffect(() => {
    const r = refs.current;
    const comAlarme = new Set();
    for (const a of alarmes.ativos) {
      for (const u of UNIDADES) {
        if (a.info.origem?.includes(u.nome) || a.info.origem?.includes(u.sigla))
          comAlarme.add(u.id);
      }
    }

    for (const [id, mk] of r.marcadores) {
      const el = mk.getElement()?.querySelector('.mu');
      if (!el) continue;
      const u = UNIDADES.find((x) => x.id === id);
      const alvo = el.querySelector('.mu-valor');

      const res = sim.reservatorios.get(id);
      const poco = sim.pocos.get(id);
      const ete = sim.etes.get(id);
      const bombas = sim.bombasPorUnidade.get(id) ?? [];
      let txt = '';
      if (res) txt = `${num(res.nivelPct, 0)} %`;
      else if (poco) txt = `${num(poco.nivelPct, 0)} %`;
      else if (ete) txt = `${num(ete.afluenteLs, 0)} L/s`;
      if (bombas.length)
        txt += `${txt ? ' · ' : ''}${bombas.filter((b) => b.ligada).length}/${bombas.length}`;
      if (alvo.textContent !== txt) alvo.textContent = txt;

      const temAlarme = comAlarme.has(id);
      const halo = el.querySelector('.mu-halo');
      if (temAlarme && !halo) {
        el.querySelector('.mu-simbolo').insertAdjacentHTML('beforeend', '<i class="mu-halo"></i>');
      } else if (!temAlarme && halo) halo.remove();

      const emManual = bombas.some((b) => b.modo === 'manual');
      el.classList.toggle('sel', emManual);
      mk.getElement().title = `${u.nome} — ${TIPOS[u.tipo].rotulo}`;
    }

    for (const [id, c] of r.setores) {
      const est = sim.setores.get(id);
      const p = est?.pressaoMca ?? 0;
      const cor = p < 10 ? 'var(--critico)' : p < 15 ? 'var(--atencao)' : 'var(--ok)';
      c.setStyle({ color: cor, fillColor: cor });
    }

    for (const [id, pl] of r.linhas) {
      const l = LINHAS.find((x) => x.id === id);
      // Uma linha só "flui" se houver bombeamento de fato a montante: a
      // animação para junto com as bombas quando cai a energia.
      const bombas = sim.bombasPorUnidade.get(l.de);
      const fluindo = bombas?.length ? bombas.some((b) => b.ligada) : true;
      const rompida = l.id === 'ad-bqt-centro' && sim.intensidade('rompimento') > 0.25;
      pl.setStyle({
        opacity: rompida ? 1 : fluindo ? 0.85 : 0.3,
        color: rompida
          ? 'var(--critico)'
          : l.sistema === 'esgoto'
            ? 'var(--esgoto)'
            : 'var(--agua)',
        dashArray: rompida ? '8 5' : fluindo ? null : '3 6',
      });
    }
  }, [tique, sim, alarmes]);

  return (
    <div className="mapa-wrap" style={{ height: altura }}>
      <div ref={div} className="mapa-leaflet" />

      <div className="mapa-controles">
        <div className="segmentado" role="group" aria-label="Camada de base">
          {CAMADAS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={camada === c.id}
              onClick={() => {
                setOffline(false);
                setCamada(c.id);
              }}
            >
              {c.nome}
            </button>
          ))}
        </div>
        <div className="segmentado" role="group" aria-label="Enquadramento">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={vista === v.id}
              onClick={() => setVista(v.id)}
            >
              {v.nome}
            </button>
          ))}
        </div>
        <div className="segmentado" role="group" aria-label="Filtro de sistema">
          {[
            ['ambos', 'Ambos'],
            ['agua', 'Água'],
            ['esgoto', 'Esgoto'],
          ].map(([id, nome]) => (
            <button
              key={id}
              type="button"
              aria-pressed={sistema === id}
              onClick={() => setSistema(id)}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      <div className="mapa-legenda">
        {Object.entries(ROTULO_FORMA).map(([tipo, rot]) => (
          <div className="mapa-legenda-linha" key={tipo}>
            <svg width="13" height="13" viewBox="-7 -7 14 14">
              <path
                d={FORMAS[tipo](5)}
                fill={tipo === 'ete' || tipo === 'eee' ? 'var(--esgoto)' : 'var(--agua)'}
                stroke="var(--superficie)"
                strokeWidth="1"
              />
            </svg>
            {rot}
          </div>
        ))}
      </div>

      {offline && <div className="mapa-offline">Sem conexão — exibindo contorno IBGE</div>}
      <div className="mapa-nota">Contorno: IBGE · rede e setores estimados</div>
    </div>
  );
}
