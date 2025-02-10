import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<'issue' | 'feedback'>('feedback');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            type,
            title,
            description,
            status: 'new'
          }
        ]);

      if (error) throw error;

      // Reset form
      setTitle('');
      setDescription('');
      setType('feedback');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white/80 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
            Submit Feedback
          </h2>
          <p className="text-white/60 mt-2 text-sm">
            Help us improve by sharing your thoughts
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2 p-1 glass-effect rounded-xl">
            <button
              type="button"
              onClick={() => setType('feedback')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                type === 'feedback'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white/90'
              }`}
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => setType('issue')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                type === 'issue'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white/90'
              }`}
            >
              Issue
            </button>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1.5">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 glass-input rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              placeholder="Brief summary of your feedback"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 glass-input rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 transition-all text-sm min-h-[100px]"
              placeholder="Provide more details about your feedback or issue"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="glow w-full bg-gradient-to-r from-blue-500 to-blue-300 text-white py-2.5 px-4 rounded-xl hover:opacity-90 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}