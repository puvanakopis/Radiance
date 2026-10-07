'use client';

import React, { useState } from 'react';
import { Review, SkinType } from '../../types';
import { Rating } from '../ui/Rating';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CheckCircle2, ThumbsUp, PenLine } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface ProductReviewSectionProps {
  productId: string;
  productName: string;
  reviews: Review[];
  rating?: number | null;
  reviewCount?: number | null;
  onAddReview: (review: { productId: string; rating: number; feedback: string; userName?: string }) => Promise<void> | void;
}

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  productName,
  reviews,
  rating,
  reviewCount,
  onAddReview,
}) => {
  const { user } = useAuth();
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  const { showToast } = useToast();

  const handleOpenWriteModal = () => {
    setFeedback('');
    setNewRating(5);
    setIsWriteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      showToast({ type: 'error', title: 'Please provide your feedback' });
      return;
    }

    if (!user) {
      showToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to your Radiance account to share your verified experience.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddReview({
        productId,
        rating: newRating,
        feedback: feedback.trim(),
        userName: user.name || user.email || 'Verified Patron',
      });

      setIsWriteModalOpen(false);
      setFeedback('');
      showToast({
        type: 'success',
        title: 'Experience Shared Successfully',
        message: 'Your formulation feedback has been published.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: err?.message || 'Unable to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked[reviewId]) return;
    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    showToast({
      type: 'info',
      title: 'Thank you',
      message: 'Marked review as helpful.',
    });
  };

  // Rating Distribution breakdown
  const validReviews = Array.isArray(reviews) ? reviews : [];
  const validReviewCount = reviewCount || validReviews.length || 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = validReviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = validReviewCount > 0 ? Math.round((count / validReviewCount) * 100) : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-12">
      {/* Review Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Overall Rating score */}
        <div className="md:col-span-4 text-center md:border-r border-[#1A1A1A]/10 md:pr-6">
          <span className="font-serif text-5xl sm:text-6xl text-[#1A1A1A] block font-medium">
            {rating !== null && rating !== undefined ? Number(rating).toFixed(1) : '—'}
          </span>
          <div className="flex justify-center my-2">
            <Rating rating={rating} size="md" showNumber={false} />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60">
            {validReviewCount > 0
              ? `Based on ${validReviewCount} verified reviews`
              : 'Be the first to review this formulation'}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="md:col-span-5 space-y-2">
          {ratingCounts.map(({ star, percentage }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-[#1A1A1A]/70 font-medium">{star} Stars</span>
              <div className="flex-1 h-2 bg-[#EAE3D9]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C87D55] rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-[#1A1A1A]/50 text-[11px]">{percentage}%</span>
            </div>
          ))}
        </div>

        {/* Write a review button */}
        <div className="md:col-span-3 text-center md:text-right">
          <Button
            variant="outline"
            size="md"
            icon={PenLine}
            onClick={handleOpenWriteModal}
            className="w-full md:w-auto"
          >
            Share Experience
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h4 className="font-serif text-xl text-[#1A1A1A]">Customer Experiences</h4>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-white border border-[#1A1A1A]/10 rounded-2xl space-y-3 shadow-xs transition-all hover:border-[#1A1A1A]/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EAE3D9] text-[#1A1A1A] font-serif font-semibold text-sm flex items-center justify-center">
                      {(rev.userName || 'P')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{rev.userName}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#8A9A86] font-medium uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Verified Patron
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Rating rating={rev.rating} size="xs" showNumber={false} />
                    <span className="text-xs text-[#1A1A1A]/40">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#1A1A1A]/80 leading-relaxed font-light">
                  {rev.comment}
                </p>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => handleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1.5 text-xs text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors cursor-pointer ${
                      helpfulClicked[rev.id] ? 'text-[#C87D55] font-semibold' : ''
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({rev.helpfulCount + (helpfulClicked[rev.id] ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/40 rounded-2xl border border-dashed border-[#1A1A1A]/20">
            <p className="font-serif text-lg text-[#1A1A1A]">Be the first to share your ritual</p>
            <p className="text-xs text-[#1A1A1A]/60 mt-1">Review {productName} and assist our beauty community.</p>
          </div>
        )}
      </div>

      {/* Share Your Experience Modal (Strictly CustomerReviewSchema) */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="Share Your Experience"
        subtitle={`Reviewing: ${productName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Account Info */}
          {user ? (
            <div className="p-3 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#1A1A1A]/60">Reviewing as:</span>
              <span className="font-semibold text-[#1A1A1A]">{user.name || user.email}</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>Sign in required to publish your review.</span>
              <a href="/login" className="underline font-semibold hover:text-amber-900">
                Sign In →
              </a>
            </div>
          )}

          {/* Overall Rating (1 - 5) */}
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block mb-2">
              Overall Rating *
            </label>
            <Rating
              rating={newRating}
              size="md"
              interactive
              onChange={(val) => setNewRating(val)}
              showNumber
            />
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block">
              Your Feedback & Experience *
            </label>
            <textarea
              required
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe the texture, results, absorption, and overall experience with this formulation..."
              className="w-full bg-white border border-[#1A1A1A]/15 rounded-xl p-4 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={isSubmitting}
              onClick={() => setIsWriteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
