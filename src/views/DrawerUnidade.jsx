/**
 * Drawer de unidade: o detalhe que abre ao clicar num marcador do mapa ou num
 * nó do sinóptico. Reúne reservação, tratamento, qualidade e os conjuntos, com
 * um atalho para a tela da estação quando há bombas.
 */

import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { Drawer } from '../ui/Overlay.jsx';
import { Chip, Tanque, Pares } from '../ui/componentes.jsx';
import { Sparkline } from '../charts/index.js';
import { num, horimetro, ROTULO_BOMBA } from '../ui/formato.js';
import { TIPOS } from '../data/topologia.js';

export default function DrawerUnidade({ unidade: u }) {
  const { sim } = useSim();
  const { fecharUnidade, abrirBomba } = useUI();

  const res = sim.reservatorios.get(u.id);
  const poco = sim.pocos.get(u.id);
  const ete = sim.etes.get(u.id);
  const qual = sim.qualidade.get(u.id);
  const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
  const malha = sim.malhas.get(u.id);
  const hist = janela(sim, `reserv/${u.id}/nivel`, 360, 120);

  return (
    <Drawer
      titulo={u.nome}
      sub={`${TIPOS[u.tipo].rotulo} · ${u.bairro} · ${u.sigla}`}
      aoFechar={fecharUnidade}
    >
      {res && (
        <div>
          <div className="drawer-secao-tit">{u.rotuloVolume ?? 'Reservação'}</div>
          <Tanque
            nivelPct={res.nivelPct}
            marcas={
              malha
                ? [
                    { pct: malha.desligaPct, rot: `desliga ${malha.desligaPct}%` },
                    { pct: malha.ligaPct, rot: `liga ${malha.ligaPct}%` },
                  ]
                : []
            }
          />
          <div style={{ marginTop: 8 }}>
            <Pares
              itens={[
                ['Volume', `${num(res.volumeM3, 0)} / ${num(res.capacidadeM3, 0)} m³`],
                ['Entrada', `${num(res.entradaLs, 1)} L/s`],
                ['Saída', `${num(res.saidaLs, 1)} L/s`],
                ['Autonomia', `${num(Math.min(res.autonomiaH, 99), 1)} h`],
                ['Chamando bombeamento', res.chamando ? 'sim' : 'não'],
              ]}
            />
          </div>
          <Sparkline t={hist.t} v={hist.v} cor="var(--serie-1)" altura={40} />
        </div>
      )}

      {poco && (
        <div>
          <div className="drawer-secao-tit">Poço de sucção</div>
          <Tanque
            nivelPct={poco.nivelPct}
            esgoto
            marcas={
              malha
                ? [
                    { pct: malha.ligaPct, rot: `liga ${malha.ligaPct}%` },
                    { pct: malha.desligaPct, rot: `desliga ${malha.desligaPct}%` },
                  ]
                : []
            }
          />
          <div style={{ marginTop: 8 }}>
            <Pares
              itens={[
                ['Afluente', `${num(poco.afluenteLs, 1)} L/s`],
                ['Recalque', `${num(poco.recalqueLs, 1)} L/s`],
                ['Volume útil', `${num(poco.capacidadeM3, 0)} m³`],
                ['Extravasando', poco.extravasando ? 'SIM' : 'não'],
              ]}
            />
          </div>
        </div>
      )}

      {ete && (
        <div>
          <div className="drawer-secao-tit">Tratamento</div>
          <div style={{ marginBottom: 8 }}>
            <Chip estado={ete.conforme ? 'ok' : 'critico'}>
              {ete.conforme ? 'Efluente conforme' : 'Fora do padrão'}
            </Chip>
          </div>
          <Pares
            itens={[
              ['Processo', u.tratamento],
              ['Vazão afluente', `${num(ete.afluenteLs, 1)} L/s`],
              ['Carga hidráulica', `${num(ete.cargaPct, 0)} %`],
              ['DBO afluente', `${num(ete.dboAfluenteMgL, 0)} mg/L`],
              ['DBO efluente', `${num(ete.dboEfluenteMgL, 0)} mg/L`],
              ['Remoção de DBO', `${num(ete.remocaoDbo * 100, 1)} %`],
              ['OD no reator', `${num(ete.odMgL, 2)} mg/L`],
            ]}
          />
        </div>
      )}

      {qual && (
        <div>
          <div className="drawer-secao-tit">Qualidade na saída</div>
          <Pares
            itens={[
              ['Cloro residual livre', `${num(qual.cloroMgL, 2)} mg/L`],
              ['pH', num(qual.ph, 2)],
              ['Turbidez', `${num(qual.turbidezUT, 2)} uT`],
              ['Fluoreto', `${num(qual.fluoretoMgL, 2)} mg/L`],
            ]}
          />
        </div>
      )}

      {bombas.length > 0 && (
        <div>
          <div className="drawer-secao-tit">Conjuntos motobomba ({bombas.length})</div>
          <table className="tabela compacta">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Modo</th>
                <th>Estado</th>
                <th className="n">Corrente</th>
                <th className="n">Horímetro</th>
              </tr>
            </thead>
            <tbody>
              {bombas.map((b) => {
                const [cor, rot] = ROTULO_BOMBA[b.estado] ?? ROTULO_BOMBA.parada;
                return (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => abrirBomba(b.id)}>
                    <td className="principal">{b.id}</td>
                    <td>
                      <span className={`selo-modo${b.modo === 'manual' ? ' man' : ''}`}>
                        {b.modo === 'manual' ? 'MAN' : 'AUTO'}
                      </span>
                    </td>
                    <td>
                      <Chip estado={cor} pequeno>
                        {rot}
                      </Chip>
                    </td>
                    <td className="n">{num(b.correnteA, 0)} A</td>
                    <td className="n">{horimetro(b.horimetroH)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="nota">Clique num conjunto para abrir o faceplate de operação.</p>
        </div>
      )}

      {malha && (
        <div>
          <div className="drawer-secao-tit">Malha de controle</div>
          <Pares
            itens={[
              ['Estratégia', malha.descricao],
              ['Modo', malha.modo === 'fora' ? 'FORA DE SERVIÇO' : 'Automático'],
              malha.ligaPct != null && ['Setpoint de partida', `${malha.ligaPct} %`],
              malha.desligaPct != null && ['Setpoint de parada', `${malha.desligaPct} %`],
              malha.nivelMinSuccaoPct != null && [
                'Mínimo de sucção',
                `${malha.nivelMinSuccaoPct} %`,
              ],
            ].filter(Boolean)}
          />
        </div>
      )}

      <div>
        <div className="drawer-secao-tit">Cadastro</div>
        <Pares
          itens={[
            ['Coordenadas', `${num(u.lat, 6)}, ${num(u.lon, 6)}`],
            ['CLP', u.clp ?? '—'],
            ['Origem do dado', u.confirmada ? 'Coordenada SAAE' : 'Estimada'],
            u.mananancial && ['Manancial', u.mananancial],
            u.alturaManometricaM && ['Altura manométrica', `${u.alturaManometricaM} m`],
          ].filter(Boolean)}
        />
      </div>
    </Drawer>
  );
}
