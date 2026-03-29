import { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, ChevronRight, GraduationCap, Search, Loader2, Menu, X, 
  BookMarked, CheckCircle2, PlayCircle, HelpCircle, ArrowRight,
  Trophy, RefreshCw, Image as ImageIcon, Book, Presentation, ChevronLeft, MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { ECONOMICS_CHAPTERS, type KnowledgePoint, type Chapter } from './constants';
import { getDetailedLearningContent, type DetailedContent } from './services/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<KnowledgePoint | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState<DetailedContent | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Progress tracking
  const [learnedPoints, setLearnedPoints] = useState<string[]>(() => {
    const saved = localStorage.getItem('learned_points');
    return saved ? JSON.parse(saved) : [];
  });

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string[]>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    localStorage.setItem('learned_points', JSON.stringify(learnedPoints));
  }, [learnedPoints]);

  const totalPoints = useMemo(() => 
    ECONOMICS_CHAPTERS.reduce((acc, ch) => acc + ch.points.length, 0), 
  []);
  
  const progress = Math.round((learnedPoints.length / totalPoints) * 100);

  const handlePointClick = async (point: KnowledgePoint) => {
    if (selectedPoint?.id === point.id) return;
    setSelectedPoint(point);
    setSelectedChapter(null);
    setIsLoading(true);
    setContent(null);
    setCurrentSlide(0);
    setShowSpeakerNotes(false);
    setQuizAnswers({});
    setShowQuizResults(false);
    
    const result = await getDetailedLearningContent(point.title, point.description);
    setContent(result);
    setIsLoading(false);
    
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSelectedPoint(null);
    setContent(null);
    setQuizAnswers({});
    setShowQuizResults(false);
    
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const toggleLearned = (pointId: string) => {
    setLearnedPoints(prev => 
      prev.includes(pointId) 
        ? prev.filter(id => id !== pointId) 
        : [...prev, pointId]
    );
  };

  const handleOptionSelect = (quizIndex: number, optionId: string, type: 'single' | 'multiple') => {
    if (showQuizResults) return;
    
    setQuizAnswers(prev => {
      const current = prev[quizIndex] || [];
      if (type === 'single') {
        return { ...prev, [quizIndex]: [optionId] };
      } else {
        const next = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [quizIndex]: next };
      }
    });
  };

  const filteredChapters = ECONOMICS_CHAPTERS.map(chapter => ({
    ...chapter,
    points: chapter.points.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(chapter => chapter.points.length > 0);

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 flex flex-col lg:relative shadow-xl lg:shadow-none"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                <GraduationCap className="w-7 h-7" />
                <span>经济学助手</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Progress Overview */}
            <div className="p-5 bg-blue-50/50 border-b border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">学习进度</span>
                <span className="text-xs font-bold text-blue-700">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              <p className="mt-2 text-[10px] text-blue-400 text-center">已掌握 {learnedPoints.length} / {totalPoints} 个知识点</p>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索知识点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
              {filteredChapters.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <button 
                    onClick={() => handleChapterClick(chapter)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all",
                      selectedChapter?.id === chapter.id ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {chapter.title}
                  </button>
                  <div className="space-y-1">
                    {chapter.points.map((point) => (
                      <button
                        key={point.id}
                        onClick={() => handlePointClick(point)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group relative overflow-hidden",
                          selectedPoint?.id === point.id
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3 z-10">
                          {learnedPoints.includes(point.id) ? (
                            <CheckCircle2 className={cn("w-4 h-4", selectedPoint?.id === point.id ? "text-blue-200" : "text-green-500")} />
                          ) : (
                            <div className={cn("w-4 h-4 rounded-full border-2", selectedPoint?.id === point.id ? "border-blue-300" : "border-slate-200")} />
                          )}
                          <span className="truncate font-medium">{point.title}</span>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-10",
                          selectedPoint?.id === point.id && "opacity-100 translate-x-0"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 leading-tight">
                {selectedPoint ? selectedPoint.title : selectedChapter ? selectedChapter.title : "开始您的经济学之旅"}
              </h2>
              {(selectedPoint || selectedChapter) && (
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {selectedPoint 
                    ? ECONOMICS_CHAPTERS.find(c => c.points.some(p => p.id === selectedPoint.id))?.title 
                    : "章节概览"}
                </span>
              )}
            </div>
          </div>
          
          {selectedPoint && (
            <button
              onClick={() => toggleLearned(selectedPoint.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                learnedPoints.includes(selectedPoint.id)
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
              )}
            >
              {learnedPoints.includes(selectedPoint.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>已掌握</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>标记为已学</span>
                </>
              )}
            </button>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {selectedPoint ? (
                <motion.div
                  key={selectedPoint.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="space-y-8 pb-20"
                >
                  {isLoading ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center gap-6">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-300" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-slate-700">正在生成多媒体教学课件...</p>
                        <p className="text-sm text-slate-400">AI 教授正在为您整理知识点、绘图并编制习题</p>
                      </div>
                    </div>
                  ) : content && (
                    <>
                      {/* Visual Breakdown Section */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                          <PlayCircle className="w-5 h-5" />
                          <span>多媒体视觉拆解</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {content.visualBreakdown.map((step, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all"
                            >
                              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                <img 
                                  src={`https://picsum.photos/seed/${selectedPoint.id}-${idx}/600/340`} 
                                  alt={step.title}
                                  className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                                  Step {idx + 1}
                                </div>
                              </div>
                              <div className="p-6 space-y-2">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {step.title}
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium italic">
                                  <ImageIcon className="w-3 h-3" />
                                  <span>图示：{step.imagePrompt}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </section>

                      {/* PPT Presentation Section */}
                      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <MonitorPlay className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-bold">核心理论 PPT 课件</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-slate-400">
                              Slide {currentSlide + 1} / {content.theorySlides.length}
                            </span>
                            <button 
                              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                              className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                                showSpeakerNotes ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                              )}
                            >
                              {showSpeakerNotes ? "隐藏教授讲解" : "显示教授讲解"}
                            </button>
                          </div>
                        </div>

                        <div className="relative aspect-[16/9] bg-slate-50 flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentSlide}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex-1 flex flex-col"
                            >
                              <h3 className="text-2xl lg:text-3xl font-black text-slate-800 mb-8 border-b-4 border-blue-500 pb-4 inline-block">
                                {content.theorySlides[currentSlide].title}
                              </h3>
                              <div className="markdown-body flex-1">
                                <Markdown>{content.theorySlides[currentSlide].content}</Markdown>
                              </div>
                            </motion.div>
                          </AnimatePresence>

                          {/* Slide Navigation */}
                          <div className="absolute bottom-6 right-8 flex items-center gap-2">
                            <button 
                              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                              disabled={currentSlide === 0}
                              className="p-2 bg-white shadow-md border border-slate-200 rounded-full text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setCurrentSlide(prev => Math.min(content.theorySlides.length - 1, prev + 1))}
                              disabled={currentSlide === content.theorySlides.length - 1}
                              className="p-2 bg-blue-600 shadow-md rounded-full text-white disabled:opacity-30 hover:bg-blue-700 transition-all"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {showSpeakerNotes && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-blue-50 border-t border-blue-100 p-6"
                          >
                            <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-xs uppercase tracking-widest">
                              <GraduationCap className="w-4 h-4" />
                              <span>教授讲解词</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed italic">
                              “{content.theorySlides[currentSlide].speakerNotes}”
                            </p>
                          </motion.div>
                        )}
                      </section>

                      {/* Quiz Section */}
                      <section id="quiz-section" className="bg-slate-900 rounded-3xl shadow-2xl p-8 lg:p-12 text-white">
                        <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                              <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">互动练习</h3>
                          </div>
                          {showQuizResults && (
                            <button 
                              onClick={() => { setQuizAnswers({}); setShowQuizResults(false); }}
                              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>重做练习</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-12">
                          {content.quizzes.map((quiz, idx) => (
                            <div key={idx} className="space-y-6">
                              <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-blue-400">
                                  {idx + 1}
                                </span>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                      quiz.type === 'single' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                                    )}>
                                      {quiz.type === 'single' ? '单选题' : '多选题'}
                                    </span>
                                  </div>
                                  <p className="text-lg font-medium text-slate-200">{quiz.question}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 ml-12">
                                {quiz.options.map((option) => {
                                  const isSelected = quizAnswers[idx]?.includes(option.id);
                                  const isCorrect = quiz.correctAnswer.includes(option.id);
                                  
                                  let buttonClass = "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group";
                                  if (showQuizResults) {
                                    if (isCorrect) {
                                      buttonClass += " border-green-500 bg-green-500/10 text-green-400";
                                    } else if (isSelected && !isCorrect) {
                                      buttonClass += " border-red-500 bg-red-500/10 text-red-400";
                                    } else {
                                      buttonClass += " border-slate-800 text-slate-500 opacity-50";
                                    }
                                  } else {
                                    buttonClass += isSelected 
                                      ? " border-blue-500 bg-blue-500/10 text-blue-400" 
                                      : " border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-400";
                                  }

                                  return (
                                    <button
                                      key={option.id}
                                      onClick={() => handleOptionSelect(idx, option.id, quiz.type)}
                                      disabled={showQuizResults}
                                      className={buttonClass}
                                    >
                                      <span>{option.text}</span>
                                      {showQuizResults && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {showQuizResults && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="ml-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700"
                                >
                                  <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm font-bold">
                                    <BookMarked className="w-4 h-4" />
                                    <span>解析</span>
                                  </div>
                                  <p className="text-sm text-slate-400 leading-relaxed">{quiz.explanation}</p>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>

                        {!showQuizResults && (
                          <div className="mt-12 flex justify-center">
                            <button
                              onClick={() => setShowQuizResults(true)}
                              disabled={Object.keys(quizAnswers).length < content.quizzes.length}
                              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20"
                            >
                              提交答案并查看解析
                            </button>
                          </div>
                        )}
                      </section>
                    </>
                  )}
                </motion.div>
              ) : selectedChapter ? (
                <motion.div
                  key={selectedChapter.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="space-y-8 pb-20"
                >
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 lg:p-12 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Book className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800">{selectedChapter.title}</h3>
                        <p className="text-slate-500">{selectedChapter.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedChapter.points.map((point) => (
                        <button
                          key={point.id}
                          onClick={() => handlePointClick(point)}
                          className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{point.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{point.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <PlayCircle className="w-4 h-4" />
                        <span>章节导读视频/图示</span>
                      </div>
                      <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative group">
                        <img 
                          src={`https://picsum.photos/seed/${selectedChapter.id}/1200/675`} 
                          alt="Chapter overview"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-10 h-10 fill-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-32 h-32 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-blue-600 rotate-12 animate-pulse">
                      <BookOpen className="w-16 h-16 -rotate-12" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">欢迎回来，经济学探索者</h1>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                      今天想学习哪个知识点？我们为您准备了全新的多媒体课件和互动练习，助您轻松掌握微观经济学。
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="text-2xl font-black text-blue-600">{learnedPoints.length}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">已掌握</div>
                    </div>
                    <div className="px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="text-2xl font-black text-slate-800">{progress}%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">总进度</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
