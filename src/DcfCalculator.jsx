import React, { useState, useEffect, useMemo } from 'react';
import { Save, FolderOpen, Trash2, X, AlertTriangle, RotateCcw } from 'lucide-react';

const DEFAULTS = {
  year1Revenue: 1000,
  growthRate: 10,
  fcfMargin: 20,
  terminalGrowth: 2.5,
  wacc: 10,
};

const CURRENT_KEY = 'dcf5:current';
const SCENARIO_PREFIX = 'dcf5:scenario:';

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function fmt(v, decimals = 1) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const neg = v < 0;
  const abs = Math.abs(v);
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return neg ? `(${s})` : s;
}

function slugify(name) {
  const base = (name || '새 분석').trim().replace(/[\s/\\'"]+/g, '_').slice(0, 80);
  return base || 'untitled';
}

function NumField({ label, value, onChange, suffix, step = 0.1 }) {
  return (
    <div className="dcf-row">
      <span className="dcf-row-label">{label}</span>
      <span className="dcf-row-input-wrap">
        <input
          className="dcf-row-input"
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
        {suffix ? <span className="dcf-row-suffix">{suffix}</span> : null}
      </span>
    </div>
  );
}

export default function DcfCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [scenarioName, setScenarioName] = useState('새 분석');
  const [hydrated, setHydrated] = useState(false);
  const [savedList, setSavedList] = useState([]);
  const [showLoadPanel, setShowLoadPanel] = useState(false);
  const [toast, setToast] = useState('');

  const updateInput = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

  function refreshScenarioList() {
    try {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(SCENARIO_PREFIX)) continue;
        try {
          const raw = localStorage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : null;
          items.push({
            key,
            name: (parsed && parsed.scenarioName) || key.replace(SCENARIO_PREFIX, ''),
            savedAt: parsed && parsed.savedAt,
          });
        } catch (e) {
          items.push({ key, name: key.replace(SCENARIO_PREFIX, ''), savedAt: null });
        }
      }
      items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      setSavedList(items);
    } catch (e) {
      setSavedList([]);
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.inputs) setInputs((prev) => ({ ...DEFAULTS, ...parsed.inputs }));
        if (parsed.scenarioName) setScenarioName(parsed.scenarioName);
      }
    } catch (e) {
      /* 저장된 초안 없음 */
    }
    setHydrated(true);
    refreshScenarioList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CURRENT_KEY, JSON.stringify({ scenarioName, inputs }));
      } catch (e) {
        /* 저장 공간 부족 등 */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [inputs, scenarioName, hydrated]);

  function handleSave() {
    const key = `${SCENARIO_PREFIX}${slugify(scenarioName)}`;
    try {
      localStorage.setItem(key, JSON.stringify({ scenarioName: scenarioName || '새 분석', inputs, savedAt: Date.now() }));
      setToast('저장됨');
      refreshScenarioList();
    } catch (e) {
      setToast('저장 실패');
    }
    setTimeout(() => setToast(''), 1500);
  }

  function handleLoad(item) {
    try {
      const raw = localStorage.getItem(item.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setInputs((prev) => ({ ...DEFAULTS, ...parsed.inputs }));
        setScenarioName(parsed.scenarioName || item.name);
      }
    } catch (e) {
      /* noop */
    }
    setShowLoadPanel(false);
  }

  function handleDelete(item) {
    try {
      localStorage.removeItem(item.key);
    } catch (e) {
      /* noop */
    }
    refreshScenarioList();
  }

  function handleNew() {
    setInputs(DEFAULTS);
    setScenarioName('새 분석');
  }

  const calc = useMemo(() => {
    const year1Revenue = n(inputs.year1Revenue);
    const growthRate = n(inputs.growthRate) / 100;
    const fcfMargin = n(inputs.fcfMargin) / 100;
    const wacc = n(inputs.wacc) / 100;
    const tg = n(inputs.terminalGrowth) / 100;

    const rows = [];
    let revenue = year1Revenue;
    for (let i = 1; i <= 5; i++) {
      if (i > 1) revenue = revenue * (1 + growthRate);
      const fcf = revenue * fcfMargin;
      const discount = Math.pow(1 + wacc, i);
      const pv = fcf / discount;
      rows.push({ year: i, revenue, fcf, pv });
    }

    const sumPV = rows.reduce((s, r) => s + r.pv, 0);
    const valid = wacc > tg;
    let pvTV = null, totalValue = null;
    if (valid) {
      const lastFCF = rows[4].fcf;
      const TV = (lastFCF * (1 + tg)) / (wacc - tg);
      pvTV = TV / Math.pow(1 + wacc, 5);
      totalValue = sumPV + pvTV;
    }
    return { rows, sumPV, pvTV, totalValue, valid };
  }, [inputs]);

  const maxAbsFcf = Math.max(...calc.rows.map((r) => Math.abs(r.fcf)), 1);

  return (
    <div className="dcf-root">
      <style>{`
        .dcf-root { background:#12151A; color:#E8E6DE; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; min-height:100vh; padding:16px 16px 40px; box-sizing:border-box; }
        .dcf-header-top { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
        .dcf-title { font-size:12.5px; color:#8B8F98; font-weight:500; }
        .dcf-toast { font-size:12px; color:#4C9A7E; }
        .dcf-header-row { display:flex; align-items:center; gap:8px; margin-bottom:18px; }
        .dcf-name-input { background:transparent; border:none; border-bottom:1px solid #2A2F38; color:#E8E6DE; font-size:18px; font-weight:600; padding:4px 0; flex:1; min-width:0; }
        .dcf-name-input:focus { outline:none; border-bottom-color:#C99A3D; }
        .dcf-icon-btn { background:none; border:1px solid #2A2F38; color:#E8E6DE; border-radius:8px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .dcf-icon-btn:active { background:#1B2028; }
        .dcf-hero { background:#171B22; border:1px solid #2A2F38; border-radius:14px; padding:20px; margin-bottom:18px; }
        .dcf-hero-label { font-size:12px; color:#8B8F98; margin-bottom:6px; }
        .dcf-hero-value { font-variant-numeric:tabular-nums; font-size:36px; font-weight:700; letter-spacing:-0.01em; line-height:1.1; }
        .dcf-hero-hint { margin-top:10px; font-size:12px; color:#6E7280; }
        .dcf-warning { display:flex; gap:8px; align-items:flex-start; background:rgba(193,85,74,0.12); border:1px solid rgba(193,85,74,0.4); color:#D98C83; padding:10px 12px; border-radius:10px; font-size:13px; margin-bottom:18px; }
        .dcf-card { border:1px solid #232830; border-radius:12px; padding:6px 14px; margin-bottom:22px; display:flex; flex-direction:column; gap:14px; }
        .dcf-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:6px 0; }
        .dcf-row-label { font-size:13.5px; color:#B7BAC2; flex:1; }
        .dcf-row-input-wrap { display:flex; align-items:center; gap:6px; flex-shrink:0; }
        .dcf-row-input { width:90px; background:#1B2028; border:1px solid #2A2F38; border-radius:8px; color:#E8E6DE; padding:7px 8px; text-align:right; font-variant-numeric:tabular-nums; font-size:14px; }
        .dcf-row-input:focus { outline:none; border-color:#C99A3D; }
        .dcf-row-suffix { font-size:12px; color:#6E7280; min-width:18px; }
        .dcf-block-title { font-size:14px; font-weight:600; margin:0 2px 10px; }
        .dcf-table-wrap { overflow-x:auto; margin:0 0 22px; border:1px solid #232830; border-radius:10px; }
        .dcf-table { border-collapse:collapse; width:100%; font-size:13px; }
        .dcf-table th, .dcf-table td { padding:9px 12px; text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
        .dcf-table th:first-child, .dcf-table td:first-child { text-align:left; position:sticky; left:0; background:#12151A; color:#B7BAC2; font-weight:500; }
        .dcf-table thead th { color:#8B8F98; font-weight:500; border-bottom:1px solid #232830; }
        .dcf-table tbody tr:not(:last-child) td { border-bottom:1px solid #1D2129; }
        .dcf-table tbody tr.dcf-fcf-row td { color:#E8E6DE; font-weight:600; }
        .dcf-bars { display:flex; align-items:flex-end; gap:8px; height:80px; margin:0 0 26px; padding:0 2px; }
        .dcf-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; gap:6px; }
        .dcf-bar { width:100%; border-radius:4px 4px 0 0; background:#4C9A7E; min-height:2px; }
        .dcf-bar-label { font-size:10.5px; color:#6E7280; }
        .dcf-bridge { display:flex; flex-direction:column; gap:9px; }
        .dcf-bridge-row { display:flex; justify-content:space-between; font-size:13.5px; }
        .dcf-bridge-row.total { border-top:1px solid #2A2F38; padding-top:10px; margin-top:4px; font-weight:700; font-size:15px; }
        .dcf-bridge-label { color:#B7BAC2; }
        .dcf-bridge-row.total .dcf-bridge-label { color:#E8E6DE; }
        .dcf-bridge-value { font-variant-numeric:tabular-nums; }
        .dcf-hint { font-size:11.5px; color:#6E7280; line-height:1.5; }
        .dcf-panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:flex-end; z-index:50; }
        .dcf-panel { background:#171B22; border-radius:16px 16px 0 0; width:100%; max-height:70vh; overflow-y:auto; padding:18px 16px 24px; border-top:1px solid #2A2F38; }
        .dcf-panel-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .dcf-panel-title { font-size:15px; font-weight:600; }
        .dcf-scenario-item { display:flex; align-items:center; justify-content:space-between; padding:12px 4px; border-bottom:1px solid #232830; }
        .dcf-scenario-name { font-size:14px; }
        .dcf-scenario-actions { display:flex; gap:8px; }
        .dcf-empty { color:#6E7280; font-size:13px; padding:20px 4px; text-align:center; line-height:1.6; }
      `}</style>

      <div className="dcf-header-top">
        <span className="dcf-title">5개년 DCF 계산기</span>
        {toast ? <span className="dcf-toast">{toast}</span> : null}
      </div>
      <div className="dcf-header-row">
        <input
          className="dcf-name-input"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="종목명 또는 시나리오 이름"
        />
        <button className="dcf-icon-btn" onClick={handleNew} title="새로 만들기">
          <RotateCcw size={16} />
        </button>
        <button
          className="dcf-icon-btn"
          onClick={() => {
            setShowLoadPanel(true);
            refreshScenarioList();
          }}
          title="불러오기"
        >
          <FolderOpen size={16} />
        </button>
        <button className="dcf-icon-btn" onClick={handleSave} title="저장">
          <Save size={16} />
        </button>
      </div>

      <div className="dcf-hero">
        <div className="dcf-hero-label">DCF 가치 합계</div>
        <div className="dcf-hero-value">{calc.valid ? fmt(calc.totalValue, 0) : '계산 불가'}</div>
        <div className="dcf-hero-hint">입력한 매출과 동일한 단위 (예: 백만 달러)</div>
      </div>

      {!calc.valid ? (
        <div className="dcf-warning">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>WACC은 영구성장률보다 커야 계산할 수 있어요.</span>
        </div>
      ) : null}

      <div className="dcf-card">
        <NumField label="1년차 매출" value={inputs.year1Revenue} onChange={(v) => updateInput('year1Revenue', v)} step={1} />
        <NumField label="5년 기하평균 성장률" value={inputs.growthRate} onChange={(v) => updateInput('growthRate', v)} suffix="%" step={0.5} />
        <NumField label="FCF 마진율" value={inputs.fcfMargin} onChange={(v) => updateInput('fcfMargin', v)} suffix="%" step={0.5} />
        <NumField label="영구성장률" value={inputs.terminalGrowth} onChange={(v) => updateInput('terminalGrowth', v)} suffix="%" step={0.25} />
        <NumField label="WACC" value={inputs.wacc} onChange={(v) => updateInput('wacc', v)} suffix="%" step={0.25} />
      </div>

      <div className="dcf-block-title">5개년 추정</div>
      <div className="dcf-table-wrap">
        <table className="dcf-table">
          <thead>
            <tr>
              <th></th>
              {calc.rows.map((r) => (
                <th key={r.year}>{r.year}년차</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>매출액</td>
              {calc.rows.map((r) => (
                <td key={r.year}>{fmt(r.revenue, 0)}</td>
              ))}
            </tr>
            <tr className="dcf-fcf-row">
              <td>FCF</td>
              {calc.rows.map((r) => (
                <td key={r.year}>{fmt(r.fcf, 0)}</td>
              ))}
            </tr>
            <tr>
              <td>현재가치(PV)</td>
              {calc.rows.map((r) => (
                <td key={r.year}>{fmt(r.pv, 0)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="dcf-block-title">연도별 FCF 추이</div>
      <div className="dcf-bars">
        {calc.rows.map((r) => {
          const heightPct = Math.max((Math.abs(r.fcf) / maxAbsFcf) * 100, 2);
          return (
            <div className="dcf-bar-col" key={r.year}>
              <div className="dcf-bar" style={{ height: `${heightPct}%` }}></div>
              <span className="dcf-bar-label">{r.year}Y</span>
            </div>
          );
        })}
      </div>

      <div className="dcf-block-title">가치 구성</div>
      <div className="dcf-bridge">
        <div className="dcf-bridge-row">
          <span className="dcf-bridge-label">추정기간 FCF의 현재가치 합</span>
          <span className="dcf-bridge-value">{calc.valid ? fmt(calc.sumPV, 0) : '—'}</span>
        </div>
        <div className="dcf-bridge-row">
          <span className="dcf-bridge-label">잔존가치(Terminal Value)의 현재가치</span>
          <span className="dcf-bridge-value">{calc.valid ? fmt(calc.pvTV, 0) : '—'}</span>
        </div>
        <div className="dcf-bridge-row total">
          <span className="dcf-bridge-label">DCF 가치 합계</span>
          <span className="dcf-bridge-value">{calc.valid ? fmt(calc.totalValue, 0) : '—'}</span>
        </div>
      </div>

      <div className="dcf-hint" style={{ marginTop: 18 }}>
        입력값은 이 기기(브라우저)에 자동 저장됩니다.
      </div>

      {showLoadPanel ? (
        <div className="dcf-panel-overlay" onClick={() => setShowLoadPanel(false)}>
          <div className="dcf-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dcf-panel-header">
              <span className="dcf-panel-title">저장된 시나리오</span>
              <button className="dcf-icon-btn" onClick={() => setShowLoadPanel(false)}>
                <X size={16} />
              </button>
            </div>
            {savedList.length === 0 ? (
              <div className="dcf-empty">아직 저장된 시나리오가 없어요.<br />현재 화면에서 저장 버튼을 눌러보세요.</div>
            ) : (
              savedList.map((item) => (
                <div className="dcf-scenario-item" key={item.key}>
                  <span className="dcf-scenario-name" onClick={() => handleLoad(item)}>
                    {item.name}
                  </span>
                  <div className="dcf-scenario-actions">
                    <button className="dcf-icon-btn" onClick={() => handleLoad(item)}>
                      <FolderOpen size={14} />
                    </button>
                    <button className="dcf-icon-btn" onClick={() => handleDelete(item)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
