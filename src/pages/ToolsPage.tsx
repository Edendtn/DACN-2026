import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Ruler, Triangle, Droplets, Search, Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Sparkles, MessageSquare, Send, Loader2, Zap, Wind, Layers, Activity, Waves, ArrowRightLeft, LineChart } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';
import { generateContentWithRetry } from '../lib/gemini';
import Markdown from 'react-markdown';

type ToolCategory = 'mep' | 'construction' | 'water' | 'general';

export const ToolsPage = () => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('mep');

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Calculator className="w-3 h-3" />
            Hệ thống tính toán kỹ thuật
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-headline mb-4">
            Trung tâm <span className="text-red-600">Dữ liệu & Tính toán</span>
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Các công cụ chuyên ngành hỗ trợ tính toán nhanh, chính xác cho kỹ sư MEP, Xây dựng và Xử lý nước.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:w-80 space-y-4">
            {[
              { id: 'mep', name: 'Ngành MEP (Cơ Điện)', icon: Zap },
              { id: 'construction', name: 'Xây dựng & Kết cấu', icon: Layers },
              { id: 'water', name: 'Ngành Xử lý nước', icon: Waves },
              { id: 'general', name: 'Công cụ chung', icon: Ruler },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ToolCategory)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all border text-left",
                  activeCategory === cat.id 
                    ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20" 
                    : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                )}
              >
                <cat.icon className="w-5 h-5" />
                {cat.name}
              </button>
            ))}
          </aside>

          {/* Tool Content */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {activeCategory === 'mep' && <MEPTools key="mep" />}
              {activeCategory === 'construction' && <ConstructionTools key="construction" />}
              {activeCategory === 'water' && <WaterTools key="water" />}
              {activeCategory === 'general' && <GeneralTools key="general" />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

const MEPTools = () => {
  const [subTool, setSubTool] = useState<'voltage' | 'wire' | 'flow' | 'duct'>('voltage');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'voltage', name: 'Sụt áp' },
          { id: 'wire', name: 'Tiết diện dây' },
          { id: 'flow', name: 'Lưu lượng' },
          { id: 'duct', name: 'Ống gió' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTool(t.id as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              subTool === t.id ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {subTool === 'voltage' && <VoltageDropCalculator />}
      {subTool === 'wire' && <WireSizeSelector />}
      {subTool === 'flow' && <FlowConverterMEP />}
      {subTool === 'duct' && <DuctSizer />}
    </motion.div>
  );
};

const VoltageDropCalculator = () => {
  const [length, setLength] = useState<number>(100);
  const [current, setCurrent] = useState<number>(20);
  const [phase, setPhase] = useState<'1' | '3'>('1');
  const [material, setMaterial] = useState<'cu' | 'al'>('cu');
  const [voltage, setVoltage] = useState<number>(220);
  const [size, setSize] = useState<number>(2.5);

  const resistivity = material === 'cu' ? 0.0172 : 0.0282;
  const drop = (2 * length * current * (resistivity / size)) / (phase === '1' ? 1 : Math.sqrt(3));
  const dropPercent = (drop / voltage) * 100;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Tính toán sụt áp (Voltage Drop)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Chiều dài (m)</label>
          <input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dòng điện (A)</label>
          <input type="number" value={current} onChange={e => setCurrent(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tiết diện dây (mm²)</label>
          <input type="number" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Số pha</label>
          <select value={phase} onChange={e => setPhase(e.target.value as any)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            <option value="1">1 Pha (220V)</option>
            <option value="3">3 Pha (380V)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vật liệu</label>
          <select value={material} onChange={e => setMaterial(e.target.value as any)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            <option value="cu">Đồng (Copper)</option>
            <option value="al">Nhôm (Aluminum)</option>
          </select>
        </div>
      </div>
      <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Độ sụt áp (%)</p>
        <p className={cn("text-4xl font-black font-mono", dropPercent > 5 ? "text-red-600" : "text-green-600")}>
          {dropPercent.toFixed(2)}%
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {dropPercent > 5 ? "Cảnh báo: Vượt quá ngưỡng 5% tiêu chuẩn." : "Đạt tiêu chuẩn kỹ thuật (< 5%)."}
        </p>
      </div>
    </div>
  );
};

const WireSizeSelector = () => {
  const [power, setPower] = useState<number>(5);
  const [method, setMethod] = useState<'conduit' | 'tray'>('conduit');
  const [phase, setPhase] = useState<'1' | '3'>('1');

  const getRecommendedSize = () => {
    const current = phase === '1' ? (power * 1000) / (220 * 0.8) : (power * 1000) / (380 * 1.732 * 0.8);
    const factor = method === 'conduit' ? 4 : 6; 
    const size = current / factor;
    const standardSizes = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
    return standardSizes.find(s => s >= size) || 120;
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Chọn tiết diện dây điện</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Công suất (kW)</label>
          <input type="number" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Số pha</label>
          <select value={phase} onChange={e => setPhase(e.target.value as any)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            <option value="1">1 Pha</option>
            <option value="3">3 Pha</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cách lắp đặt</label>
          <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            <option value="conduit">Đi trong ống (Conduit)</option>
            <option value="tray">Trên thang máng cáp (Tray)</option>
          </select>
        </div>
      </div>
      <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Tiết diện dây khuyến nghị</p>
        <p className="text-4xl font-black text-blue-600 font-mono">
          {getRecommendedSize()} <span className="text-xl">mm²</span>
        </p>
      </div>
    </div>
  );
};

const FlowConverterMEP = () => {
  const [value, setValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState('m3/h');
  const [toUnit, setToUnit] = useState('l/s');

  const units: Record<string, number> = {
    'm3/h': 1,
    'l/s': 0.277778,
    'l/min': 16.6667,
    'cfm': 0.588578,
  };

  const result = (value / units[fromUnit]) * units[toUnit];

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Chuyển đổi lưu lượng</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Giá trị</label>
          <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Từ</label>
          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Sang</label>
          <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-8 p-6 bg-slate-50 rounded-2xl text-center">
        <p className="text-2xl font-black text-slate-900 font-mono">{result.toFixed(3)} {toUnit}</p>
      </div>
    </div>
  );
};

const DuctSizer = () => {
  const [flow, setFlow] = useState<number>(1000); 
  const [velocity, setVelocity] = useState<number>(5); 

  const area = (flow / 3600) / velocity; 
  const side = Math.sqrt(area) * 1000; 
  const diameter = Math.sqrt((4 * area) / Math.PI) * 1000; 

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Tính kích thước ống gió (Duct Sizer)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lưu lượng (m³/h)</label>
          <input type="number" value={flow} onChange={e => setFlow(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vận tốc gió (m/s)</label>
          <input type="number" value={velocity} onChange={e => setVelocity(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ống vuông tương đương</p>
          <p className="text-2xl font-black text-slate-900 font-mono">{Math.round(side)} x {Math.round(side)} <span className="text-sm">mm</span></p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ống tròn tương đương (Ø)</p>
          <p className="text-2xl font-black text-slate-900 font-mono">{Math.round(diameter)} <span className="text-sm">mm</span></p>
        </div>
      </div>
    </div>
  );
};

const ConstructionTools = () => {
  const [subTool, setSubTool] = useState<'slope' | 'geometry' | 'steel' | 'material'>('slope');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'slope', name: 'Độ dốc' },
          { id: 'geometry', name: 'Hình học' },
          { id: 'steel', name: 'Tra thép' },
          { id: 'material', name: 'Vật tư' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTool(t.id as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              subTool === t.id ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {subTool === 'slope' && <SlopeCalculator />}
      {subTool === 'geometry' && <ConstructionGeometry />}
      {subTool === 'steel' && <SteelLookup />}
      {subTool === 'material' && <MaterialEstimator />}
    </motion.div>
  );
};

const SlopeCalculator = () => {
  const [mode, setMode] = useState<'deg-to-pct' | 'pct-to-deg'>('deg-to-pct');
  const [value, setValue] = useState<number>(5);

  const result = mode === 'deg-to-pct' 
    ? Math.tan(value * Math.PI / 180) * 100 
    : Math.atan(value / 100) * 180 / Math.PI;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Tính toán độ dốc (Slope/Pitch)</h3>
      <div className="flex gap-4 mb-8">
        <button onClick={() => setMode('deg-to-pct')} className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all", mode === 'deg-to-pct' ? "bg-slate-900 text-white" : "bg-white text-slate-600")}>Độ (°) sang Phần trăm (%)</button>
        <button onClick={() => setMode('pct-to-deg')} className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all", mode === 'pct-to-deg' ? "bg-slate-900 text-white" : "bg-white text-slate-600")}>Phần trăm (%) sang Độ (°)</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Giá trị nhập vào</label>
          <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Kết quả chuyển đổi</p>
          <p className="text-4xl font-black text-slate-900 font-mono">
            {result.toFixed(2)}{mode === 'deg-to-pct' ? '%' : '°'}
          </p>
          <p className="mt-2 text-xs text-slate-400">Tỉ lệ tương đương: 1:{Math.round(100/result)}</p>
        </div>
      </div>
    </div>
  );
};

const ConstructionGeometry = () => {
  const [shape, setShape] = useState<'hypotenuse' | 'trapezoid' | 'arc'>('hypotenuse');
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [h, setH] = useState(5);
  const [r, setR] = useState(10);
  const [angle, setAngle] = useState(90);

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 font-headline">Hình học thực tế</h3>
        <select value={shape} onChange={e => setShape(e.target.value as any)} className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold">
          <option value="hypotenuse">Cạnh huyền (Pythagoras)</option>
          <option value="trapezoid">Diện tích hình thang</option>
          <option value="arc">Chiều dài cung tròn</option>
        </select>
      </div>

      {shape === 'hypotenuse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cạnh kề a</label>
              <input type="number" value={a} onChange={e => setA(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cạnh đối b</label>
              <input type="number" value={b} onChange={e => setB(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
            </div>
          </div>
          <div className="p-8 bg-green-50 rounded-2xl border border-green-100 text-center flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Cạnh huyền c</p>
            <p className="text-4xl font-black text-green-600 font-mono">{Math.sqrt(a*a + b*b).toFixed(3)}</p>
          </div>
        </div>
      )}

      {shape === 'trapezoid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <input type="number" placeholder="Đáy lớn" value={a} onChange={e => setA(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
            <input type="number" placeholder="Đáy nhỏ" value={b} onChange={e => setB(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
            <input type="number" placeholder="Chiều cao" value={h} onChange={e => setH(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
          </div>
          <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Diện tích</p>
            <p className="text-4xl font-black text-blue-600 font-mono">{((a + b) * h / 2).toFixed(2)}</p>
          </div>
        </div>
      )}

      {shape === 'arc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bán kính r</label>
              <input type="number" value={r} onChange={e => setR(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Góc ở tâm (độ)</label>
              <input type="number" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
            </div>
          </div>
          <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 text-center flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Chiều dài cung</p>
            <p className="text-4xl font-black text-amber-600 font-mono">{(2 * Math.PI * r * angle / 360).toFixed(3)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SteelLookup = () => {
  const [diameter, setDiameter] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);

  const area = (Math.PI * (diameter/10) * (diameter/10) / 4) * quantity; 
  const weight = (0.00617 * diameter * diameter) * quantity; 

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Tra cứu nhanh thép</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Đường kính (mm)</label>
          <select value={diameter} onChange={e => setDiameter(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            {[6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32].map(d => <option key={d} value={d}>D{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Số lượng thanh</label>
          <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diện tích tiết diện</p>
          <p className="text-2xl font-black text-slate-900 font-mono">{area.toFixed(3)} <span className="text-sm">cm²</span></p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Khối lượng đơn vị</p>
          <p className="text-2xl font-black text-slate-900 font-mono">{weight.toFixed(3)} <span className="text-sm">kg/m</span></p>
        </div>
      </div>
    </div>
  );
};

const MaterialEstimator = () => {
  const [area, setArea] = useState<number>(100);
  const [type, setType] = useState('brick-wall');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const prompt = `Bạn là một kỹ sư xây dựng chuyên nghiệp. Hãy tính định mức vật tư cho hạng mục "${type === 'brick-wall' ? 'Xây tường gạch' : 'Cán nền bê tông'}" với diện tích/khối lượng là ${area} m2.
      Hãy cung cấp số lượng ước tính cho:
      1. Xi măng (bao 50kg)
      2. Cát (m3)
      3. Gạch (viên) - nếu là xây tường
      4. Đá (m3) - nếu là bê tông
      Trả lời bằng tiếng Việt, định dạng Markdown ngắn gọn, chỉ nêu con số và đơn vị. Không ghi "AI" hay "Trợ lý".`;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt
      }, process.env.GEMINI_API_KEY!);

      setResult(response.text || "Không thể tính toán.");
    } catch (error) {
      setResult("Lỗi hệ thống tính toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Định mức vật tư</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Hạng mục</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">
            <option value="brick-wall">Xây tường gạch (100mm)</option>
            <option value="concrete">Cán nền bê tông (dày 10cm)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Diện tích (m²)</label>
          <input type="number" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
      </div>
      <button 
        onClick={handleEstimate}
        disabled={loading}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all mb-8 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
        Tính toán định mức
      </button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kết quả ước tính vật tư</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <Markdown>{result}</Markdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const WaterTools = () => {
  const [subTool, setSubTool] = useState<'compatibility' | 'dosing' | 'lsi' | 'concentration'>('compatibility');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'compatibility', name: 'Tương thích hóa chất' },
          { id: 'dosing', name: 'Liều lượng (Dosing)' },
          { id: 'lsi', name: 'Chỉ số LSI' },
          { id: 'concentration', name: 'Đổi nồng độ' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTool(t.id as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              subTool === t.id ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {subTool === 'compatibility' && <ChemicalCompatibility />}
      {subTool === 'dosing' && <DosingCalculator />}
      {subTool === 'lsi' && <LSICalculator />}
      {subTool === 'concentration' && <ConcentrationConverter />}
    </motion.div>
  );
};

const ChemicalCompatibility = () => {
  const [material, setMaterial] = useState('');
  const [chemical, setChemical] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [technicalReport, setTechnicalReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleCheck = async () => {
    setSearching(true);
    setTechnicalReport(null);
    try {
      const q = query(
        collection(db, 'chemical_compatibility'), 
        where('material', '==', material),
        where('chemical', '==', chemical)
      );
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'chemical_compatibility');
        return;
      }
      
      let baseResult;
      if (!snapshot.empty) {
        baseResult = snapshot.docs[0].data();
      } else {
        baseResult = {
          material,
          chemical,
          rating: 'Đang phân tích...',
          notes: 'Đang truy xuất dữ liệu kỹ thuật...'
        };
      }
      setResult(baseResult);

      setLoadingReport(true);
      try {
        const prompt = `Hãy đánh giá độ tương thích giữa vật liệu "${material}" và hóa chất "${chemical}". 
        Hãy cung cấp:
        1. Xếp hạng tương thích (A - Rất tốt, B - Tốt, C - Hạn chế, D - Không tương thích).
        2. Giải thích lý do kỹ thuật.
        3. Các lưu ý an toàn quan trọng.
        Trả lời bằng tiếng Việt, định dạng Markdown chuyên nghiệp. Không ghi "AI" hay "Trợ lý".`;

        const response = await generateContentWithRetry({
          model: "gemini-3-flash-preview",
          contents: prompt
        }, process.env.GEMINI_API_KEY!);

        const text = response.text || "Không thể lấy dữ liệu.";
        setTechnicalReport(text);
        
        if (baseResult.rating === 'Đang phân tích...') {
          const ratingMatch = text.match(/Xếp hạng:?\s*([A-D])/i);
          const rating = ratingMatch ? `${ratingMatch[1].toUpperCase()} - ${ratingMatch[1].toUpperCase() === 'A' ? 'Rất tốt' : ratingMatch[1].toUpperCase() === 'B' ? 'Tốt' : ratingMatch[1].toUpperCase() === 'C' ? 'Hạn chế' : 'Không tương thích'}` : 'B - Cần kiểm tra';
          setResult({ ...baseResult, rating, notes: 'Phân tích dựa trên thông số kỹ thuật vật liệu.' });
        }
      } catch (aiError) {
        setTechnicalReport("Hệ thống phân tích đang bận. Vui lòng tham khảo các nguồn tham chiếu bên dưới.");
      } finally {
        setLoadingReport(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Droplets className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 font-headline">Bảng tra tương thích hóa chất</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vật liệu đường ống/bồn</label>
            <input type="text" placeholder="VD: PVC, HDPE, Inox 316..." value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tên hóa chất</label>
            <input type="text" placeholder="VD: H2SO4, NaOH, Chlorine..." value={chemical} onChange={(e) => setChemical(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
          </div>
        </div>
        <button 
          onClick={handleCheck}
          disabled={!material || !chemical || searching}
          className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-900/10 hover:bg-red-700 disabled:opacity-50 transition-all mb-12 flex items-center justify-center gap-2"
        >
          {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Tra cứu tương thích
        </button>

        {result && (
          <div className="space-y-6">
            <div className={cn(
              "p-8 rounded-3xl border flex flex-col md:flex-row gap-8 items-center",
              result.rating.startsWith('A') ? "bg-green-50 border-green-100" :
              result.rating.startsWith('B') ? "bg-blue-50 border-blue-100" :
              result.rating.startsWith('C') ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
            )}>
              <div className="shrink-0">
                {result.rating.startsWith('A') && <CheckCircle2 className="w-16 h-16 text-green-500" />}
                {result.rating.startsWith('B') && <CheckCircle2 className="w-16 h-16 text-blue-500" />}
                {result.rating.startsWith('C') && <AlertTriangle className="w-16 h-16 text-amber-500" />}
                {result.rating.startsWith('D') && <XCircle className="w-16 h-16 text-red-500" />}
                {result.rating.includes('Đang') && <Loader2 className="w-16 h-16 text-slate-400 animate-spin" />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kết quả đánh giá</p>
                <h4 className={cn(
                  "text-2xl font-black mb-2",
                  result.rating.startsWith('A') ? "text-green-600" :
                  result.rating.startsWith('B') ? "text-blue-600" :
                  result.rating.startsWith('C') ? "text-amber-600" : 
                  result.rating.includes('Đang') ? "text-slate-400" : "text-red-600"
                )}>{result.rating}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{result.notes}</p>
              </div>
            </div>

            {loadingReport && (
              <div className="flex items-center gap-3 text-slate-400 text-sm font-medium animate-pulse p-4">
                <Activity className="w-4 h-4" />
                Đang truy xuất báo cáo phân tích kỹ thuật...
              </div>
            )}

            {technicalReport && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <Info className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Báo cáo phân tích kỹ thuật</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <Markdown>{technicalReport}</Markdown>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white/10 rounded-2xl">
            <ExternalLink className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold font-headline">Công cụ tham chiếu Quốc tế</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="https://cameochemicals.noaa.gov/reactivity" target="_blank" rel="noopener noreferrer" className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold group-hover:text-amber-400 transition-colors">NOAA CAMEO Chemicals</h4>
              <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-amber-400" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Công cụ dự đoán phản ứng hóa học uy tín nhất từ Chính phủ Hoa Kỳ.</p>
          </a>
          <a href="https://www.coleparmer.com/chemical-resistance" target="_blank" rel="noopener noreferrer" className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold group-hover:text-amber-400 transition-colors">Cole-Parmer Resistance</h4>
              <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-amber-400" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Tra cứu độ bền của vật liệu đối với hàng ngàn loại hóa chất khác nhau.</p>
          </a>
        </div>
      </div>
    </div>
  );
};

const DosingCalculator = () => {
  const [flow, setFlow] = useState<number>(10); // m3/h
  const [dosage, setDosage] = useState<number>(5); // mg/l
  const [concentration, setConcentration] = useState<number>(10); // %

  const pumpFlow = (flow * dosage) / (concentration * 10);

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Tính liều lượng hóa chất (Dosing)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lưu lượng nước (m³/h)</label>
          <input type="number" value={flow} onChange={e => setFlow(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nồng độ mong muốn (mg/l)</label>
          <input type="number" value={dosage} onChange={e => setDosage(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nồng độ hóa chất (%)</label>
          <input type="number" value={concentration} onChange={e => setConcentration(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" />
        </div>
      </div>
      <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Tốc độ bơm định lượng</p>
        <p className="text-4xl font-black text-blue-600 font-mono">{pumpFlow.toFixed(2)} <span className="text-xl">l/h</span></p>
      </div>
    </div>
  );
};

const LSICalculator = () => {
  const [temp, setTemp] = useState(25);
  const [ph, setPh] = useState(7.5);
  const [tds, setTds] = useState(500);
  const [calcium, setCalcium] = useState(200);
  const [alkalinity, setAlkalinity] = useState(150);

  // LSI = pH - pHs
  // pHs = (9.3 + A + B) - (C + D)
  // A = (log10(TDS) - 1) / 10
  // B = -13.12 * log10(temp + 273.15) + 34.55
  // C = log10(calcium) - 0.4
  // D = log10(alkalinity)

  const A = (Math.log10(tds || 1) - 1) / 10;
  const B = -13.12 * Math.log10(temp + 273.15) + 34.55;
  const C = Math.log10(calcium || 1) - 0.4;
  const D = Math.log10(alkalinity || 1);
  const pHs = (9.3 + A + B) - (C + D);
  const lsi = ph - pHs;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Tính chỉ số LSI (Langelier Saturation Index)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nhiệt độ (°C)</label><input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-2 px-4 font-bold" /></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">pH</label><input type="number" value={ph} onChange={e => setPh(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-2 px-4 font-bold" /></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">TDS (mg/l)</label><input type="number" value={tds} onChange={e => setTds(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-2 px-4 font-bold" /></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Độ cứng Ca (mg/l)</label><input type="number" value={calcium} onChange={e => setCalcium(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-2 px-4 font-bold" /></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Độ kiềm (mg/l)</label><input type="number" value={alkalinity} onChange={e => setAlkalinity(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-2 px-4 font-bold" /></div>
      </div>
      
      <div className={cn("p-8 rounded-2xl border text-center mb-8", lsi > 0.5 ? "bg-amber-50 border-amber-100" : lsi < -0.5 ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100")}>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Chỉ số LSI (Tự động)</p>
        <p className="text-4xl font-black font-mono">{lsi.toFixed(2)}</p>
        <p className="mt-2 text-xs font-bold">
          {lsi > 0.5 ? "Nước có xu hướng đóng cặn." : lsi < -0.5 ? "Nước có tính ăn mòn." : "Nước ở trạng thái cân bằng."}
        </p>
      </div>

      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Công thức áp dụng</p>
        <div className="text-xs text-slate-600 space-y-2 font-mono">
          <p>LSI = pH - pHs</p>
          <p>pHs = (9.3 + A + B) - (C + D)</p>
          <p>A = (log10(TDS) - 1) / 10 = {A.toFixed(3)}</p>
          <p>B = -13.12 * log10(°C + 273.15) + 34.55 = {B.toFixed(3)}</p>
          <p>C = log10(CaH) - 0.4 = {C.toFixed(3)}</p>
          <p>D = log10(Alk) = {D.toFixed(3)}</p>
        </div>
      </div>
    </div>
  );
};

const ConcentrationConverter = () => {
  const [value, setValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('mg/l');
  const [toUnit, setToUnit] = useState('ppm');

  const units: Record<string, number> = {
    'mg/l': 1,
    'ppm': 1,
    'ppb': 1000,
    'g/m3': 1,
  };

  const result = (value / units[fromUnit]) * units[toUnit];

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Chuyển đổi đơn vị nồng độ</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Giá trị</label><input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" /></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Từ</label><select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">{Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Sang</label><select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">{Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
      </div>
      <div className="mt-8 p-6 bg-slate-50 rounded-2xl text-center"><p className="text-2xl font-black text-slate-900 font-mono">{result.toFixed(3)} {toUnit}</p></div>
    </div>
  );
};

const GeneralTools = () => {
  const [value, setValue] = useState<number>(1);
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');

  const unitCategories: Record<string, any> = {
    length: {
      m: 1,
      ft: 3.28084,
      in: 39.3701,
      mm: 1000,
      cm: 100,
      km: 0.001,
      mile: 0.000621371
    },
    area: {
      m2: 1,
      ft2: 10.7639,
      ha: 0.0001,
      acre: 0.000247105
    },
    weight: {
      kg: 1,
      lb: 2.20462,
      ton: 0.001,
      g: 1000
    },
    pressure: {
      bar: 1,
      psi: 14.5038,
      pa: 100000,
      atm: 0.986923
    }
  };

  const currentUnits = unitCategories[category];
  const result = (value / currentUnits[fromUnit]) * currentUnits[toUnit];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Chuyển đổi đơn vị chung</h3>
      <div className="mb-8">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Loại đơn vị</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(unitCategories).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                const units = Object.keys(unitCategories[cat]);
                setFromUnit(units[0]);
                setToUnit(units[1]);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                category === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600"
              )}
            >
              {cat === 'length' ? 'Chiều dài' : cat === 'area' ? 'Diện tích' : cat === 'weight' ? 'Khối lượng' : 'Áp suất'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Giá trị</label><input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold" /></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Từ</label><select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">{Object.keys(currentUnits).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Sang</label><select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 font-bold">{Object.keys(currentUnits).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
      </div>
      <div className="mt-8 p-8 bg-slate-900 rounded-2xl text-center"><p className="text-3xl font-black text-amber-400 font-mono">{result.toLocaleString()} {toUnit}</p></div>
    </motion.div>
  );
};
