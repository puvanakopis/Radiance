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

interface ProductReviewSectionProps {
  productId: string;
  productName: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
}

export const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  productName,
  reviews,
  rating,
  reviewCount,
  onAddReview,
}) => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [skinType, setSkinType] = useState<SkinType>('Combination');
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !comment) {
      showToast({ type: 'error', title: 'Please complete all required fields' });
      return;
    }

    onAddReview({
      productId,
      userName: name,
      userLocation: location || 'Sri Lanka',
      rating: newRating,
      title,
      comment,
      verified: true,
      skinType,
    });

    setIsWriteModalOpen(false);
    setName('');
    setLocation('');
    setTitle('');
    setComment('');
    showToast({
      type: 'success',
      title: 'Review submitted',
      message: 'Thank you for sharing your experience with the Velora community.',
    });
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
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : star === 5 ? 85 : 15;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-12">
      {/* Review Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Overall Rating score */}
        <div className="md:col-span-4 text-center md:border-r border-[#1A1A1A]/10 md:pr-6">
          <span className="font-serif text-5xl sm:text-6xl text-[#1A1A1A] block font-medium">
            {rating.toFixed(1)}
          </span>
          <div className="flex justify-center my-2">
            <Rating rating={rating} size="md" showNumber={false} />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60">
            Based on {reviewCount} verified reviews
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
            onClick={() => setIsWriteModalOpen(true)}
            className="w-full md:w-auto"
          >
            Write Review
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
                      {rev.userName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{rev.userName}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#8A9A86] font-medium uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      {rev.userLocation && (
                        <p className="text-[11px] text-[#1A1A1A]/50">{rev.userLocation}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Rating rating={rev.rating} size="xs" showNumber={false} />
                    <span className="text-xs text-[#1A1A1A]/40">{rev.date}</span>
                  </div>
                </div>

                {rev.skinType && (
                  <Badge variant="ivory" size="xs">
                    Skin Type: {rev.skinType}
                  </Badge>
                )}

                <h5 className="font-serif text-base text-[#1A1A1A] font-medium">{rev.title}</h5>
                <p className="text-xs sm:text-sm text-[#1A1A1A]/75 leading-relaxed">{rev.comment}</p>

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

      {/* Write a Review Modal */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="Share Your Experience"
        subtitle={`Reviewing: ${productName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block mb-2">
              Overall Rating
            </label>
            <Rating
              rating={newRating}
              size="md"
              interactive
              onChange={(val) => setNewRating(val)}
              showNumber
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kavindi Perera"
            />
            <Input
              label="Location (City)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Colombo 07"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block mb-1.5">
              Your Skin Type
            </label>
            <select
              value={skinType}
              onChange={(e) => setSkinType(e.target.value as SkinType)}
              className="w-full bg-white border border-[#1A1A1A]/15 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
            >
              <option value="Normal">Normal</option>
              <option value="Dry">Dry</option>
              <option value="Combination">Combination</option>
              <option value="Oily">Oily</option>
              <option value="Sensitive">Sensitive</option>
              <option value="All Skin Types">All Skin Types</option>
            </select>
          </div>

          <Input
            label="Review Headline"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your ritual experience..."
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block">
              Detailed Feedback *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did the texture, absorption, and results feel on your skin?"
              className="w-full bg-white border border-[#1A1A1A]/15 rounded-xl p-4 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsWriteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
