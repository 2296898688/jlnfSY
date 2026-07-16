import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, LayoutGrid, QrCode, Eye, Trash2, Edit3,
  ChevronLeft, ChevronRight, X, Info, Check, Image as ImageIcon,
  ArrowLeft, Database, Send,
  Calendar, Quote, MapPin, Leaf, CheckCircle2, Paperclip,
  AlertCircle, ShoppingBag, Timer, ExternalLink, Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Batch, ViewState, TimelineItem } from './types';

// Constants
const STATUS_CONFIG: Record<Batch['status'], { label: string; color: string; bgColor: string; borderColor: string }> = {
  draft: { label: '草稿', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
  published: { label: '已发布', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
};

// Capsule Toggle Component
const CapsuleToggle = ({
  published,
  onChange,
  disabled = false,
  size = 'sm',
}: {
  published: boolean;
  onChange: (published: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) => {
  const isSm = size === 'sm';
  return (
    <button
      onClick={() => !disabled && onChange(!published)}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 select-none
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${isSm ? 'w-12 h-7' : 'w-14 h-8'}
        ${published ? 'bg-emerald-500' : 'bg-slate-300'}
      `}
    >
      <span
        className={`absolute rounded-full bg-white shadow transition-all duration-200
          ${isSm ? 'h-5 w-5' : 'h-6 w-6'}
          ${published ? 'right-1' : 'left-1'}
        `}
      />
    </button>
  );
};

// Reusable Image Upload Component
const ImageUpload = ({ 
  value, 
  onChange, 
  label = "上传图片", 
  className = "",
  aspect = "aspect-video"
}: { 
  value?: string; 
  onChange: (url: string) => void; 
  label?: string;
  className?: string;
  aspect?: string;
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        {label}
      </label>
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        className={`relative ${aspect} rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden
          ${value ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
          ${isDragging ? 'border-blue-500 bg-blue-50 shadow-inner' : ''}`}
      >
        {value ? (
          <>
            <img src={value} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <div className="p-2 bg-white rounded-full text-emerald-600 shadow-lg">
                <Edit3 className="w-4 h-4" />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                className="p-2 bg-white rounded-full text-red-500 shadow-lg hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-600">点击或拖拽上传</p>
              <p className="text-[10px] text-slate-400 mt-1 px-4">支持 JPG, PNG, WEBP (最大 5MB)</p>
            </div>
          </>
        )}
        <input 
          type="file" 
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
};

// Reusable Confirm Modal
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "确认删除",
  confirmColor = "bg-red-600 hover:bg-red-700"
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  confirmColor?: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4"
      >
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-2.5 ${confirmColor} text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-red-100`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Tag Input Component
const TagInput = ({ 
  tags = [], 
  onChange, 
  placeholder = "输入后回车添加..." 
}: { 
  tags?: string[]; 
  onChange: (tags: string[]) => void; 
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
        {tags.map((tag, index) => (
          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg group shadow-sm">
            {tag}
            <button onClick={() => removeTag(index)} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none outline-none text-xs text-slate-600 px-1 min-w-[120px]"
        />
      </div>
    </div>
  );
};

// Mock Data
const INITIAL_BATCHES: Batch[] = [
  {
    id: '1',
    productName: '农垦小冰麦面粉',
    batchNumber: 'MF-2026-001',
    category: '面粉',
    createTime: '2026-07-05 14:30',
    timelineCount: 5,
    imageUrl: `${import.meta.env.BASE_URL}images/xiaomai.jpg`,
    images: [`${import.meta.env.BASE_URL}images/xiaomai.jpg`],
    status: 'published',
    topLabel: '农品溯源',
    location: '吉林省 · 白城市',
    productSubTitle: '高蛋白 · 低脂肪 · 零添加',
    tags: ['小冰麦', '高蛋白24%', '低脂1%', '零添加', '农垦管控'],
    productIntro: '产自吉林省西部半干旱碱化区域，对积温、纬度要求苛刻，是改良土壤、培肥地力的特色作物，产地稀缺性强。执行纯净配方（仅小麦与水），无添加。蛋白质含量高达24%，显著高于普通中筋小麦粉（约15%）；脂肪含量仅1%，低于同类产品，是高蛋白、低脂的健康主食优选。从种植、加工到销售，由吉林省农垦集团全程监督，建立全链路可追溯体系。',
    timelineItems: [
      { id: 't1', title: '碱地种植', date: '2026-04-15', subtitle: '稀缺产地', description: '吉林省西部半干旱碱化区域，独特积温与纬度条件，培肥地力的特色小冰麦种植基地。', tags: ['碱地改良', '稀缺产区'] },
      { id: 't2', title: '田间管理', date: '2026-05-20', subtitle: '纯净生长', description: '全程执行纯净配方标准，仅使用小麦与水，杜绝任何添加剂，确保原料天然纯净。', tags: ['纯净配方', '无添加'] },
      { id: 't3', title: '收割筛选', date: '2026-07-01', subtitle: '严控品质', description: '颗粒饱满度与蛋白质含量双重筛选，确保蛋白质含量达24%的高标准。', tags: ['高蛋白', '严格筛选'] },
      { id: 't4', title: '精细研磨', date: '2026-07-05', subtitle: '低温工艺', description: '采用低温低速研磨工艺，保留小麦胚芽营养，脂肪含量仅1%，粉质细腻。', tags: ['低温研磨', '低脂'] },
      { id: 't5', title: '农垦溯源', date: '2026-07-05', subtitle: '全程可溯', description: '吉林省农垦集团全程监督，建立从种植、加工到销售的全链路可追溯体系。', tags: ['农垦管控', '全链路溯源'] }
    ]
  },
  {
    id: '2',
    productName: '白燕2号燕麦片',
    batchNumber: 'YM-2026-001',
    category: '燕麦',
    createTime: '2026-07-05 09:15',
    timelineCount: 5,
    imageUrl: `${import.meta.env.BASE_URL}images/yanmai.jpg`,
    images: [`${import.meta.env.BASE_URL}images/yanmai.jpg`],
    status: 'published',
    topLabel: '农品溯源',
    location: '吉林省 · 白城市',
    productSubTitle: '地理标志 · 低脂高蛋白',
    tags: ['地理标志产品', '高蛋白23%', '低脂8%', '农垦管控', '白燕2号'],
    productIntro: '原料源自北纬45°世界黄金燕麦带核心产区——吉林白城，是中国首个获得地理标志保护的燕麦产品。蛋白质含量达23%，与市场高端有机燕麦持平；脂肪含量仅8%，显著低于主流竞品。依托农垦集团全流程管控与可追溯供应链，从田间到包装确保产品纯净、安全。由国家燕麦荞麦产业技术体系首席科学家任长忠研究员团队培育，在白城盐碱地育成，具有耐贫瘠、耐盐碱、抗旱、适应性强、籽粒体积大、生育期短等优势。',
    timelineItems: [
      { id: 't1', title: '品种培育', date: '2025-09-10', subtitle: '科学家团队', description: '由国家燕麦荞麦产业技术体系首席科学家任长忠研究员团队在白城盐碱地育成，具有耐贫瘠、耐盐碱、抗旱等优势。', tags: ['院士育种', '盐碱地培育'] },
      { id: 't2', title: '黄金产区', date: '2026-04-20', subtitle: '北纬45°', description: '播种于北纬45°世界黄金燕麦带核心产区——吉林白城，中国首个燕麦地理标志保护产品。', tags: ['黄金纬度', '地理标志'] },
      { id: 't3', title: '田间种植', date: '2026-05-15', subtitle: '耐旱生长', description: '白燕2号生育期短、适应性强的特性使其在碱地环境中茁壮成长，无需大量化肥农药。', tags: ['耐贫瘠', '绿色种植'] },
      { id: 't4', title: '收割加工', date: '2026-06-30', subtitle: '保留营养', description: '适时收割后进行低温烘干与压片处理，保留籽粒完整营养，蛋白质达23%，脂肪仅8%。', tags: ['高蛋白', '低脂加工'] },
      { id: 't5', title: '农垦品控', date: '2026-07-05', subtitle: '全链路溯源', description: '农垦集团全流程管控与可追溯供应链，从田间到包装确保产品纯净、安全可追溯。', tags: ['农垦管控', '品质溯源'] }
    ]
  },
  {
    id: '3',
    productName: '中科发5弱碱大米',
    batchNumber: 'DM-2026-001',
    category: '大米',
    createTime: '2026-07-05 16:45',
    timelineCount: 5,
    imageUrl: `${import.meta.env.BASE_URL}images/dami.jpg`,
    images: [`${import.meta.env.BASE_URL}images/dami.jpg`],
    status: 'published',
    topLabel: '农品溯源',
    location: '吉林省 · 白城市',
    productSubTitle: '科技育种 · 弱碱健康 · 香糯兼备',
    tags: ['分子育种', '弱碱米', '盐碱地改良', '农垦管控', '院士团队'],
    productIntro: '由中国科学院李家洋院士团队通过分子设计育种技术培育，专为盐碱地改良而生。产自弱碱性土壤，大米天然呈碱性，形成"弱碱"的独特健康价值。米粒饱满，口感细腻弹糯，香气持久，综合食味值对标"稻花香2号"。由农垦集团下属白城牧场全程管控，实现从种植、加工到销售的可追溯闭环。科技唤醒盐碱地，天生碱地米。',
    timelineItems: [
      { id: 't1', title: '分子育种', date: '2024-03-10', subtitle: '院士团队', description: '中国科学院李家洋院士团队通过分子设计育种技术培育，专为盐碱地改良而生的优质稻种。', tags: ['分子育种', '院士团队'] },
      { id: 't2', title: '碱地育苗', date: '2026-04-10', subtitle: '弱碱土壤', description: '白城牧场弱碱性土壤大棚育苗，天然碱性水土环境赋予大米独特的"弱碱"健康价值。', tags: ['弱碱土壤', '科学育苗'] },
      { id: 't3', title: '田间管理', date: '2026-05-20', subtitle: '盐碱改良', description: '通过种植水稻改良盐碱地，物理防虫与有机肥并用，实现生态与品质双赢。', tags: ['盐碱改良', '绿色种植'] },
      { id: 't4', title: '精细加工', date: '2026-07-01', subtitle: '食味对标', description: '采用低温精米加工，米粒饱满晶莹，综合食味值对标"稻花香2号"，口感细腻弹糯。', tags: ['低温加工', '食味值高'] },
      { id: 't5', title: '农垦溯源', date: '2026-07-05', subtitle: '全程可溯', description: '吉林省农垦集团白城牧场全程管控，从种植到加工销售全链路可追溯闭环，品质安心。', tags: ['农垦管控', '全链路溯源'] }
    ]
  }
];

const STORAGE_KEY = 'trace_batches';

const DATA_VERSION = 3;

function loadBatches(): Batch[] {
  try {
    const ver = localStorage.getItem('trace_version');
    if (ver !== String(DATA_VERSION)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem('trace_version', String(DATA_VERSION));
      return INITIAL_BATCHES;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_BATCHES;
}

export default function App() {
  const [batches, setBatches] = useState<Batch[]>(loadBatches);
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [previousView, setPreviousView] = useState<ViewState>('dashboard');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const selectedBatchRef = useRef(selectedBatch);
  useEffect(() => { selectedBatchRef.current = selectedBatch; }, [selectedBatch]);
  // Auto-sync selectedBatch changes to batches
  useEffect(() => {
    if (!selectedBatch) return;
    setBatches(prev => {
      const exists = prev.find(b => b.id === selectedBatch.id);
      if (exists) return prev.map(b => b.id === selectedBatch.id ? selectedBatch : b);
      return prev;
    });
  }, [selectedBatch]);
  // Persist batches to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(batches)); } catch {}
  }, [batches]);

  const [showQRModal, setShowQRModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部分类');
  const [dateFilter, setDateFilter] = useState('');
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [timelineSaved, setTimelineSaved] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [previewCountdown, setPreviewCountdown] = useState(30);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, dateFilter]);

  // Countdown timer for shop redirect in preview
  useEffect(() => {
    if (viewState === 'preview' && selectedBatch?.shopUrl) {
      const seconds = selectedBatch.countdownSeconds || 30;
      setPreviewCountdown(seconds);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setPreviewCountdown(prev => {
          if (prev <= 1) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            window.open(selectedBatchRef.current?.shopUrl || '', '_blank');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [viewState, selectedBatch?.id]);

  const handleStatusUpdate = (batchId: string, newStatus: Batch['status']) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: newStatus } : b));
    if (selectedBatch && selectedBatch.id === batchId) {
      setSelectedBatch({ ...selectedBatch, status: newStatus });
    }
  };

  // Handlers
  const handleEditConfig = (batch: Batch) => {
    setSelectedBatch(JSON.parse(JSON.stringify(batch))); // Deep clone for editing
    setActiveNodeIndex(0);
    setViewState('config');
  };

  const handleShowQR = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowQRModal(true);
  };

  const handlePreviewH5 = (batch: Batch) => {
    setPreviousView(viewState);
    if (viewState !== 'config') {
      setSelectedBatch(batch);
    }
    setViewState('preview');
  };

  const handleNewBatch = () => {
    const year = new Date().getFullYear().toString();
    const ts = Date.now().toString().slice(-6);
    const batchNumber = `NEW-${year}-${ts}`;
    const newBatch: Batch = {
      id: Date.now().toString(),
      productName: '',
      batchNumber,
      category: '',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      timelineCount: 0,
      imageUrl: '',
      images: [],
      status: 'draft',
      tags: [],
      productIntro: '',
      timelineItems: [],
    };
    setSelectedBatch(newBatch);
    setActiveNodeIndex(0);
    setViewState('config');
  };

  const handleSaveConfig = () => {
    if (!selectedBatch) return;
    setBatches(prev => {
      const exists = prev.find(b => b.id === selectedBatch.id);
      if (exists) {
        return prev.map(b => b.id === selectedBatch.id ? selectedBatch : b);
      }
      return [selectedBatch, ...prev];
    });
    setViewState('dashboard');
  };

  const saveInPlace = () => {
    if (!selectedBatch) return;
    setBatches(prev => {
      const exists = prev.find(b => b.id === selectedBatch.id);
      if (exists) {
        return prev.map(b => b.id === selectedBatch.id ? selectedBatch : b);
      }
      return [selectedBatch, ...prev];
    });
  };

  const handleSaveTimeline = () => {
    saveInPlace();
    setTimelineSaved(true);
  };

  const handleDeleteBatch = (id: string) => {
    setConfirmDelete({ id });
  };

  const confirmDeleteBatch = () => {
    if (!confirmDelete) return;
    setBatches(prev => prev.filter(b => b.id !== confirmDelete.id));
    if (selectedBatch?.id === confirmDelete.id) setSelectedBatch(null);
    setConfirmDelete(null);
  };

  // 产品分类 → 批次编号缩写
  const CATEGORY_ABBR: Record<string, string> = {
    '大米': 'DM',
    '燕麦': 'YM',
    '面粉': 'MF',
  };

  const handleUpdateBatchField = (field: keyof Batch, value: any) => {
    if (!selectedBatch) return;
    setSelectedBatch(prev => {
      const updated = { ...prev, [field]: value };
      // 当修改分类时，同步更新批次编号的英文缩写前缀
      if (field === 'category' && value) {
        const abbr = CATEGORY_ABBR[value];
        if (abbr) {
          const parts = updated.batchNumber.split('-');
          // 保留年份和序号，只替换前缀
          if (parts.length === 3) {
            updated.batchNumber = `${abbr}-${parts[1]}-${parts[2]}`;
          }
        }
      }
      return updated;
    });
  };

  const handleUpdateNode = (field: keyof TimelineItem, value: any) => {
    if (!selectedBatch) return;
    setTimelineSaved(false);
    const newItems = [...(selectedBatch.timelineItems || [])];
    newItems[activeNodeIndex] = { ...newItems[activeNodeIndex], [field]: value };
    setSelectedBatch({ ...selectedBatch, timelineItems: newItems });
  };

  const handleAddNode = () => {
    if (!selectedBatch) return;
    const newNode: TimelineItem = {
      id: `t${Date.now()}`,
      title: '新环节',
      date: new Date().toISOString().split('T')[0],
      description: '请填写环节说明内容...'
    };
    setSelectedBatch({
      ...selectedBatch,
      timelineItems: [...(selectedBatch.timelineItems || []), newNode]
    });
    setActiveNodeIndex((selectedBatch.timelineItems || []).length);
    setTimelineSaved(false);
  };

  const handleDeleteNode = (index: number) => {
    if (!selectedBatch) return;
    if ((selectedBatch.timelineItems || []).length <= 1) return;
    const newItems = selectedBatch.timelineItems.filter((_, i) => i !== index);
    setSelectedBatch({ ...selectedBatch, timelineItems: newItems });
    if (activeNodeIndex >= newItems.length) setActiveNodeIndex(Math.max(0, newItems.length - 1));
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '全部分类' || batch.category === categoryFilter;
    const matchesDate = !dateFilter || batch.createTime.includes(dateFilter);
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBatches = filteredBatches.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startIndex = filteredBatches.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, filteredBatches.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {viewState !== 'preview' && (
        <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">农品溯源管理</h1>
              <p className="text-xs text-slate-500">管理所有产品溯源批次，创建、编辑与导出二维码</p>
            </div>
          </div>
        </nav>
      )}

      {viewState === 'preview' && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[390px] h-full max-h-[844px] bg-[#F7F8F7] rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-[8px] border-slate-800">
            {/* H5 Header */}
            <header className="h-12 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <button
                onClick={() => setViewState(previousView)}
                className="p-1 text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {selectedBatch.status === 'published' || previousView === 'config' ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                  <Leaf className="w-4 h-4" />
                  {selectedBatch.topLabel || '农品溯源'}
                </div>
              ) : (
                <div />
              )}
              <div className="w-5 h-5"></div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              {selectedBatch.status === 'published' || previousView === 'config' ? (
              <>
                {/* Hero Carousel */}
              {(() => {
                const slides = (selectedBatch.images || []).filter(Boolean);
                const idx = Math.min(carouselIndex, slides.length - 1);
                return (
                  <div className="px-3 pt-2">
                    <div className="relative aspect-[1.5/1] rounded-2xl overflow-hidden shadow-sm group">
                      <img src={slides[idx] || selectedBatch.imageUrl} className="w-full h-full object-cover transition-opacity duration-300" alt="" />
                      {slides.length > 1 && (
                        <>
                          <button
                            onClick={() => setCarouselIndex(i => i === 0 ? slides.length - 1 : i - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCarouselIndex(i => i === slides.length - 1 ? 0 : i + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {slides.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCarouselIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Product Info */}
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.tags?.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FDF7E7] text-[#B8860B] text-[10px] font-bold rounded border border-[#F5E6BD]">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedBatch.productName}</h2>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedBatch.location || '原产地正品溯源'}
                  </div>
                  {selectedBatch.productSubTitle && (
                    <div className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full inline-block border border-slate-100 mt-1">
                      {selectedBatch.productSubTitle}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-emerald-600 rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-800">产地简介</h3>
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 relative mt-2">
                  <Quote className="absolute left-3 top-3 w-4 h-4 text-slate-200" />
                  <p className="text-[11px] text-slate-500 leading-relaxed indent-6">
                    {selectedBatch.productIntro || '该产品产地环境优越，严格遵循绿色农业种植标准，从源头保障每一份产品的品质与安全。'}
                  </p>
                </div>

                {/* Attachments */}
                {(selectedBatch.attachments || []).length > 0 && (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                      <h3 className="text-sm font-bold text-slate-800">产品附件</h3>
                    </div>
                    <div className="space-y-2">
                      {(selectedBatch.attachments || []).map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                        >
                          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{att.name}</p>
                            <p className="text-[10px] text-slate-400">点击查看</p>
                          </div>
                          <Eye className="w-4 h-4 text-blue-500 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Header */}
                <div className="flex items-center justify-center py-4">
                  <div className="h-px w-full bg-slate-200"></div>
                  <div className="px-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    全链路溯源
                  </div>
                  <div className="h-px w-full bg-slate-200"></div>
                </div>

                {/* Timeline Items */}
                <div className="space-y-6 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-200 border-dashed border-l border-slate-300"></div>
                  {selectedBatch.timelineItems.map((item, i) => {
                    return (
                      <div key={i} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10 border-4 border-[#F7F8F7] text-xs font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                          {item.image && (
                            <div className="aspect-[2/1] overflow-hidden">
                              <img src={item.image} className="w-full h-full object-cover" alt="" />
                            </div>
                          )}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md">
                                环节 {i + 1}
                              </span>
                              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                            </div>
                            {item.subtitle && (
                              <p className="text-[10px] text-slate-400 font-medium -mt-2">{item.subtitle}</p>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <Calendar className="w-3 h-3" />
                              <span>{item.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Node Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.tags.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Node Attachments */}
                            {(item.attachments || []).length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-slate-50">
                                {(item.attachments || []).map((att, ai) => (
                                  <a
                                    key={ai}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors"
                                  >
                                    <Paperclip className="w-3 h-3 text-blue-500 shrink-0" />
                                    <span className="text-[10px] text-slate-600 truncate">{att.name}</span>
                                    <Eye className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
                                  </a>
                                ))}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Batch Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">批次编号</span>
                    <span className="text-sm font-bold text-slate-800 font-mono tracking-tight">{selectedBatch.batchNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">出品方</span>
                    <span className="text-sm font-bold text-slate-800">五常市农垦溯源农业有限公司</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">溯源生成</span>
                    <span className="text-sm font-bold text-slate-500 font-mono">{selectedBatch.createTime}</span>
                  </div>
                </div>

                {/* Footer */}
                {selectedBatch.shopUrl ? (
                  <div className="text-center pt-6 pb-10 space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-orange-500">
                      <Timer className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">
                        {previewCountdown >= 60
                          ? `${Math.floor(previewCountdown / 60)}分${previewCountdown % 60}秒`
                          : `${previewCountdown}秒`}后自动跳转至官方商城
                      </span>
                    </div>
                    <a
                      href={selectedBatch.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 transition-colors shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      前往官方商城购买
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="text-center pt-6 pb-10 space-y-1">
                    <div className="flex items-center justify-center gap-1 text-slate-300 text-[10px] font-bold">
                      <Leaf className="w-3 h-3" />
                      农品溯源管理系统
                    </div>
                    <p className="text-[9px] text-slate-200 font-medium tracking-widest">让每一份农产品都有迹可循</p>
                  </div>
                )}
              </div>
              </>
              ) : (
                /* 产品已下架 - 停用展示 */
                <div className="flex flex-col items-center justify-center h-full px-8 py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Ban className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-base font-bold text-slate-400">该产品已下架</p>
                  {selectedBatch.productName && (
                    <p className="text-xs text-slate-300 mt-2">{selectedBatch.productName}</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-8 py-6 space-y-3">
        {viewState === 'dashboard' && (
          <>
            {/* 筛选栏 */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索产品名称或批次编号"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput); }}
                />
              </div>
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>全部分类</option>
                <option>大米</option>
                <option>燕麦</option>
                <option>面粉</option>
              </select>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 relative">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                {dateFilter && (
                  <button onClick={() => setDateFilter('')} className="p-0.5 hover:bg-slate-200 rounded text-slate-400">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setSearchTerm(searchInput)}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0"
                >
                  查询
                </button>
                <button
                  onClick={() => { setSearchInput(''); setSearchTerm(''); setCategoryFilter('全部分类'); setDateFilter(''); }}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shrink-0"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 功能栏 */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleNewBatch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md active:scale-95 shrink-0 text-sm"
              >
                <Plus className="w-4 h-4" />
                新建批次
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">产品名称</th>
                    <th className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">批次编号</th>
                    <th className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">状态</th>
                    <th className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">产品分类</th>
                    <th className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">创建时间</th>
                    <th className="px-4 py-4 text-sm font-semibold text-slate-600 text-right whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={batch.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" alt="" />
                          <span className="font-semibold text-slate-800">{batch.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-md uppercase border border-slate-200">
                          {batch.batchNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <CapsuleToggle
                          published={batch.status === 'published'}
                          onChange={(publish) => handleStatusUpdate(batch.id, publish ? 'published' : 'draft')}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{batch.category}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{batch.createTime}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleEditConfig(batch)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            编辑
                          </button>
                          <button
                            onClick={() => handlePreviewH5(batch)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            预览
                          </button>
                          <button
                            onClick={() => handleShowQR(batch)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-orange-600 hover:bg-orange-50 rounded-lg border border-orange-200 transition-colors"
                          >
                            <QrCode className="w-3 h-3" />
                            二维码
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
                <p>共 {filteredBatches.length} 条{searchTerm || categoryFilter !== '全部分类' || dateFilter ? `（已筛选，总计 ${batches.length} 条）` : ''}，每页 {pageSize} 条</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-xs font-bold transition-colors ${page === safePage ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-white hover:shadow-sm text-slate-500'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 ml-2">{startIndex}-{endIndex} / {filteredBatches.length}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {viewState === 'config' && selectedBatch && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Config Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewState('dashboard')}
                  className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded border border-emerald-200">
                  {selectedBatch.batchNumber}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[selectedBatch.status].bgColor} ${STATUS_CONFIG[selectedBatch.status].color} ${STATUS_CONFIG[selectedBatch.status].borderColor}`}>
                    {STATUS_CONFIG[selectedBatch.status].label}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{selectedBatch.productName}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handlePreviewH5(selectedBatch)}
                  className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  预览 H5
                </button>
                {selectedBatch.status === 'draft' ? (
                  <>
                    <button
                      onClick={() => {
                        handleSaveConfig();
                        handleStatusUpdate(selectedBatch.id, 'draft');
                      }}
                      className="px-5 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      暂存草稿
                    </button>
                    <button
                      onClick={() => {
                        handleSaveConfig();
                        handleStatusUpdate(selectedBatch.id, 'published');
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <Send className="w-4 h-4" />
                      保存并发布
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleSaveConfig();
                        handleStatusUpdate(selectedBatch.id, 'draft');
                      }}
                      className="px-5 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      撤回草稿
                    </button>
                    <button
                      onClick={() => {
                        handleSaveConfig();
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <Check className="w-4 h-4" />
                      保存并更新
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Split Config Grid */}
            <div className="grid grid-cols-1 gap-8">
              {/* Section: Landing Page Config + Attachments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                  <h3 className="font-bold">首屏展示配置</h3>
                  <span className="text-xs text-slate-400 font-normal">配置扫码后首屏展示内容与附件</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                  {/* Product Images - top, full width */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      产品图片 <span className="text-xs font-normal text-slate-400 ml-1">上传多张，点击设为封面</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mb-3">首张默认为封面，H5页面可横向轮播展示</p>
                    <div className="flex flex-wrap gap-3">
                      {(selectedBatch.images || []).map((img, i) => {
                        const isCover = img === selectedBatch.imageUrl || (!selectedBatch.imageUrl && i === 0);
                        return (
                          <div key={i} className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 group ${isCover ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
                            <img
                              src={img}
                              className={`w-full h-full object-cover ${!isCover ? 'cursor-pointer' : ''}`}
                              alt=""
                              onClick={() => { if (!isCover) handleUpdateBatchField('imageUrl', img); }}
                            />
                            {isCover && (
                              <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5 pointer-events-none">封面</span>
                            )}
                            {!isCover && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] font-bold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">设为封面</span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImages = (selectedBatch.images || []).filter((_, idx) => idx !== i);
                                handleUpdateBatchField('images', newImages);
                                if (isCover && newImages.length > 0) {
                                  handleUpdateBatchField('imageUrl', newImages[0]);
                                } else if (newImages.length === 0) {
                                  handleUpdateBatchField('imageUrl', '');
                                }
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-slate-50 transition-colors">
                        <Plus className="w-5 h-5 text-slate-400" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []) as File[];
                            files.forEach((file) => {
                              if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const url = ev.target?.result as string;
                                  setSelectedBatch((prev: Batch) => {
                                    const newImages = [...(prev.images || []), url];
                                    return { ...prev, images: newImages, imageUrl: prev.imageUrl || url };
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Basic fields - two columns */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700 mb-3 block">基本信息</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            产品主标题 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                          </label>
                          <input
                            type="text"
                            value={selectedBatch.productName}
                            onChange={(e) => handleUpdateBatchField('productName', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">产品副标题</label>
                          <input
                            type="text"
                            value={selectedBatch.productSubTitle || ''}
                            onChange={(e) => handleUpdateBatchField('productSubTitle', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            产品分类 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                          </label>
                          <div className="relative">
                            <select
                              value={selectedBatch.category}
                              onChange={(e) => handleUpdateBatchField('category', e.target.value)}
                                                           className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 disabled:cursor-not-allowed"
                            >
                              <option value="">请选择产品分类</option>
                              <option>大米</option>
                              <option>燕麦</option>
                              <option>面粉</option>
                            </select>
                            <LayoutGrid className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {/* Right */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            地理信息 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={selectedBatch.location || ''}
                              onChange={(e) => handleUpdateBatchField('location', e.target.value)}
                              placeholder="例如：黑龙江省 · 五常市"
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">顶部标签</label>
                          <input
                            type="text"
                            value={selectedBatch.topLabel || ''}
                            onChange={(e) => handleUpdateBatchField('topLabel', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">核心优势标签</label>
                          <TagInput
                            tags={selectedBatch.tags}
                            onChange={(newTags) => handleUpdateBatchField('tags', newTags)}
                            placeholder="输入亮点后回车添加..."
                          />
                        </div>
                      </div>
                    </div>
                    {/* 产地简介 - full width */}
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-bold text-slate-700">产地简介</label>
                      <textarea
                        rows={3}
                        value={selectedBatch.productIntro || ''}
                        onChange={(e) => handleUpdateBatchField('productIntro', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-sm leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Product Attachments (merged) */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700 mb-2 block">产品附件</label>
                    <p className="text-[11px] text-slate-400 mb-3">上传质检报告、认证证书等文件，将在H5页面展示</p>
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-colors">
                      <Paperclip className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">点击上传附件</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []) as File[];
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const newAttach = { name: file.name, url: ev.target?.result as string };
                              setSelectedBatch((prev: Batch) => ({
                                ...prev,
                                attachments: [...(prev.attachments || []), newAttach],
                              }));
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>
                    {(selectedBatch.attachments || []).length > 0 && (
                      <div className="space-y-2 mt-3">
                        {(selectedBatch.attachments || []).map((att, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <Paperclip className="w-4 h-4 text-blue-500" />
                              <div>
                                <p className="text-sm font-bold text-slate-700">{att.name}</p>
                                <p className="text-[10px] text-slate-400">已上传</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newAttachments = (selectedBatch.attachments || []).filter((_, idx) => idx !== i);
                                handleUpdateBatchField('attachments', newAttachments);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: 商城跳转配置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-1.5 h-4 bg-orange-600 rounded-full"></div>
                  <h3 className="font-bold">商城跳转配置</h3>
                  <span className="text-xs text-slate-400 font-normal">溯源页面倒计时结束后自动跳转至商城</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        商城链接
                      </label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          value={selectedBatch.shopUrl || ''}
                          onChange={(e) => handleUpdateBatchField('shopUrl', e.target.value)}
                          placeholder="https://shop.example.com/product/xxx"
                                                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">填写后溯源页将展示商城跳转入口</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        跳转倒计时
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {[30, 60, 90, 120].map(s => (
                          <button
                            key={s}
                            type="button"
                                                       onClick={() => handleUpdateBatchField('countdownSeconds', s)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors disabled:cursor-not-allowed
                              ${(selectedBatch.countdownSeconds || 30) === s
                                ? 'bg-orange-50 border-orange-300 text-orange-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-500'
                              }`}
                          >
                            {s >= 60 ? `${s / 60}分钟` : `${s}秒`}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          min={5}
                          max={600}
                          step={5}
                          value={selectedBatch.countdownSeconds || 30}
                          onChange={(e) => handleUpdateBatchField('countdownSeconds', Math.max(5, parseInt(e.target.value) || 30))}
                                                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">倒计时结束后自动打开商城链接（5-600秒）</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Journey Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                  <h3 className="font-bold">溯源内容条目</h3>
                  <span className="text-xs text-slate-400 font-normal">每条对应一个溯源时间节点</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                      <span>条目列表 ({selectedBatch.timelineItems.length})</span>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedBatch.timelineItems.map((item, i) => (
                        <div 
                          key={item.id} 
                          onClick={() => { setActiveNodeIndex(i); setTimelineSaved(true); }}
                          className={`p-4 rounded-xl border flex items-center justify-between group transition-all cursor-pointer ${i === activeNodeIndex ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === activeNodeIndex ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${i === activeNodeIndex ? 'text-emerald-900' : 'text-slate-800'}`}>{item.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                            </div>
                          </div>
                          <Trash2
                            className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(i);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleAddNode}
                                           className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" /> 添加溯源条目
                    </button>
                  </div>

                  {/* Entry Detail Editor */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{activeNodeIndex + 1}</div>
                      <h4 className="font-bold text-lg">编辑条目内容</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left (2/3): text fields */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              发生日期 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                                               value={selectedBatch.timelineItems[activeNodeIndex]?.date || ''}
                                onChange={(e) => handleUpdateNode('date', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              条目标题 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                            </label>
                            <input
                              type="text"
                                                           value={selectedBatch.timelineItems[activeNodeIndex]?.title || ''}
                              onChange={(e) => handleUpdateNode('title', e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">条目副标题</label>
                          <input
                            type="text"
                                                       value={selectedBatch.timelineItems[activeNodeIndex]?.subtitle || ''}
                            onChange={(e) => handleUpdateNode('subtitle', e.target.value)}
                            placeholder="可选，补充说明"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            正文说明 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                          </label>
                          <textarea
                            rows={6}
                                                       value={selectedBatch.timelineItems[activeNodeIndex]?.description || ''}
                            onChange={(e) => handleUpdateNode('description', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-sm leading-relaxed disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      {/* Right (1/3): media */}
                      <div className="space-y-4">
                        <ImageUpload
                          label="凭证配图"
                          value={selectedBatch.timelineItems[activeNodeIndex]?.image}
                          onChange={(url) => handleUpdateNode('image', url)}
                          aspect="aspect-square w-24"
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">环节优势标签</label>
                          <TagInput
                            tags={selectedBatch.timelineItems[activeNodeIndex]?.tags}
                            onChange={(newTags) => handleUpdateNode('tags', newTags)}
                            placeholder="输入环节亮点后回车添加..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">附件上传</label>
                          <p className="text-[11px] text-slate-400">仅支持图片和 PDF 文件</p>
                          <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-slate-200 rounded-lg transition-colors cursor-pointer hover:border-emerald-400 hover:bg-slate-50">
                            <Paperclip className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">上传附件</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              multiple
                                                           onChange={(e) => {
                                const files = Array.from(e.target.files ?? []) as File[];
                                const idx = activeNodeIndex;
                                files.forEach((file) => {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const newAttach = { name: file.name, url: ev.target?.result as string };
                                    setSelectedBatch((prev: Batch) => {
                                      const items = [...prev.timelineItems];
                                      items[idx] = { ...items[idx], attachments: [...(items[idx].attachments || []), newAttach] };
                                      return { ...prev, timelineItems: items };
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }}
                            />
                          </label>
                          {(selectedBatch.timelineItems[activeNodeIndex]?.attachments || []).length > 0 && (
                            <div className="space-y-1.5">
                              {(selectedBatch.timelineItems[activeNodeIndex]?.attachments || []).map((att, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span className="text-xs text-slate-700 truncate">{att.name}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newAttachments = (selectedBatch.timelineItems[activeNodeIndex]?.attachments || []).filter((_, idx) => idx !== i);
                                      handleUpdateNode('attachments', newAttachments);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setActiveNodeIndex(prev => Math.max(0, prev - 1)); setTimelineSaved(true); }}
                          className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
                          disabled={activeNodeIndex === 0}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-slate-600">{activeNodeIndex + 1} / {selectedBatch.timelineItems.length}</span>
                        <button
                          onClick={() => { setActiveNodeIndex(prev => Math.min(selectedBatch.timelineItems.length - 1, prev + 1)); setTimelineSaved(true); }}
                          className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                          disabled={activeNodeIndex === selectedBatch.timelineItems.length - 1}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {timelineSaved ? (
                          <button
                            onClick={() => setTimelineSaved(false)}
                                                       className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Edit3 className="w-4 h-4" />
                            修改
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveTimeline()}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            保存条目
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">批次溯源二维码</h3>
                      <p className="text-sm text-slate-500">扫描二维码即可查看该批次完整溯源信息</p>
                    </div>
                  </div>
                  <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm overflow-hidden">
                     <img src={selectedBatch.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{selectedBatch.productName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        {selectedBatch.batchNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{selectedBatch.category} · {selectedBatch.timelineItems.length}条溯源</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-3 border border-amber-100">
                  <Info className="w-5 h-5 text-amber-600" />
                  <p className="text-[11px] text-amber-700 font-bold leading-tight">
                    二维码下载后即可用于印刷。当前批次处于「{STATUS_CONFIG[selectedBatch.status].label}」状态，内容正式发布后，扫码用户即可查看最新溯源信息。
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-4 gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-emerald-100/50 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-64 h-64 bg-white p-6 rounded-[32px] border-8 border-slate-200 shadow-xl flex items-center justify-center">
                      <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-2">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className={`rounded ${i % 3 === 0 ? 'bg-slate-800' : i % 5 === 0 ? 'bg-emerald-600' : 'bg-slate-100'}`}></div>
                        ))}
                        {/* Mock QR Logo Centered */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-12 h-12 bg-white rounded shadow-lg border-2 border-slate-100 flex items-center justify-center">
                              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs italic rotate-45">
                                 <div className="rotate-[-45deg]">NK</div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    关闭
                  </button>
                  <button 
                    className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                    下载二维码
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteBatch}
        title="确认删除该批次？"
        message="删除后该批次的所有溯源信息、环节及关联二维码将永久失效，无法找回。"
      />
    </div>
  );
}
