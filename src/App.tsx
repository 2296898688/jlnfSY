import React, { useState, useEffect } from 'react';
import {
  Plus, Search, LayoutGrid, QrCode, Eye, Trash2, Edit3,
  ChevronLeft, ChevronRight, X, Info, Check, Image as ImageIcon,
  ArrowLeft, Database, Send, XCircle,
  Calendar, Quote, MapPin, Leaf, Award, CheckCircle2, Star, ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Batch, ViewState, TimelineItem } from './types';

// Constants
const CATEGORY_ABBR: Record<string, string> = {
  '大米': 'ZKF',
  '燕麦': 'BY',
  '面粉': 'XBM'
};

const STATUS_CONFIG: Record<Batch['status'], { label: string; color: string; bgColor: string; borderColor: string }> = {
  draft: { label: '草稿', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
  published: { label: '已发布', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
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
    batchNumber: 'XBM-2026-001',
    category: '面粉',
    createTime: '2026-07-05 14:30',
    timelineCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=400&auto=format&fit=crop',
    status: 'published',
    topLabel: '农品溯源',
    location: '河南省 · 新乡市',
    productSubTitle: '筋道有力 · 麦香浓郁',
    tags: ['高筋面粉', '麦香原味', '无添加'],
    productIntro: '精选优质小麦研磨而成，不含增白剂，面质细腻，麦香醇厚。',
    timelineItems: [
      { id: 't1', title: '小麦筛选', date: '2026-07-05', description: '严格筛选颗粒饱满的优质小麦。', tags: ['优选小麦'] },
      { id: 't2', title: '研磨工艺', date: '2026-07-05', description: '采用多道轻研细磨工艺。', tags: ['石磨工艺'] },
      { id: 't3', title: '品质质检', date: '2026-07-05', description: '理化指标全面达标。', tags: ['国标品质'] },
      { id: 't4', title: '无菌包装', date: '2026-07-05', description: '全自动无菌化包装，安全卫生。', tags: ['无菌灌装'] },
      { id: 't5', title: '物流出库', date: '2026-07-05', description: '全程温控物流，确保新鲜。', tags: ['冷链物流'] }
    ]
  },
  {
    id: '2',
    productName: '白燕系列燕麦片',
    batchNumber: 'BY-2026-001',
    category: '燕麦',
    createTime: '2026-07-05 09:15',
    timelineCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=400&h=400&auto=format&fit=crop',
    status: 'published',
    topLabel: '绿色农产',
    location: '内蒙古 · 锡林郭勒',
    productSubTitle: '天然无公害 · 高纤维',
    tags: ['有机认证', '高膳食纤维', '低脂'],
    productIntro: '精选优质燕麦，保留天然营养成分，富含膳食纤维，健康生活首选。',
    timelineItems: [
      { id: 't1', title: '种植选址', date: '2026-07-05', description: '选自高海拔无污染种植基地。', tags: ['高海拔', '无污染'] },
      { id: 't2', title: '生长监测', date: '2026-07-05', description: '科学化田间管理，保证作物健康成长。', tags: ['科学管理'] },
      { id: 't3', title: '收割初加工', date: '2026-07-05', description: '及时收割并进行低温烘干处理。', tags: ['及时收割'] },
      { id: 't4', title: '分级筛选', date: '2026-07-05', description: '通过红外分选机进行分级。', tags: ['智能分拣'] },
      { id: 't5', title: '包装封存', date: '2026-07-05', description: '采用充氮防潮包装。', tags: ['防潮防腐'] }
    ]
  },
  {
    id: '3',
    productName: '中科发5弱碱大米',
    batchNumber: 'ZKF-2026-001',
    category: '大米',
    createTime: '2026-07-05 16:45',
    timelineCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&h=400&auto=format&fit=crop',
    status: 'published',
    topLabel: '农品溯源',
    location: '黑龙江省 · 五常市',
    productSubTitle: '寒地黑土 · 晶莹剔透',
    tags: ['地理标志产品', '绿色种植', '优质品种'],
    productIntro: '产自黑龙江五常核心产区，肥沃黑土孕育，天然矿泉灌溉，口感香甜软糯。',
    timelineItems: [
      { id: 't1', title: '产地环境', date: '2026-07-05', description: '本产品产自黑龙江省五常市核心黑土种植区，地处北纬45°黄金水稻种植带。', tags: ['核心产区', '黑土资源'] },
      { id: 't2', title: '播种环节', date: '2026-07-05', description: '选用中科发5号优质品种，采用大棚钵体早育苗技术。', tags: ['优质种子', '专业育苗'] },
      { id: 't3', title: '田间管理', date: '2026-07-05', description: '全程采用绿色种植标准，施用有机肥。', tags: ['绿色种植', '人工除草'] },
      { id: 't4', title: '加工环节', date: '2026-07-05', description: '采用全套精米生产线，多道碾白、抛光。', tags: ['精细加工', '低温抛光'] },
      { id: 't5', title: '质量检测', date: '2026-07-05', description: '每批次产品均经过严格质量检测，指标均符合标准。', tags: ['严格检测', '品质保证'] }
    ]
  },
  {
    id: '4',
    productName: '黑苦荞全麦粉',
    batchNumber: 'XBM-2026-002',
    category: '面粉',
    createTime: '2026-07-05 10:20',
    timelineCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=400&auto=format&fit=crop',
    status: 'draft',
    topLabel: '新品研发',
    location: '四川省 · 凉山州',
    productSubTitle: '高海拔苦荞 · 低升糖',
    tags: ['大凉山原产', '全麦研磨'],
    productIntro: '选自海拔2500米以上高寒山区黑苦荞，含丰富生物黄酮，健康代餐好物。',
    timelineItems: [
      { id: 't1', title: '原料采集', date: '2026-07-05', description: '大凉山高寒地区手工采收。', tags: ['高寒原产'] }
    ]
  },
  {
    id: '5',
    productName: '澳洲进口原味麦片',
    batchNumber: 'BY-2026-002',
    category: '燕麦',
    createTime: '2026-07-05 11:15',
    timelineCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=400&h=400&auto=format&fit=crop',
    status: 'published',
    topLabel: '进口品质',
    location: '澳大利亚 · 维多利亚州',
    productSubTitle: '阳光充足 · 颗颗饱满',
    tags: ['澳洲进口', '无添加糖'],
    productIntro: '精选澳洲优质燕麦产区，阳光充足，颗颗饱满，口感软糯香甜。',
    timelineItems: [
      { id: 't1', title: '海外产地', date: '2026-06-20', description: '澳洲维多利亚州核心燕麦种植带。', tags: ['澳洲直供'] },
      { id: 't2', title: '海运报关', date: '2026-07-01', description: '严格通过海关检疫检验。', tags: ['品质清关'] },
      { id: 't3', title: '保税仓分装', date: '2026-07-05', description: '保税区万级无尘车间分装。', tags: ['无尘分装'] }
    ]
  },
  {
    id: '6',
    productName: '红泥旱田珍珠米',
    batchNumber: 'ZKF-2026-002',
    category: '大米',
    createTime: '2026-07-01 08:30',
    timelineCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&h=400&auto=format&fit=crop',
    status: 'published',
    topLabel: '限时供应',
    location: '吉林省 · 松原市',
    productSubTitle: '红泥旱田 · 颗粒如珠',
    tags: ['旱田种植', '限时发售'],
    productIntro: '独有的红泥旱田种植，生长期长，颗粒圆润如珍珠，胶质含量高。',
    timelineItems: [
      { id: 't1', title: '选种育苗', date: '2026-04-10', description: '精选抗旱高产优质品种。', tags: ['优选品种'] },
      { id: 't2', title: '旱田管理', date: '2026-05-20', description: '红泥旱田特有耕作模式。', tags: ['特种耕作'] },
      { id: 't3', title: '物理除虫', date: '2026-07-01', description: '采用诱虫灯等物理手段防治。', tags: ['物理防虫'] },
      { id: 't4', title: '低温磨米', date: '2026-07-05', description: '15度恒温磨米，锁住营养。', tags: ['低温护氧'] },
      { id: 't5', title: '真空保鲜', date: '2026-07-05', description: '六面真空包装，防止氧化。', tags: ['真空气调'] }
    ]
  }
];

export default function App() {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [previousView, setPreviousView] = useState<ViewState>('dashboard');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [newBatchImage, setNewBatchImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400');
  const [showQRModal, setShowQRModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部分类');
  const [dateFilter, setDateFilter] = useState('');
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, dateFilter]);

  const handleStatusUpdate = (batchId: string, newStatus: Batch['status']) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: newStatus } : b));
    if (selectedBatch && selectedBatch.id === batchId) {
      setSelectedBatch({ ...selectedBatch, status: newStatus });
    }
  };

  const handleBatchStatusUpdate = (newStatus: Batch['status']) => {
    setBatches(prev => prev.map(b => selectedIds.has(b.id) ? { ...b, status: newStatus } : b));
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBatches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBatches.map(b => b.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
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

  const handleSaveConfig = () => {
    if (!selectedBatch) return;
    setBatches(prev => prev.map(b => b.id === selectedBatch.id ? selectedBatch : b));
    setViewState('dashboard');
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

  const handleUpdateBatchField = (field: keyof Batch, value: any) => {
    if (!selectedBatch) return;
    setSelectedBatch({ ...selectedBatch, [field]: value });
  };

  const handleUpdateNode = (field: keyof TimelineItem, value: any) => {
    if (!selectedBatch) return;
    const newItems = [...(selectedBatch.timelineItems || [])];
    newItems[activeNodeIndex] = { ...newItems[activeNodeIndex], [field]: value };
    setSelectedBatch({ ...selectedBatch, timelineItems: newItems });
  };

  const handleAddNode = () => {
    if (!selectedBatch) return;
    if (selectedBatch.status === 'published') return;
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
  };

  const handleDeleteNode = (index: number) => {
    if (!selectedBatch) return;
    if (selectedBatch.status === 'published') return;
    if ((selectedBatch.timelineItems || []).length <= 1) return;
    const newItems = selectedBatch.timelineItems.filter((_, i) => i !== index);
    setSelectedBatch({ ...selectedBatch, timelineItems: newItems });
    if (activeNodeIndex >= newItems.length) setActiveNodeIndex(Math.max(0, newItems.length - 1));
  };

  const handleCreateBatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productName = formData.get('productName') as string;
    const category = formData.get('category') as string;
    
    // Validation
    const errors: Record<string, string> = {};
    if (!productName.trim()) errors.productName = "请输入产品名称";
    if (category === '请选择产品分类') errors.category = "请选择产品分类";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    
    // Auto-generate batch number: [Abbr]-[Year]-[Seq]
    const year = new Date().getFullYear().toString();
    const abbr = CATEGORY_ABBR[category] || 'MISC';
    
    // Find current max sequence for this category and year
    const sameCategoryYearBatches = batches.filter(b => b.batchNumber.startsWith(`${abbr}-${year}-`));
    let nextSeq = 1;
    if (sameCategoryYearBatches.length > 0) {
      const seqs = sameCategoryYearBatches.map(b => {
        const parts = b.batchNumber.split('-');
        return parseInt(parts[parts.length - 1], 10);
      });
      nextSeq = Math.max(...seqs) + 1;
    }
    const batchNumber = `${abbr}-${year}-${nextSeq.toString().padStart(3, '0')}`;

    const newBatch: Batch = {
      id: Date.now().toString(),
      productName: productName || '新产品',
      batchNumber,
      category: category !== '请选择产品分类' ? category : '粮食作物',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      timelineCount: 1,
      imageUrl: newBatchImage,
      status: 'draft',
      tags: ['地理标志产品', '绿色种植'],
      productIntro: '产品产地直供，全程严控质量。',
      timelineItems: [
        { id: 't1', title: '产地环境', date: new Date().toISOString().split('T')[0], description: '环境优美，水源纯净。', tags: ['生态环境'] }
      ]
    };
    setBatches([newBatch, ...batches]);
    setShowNewBatchModal(false);
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
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                <Leaf className="w-4 h-4" />
                {selectedBatch.topLabel || '农品溯源'}
              </div>
              <div className="w-5 h-5"></div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              {/* Hero Image */}
              <div className="px-3 pt-2">
                <div className="aspect-[1.5/1] rounded-2xl overflow-hidden shadow-sm">
                  <img src={selectedBatch.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
              </div>

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
                              <span className={`px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md`}>
                                环节 {i + 1}
                              </span>
                              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {item.description}
                            </p>
                            
                            {/* Node Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.tags.map((tag, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-100">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {i === selectedBatch.timelineItems.length - 1 && (
                              <div className="flex gap-2 pt-2">
                                {[
                                  { label: '农残合格', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                                  { label: '重金属合格', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                                  { label: '特级品质', icon: Star, color: 'bg-orange-50 text-orange-600' },
                                ].map((b, idx) => (
                                  <div key={idx} className={`${b.color} rounded-lg p-2 flex-1 flex flex-col items-center justify-center gap-1`}>
                                    <b.icon className="w-4 h-4" />
                                    <span className="text-[8px] font-bold">{b.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Badges */}
                <div className="flex justify-between px-2 pt-6 pb-2">
                  {[
                    { label: '全程溯源', icon: ShieldCheck },
                    { label: '权威认证', icon: Award },
                    { label: '一物一码', icon: QrCode },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                      <b.icon className="w-3.5 h-3.5 text-emerald-600" />
                      {b.label}
                    </div>
                  ))}
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
                <div className="text-center pt-6 pb-10 space-y-1">
                  <div className="flex items-center justify-center gap-1 text-slate-300 text-[10px] font-bold">
                    <Leaf className="w-3 h-3" />
                    农品溯源管理系统
                  </div>
                  <p className="text-[9px] text-slate-200 font-medium tracking-widest">让每一份农产品都有迹可循</p>
                </div>
              </div>
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
                onClick={() => setShowNewBatchModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md active:scale-95 shrink-0 text-sm"
              >
                <Plus className="w-4 h-4" />
                新建批次
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {selectedIds.size > 0 ? `已选 ${selectedIds.size} 项` : ''}
                </span>
                <button
                  onClick={() => handleBatchStatusUpdate('published')}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 hover:bg-blue-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  批量发布
                </button>
                <button
                  onClick={() => handleBatchStatusUpdate('draft')}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 hover:bg-blue-700"
                >
                  <XCircle className="w-4 h-4" />
                  批量撤回
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredBatches.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
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
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedIds.has(batch.id)}
                          onChange={() => toggleSelect(batch.id)}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleEditConfig(batch)}
                        >
                          <img src={batch.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" alt="" />
                          <span className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer">{batch.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-md uppercase border border-slate-200">
                          {batch.batchNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[batch.status].bgColor} ${STATUS_CONFIG[batch.status].color} ${STATUS_CONFIG[batch.status].borderColor}`}>
                          {STATUS_CONFIG[batch.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{batch.category}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{batch.createTime}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handlePreviewH5(batch)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            预览
                          </button>
                          {batch.status === 'draft' ? (
                            <button onClick={() => handleStatusUpdate(batch.id, 'published')} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors">
                              <Send className="w-3 h-3" />
                              发布
                            </button>
                          ) : (
                            <button onClick={() => handleStatusUpdate(batch.id, 'draft')} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                              <XCircle className="w-3 h-3" />
                              撤回
                            </button>
                          )}
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
              </div>
            </div>

            {/* Split Config Grid */}
            <div className="grid grid-cols-1 gap-8">
              {/* Section: Landing Page Config */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                  <h3 className="font-bold">首屏展示配置</h3>
                  <span className="text-xs text-slate-400 font-normal">配置扫码后首屏展示内容</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <ImageUpload 
                        label="首屏背景图"
                        value={selectedBatch.imageUrl}
                        onChange={(url) => handleUpdateBatchField('imageUrl', url)}
                        aspect="aspect-square w-40"
                      />
                      <p className="text-[11px] text-slate-400">建议尺寸 750×1334px，将叠加黑色半透明蒙层</p>
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
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">产品副标题</label>
                      <input 
                        type="text" 
                        value={selectedBatch.productSubTitle || ''}
                        onChange={(e) => handleUpdateBatchField('productSubTitle', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700">核心优势标签</label>
                      <TagInput 
                        tags={selectedBatch.tags} 
                        onChange={(newTags) => handleUpdateBatchField('tags', newTags)}
                        placeholder="输入亮点后回车添加..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">产地简介</label>
                      <textarea 
                        rows={4}
                        value={selectedBatch.productIntro || ''}
                        onChange={(e) => handleUpdateBatchField('productIntro', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-sm leading-relaxed" 
                      />
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
                          onClick={() => setActiveNodeIndex(i)}
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
                          {selectedBatch.status !== 'published' && (
                            <Trash2
                              className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(i);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleAddNode}
                      disabled={selectedBatch.status === 'published'}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" /> 添加溯源条目
                    </button>
                    {selectedBatch.status === 'published' && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">已发布状态下无法增删环节或调整顺序。如需修改，请先将批次「撤回为草稿」。</p>
                      </div>
                    )}
                  </div>

                  {/* Entry Detail Editor */}
                  <div className={`lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 relative ${selectedBatch.status === 'published' ? 'opacity-80' : ''}`}>
                    {selectedBatch.status === 'published' && (
                       <div className="absolute inset-0 z-10 bg-white/10 cursor-not-allowed" title="已发布状态，只读模式" />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{activeNodeIndex + 1}</div>
                      <h4 className="font-bold text-lg">编辑条目内容 {selectedBatch.status === 'published' && <span className="text-amber-600 text-xs ml-2 font-normal">(已发布，只读)</span>}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            发生日期 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              disabled={selectedBatch.status === 'published'}
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
                            disabled={selectedBatch.status === 'published'}
                            value={selectedBatch.timelineItems[activeNodeIndex]?.title || ''} 
                            onChange={(e) => handleUpdateNode('title', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed" 
                          />
                        </div>
                        <div className="space-y-2 pt-2">
                          <ImageUpload 
                            label="凭证配图"
                            value={selectedBatch.timelineItems[activeNodeIndex]?.image}
                            onChange={(url) => selectedBatch.status !== 'published' && handleUpdateNode('image', url)}
                            aspect="aspect-square w-32"
                            className={selectedBatch.status === 'published' ? 'pointer-events-none' : ''}
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-slate-700">环节优势标签</label>
                          <TagInput 
                            tags={selectedBatch.timelineItems[activeNodeIndex]?.tags} 
                            onChange={(newTags) => selectedBatch.status !== 'published' && handleUpdateNode('tags', newTags)}
                            placeholder={selectedBatch.status === 'published' ? "已发布不可编辑" : "输入环节亮点后回车添加..."}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            正文说明 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded">必填</span>
                          </label>
                          <textarea 
                            rows={12}
                            disabled={selectedBatch.status === 'published'}
                            value={selectedBatch.timelineItems[activeNodeIndex]?.description || ''}
                            onChange={(e) => handleUpdateNode('description', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-sm leading-relaxed disabled:cursor-not-allowed" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={() => handleDeleteNode(activeNodeIndex)}
                        className="flex items-center gap-2 text-red-500 font-bold text-sm hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={selectedBatch.timelineItems.length <= 1 || selectedBatch.status === 'published'}
                      >
                        <Trash2 className="w-4 h-4" /> 删除本条
                      </button>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setActiveNodeIndex(prev => Math.max(0, prev - 1))}
                          className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
                          disabled={activeNodeIndex === 0}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-slate-600">{activeNodeIndex + 1} / {selectedBatch.timelineItems.length}</span>
                        <button 
                          onClick={() => setActiveNodeIndex(prev => Math.min(selectedBatch.timelineItems.length - 1, prev + 1))}
                          className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                          disabled={activeNodeIndex === selectedBatch.timelineItems.length - 1}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* New Batch Modal */}
      <AnimatePresence>
        {showNewBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewBatchModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <Plus className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">新建溯源批次</h3>
                      <p className="text-sm text-slate-500">填写产品基础信息，系统将自动生成批次编号与二维码</p>
                    </div>
                  </div>
                  <button onClick={() => setShowNewBatchModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateBatch} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      产品名称 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded uppercase font-bold">必填</span>
                    </label>
                    <input 
                      type="text" 
                      name="productName"
                      placeholder='请输入产品名称，如"东北大米"'
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
                        ${formErrors.productName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    />
                    {formErrors.productName && <p className="text-[10px] text-red-500 font-bold pl-1">{formErrors.productName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      产品分类 <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded uppercase font-bold">必填</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="category"
                        className={`w-full appearance-none px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-500
                          ${formErrors.category ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      >
                        <option>请选择产品分类</option>
                        <option>大米</option>
                        <option>燕麦</option>
                        <option>面粉</option>
                      </select>
                      <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {formErrors.category && <p className="text-[10px] text-red-500 font-bold pl-1">{formErrors.category}</p>}
                  </div>

                  <ImageUpload 
                    label="产品封面图"
                    value={newBatchImage}
                    onChange={setNewBatchImage}
                    aspect="aspect-video"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      批次备注 <span className="text-slate-400 font-normal uppercase text-[10px] bg-slate-50 px-1.5 py-0.5 rounded">选填</span>
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="可填写产地、年份、特殊说明等备注信息"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  <div className="bg-blue-50/50 rounded-2xl p-5 space-y-3 border border-blue-100/50">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Info className="w-4 h-4" />
                      <p className="text-sm font-bold">提交后将自动完成以下操作：</p>
                    </div>
                    <ul className="space-y-2 pl-6">
                      {[
                        '生成唯一批次编号（格式：缩写-年份-流水号）',
                        '生成该批次专属溯源二维码',
                        '创建空白溯源内容配置，自动跳转至编辑器'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-blue-700/80 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowNewBatchModal(false)}
                      className="flex-1 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      取消
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                      <Check className="w-5 h-5" />
                      确认创建
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://trace.nk.com/b/${selectedBatch.batchNumber}`}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 focus:outline-none"
                    />
                    <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      复制
                    </button>
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
