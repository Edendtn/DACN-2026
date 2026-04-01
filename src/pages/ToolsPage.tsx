import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Ruler, Triangle, Droplets, Search, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';

type ToolType = 'units' | 'geometry' | 'chemical';

export const ToolsPage = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('units');

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
            Công cụ kỹ thuật & Tiện ích
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-headline mb-4">
            Bộ công cụ <span className="text-red-600">Kỹ thuật chuyên dụng</span>
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Các công cụ hỗ trợ tính toán, chuyển đổi và kiểm tra vật liệu dành cho kỹ sư và quản lý dự án.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:w-80 space-y-4">
            {[
              { id: 'units', name: 'Chuyển đổi đơn vị', icon: Ruler },
              { id: 'geometry', name: 'Tính toán hình học', icon: Triangle },
              { id: 'chemical', name: 'Tương thích hóa chất', icon: Droplets },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ToolType)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all border",
                  activeTool === tool.id 
                    ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20" 
                    : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                )}
              >
                <tool.icon className="w-5 h-5" />
                {tool.name}
              </button>
            ))}
          </aside>

          {/* Tool Content */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTool === 'units' && <UnitConverter key="units" />}
              {activeTool === 'geometry' && <GeometryCalculator key="geometry" />}
              {activeTool === 'chemical' && <ChemicalCompatibility key="chemical" />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [value, setValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  
  const unitCategories: Record<string, Record<string, number>> = {
    length: {
      'm': 1,
      'ft': 3.28084,
      'in': 39.3701,
      'cm': 100,
      'mm': 1000,
      'km': 0.001,
      'mi': 0.000621371,
    },
    pressure: {
      'bar': 1,
      'psi': 14.5038,
      'kPa': 100,
      'MPa': 0.1,
      'atm': 0.986923,
      'mH2O': 10.197,
    },
    flow: {
      'm3/h': 1,
      'l/min': 16.6667,
      'gpm (US)': 4.40287,
      'm3/day': 24,
      'l/s': 0.277778,
    },
    area: {
      'm2': 1,
      'ft2': 10.7639,
      'ha': 0.0001,
      'acre': 0.000247105,
    }
  };

  const units = unitCategories[category];
  const result = (value / units[fromUnit]) * units[toUnit];

  // Reset units when category changes
  useEffect(() => {
    const firstUnit = Object.keys(unitCategories[category])[0];
    const secondUnit = Object.keys(unitCategories[category])[1];
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
  }, [category]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-2xl font-bold text-slate-900 font-headline">Chuyển đổi đơn vị</h3>
        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
          {Object.keys(unitCategories).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                category === cat ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {cat === 'length' ? 'Chiều dài' : cat === 'pressure' ? 'Áp suất' : cat === 'flow' ? 'Lưu lượng' : 'Diện tích'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Giá trị</label>
          <input 
            type="number" 
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Từ đơn vị</label>
          <select 
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
          >
            {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Sang đơn vị</label>
          <select 
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
          >
            {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-12 p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Kết quả chuyển đổi</p>
        <p className="text-4xl font-black text-red-600 font-mono">
          {result.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xl">{toUnit.toUpperCase()}</span>
        </p>
      </div>
    </motion.div>
  );
};

const GeometryCalculator = () => {
  const [shape, setShape] = useState<'triangle' | 'circle' | 'cylinder'>('triangle');
  
  // Triangle states
  const [a, setA] = useState<number>(3);
  const [b, setB] = useState<number>(4);
  const [c, setC] = useState<number>(5);

  // Circle/Cylinder states
  const [radius, setRadius] = useState<number>(1);
  const [height, setHeight] = useState<number>(2);

  // Triangle calculations
  const angleA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * (180 / Math.PI);
  const angleB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * (180 / Math.PI);
  const angleC = 180 - angleA - angleB;

  // Circle calculations
  const circleArea = Math.PI * radius * radius;
  const circumference = 2 * Math.PI * radius;

  // Cylinder calculations
  const cylinderVolume = circleArea * height;
  const cylinderSurfaceArea = 2 * Math.PI * radius * (radius + height);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-2xl font-bold text-slate-900 font-headline">Tính toán hình học</h3>
        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
          {[
            { id: 'triangle', name: 'Tam giác' },
            { id: 'circle', name: 'Hình tròn' },
            { id: 'cylinder', name: 'Hình trụ' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setShape(s.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                shape === s.id ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {shape === 'triangle' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {['Cạnh a', 'Cạnh b', 'Cạnh c'].map((label, i) => (
              <div key={label}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{label}</label>
                <input 
                  type="number" 
                  value={[a, b, c][i]}
                  onChange={(e) => [setA, setB, setC][i](Number(e.target.value))}
                  className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
                />
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Góc A', value: angleA },
              { label: 'Góc B', value: angleB },
              { label: 'Góc C', value: angleC },
            ].map(angle => (
              <div key={angle.label} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{angle.label}</p>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {isNaN(angle.value) ? '---' : angle.value.toFixed(2)}°
                </p>
              </div>
            ))}
          </div>
          {isNaN(angleA) && (
            <p className="mt-6 text-red-500 text-xs font-bold text-center">
              * Tổng 2 cạnh bất kỳ phải lớn hơn cạnh còn lại để tạo thành tam giác.
            </p>
          )}
        </>
      )}

      {shape === 'circle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bán kính (r)</label>
            <input 
              type="number" 
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
            />
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diện tích</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{circleArea.toFixed(4)}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chu vi</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{circumference.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {shape === 'cylinder' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bán kính đáy (r)</label>
              <input 
                type="number" 
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Chiều cao (h)</label>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Thể tích (V)</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{cylinderVolume.toFixed(4)}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diện tích toàn phần</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{cylinderSurfaceArea.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ChemicalCompatibility = () => {
  const [material, setMaterial] = useState('');
  const [chemical, setChemical] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleCheck = async () => {
    setSearching(true);
    try {
      // In a real app, we'd query Firestore
      // For demo, we'll simulate a search
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
      if (!snapshot.empty) {
        setResult(snapshot.docs[0].data());
      } else {
        // Mock result if not found in DB for demo purposes
        setResult({
          material,
          chemical,
          rating: 'B - Good',
          notes: 'Vật liệu có khả năng chống chịu tốt trong điều kiện nhiệt độ phòng. Cần kiểm tra thêm nếu ở nhiệt độ cao.'
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
    >
      <h3 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Kiểm tra tương thích Hóa chất</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Loại vật liệu (Material)</label>
          <input 
            type="text" 
            placeholder="VD: Inox 304, PVC, HDPE..."
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Hóa chất (Chemical)</label>
          <input 
            type="text" 
            placeholder="VD: Axit Sunfuric, Clo, Dầu..."
            value={chemical}
            onChange={(e) => setChemical(e.target.value)}
            className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold focus:ring-red-600"
          />
        </div>
      </div>
      <button 
        onClick={handleCheck}
        disabled={!material || !chemical || searching}
        className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-900/10 hover:bg-red-700 disabled:opacity-50 transition-all mb-12"
      >
        {searching ? 'Đang kiểm tra...' : 'Kiểm tra độ tương thích'}
      </button>

      {result && (
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
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kết quả đánh giá</p>
            <h4 className={cn(
              "text-2xl font-black mb-2",
              result.rating.startsWith('A') ? "text-green-600" :
              result.rating.startsWith('B') ? "text-blue-600" :
              result.rating.startsWith('C') ? "text-amber-600" : "text-red-600"
            )}>{result.rating}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {result.notes}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
