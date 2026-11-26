
/*
 * CadaGota v21.3
 * Monitoratge real de sis plantes.
 *
 * - Dades reals de Supabase
 * - Conserva l'ultima humitat registrada
 * - Identifica les lectures antigues
 * - Relleotge de tres anells
 * - Gra fiques desplegables
 * - Avisos dins de la web
 * - Sense ordres remotes al rele
 */

(() => {
  'use strict';

  const ROOT = document.getElementById('cg-dashboard');
  if (!ROOT) return;

  const URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';

  // Clau publica de Supabase.
  const KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';

  const $ = id => document.getElementById(id);

  const fmt = new Intl.NumberFormat('ca-ES', {
    maximumFractionDigits: 1
  });

  const periodOptions = [
    ['10 min', 1 / 6],
    ['1 h', 1],
    ['24 h', 24],
    ['7 d', 168],
    ['30 d', 720]
  ];

  const state = {
    rows: [],
    configs: [],
    hours: {},
    busy: false,
    updatedAt: 0,
    error: null
  };

  for (let i = 1; i <= 6; i++) {
    state.hours[i] = 24;
  }

  // ============================================
  // UTILITATS
  // ============================================

  function node(tag, cls, txt) {
    const n = document.createElement(tag);

    if (cls) n.className = cls;
    if (txt !== undefined) n.textContent = txt;

    return n;
  }

  function svg(tag, attrs = {}, txt) {
    const n = document.createElementNS(
      'http://www.w3.org/2000/svg',
      tag
    );

    for (const [k, v] of Object.entries(attrs)) {
      n.setAttribute(k, String(v));
    }

    if (txt !== undefined) n.textContent = txt;

    return n;
  }

  function validDate(value) {
    const d = new Date(value);

    return Number.isFinite(d.getTime()) ? d : null;
  }

  function percent(raw, config) {
    if (
      !config ||
      !Number.isInteger(config.raw_sec) ||
      !Number.isInteger(config.raw_humit) ||
      Math.abs(config.raw_humit - config.raw_sec) < 20
    ) {
      return null;
    }

    const value = Number(raw);

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 4095
    ) {
      return null;
    }

    const result =
      100 * (value - config.raw_sec) /
      (config.raw_humit - config.raw_sec);

    return Math.max(0, Math.min(100, result));
  }

  function timeAge(value) {
    const d = validDate(value);

    if (!d) return 'Data desconeguda';

    const seconds = Math.max(
      0,
      Math.floor((Date.now() - d.getTime()) / 1000)
    );

    if (seconds < 60) {
      return `Fa ${seconds} s`;
    }

    if (seconds < 3600) {
      return `Fa ${Math.floor(seconds / 60)} min`;
    }

    if (seconds < 86400) {
      return `Fa ${Math.floor(seconds / 3600)} h`;
    }

    return `Fa ${Math.floor(seconds / 86400)} dies`;
  }

  function configFor(number) {
    return state.configs.find(
      c => Number(c.jardinera) === number
    ) || null;
  }

  function indicator(title, figure, description, color, progress = null) {
    const box = node('div', `cg-indicator cg-indicator--${color}`);
    const ring = node('div', 'cg-reading-ring');
    if (progress !== null) ring.style.setProperty('--cg-progress', `${progress}%`);
    const content = node('div', 'cg-reading-ring-center');
    content.append(node('strong', 'cg-indicator-value', figure));
    if (description) content.append(node('small', '', description));
    ring.append(content);
    box.append(ring, node('span', 'cg-indicator-title', title));
    return box;
  }

  // ============================================
  // CONSULTES A SUPABASE
  // ============================================

  async function read(table, params) {
    const abort = new AbortController();

    const timer = setTimeout(
      () => abort.abort(),
      12000
    );

    try {
      const response = await fetch(
        `${URL}/rest/v1/${table}?${params.toString()}`,
        {
          headers: {
            apikey: KEY,
            Accept: 'application/json'
          },
          cache: 'no-store',
          signal: abort.signal
        }
      );

      if (!response.ok) {
        throw new Error(
          `${table}: HTTP ${response.status}`
        );
      }

      const rows = await response.json();

      if (!Array.isArray(rows)) {
        throw new Error(
          `Resposta de dades no vàlida: ${table}`
        );
      }

      return rows;

    } finally {
      clearTimeout(timer);
    }
  }

  // ============================================
  // DIAGNOSTIC DEL RELE
  // ============================================

  // ============================================
  // FITXES DE LES SIS PLANTES
  // ============================================

  function buildPlant(i) {
    const config = configFor(i);

    const disabled = config?.sensor_connectat === false;
    const row = disabled ? null : state.rows.find(reading => reading.jardinera === i) || null;
    const connected = Boolean(row);

    const date = row ? validDate(row.created_at) : null;

    const age = date
      ? Date.now() - date.getTime()
      : Infinity;

    const stale =
      !Number.isFinite(age) ||
      age > 90000 ||
      age < -30000;

    const name =
      config?.nom_planta?.trim() ||
      `Planta ${String(i).padStart(2, '0')}`;

    const species =
      config?.especie?.trim() ||
      'Espècie pendent d’identificar';

    const wrap = node(
      'article',
      'cg-plant' + (!connected ? ' cg-disconnected' : '')
    );

    wrap.id = `cg-plant-${i}`;

    // CAPCALERA

    const head = node('div', 'cg-plant-head');
    const heading = node('div', '');

    heading.append(
      node(
        'p',
        'cg-kicker',
        `JARDINERA ${String(i).padStart(2, '0')} · PIN A${i - 1}`
      ),
      node('h2', '', name),
      node('em', 'cg-species', species)
    );

    const label = disabled
      ? 'Pendent de connectar'
      : config?.sensor_connectat === true || row
        ? 'Connectada'
        : 'Pendent de lectura';

    heading.append(node('span', 'cg-pill ' +
      (label === 'Connectada' ? 'cg-connected' : 'cg-inactive'), label));
    head.append(heading);
    wrap.append(head);

    // ============================================
    // HUMITAT
    // ========================================

    const humidity = row ? percent(row.humitat_raw, config) : null;

    const relay =
      row && !stale
        ? row.bomba_activa
        : null;

    const values = node('div', 'cg-indicators');

    const humidityText = humidity !== null
      ? `${fmt.format(humidity)}%`
      : row ? `${row.humitat_raw} RAW` : '—';

    const humidityDescription = row
      ? (humidity === null ? 'Calibració pendent' : `${row.humitat_raw} RAW`)
      : (disabled ? '' : 'Esperant lectures');

    const relayText = relay === true ? 'Obert' : relay === false ? 'Tancat' : '—';
    const relayColor = relay === true ? 'open' : relay === false ? 'closed' : 'unknown';
    values.append(
      indicator('Humitat del sòl', humidityText, humidityDescription, 'humidity', humidity),
      indicator('Estat del relé', relayText, '', relayColor)
    );
    head.append(values);

    // ========================================
    // GRAFICA DESPLEGABLE
    // ========================================

    if (connected) {
      const detail = node('details', 'cg-chart-details');

      const summary = node(
        'summary',
        '',
        'Consultar l’evolució de la humitat'
      );

      detail.append(summary);

      const inner = node('div', 'cg-chart-inner');
      const controls = node('div', 'cg-periods');

      for (const [text, hours] of periodOptions) {
        const button = node('button', '', text);

        button.type = 'button';

        button.setAttribute(
          'aria-pressed',
          String(state.hours[i] === hours)
        );

        button.addEventListener('click', () => {
          state.hours[i] = hours;

          for (
            const b of controls.querySelectorAll('button')
          ) {
            b.setAttribute(
              'aria-pressed',
              String(b === button)
            );
          }

          renderPlantChart(i, inner);
        });

        controls.append(button);
      }

      inner.append(
        controls,
        node('div', 'cg-chart-target'),
        node(
          'p',
          'cg-chart-caption',
          'Només lectures reals. Els períodes sense dades no es representen com a continuïtat.'
        )
      );

      detail.append(inner);

      detail.addEventListener('toggle', () => {
        if (detail.open) {
          renderPlantChart(i, inner);
        }
      });

      wrap.append(detail);

    } else {
      wrap.append(
        node(
          'p',
          'cg-pending',
          'Historial no disponible fins que hi hagi un sensor assignat i dades reals.'
        )
      );
    }

    return wrap;
  }

  // ============================================
  // SEGMENTACIO DE LES GRAFIQUES
  // ============================================

  function segmentData(data, gapMs) {
    const paths = [];
    const current = [];

    for (const point of data) {
      if (
        current.length &&
        point.t - current[current.length - 1].t > gapMs
      ) {
        paths.push([...current]);
        current.length = 0;
      }

      current.push(point);
    }

    if (current.length) {
      paths.push(current);
    }

    return paths;
  }

  // ============================================
  // GRAFIQUES D'HUMITAT
  // ============================================

  function renderPlantChart(i, inner) {
    const target = inner.querySelector('.cg-chart-target');

    if (!target) return;

    target.replaceChildren();

    const config = configFor(i);
    const hours = state.hours[i];

    const now = Date.now();
    const start = now - hours * 3600000;

    const calibrated = Boolean(
      config &&
      Number.isInteger(config.raw_sec) &&
      Number.isInteger(config.raw_humit) &&
      Math.abs(config.raw_sec - config.raw_humit) >= 20
    );

    const series = state.rows
      .filter(row => {
        const t = new Date(row.created_at).getTime();

        return (
          row.jardinera === i &&
          Number.isFinite(t) &&
          t >= start &&
          t <= now &&
          Number.isInteger(row.humitat_raw) &&
          row.humitat_raw >= 0 &&
          row.humitat_raw <= 4095
        );
      })
      .map(row => ({
        t: new Date(row.created_at).getTime(),
        v: calibrated
          ? percent(row.humitat_raw, config)
          : row.humitat_raw
      }))
      .filter(point => Number.isFinite(point.v))
      .sort((a, b) => a.t - b.t);

    if (!series.length) {
      target.append(
        node(
          'p',
          'cg-muted',
          'No hi ha lectures reals en aquest període.'
        )
      );
      return;
    }

    const values = series.map(point => point.v);

    const minV = calibrated
      ? 0
      : Math.max(0, Math.min(...values) - 50);

    let maxV = calibrated
      ? 100
      : Math.min(4095, Math.max(...values) + 50);

    if (maxV <= minV) {
      maxV = minV + 1;
    }

    // Agregacio temporal per simplificar la grafica.

    const buckets = Math.min(
      90,
      Math.max(20, Math.ceil(720 / hours))
    );

    const bucketWidth = (now - start) / buckets;

    const grouped = [];

    for (let k = 0; k < buckets; k++) {
      const beginning = start + k * bucketWidth;
      const ending = beginning + bucketWidth;

      const group = series.filter(
        d => d.t >= beginning && d.t < ending
      );

      if (group.length) {
        grouped.push({
          t: group[Math.floor(group.length / 2)].t,
          v: group.reduce(
            (sum, d) => sum + d.v,
            0
          ) / group.length
        });
      }
    }

    const width = 840;
    const height = 290;

    const padding = {
      l: 54,
      r: 16,
      t: 18,
      b: 39
    };

    const plotWidth = width - padding.l - padding.r;
    const plotHeight = height - padding.t - padding.b;

    const x = t =>
      padding.l +
      (t - start) / (now - start) * plotWidth;

    const y = v =>
      padding.t +
      plotHeight -
      (v - minV) / (maxV - minV) * plotHeight;

    const chart = svg('svg', {
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label':
        `Historial de ${hours} hores, ${series.length} lectures`
    });

    // Linies horitzontals.

    for (let j = 0; j <= 4; j++) {
      const yy = padding.t + j * plotHeight / 4;

      chart.append(
        svg('line', {
          x1: padding.l,
          y1: yy,
          x2: width - padding.r,
          y2: yy,
          stroke: '#dce2dc',
          'stroke-width': 1
        })
      );

      const value =
        maxV - j * (maxV - minV) / 4;

      chart.append(
        svg('text', {
          x: padding.l - 8,
          y: yy + 5,
          'text-anchor': 'end',
          class: 'cg-axis'
        }, `${fmt.format(value)}${calibrated ? '%' : ''}`)
      );
    }

    // Eix temporal.

    const format = new Intl.DateTimeFormat(
      'ca-ES',
      hours <= 24
        ? {hour: '2-digit', minute: '2-digit'}
        : {day: '2-digit', month: 'short'}
    );

    for (let j = 0; j <= 4; j++) {
      chart.append(
        svg('text', {
          x: padding.l + j * plotWidth / 4,
          y: height - 8,
          'text-anchor':
            j === 0
              ? 'start'
              : j === 4
                ? 'end'
                : 'middle',
          class: 'cg-axis'
        }, format.format(
          new Date(start + j * (now - start) / 4)
        ))
      );
    }

    // No unir intervals sense dades.

    const gap = Math.max(
      90000,
      bucketWidth * 2.5
    );

    for (const segment of segmentData(grouped, gap)) {
      if (segment.length > 1) {
        chart.append(
          svg('polyline', {
            points: segment
              .map(d =>
                `${x(d.t).toFixed(2)},${y(d.v).toFixed(2)}`
              )
              .join(' '),
            fill: 'none',
            stroke: '#438b97',
            'stroke-width': 2.5,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          })
        );
      } else {
        chart.append(
          svg('circle', {
            cx: x(segment[0].t),
            cy: y(segment[0].v),
            r: 3.5,
            fill: '#438b97'
          })
        );
      }
    }

    if (hours <= 1) {
      for (const d of grouped) {
        chart.append(
          svg('circle', {
            cx: x(d.t),
            cy: y(d.v),
            r: 2,
            fill: '#438b97'
          })
        );
      }
    }

    target.append(chart);

    const unit = calibrated
      ? 'índex d’humitat calibrat (%)'
      : 'lectures RAW (sense calibració)';

    target.append(
      node(
        'p',
        'cg-muted',
        `${series.length} lectures registrades · ` +
        `${grouped.length} intervals representats · ` +
        `${unit}. Les mitjanes són només de visualització.`
      )
    );
  }

  // ============================================
  // DIPOSIT D'AIGUA
  // ============================================

  function renderTank(latest) {
    const tankState = $('cg-tank-state');
    const tankDetail = $('cg-tank-detail');

    if (!tankState || !tankDetail) return;
    const water = document.querySelector('.cg-tank-visual svg g[clip-path]');
    const timestamp = latest ? validDate(latest.created_at) : null;
    const readingAge = timestamp ? Date.now() - timestamp.getTime() : Infinity;
    const level = readingAge >= -30000 && readingAge <= 90000
      ? latest.diposit_ok
      : null;
    
    if (water) {
      const [fill, surface] = water.querySelectorAll('path');
      const known = level === true || level === false;
      water.style.display = known ? '' : 'none';
    
      if (known && fill && surface) {
        const y = level ? 112 : 185;
        const wave = `M28 ${y} Q61 ${y - 6} 95 ${y} T162 ${y}`;
        fill.setAttribute('d', `${wave} V207 H28 Z`);
        surface.setAttribute('d', wave);
      }
    }

    if (!latest) {
      tankState.textContent = 'Sense dades reals';

      tankDetail.textContent =
        'Encara no s’ha rebut cap lectura.';

      return;
    }

    const date = validDate(latest.created_at);

    const age = date
      ? Date.now() - date.getTime()
      : Infinity;

    const fresh =
      age >= -30000 &&
      age <= 90000;

    tankState.textContent = !fresh
      ? 'Lectura antiga'
      : latest.diposit_ok === true
        ? 'Aigua per sobre del flotador'
        : latest.diposit_ok === false
          ? 'Nivell inferior al flotador'
          : 'Estat desconegut';

    tankDetail.textContent =
      `Sensor D1 · ${timeAge(latest.created_at)}. ` +
      'El flotador només indica un nivell límit; ' +
      'el volum en litres encara no es pot estimar.';
  }

  // ============================================
  // AVISOS DINS DE LA WEB
  // ============================================

  function renderAlerts(latest) {
    const alerts = $('cg-alerts');

    if (!alerts) return;

    alerts.replaceChildren();

    function add(type, title, body) {
      const element = node(
        'div',
        `cg-alert cg-alert-${type}`
      );

      element.append(
        node('strong', '', title),
        node('span', '', body)
      );

      alerts.append(element);
    }

    if (state.error) {
      add(
        'error',
        'Error de consulta',
        state.error
      );
    }

    if (!latest) {
      add(
        'warn',
        'Sense lectures disponibles',
        'No hi ha lectures carregades. ' +
        'Un error de consulta no significa ' +
        'que les dades s’hagin esborrat.'
      );
      return;
    }

    const date = validDate(latest.created_at);

    const age = date
      ? Date.now() - date.getTime()
      : Infinity;

    if (!Number.isFinite(age) || age > 300000) {
      add(
        'warn',
        'Possible desconnexió',
        `Última lectura: ${timeAge(latest.created_at)}.`
      );
    } else if (age > 90000) {
      add(
        'warn',
        'Telemetria endarrerida',
        `Última lectura: ${timeAge(latest.created_at)}.`
      );
    } else if (latest.diposit_ok === false) {
      add(
        'warn',
        'Dipòsit per sota del límit',
        'El flotador indica un nivell insuficient.'
      );
    }

    const config = configFor(latest.jardinera);

    const humidity = percent(
      latest.humitat_raw,
      config
    );

    if (
      age >= -30000 &&
      age <= 90000 &&
      humidity !== null &&
      humidity < config?.humitat_minima &&
      latest.bomba_activa === false
    ) {
      add(
        'info',
        'Humitat baixa i relé desactivat',
        'Pot ser degut al bloqueig temporal. ' +
        'El firmware actual no comunica el motiu exacte.'
      );
    }
  }

  // ============================================
  // COMPARACIO ENTRE PLANTES
  // ============================================

  function renderCompare() {
    const target = $('cg-compare-content');

    if (!target) return;

    target.replaceChildren();

    const connected = [...new Set(state.rows.map(row => row.jardinera))]
      .filter(number => configFor(number)?.sensor_connectat !== false)
      .sort((a, b) => a - b);

    const elements = connected.map(number => {
      const latest = state.rows.find(row => row.jardinera === number);

      return {
        number,
        humidity: latest
          ? percent(
              latest.humitat_raw,
              configFor(number)
            )
          : null
      };
    });

    for (const item of elements) {
      const row = node('div', 'cg-compare-row');

      row.append(
        node(
          'span',
          '',
          configFor(item.number)?.nom_planta ||
          `Planta ${item.number}`
        )
      );

      const meter = node('div', 'cg-compare-meter');
      const fill = node('span', '');

      fill.style.width =
        `${item.humidity ?? 0}%`;

      meter.append(fill);

      row.append(
        meter,
        node(
          'strong',
          '',
          item.humidity === null
            ? '—'
            : `${fmt.format(item.humidity)}%`
        )
      );

      target.append(row);
    }

    target.append(
      node(
        'p',
        'cg-muted',
        'Comparació de les jardineres amb lectures reals.'
      )
    );
  }

  // ============================================
  // DIBUIXAR EL PANELL
  // ============================================

  function render() {
    const latest = state.rows[0] || null;

    const plants = $('cg-plants');

    if (plants) {
      const openCharts = new Set(
        [...plants.querySelectorAll('.cg-chart-details[open]')]
          .map(details => details.closest('.cg-plant').id)
      );
      const cards = [];
      for (let i = 1; i <= 6; i++) {
        const card = buildPlant(i);
        const chart = card.querySelector('.cg-chart-details');
        if (chart && openCharts.has(card.id)) chart.open = true;
        cards.push(card);
      }
      plants.replaceChildren(...cards);
    }

    renderTank(latest);
    renderAlerts(state.rows.find(row => configFor(row.jardinera)?.sensor_connectat !== false) || null);
    renderCompare();

    const status = $('cg-status');
    const clock = $('cg-reading-clock');
    const date = latest ? validDate(latest.created_at) : null;

    if (clock) {
      clock.textContent = date ? date.toLocaleTimeString('ca-ES', {
        hour: '2-digit', minute: '2-digit'
      }) : '—';
      if (date) clock.dateTime = date.toISOString();
      else clock.removeAttribute('datetime');
    }

    if (status) {
      if (state.error) {
        status.textContent =
          'Hi ha incidències en la consulta de dades.';
      } else if (latest) {
        const age = date ? Date.now() - date.getTime() : Infinity;
        status.textContent = (date ? date.toLocaleDateString('ca-ES', {
          day: 'numeric', month: 'short', year: 'numeric'
        }) : 'Data desconeguda') +
          (age > 90000 ? ' · Lectura antiga' : age < -30000 ? ' · Hora incorrecta' : '');
      } else {
        status.textContent =
          'Sense lectures reals disponibles';
      }
    }
  }

  // ============================================
  // CARREGAR DADES DE SUPABASE
  // ============================================

  async function load() {
    if (state.busy) return;

    state.busy = true;

    const refresh = $('cg-refresh');

    if (refresh) {
      refresh.disabled = true;
    }

    try {
      const since = new Date(
        Date.now() - 30 * 86400000
      ).toISOString();

      // Les consultes son independents.
      // Un error de configuracio no ha d'ocultar
      // la telemetria real.

      const results = await Promise.allSettled([
        read(
          'configuracio_reg',
          new URLSearchParams({
            select:
              'jardinera,nom_planta,especie,observacions,' +
              'raw_sec,raw_humit,humitat_minima,' +
              'humitat_maxima,mode_automatic,sensor_connectat',
            order: 'jardinera.asc',
            limit: '6'
          })
        ),

        Promise.all(Array.from({ length: 6 }, (_, index) => read(
          'telemetria_arduino',
          new URLSearchParams({
            select: 'jardinera,humitat_raw,diposit_ok,bomba_activa,created_at',
            jardinera: `eq.${index + 1}`,
            created_at: `gte.${since}`,
            order: 'created_at.desc',
            limit: '1000'
          })
        ))).then(groups => groups.flat().sort((a, b) =>
          Date.parse(b.created_at) - Date.parse(a.created_at)
        ))
      ]);

      const [configResult, telemetryResult] = results;
      const errors = [];

      if (configResult.status === 'fulfilled') {
        state.configs = configResult.value;
      } else {
        errors.push(
          'Configuració de les plantes: ' +
          String(
            configResult.reason?.message ||
            configResult.reason
          )
        );
      }

      if (telemetryResult.status === 'fulfilled') {
        state.rows = telemetryResult.value;
      } else {
        errors.push(
          'Lectures reals de l’Arduino: ' +
          String(
            telemetryResult.reason?.message ||
            telemetryResult.reason
          )
        );
      }

      state.error = errors.length
        ? errors.join(' · ')
        : null;

      state.updatedAt = Date.now();

    } catch (error) {
      state.error =
        error?.message ||
        'Error desconegut en carregar les dades';

    } finally {
      state.busy = false;

      if (refresh) {
        refresh.disabled = false;
      }

      render();
    }
  }

  // ============================================
  // INICIAR
  // ============================================

  const refreshButton = $('cg-refresh');

  if (refreshButton) {
    refreshButton.addEventListener('click', load);
  }

  load();

  setInterval(() => {
    if (!document.hidden) {
      load();
    }
  }, 30000);

  setInterval(() => {
    if (!document.hidden && !state.busy) {
      render();
    }
  }, 15000);

})();
