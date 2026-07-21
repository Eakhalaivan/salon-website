import { useState, useEffect } from 'react';
import { useCmsContent, useUpdateCmsContent } from '../../hooks/api/useCmsContent';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Button } from '../../components/ui/Button';
import { Save, Layout, FileText, Image, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

export const CmsEditor = () => {
  const [activePage, setActivePage] = useState('home');
  const { data: blocks, isLoading } = useCmsContent(activePage);
  const updateMutation = useUpdateCmsContent();

  const [editState, setEditState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (blocks) {
      const initialState: Record<string, string> = {};
      Object.values(blocks).forEach((block: any) => {
        initialState[block.blockKey] = block.contentValue;
      });
      setEditState(initialState);
    }
  }, [blocks]);

  const handleSave = (blockKey: string) => {
    updateMutation.mutate({
      pageKey: activePage,
      blockKey,
      contentValue: editState[blockKey],
    });
  };

  const pages = [
    { id: 'home', label: 'Home Page', icon: <Layout size={18} /> },
    { id: 'about', label: 'About Us', icon: <FileText size={18} /> },
    { id: 'faq', label: 'FAQ', icon: <FileText size={18} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> }
  ];

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE_URL': return <Image size={16} className="text-primary" />;
      case 'HTML': return <PenTool size={16} className="text-secondary" />;
      default: return <FileText size={16} className="text-on-surface-variant" />;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">CMS Editor</h1>
          <p className="font-body-lg text-on-surface-variant">Manage content across the public website pages dynamically.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-8">
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-md transition-all duration-300 ${
              activePage === page.id 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-105' 
                : 'bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-container hover:scale-105'
            }`}
          >
            {page.icon}
            {page.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
        </div>
      ) : (
        <AnimatedSection>
          <div className="space-y-6">
            {blocks && Object.values(blocks).length > 0 ? Object.values(blocks).map((block: any, i: number) => (
              <motion.div 
                key={block.blockKey} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-outline-variant/20 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-surface-container flex items-center justify-center">
                      {getContentTypeIcon(block.contentType)}
                    </div>
                    <div>
                      <h3 className="font-display-sm text-xl text-on-surface">{block.blockKey}</h3>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mt-1">
                        Type: {block.contentType}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSave(block.blockKey)}
                    disabled={updateMutation.isPending && updateMutation.variables?.blockKey === block.blockKey}
                    className="shrink-0 shadow-[0px_8px_20px_rgba(212,175,55,0.2)]"
                  >
                    {updateMutation.isPending && updateMutation.variables?.blockKey === block.blockKey ? (
                      <>
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4">
                  {block.contentType === 'TEXT' || block.contentType === 'IMAGE_URL' ? (
                    <input
                      type="text"
                      value={editState[block.blockKey] || ''}
                      onChange={(e) => setEditState({ ...editState, [block.blockKey]: e.target.value })}
                      className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
                    />
                  ) : (
                    <textarea
                      value={editState[block.blockKey] || ''}
                      onChange={(e) => setEditState({ ...editState, [block.blockKey]: e.target.value })}
                      rows={5}
                      className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md resize-y"
                    />
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="glass-panel p-16 text-center rounded-[32px] shadow-sm">
                <FileText className="mx-auto h-16 w-16 text-on-surface-variant mb-6 opacity-50" />
                <h3 className="font-display-sm text-2xl text-on-surface mb-2">No Content Blocks Found</h3>
                <p className="font-body-md text-on-surface-variant">
                  No content blocks have been registered for the <strong className="text-primary">{activePage}</strong> page yet.
                </p>
              </div>
            )}
          </div>
        </AnimatedSection>
      )}
    </div>
  );
};
